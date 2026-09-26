const User = require('../models/User');
const ProjectHistory = require('../models/ProjectHistory');
const Skill = require('../models/Skill');
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

  let mainSkills = bodyData.mainSkills ? JSON.parse(bodyData.mainSkills) : [];
  let projectHistory = bodyData.projectHistory ? JSON.parse(bodyData.projectHistory) : [];

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
    gpa,
    onboardingCompleted: true
  };

  if (avatarUrl) {
    updateData.avatar = avatarUrl;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { returnDocument: 'after', runValidators: true });

  return updatedUser;
};

const getMyProfile = async (userId) => {
  return await User.findById(userId)
    .populate('departmentId', 'name')
    .populate('majorId', 'name')
    .populate('projectHistory')
    .select('-password -googleId'); // Không trả về mật khẩu
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

  let mainSkills = bodyData.mainSkills ? JSON.parse(bodyData.mainSkills) : [];
  const finalSkills = await processSkills(mainSkills);

  const updateData = {
    name, phone, dob, address, semester, departmentId, majorId, gpa,
    mainSkills: finalSkills
  };

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

module.exports = {
  updateOnboardingProfile,
  getMyProfile,
  getPublicProfile,
  updateMyProfile
};
