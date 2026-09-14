const User = require('../models/User');
const ProjectHistory = require('../models/ProjectHistory');
const Skill = require('../models/Skill');
const Fuse = require('fuse.js');

/**
 * PUT /api/user/onboarding
 * Hoàn thiện hồ sơ 4 bước
 */
const updateOnboardingProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // Lấy từ authMiddleware
    const {
      name,
      phone,
      dob,
      address,
      semester,
      departmentId,
      majorId,
      gradeGoal
    } = req.body;

    // Phân tích cú pháp do truyền qua FormData (FormData biến array/object thành string)
    if (!name || !phone || !departmentId) {
      return res.status(400).json({ success: false, message: 'Dữ liệu hồ sơ bị thiếu hoặc không đúng định dạng. Xin vui lòng thử lại!' });
    }

    let mainSkills = req.body.mainSkills ? JSON.parse(req.body.mainSkills) : [];
    let projectHistory = req.body.projectHistory ? JSON.parse(req.body.projectHistory) : [];

    // Avatar từ Cloudinary
    let avatarUrl = req.file ? req.file.path : undefined;

    // 1. Lưu Lịch sử dự án
    // Xóa các dự án cũ (nếu có trường hợp gọi lại API)
    await ProjectHistory.deleteMany({ userId });
    
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
      await ProjectHistory.insertMany(projectsToInsert);
    }

    // 2. Xử lý Auto-Moderation Skills (Fuzzy Matching)
    const finalSkills = [];
    if (mainSkills && mainSkills.length > 0) {
      const allSkills = await Skill.find();
      // Khởi tạo thuật toán Fuse.js (Fuzzy Matching)
      const fuse = new Fuse(allSkills, {
        keys: ['name'],
        threshold: 0.3 // Độ lệch (0 là giống hoàn toàn, 1 là khác hoàn toàn). 0.3 cho phép sai chính tả nhẹ
      });

      for (let rawSkill of mainSkills) {
        // Chuẩn hóa nhẹ chuỗi nhập vào: cắt khoảng trắng thừa
        const trimmedSkill = rawSkill.trim();
        if (!trimmedSkill) continue;

        const searchResult = fuse.search(trimmedSkill);
        
        if (searchResult.length > 0) {
          // GOM NHÓM: Tìm thấy từ gốc tương đồng
          const matchedSkill = searchResult[0].item;
          matchedSkill.usageCount += 1;
          // Thuật toán đám đông: trên 3 người dùng thì duyệt
          if (matchedSkill.usageCount >= 3) {
            matchedSkill.isApproved = true;
          }
          await matchedSkill.save();
          finalSkills.push(matchedSkill.name);
        } else {
          // TẠO MỚI: Từ hoàn toàn lạ
          // Hàm chuẩn hóa viết hoa chữ cái đầu (vd: "cắm hoa" -> "Cắm Hoa")
          const normalizedName = trimmedSkill
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          const newSkill = await Skill.create({
            name: normalizedName,
            isApproved: false, // Lưu tạm để theo dõi
            usageCount: 1
          });
          finalSkills.push(newSkill.name);
          
          // Thêm ngay vào instance fuse để các vòng lặp sau có thể gom nhóm nếu bị trùng (trong cùng 1 request)
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
      mainSkills: [...new Set(finalSkills)], // Xóa trùng lặp trong mảng
      gradeGoal,
      onboardingCompleted: true
    };

    if (avatarUrl) {
      updateData.avatar = avatarUrl;
    }

    // validate logic (bắt lỗi mongoose) sẽ được gọi nhờ { runValidators: true }
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: 'Hồ sơ đã được cập nhật thành công',
      data: updatedUser
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateOnboardingProfile
};
