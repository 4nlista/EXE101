const { testAiConnection, recommendProjectsWithAI, extractTextFromPdfUrl, matchApplicantWithAI } = require('../services/aiService');
const { adminChatWithAI } = require('../services/aiAdminService');
const User = require('../models/User');
const Project = require('../models/Project');
const Application = require('../models/Application');

// @route   GET /api/ai/test
// @desc    Test kết nối tới Gemini API
// @access  Public (hoặc Admin tùy bạn)
const testConnection = async (req, res) => {
  try {
    const result = await testAiConnection();
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.message
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Lỗi controller AI test:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// @route   POST /api/ai/recommend-projects
// @desc    Gửi prompt để AI gợi ý dự án phù hợp
// @access  Private (Chỉ VIP / PREMIUM)
const recommendProjects = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập câu hỏi' });
    }

    // 1. Lấy thông tin User và kiểm tra gói
    const user = await User.findById(req.user.id).select('name mainSkills departmentId semester gradeGoal projectHistory currentPackage').populate('departmentId', 'name');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    if (user.currentPackage === 'free') {
      return res.status(403).json({ success: false, message: 'Vui lòng nâng cấp gói VIP hoặc PREMIUM để sử dụng tính năng này.' });
    }

    // 2. Lấy danh sách các Project đang open
    const projects = await Project.find({
      status: 'open',
      deadline: { $gt: new Date() }
    })
    .select('title description candidateRequirements gradeTarget maxMembers deadline members departmentIds')
    .populate('departmentIds', 'name');

    // Cấu trúc lại dữ liệu cho gọn nhẹ trước khi gửi lên AI (Bỏ bớt các trường không cần thiết)
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

    // 3. Gọi AI Service
    const aiResult = await recommendProjectsWithAI(cleanUser, cleanProjects, prompt);

    if (aiResult.success) {
      return res.status(200).json({
        success: true,
        data: aiResult.data // Trả thẳng JSON đã parse cho Frontend
      });
    } else {
      return res.status(500).json({
        success: false,
        message: aiResult.message
      });
    }
  } catch (error) {
    console.error('Lỗi controller AI recommendProjects:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi gọi AI' });
  }
};

// @route   POST /api/ai/match-applicant/:applicationId
// @desc    Đọc CV và phân tích % phù hợp của ứng viên
// @access  Private (Chỉ PREMIUM & Chủ dự án)
const matchApplicant = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // 1. Lấy thông tin User và kiểm tra gói PREMIUM
    const user = await User.findById(req.user.id).select('currentPackage');
    if (!user || user.currentPackage !== 'premium') {
      return res.status(403).json({ success: false, message: 'Chức năng này chỉ dành cho tài khoản PREMIUM.' });
    }

    // 2. Lấy đơn ứng tuyển
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn ứng tuyển' });
    }

    // 3. Lấy thông tin dự án để kiểm tra quyền và lấy yêu cầu
    const project = await Project.findById(application.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án' });
    }

    // Kiểm tra xem người gọi API có phải là chủ dự án không
    if (project.leaderId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền phân tích ứng viên của dự án này.' });
    }

    // 4. Trích xuất text từ CV
    if (!application.cvFileUrl) {
      return res.status(400).json({ success: false, message: 'Ứng viên này không có file CV để phân tích.' });
    }

    const cvText = await extractTextFromPdfUrl(application.cvFileUrl);
    if (!cvText) {
      return res.status(500).json({ success: false, message: 'Không thể đọc nội dung từ file CV này (có thể file bị lỗi hoặc hình ảnh không chứa text).' });
    }

    // 5. Gọi AI để phân tích
    const aiResult = await matchApplicantWithAI(project.candidateRequirements, cvText);

    if (aiResult.success) {
      // 6. Cập nhật kết quả vào DB
      application.matchPercent = aiResult.data.matchPercent;
      application.matchReason = aiResult.data.matchReason;
      await application.save();

      return res.status(200).json({
        success: true,
        data: {
          matchPercent: application.matchPercent,
          matchReason: application.matchReason
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: aiResult.message
      });
    }
  } catch (error) {
    console.error('Lỗi controller AI matchApplicant:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi phân tích CV' });
  }
};

// @route   POST /api/ai/admin-chat
// @desc    Admin chat với AI để hỏi số liệu thống kê
// @access  Private (Chỉ Admin)
const adminChat = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập câu hỏi' });
    }

    // Kiểm tra quyền Admin (roleCode)
    if (req.user.roleCode !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập.' });
    }

    const aiResult = await adminChatWithAI(prompt);

    if (aiResult.success) {
      return res.status(200).json({
        success: true,
        data: aiResult.data
      });
    } else {
      return res.status(500).json({
        success: false,
        message: aiResult.message
      });
    }
  } catch (error) {
    console.error('Lỗi controller AI adminChat:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi gọi AI Admin' });
  }
};

module.exports = {
  testConnection,
  recommendProjects,
  matchApplicant,
  adminChat
};
