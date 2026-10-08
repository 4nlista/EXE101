const User = require('../models/User');
const ProjectHistory = require('../models/ProjectHistory');
const Skill = require('../models/Skill');
const Subscription = require('../models/Subscription');
const { SUBSCRIPTION_STATUS } = require('../constants/subscriptionEnum');
const Fuse = require('fuse.js');

// Helper xử lý kỹ năng bằng Fuzzy Matching
const processSkills = async (mainSkills) => {
  const finalSkills = [];
  if (mainSkills && mainSkills.length > 0) {
    const allSkills = await Skill.find();
    const fuse = new Fuse(allSkills, {
      keys: ['name'],
      threshold: 0.3
    });

    for (let rawSkill of mainSkills) {
      const trimmedSkill = rawSkill.trim();
      if (!trimmedSkill) continue;

      const searchResult = fuse.search(trimmedSkill);

      if (searchResult.length > 0) {
        const matchedSkill = searchResult[0].item;
        matchedSkill.usageCount += 1;
        if (matchedSkill.usageCount >= 3) {
          matchedSkill.isApproved = true;
        }
        await matchedSkill.save();
        finalSkills.push(matchedSkill.name);
      } else {
        const normalizedName = trimmedSkill
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        const newSkill = await Skill.create({
          name: normalizedName,
          isApproved: false,
          usageCount: 1
        });
        finalSkills.push(newSkill.name);
        fuse.add(newSkill);
      }
    }
  }
  return [...new Set(finalSkills)];
};

// Hàm cập nhật hồ sơ user (Onboarding)
const updateOnboardingProfile = async (userId, bodyData, avatarUrl) => {
  const {
    name,
    phone,
    dob,
    address,
    semester,
    departmentId,
    majorId,
    gpa
  } = bodyData;

  // Kiểm tra tính duy nhất của số điện thoại nếu có
  if (phone) {
    const existingPhone = await User.findOne({ phone: phone.trim(), _id: { $ne: userId } });
    if (existingPhone) {
      const error = new Error('Số điện thoại này đã được sử dụng bởi một tài khoản khác.');
      error.statusCode = 400;
      throw error;
    }
  }

  // Kiểm tra tính hợp lệ của điểm GPA (thang điểm 4.0)
  let validGpa = undefined;
  if (gpa !== undefined && gpa !== null && gpa !== '') {
    const numGpa = Number(gpa);
    if (isNaN(numGpa) || numGpa < 0 || numGpa > 4.0) {
      const error = new Error('Điểm GPA phải nằm trong khoảng từ 0.0 đến 4.0');
      error.statusCode = 400;
      throw error;
    }
    validGpa = numGpa;
  }

  // 1. Lưu Lịch sử dự án
  await ProjectHistory.deleteMany({ userId });

  let projectHistoryIds = [];
  if (projectHistory && projectHistory.length > 0) {
    const projectsToInsert = projectHistory.map(p => {
      const obj = { ...p, userId };
      if (!obj.startDate) delete obj.startDate;
      if (!obj.endDate) delete obj.endDate;
      if (obj.type === 'personal') {
        delete obj.role;
        delete obj.task;
      }
      return obj;
    });
    const inserted = await ProjectHistory.insertMany(projectsToInsert);
    projectHistoryIds = inserted.map(p => p._id);
  }

  // 2. Xử lý Auto-Moderation Skills (Fuzzy Matching)
  const finalSkills = await processSkills(mainSkills);

  // 3. Cập nhật User Profile
  const updateData = {
    name,
    phone,
    dob,
    address,
    semester,
    departmentId,
    majorId,
    mainSkills: [...new Set(finalSkills)],
    projectHistory: projectHistoryIds,
    onboardingCompleted: true
  };

  if (validGpa !== undefined) {
    updateData.gpa = validGpa;
  }

  if (avatarUrl) {
    updateData.avatar = avatarUrl;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { returnDocument: 'after', runValidators: true });

  return updatedUser;
};

const getMyProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate('departmentId', 'name')
    .populate('majorId', 'name')
    .populate('projectHistory')
    .select('-password -googleId'); // Không trả về mật khẩu

  if (!user) return null;

  const userData = user.toObject();

  // Find active subscription if any
  if (user.currentPackage !== 'free') {
    const activeSub = await Subscription.findOne({ 
      userId: user._id, 
      status: SUBSCRIPTION_STATUS.ACTIVE 
    }).sort({ endDate: -1 });

    if (activeSub) {
      userData.subscriptionEndDate = activeSub.endDate;
    }
  }

  return userData;
};

const getPublicProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate('departmentId', 'name')
    .populate('majorId', 'name')
    .populate('projectHistory')
    .select('-password -googleId -walletBalance');

  if (!user) return null;

  const publicData = user.toObject();
  const privacy = publicData.privacySettings || {};

  // Lọc dữ liệu dựa trên privacySettings
  if (!privacy.email) delete publicData.email;
  if (!privacy.phone) delete publicData.phone;
  if (!privacy.dob) delete publicData.dob;
  if (!privacy.address) delete publicData.address;
  if (!privacy.semester) delete publicData.semester;
  if (!privacy.departmentId) delete publicData.departmentId;
  if (!privacy.majorId) delete publicData.majorId;
  if (!privacy.mainSkills) delete publicData.mainSkills;
  if (!privacy.projectHistory) delete publicData.projectHistory;
  if (!privacy.gpa) delete publicData.gpa;

  return publicData;
};

const updateMyProfile = async (userId, bodyData, avatarUrl) => {
  const {
    name, phone, dob, address, semester, departmentId, majorId, gpa, privacySettings
  } = bodyData;

  // Kiểm tra tính duy nhất của số điện thoại nếu có
  if (phone) {
    const existingPhone = await User.findOne({ phone: phone.trim(), _id: { $ne: userId } });
    if (existingPhone) {
      const error = new Error('Số điện thoại này đã được sử dụng bởi một tài khoản khác.');
      error.statusCode = 400;
      throw error;
    }
  }

  // Kiểm tra tính hợp lệ của điểm GPA (thang điểm 4.0)
  let validGpa = undefined;
  if (gpa !== undefined && gpa !== null && gpa !== '') {
    const numGpa = Number(gpa);
    if (isNaN(numGpa) || numGpa < 0 || numGpa > 4.0) {
      const error = new Error('Điểm GPA phải nằm trong khoảng từ 0.0 đến 4.0');
      error.statusCode = 400;
      throw error;
    }
    validGpa = numGpa;
  }

  let mainSkills = bodyData.mainSkills ? JSON.parse(bodyData.mainSkills) : [];
  const finalSkills = await processSkills(mainSkills);

  const updateData = {
    name, phone, dob, address, semester, departmentId, majorId,
    mainSkills: finalSkills
  };

  if (validGpa !== undefined) {
    updateData.gpa = validGpa;
  }

  if (privacySettings) {
    updateData.privacySettings = JSON.parse(privacySettings);
  }
  if (avatarUrl) {
    updateData.avatar = avatarUrl;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { returnDocument: 'after', runValidators: true })
    .populate('departmentId', 'name')
    .populate('majorId', 'name')
    .populate('projectHistory')
    .select('-password -googleId');
  return updatedUser;
};

/**
 * Kiểm tra số điện thoại có khả dụng không (chưa có tài khoản khác sử dụng)
 * @param {string} phone - Số điện thoại cần kiểm tra
 * @param {string} currentUserId - ID người dùng hiện tại (bỏ qua chính họ khi edit)
 */
const checkPhoneAvailability = async (phone, currentUserId) => {
  if (!phone) return true;
  const query = { phone: phone.trim() };
  if (currentUserId) {
    query._id = { $ne: currentUserId };
  }
  const existingUser = await User.findOne(query);
  return !existingUser;
};

module.exports = {
  updateOnboardingProfile,
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
  checkPhoneAvailability
};
