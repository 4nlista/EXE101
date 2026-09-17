const User = require('../models/User');
const ProjectHistory = require('../models/ProjectHistory');
const Skill = require('../models/Skill');
const Fuse = require('fuse.js');

// Hàm cập nhật hồ sơ user
const updateOnboardingProfile = async (userId, bodyData, avatarUrl) => {
  const {
    name,
    phone,
    dob,
    address,
    semester,
    departmentId,
    majorId,
    gradeGoal
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
    gradeGoal,
    onboardingCompleted: true
  };

  if (avatarUrl) {
    updateData.avatar = avatarUrl;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

  return updatedUser;
};

module.exports = {
  updateOnboardingProfile
};
