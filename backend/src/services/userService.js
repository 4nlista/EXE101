const User = require('../models/User');

/**
 * Cập nhật thông tin hồ sơ 4 bước cho User
 * @param {string} userId - ID người dùng cần cập nhật
 * @param {Object} setupData - Dữ liệu hồ sơ
 */
const setupProfile = async (userId, setupData) => {
  // 1. Tìm user
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Không tìm thấy thông tin người dùng.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Cập nhật dữ liệu từ setupData
  // BƯỚC 1: CÁ NHÂN
  if (setupData.name) user.name = setupData.name;
  if (setupData.phone) user.phone = setupData.phone;
  if (setupData.address) user.address = setupData.address;
  if (setupData.dob) user.dob = setupData.dob;
  
  // BƯỚC 2: HỌC TẬP
  if (setupData.semester) user.semester = setupData.semester;
  if (setupData.majorId) user.majorId = setupData.majorId;
  if (setupData.specializationId) user.specializationId = setupData.specializationId;

  // BƯỚC 3: HỒ SƠ NĂNG LỰC
  if (setupData.mainSkills) user.mainSkills = setupData.mainSkills;
  if (setupData.strengths) user.strengths = setupData.strengths;
  if (setupData.weaknesses) user.weaknesses = setupData.weaknesses;
  if (setupData.projectHistory) user.projectHistory = setupData.projectHistory;

  // BƯỚC 4: MỤC TIÊU
  if (setupData.gradeGoal) user.gradeGoal = setupData.gradeGoal;

  // 3. Đánh dấu đã hoàn thiện hồ sơ
  user.onboardingCompleted = true;

  // 4. Lưu vào Database
  await user.save();

  return user;
};

module.exports = {
  setupProfile
};
