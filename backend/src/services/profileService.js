const User = require('../models/User');

/**
 * Cập nhật thông tin profile onboarding
 * @param {string} userId 
 * @param {Object} updateData 
 */
const updateOnboardingProfile = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
};

module.exports = {
  updateOnboardingProfile
};
