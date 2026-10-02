const AiChatSession = require('../models/AiChatSession');
const User = require('../models/User');
const Project = require('../models/Project');
const { recommendProjectsWithAI } = require('../services/aiService');
const { AI_SENDER } = require('../constants/aiEnum');

// @route   GET /api/ai/sessions
// @desc    Lấy danh sách các phiên chat của user
// @access  Private
const getSessions = async (req, res) => {
  try {
    // Chỉ lấy title, createdAt, updatedAt để hiển thị trên Sidebar cho nhẹ
    const sessions = await AiChatSession.find({ userId: req.user.id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chat session:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// @route   POST /api/ai/sessions
// @desc    Tạo phiên chat mới
// @access  Private
const createSession = async (req, res) => {
  try {
    const newSession = await AiChatSession.create({
      userId: req.user.id,
      title: 'Cuộc hội thoại mới'
    });

    res.status(201).json({ success: true, data: newSession });
  } catch (error) {
    console.error('Lỗi khi tạo chat session:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// @route   GET /api/ai/sessions/:sessionId
// @desc    Lấy toàn bộ tin nhắn của 1 phiên chat
// @access  Private
const getSessionById = async (req, res) => {
  try {
    const session = await AiChatSession.findOne({ _id: req.params.sessionId, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiên chat' });
    }

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết chat session:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// @route   DELETE /api/ai/sessions/:sessionId
// @desc    Xóa phiên chat
// @access  Private
const deleteSession = async (req, res) => {
  try {
    const session = await AiChatSession.findOneAndDelete({ _id: req.params.sessionId, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiên chat' });
    }

    res.status(200).json({ success: true, message: 'Đã xóa phiên chat' });
  } catch (error) {
    console.error('Lỗi khi xóa chat session:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// @route   POST /api/ai/sessions/:sessionId/messages
// @desc    Gửi tin nhắn mới vào phiên chat và nhận phản hồi từ AI
// @access  Private (Chỉ VIP / PREMIUM)
const sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tin nhắn' });
    }

    // 1. Kiểm tra session có tồn tại không
    const session = await AiChatSession.findOne({ _id: sessionId, userId: req.user.id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiên chat' });
    }

    // 2. Kiểm tra quyền của user (Gói VIP / PREMIUM)
    const user = await User.findById(req.user.id).select('name mainSkills departmentId semester gradeGoal projectHistory currentPackage').populate('departmentId', 'name');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }
    if (user.currentPackage === 'free') {
      return res.status(403).json({ success: false, message: 'Vui lòng nâng cấp VIP hoặc PREMIUM.' });
    }

    // Nếu đây là tin nhắn đầu tiên, cập nhật lại title của session bằng câu hỏi của user (cắt 30 ký tự)
    if (session.messages.length === 0) {
      session.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
    }

    // 3. Thêm tin nhắn của User vào DB
    session.messages.push({
      sender: AI_SENDER.USER,
      text: text
    });
    
    // Tạm lưu DB để lỡ AI lỗi thì tin user vẫn còn
    await session.save();

    // 4. Chuẩn bị dữ liệu để gọi AI
    const projects = await Project.find({
      status: 'open',
      deadline: { $gt: new Date() }
    }).select('title description candidateRequirements gradeTarget maxMembers deadline members departmentIds').populate('departmentIds', 'name');

    const cleanProjects = projects.map(p => ({
      _id: p._id,
      title: p.title,
      description: p.description,
      candidateRequirements: p.candidateRequirements,
      departments: p.departmentIds.map(d => d.name),
      gradeTarget: p.gradeTarget,
      slotsAvailable: p.maxMembers - p.members.length,
      deadline: p.deadline
    }));

    const cleanUser = {
      name: user.name,
      mainSkills: user.mainSkills,
      department: user.departmentId ? user.departmentId.name : '',
      semester: user.semester,
      gradeGoal: user.gradeGoal,
      projectHistory: user.projectHistory
    };

    // Chuẩn bị toàn bộ lịch sử (format dạng chuỗi) để gửi cho AI
    const chatHistoryText = session.messages.map(msg => {
      const role = msg.sender === AI_SENDER.USER ? 'Sinh viên' : 'AI';
      return `${role}: ${msg.text}`;
    }).join('\n');

    // 5. Gọi AI
    const aiResult = await recommendProjectsWithAI(cleanUser, cleanProjects, text, chatHistoryText);

    if (aiResult.success) {
      const aiData = aiResult.data;
      
      // 6. Thêm tin nhắn của AI vào DB
      const aiMessage = {
        sender: AI_SENDER.AI,
        text: aiData.replyMessage,
        projects: aiData.recommendedProjects && aiData.recommendedProjects.length > 0 ? aiData.recommendedProjects : []
      };

      session.messages.push(aiMessage);
      await session.save();

      return res.status(200).json({
        success: true,
        data: aiMessage
      });
    } else {
      return res.status(500).json({ success: false, message: aiResult.message });
    }
  } catch (error) {
    console.error('Lỗi controller AI sendMessage:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi gọi AI' });
  }
};

module.exports = {
  getSessions,
  createSession,
  getSessionById,
  deleteSession,
  sendMessage
};
