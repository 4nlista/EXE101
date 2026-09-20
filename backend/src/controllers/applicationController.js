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
      reason: error.reason || null
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
    
    const status = await applicationService.checkApplicationStatus(projectId, applicantId);
    
    return res.status(200).json({
      success: true,
      canApply: status.canApply,
      reason: status.reason
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra trạng thái ứng tuyển.'
    });
  }
};

module.exports = {
  createApplication,
  checkApplicationStatus
};
