const applicationService = require('../services/applicationService');
const { applyProjectSchema } = require('../validations/applicationValidation');

/**
 * [POST] /api/projects/:projectId/apply
 * Tạo hồ sơ ứng tuyển mới
 */
const createApplication = async (req, res) => {
  try {
    const { projectId } = req.params;
    const applicantId = req.user.id;
    const { note } = req.body;
    
    // Validate dữ liệu text (Ghi chú) bằng Joi
    const { error } = applyProjectSchema.validate({ note });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Lấy link file từ Multer (Cloudinary)
    const cvFileUrl = req.file ? req.file.path : null;
    if (!cvFileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải lên file CV (định dạng PDF).'
      });
    }

    // Gọi service xử lý logic
    const application = await applicationService.createApplication(
      projectId,
      applicantId,
      cvFileUrl,
      note
    );

    return res.status(201).json({
      success: true,
      message: 'Gửi hồ sơ ứng tuyển thành công.',
      data: application
    });

  } catch (error) {
    // Các lỗi bắt được từ Service (ví dụ: đã nộp rồi, dự án full, v.v)
    return res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi gửi hồ sơ ứng tuyển.',
      status: error.appStatus || null,
      rejectionCount: error.rejectionCount || 0
    });
  }
};

/**
 * [GET] /api/projects/:projectId/application-status
 * Kiểm tra xem user hiện tại đã ứng tuyển dự án này chưa
 */
const checkApplicationStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const applicantId = req.user.id;
    
    const result = await applicationService.checkApplicationStatus(projectId, applicantId);
    
    return res.status(200).json({
      success: true,
      canApply: result.canApply,
      status: result.status,
      rejectionCount: result.rejectionCount
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra trạng thái ứng tuyển.'
    });
  }
};

/**
 * [GET] /api/applications/my-applications
 * Lấy danh sách hồ sơ user đã nộp
 */
const getMyApplications = async (req, res) => {
  try {
    const applicantId = req.user.id;
    const result = await applicationService.getMyApplications(applicantId, req.query);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách hồ sơ.'
    });
  }
};

/**
 * [PATCH] /api/applications/:id/cancel
 * Hủy đơn đang PENDING
 */
const cancelApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const applicantId = req.user.id;
    
    await applicationService.cancelApplication(applicationId, applicantId);
    
    return res.status(200).json({
      success: true,
      message: 'Hủy đơn đăng ký thành công.'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi hủy đơn.'
    });
  }
};

/**
 * [PATCH] /api/applications/:id/accept-invite
 * Chấp nhận lời mời INVITED
 */
const acceptInvite = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const applicantId = req.user.id;
    
    const result = await applicationService.acceptInvite(applicationId, applicantId);
    
    return res.status(200).json({
      success: true,
      message: 'Đã chấp nhận lời mời tham gia dự án.',
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi chấp nhận lời mời.'
    });
  }
};

/**
 * [PATCH] /api/applications/:id/decline-invite
 * Từ chối lời mời INVITED
 */
const declineInvite = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const applicantId = req.user.id;
    
    await applicationService.declineInvite(applicationId, applicantId);
    
    return res.status(200).json({
      success: true,
      message: 'Đã từ chối lời mời tham gia dự án.'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi từ chối lời mời.'
    });
  }
};

module.exports = {
  createApplication,
  checkApplicationStatus,
  getMyApplications,
  cancelApplication,
  acceptInvite,
  declineInvite
};
