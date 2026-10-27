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

    // 2. Lấy danh sách các Project đang open (loại trừ dự án của chính mình và dự án đã tham gia)
    const projects = await Project.find({
      status: 'open',
      deadline: { $gt: new Date() },
      ownerId: { $ne: req.user.id },
      'members.userId': { $ne: req.user.id }
    })
    .select('title description candidateRequirements gradeTarget maxMembers deadline members departmentIds')
    .populate('departmentIds', 'name');

    // Chỉ giữ lại các dự án thực tế còn slot tuyển thành viên
    const availableProjects = projects.filter(p => (p.maxMembers - (p.members?.length || 0)) > 0);

    // Cấu trúc lại dữ liệu cho gọn nhẹ trước khi gửi lên AI (Bỏ bớt các trường không cần thiết)
    const cleanProjects = availableProjects.map(p => ({
      _id: p._id,
      title: p.title,
      description: p.description,
      candidateRequirements: p.candidateRequirements,
      departments: p.departmentIds.map(d => d.name),
      gradeTarget: p.gradeTarget,
      slotsAvailable: p.maxMembers - (p.members?.length || 0),
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
// @desc    Phân tích % phù hợp và đánh giá ứng viên (kết hợp CV và Kỹ năng cá nhân)
// @access  Private (Chủ dự án hoặc Admin)
const matchApplicant = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // 1. Lấy đơn ứng tuyển kèm thông tin ứng viên (kỹ năng, học vấn, kinh nghiệm)
    const application = await Application.findById(applicationId)
      .populate({
        path: 'applicantId',
        select: 'name avatar departmentId majorId semester gpa mainSkills projectHistory',
        populate: [
          { path: 'departmentId', select: 'name' },
          { path: 'majorId', select: 'name' },
          { path: 'projectHistory' }
        ]
      });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn ứng tuyển.' });
    }

    // 2. Lấy thông tin dự án để kiểm tra quyền và lấy yêu cầu tuyển dụng
    const project = await Project.findById(application.projectId)
      .populate('departmentIds', 'name');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án.' });
    }

    // 3. Kiểm tra xem người gọi API có phải là chủ dự án (ownerId) hoặc Admin không
    if (project.ownerId.toString() !== req.user.id && req.user.roleCode !== 0) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền phân tích ứng viên của dự án này.' });
    }

    // 4. Trích xuất text từ CV (nếu có file)
    let cvText = null;
    if (application.cvFileUrl) {
      cvText = await extractTextFromPdfUrl(application.cvFileUrl);
    }

    // 5. Chuẩn bị dữ liệu đa chiều gửi sang AI
    const applicant = application.applicantId;
    const candidateData = {
      name: applicant?.name || 'Ứng viên',
      department: applicant?.departmentId?.name || '',
      major: applicant?.majorId?.name || '',
      semester: applicant?.semester,
      gpa: applicant?.gpa,
      mainSkills: applicant?.mainSkills || [],
      projectHistory: applicant?.projectHistory || [],
      note: application.note || '',
      cvText
    };

    const projectData = {
      title: project.title,
      description: project.description,
      candidateRequirements: project.candidateRequirements,
      departments: (project.departmentIds || []).map(d => d.name || d),
      gradeTarget: project.gradeTarget
    };

    // 6. Gọi AI Gemini để phân tích
    const aiResult = await matchApplicantWithAI(candidateData, projectData);

    if (aiResult.success) {
      // 7. Cập nhật kết quả vào database
      application.matchPercent = aiResult.data.matchPercent;
      application.matchReason = aiResult.data.summary || 'Đã phân tích độ phù hợp với dự án.';
      application.matchDetails = {
        strengths: aiResult.data.strengths || [],
        weaknesses: aiResult.data.weaknesses || [],
        recommendation: aiResult.data.recommendation || ''
      };
      await application.save();

      return res.status(200).json({
        success: true,
        data: {
          matchPercent: application.matchPercent,
          matchReason: application.matchReason,
          matchDetails: application.matchDetails
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: aiResult.message || 'Lỗi khi phân tích hồ sơ ứng viên.'
      });
    }
  } catch (error) {
    console.error('Lỗi controller AI matchApplicant:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi phân tích ứng viên.' });
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

    // Kiểm tra quyền Admin (roleCode: 0 hoặc 'ADMIN')
    if (req.user.roleCode !== 0 && req.user.roleCode !== 'ADMIN') {
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
