const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Major = require('../models/Major');
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

  // Lấy và phân tích lịch sử dự án
  let projectHistory = [];
  if (bodyData.projectHistory) {
    try {
      projectHistory = typeof bodyData.projectHistory === 'string'
        ? JSON.parse(bodyData.projectHistory)
        : bodyData.projectHistory;
    } catch (e) {
      projectHistory = [];
    }
  }

  // Lấy và phân tích kỹ năng
  let mainSkills = [];
  if (bodyData.mainSkills) {
    try {
      mainSkills = typeof bodyData.mainSkills === 'string'
        ? JSON.parse(bodyData.mainSkills)
        : bodyData.mainSkills;
    } catch (e) {
      mainSkills = [];
    }
  }

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
  if (Array.isArray(projectHistory) && projectHistory.length > 0) {
    const projectsToInsert = projectHistory
      .filter(p => p && p.projectName && p.projectName.trim())
      .map(p => {
        const obj = { ...p, userId, projectName: p.projectName.trim() };
        if (!obj.type) obj.type = 'personal';
        if (!obj.startDate) delete obj.startDate;
        if (!obj.endDate) delete obj.endDate;
        if (obj.type === 'personal') {
          delete obj.role;
          delete obj.task;
        } else if (obj.type === 'group' && !obj.role) {
          obj.role = 'member';
        }
        return obj;
      });

    if (projectsToInsert.length > 0) {
      const inserted = await ProjectHistory.insertMany(projectsToInsert);
      projectHistoryIds = inserted.map(p => p._id);
    }
  }

  // 2. Xử lý Auto-Moderation Skills (Fuzzy Matching)
  const finalSkills = await processSkills(mainSkills);

  // Chuẩn hóa majorId: Hỗ trợ các ngành không có chuyên ngành (lưu null thay vì chuỗi rỗng gây lỗi Cast to ObjectId)
  const validMajorId = (majorId && mongoose.Types.ObjectId.isValid(majorId)) ? majorId : null;

  // 3. Cập nhật User Profile
  const updateData = {
    name,
    phone,
    dob,
    address,
    semester,
    departmentId,
    majorId: validMajorId,
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

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { returnDocument: 'after', runValidators: true })
    .populate('departmentId', 'name')
    .populate('majorId', 'name')
    .populate('projectHistory')
    .select('-password -googleId');

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

  let mainSkills = [];
  if (bodyData.mainSkills) {
    try {
      mainSkills = typeof bodyData.mainSkills === 'string'
        ? JSON.parse(bodyData.mainSkills)
        : bodyData.mainSkills;
    } catch (e) {
      mainSkills = [];
    }
  }
  const finalSkills = await processSkills(mainSkills);

  const validDepartmentId = (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) ? departmentId : null;
  const validMajorId = (majorId && mongoose.Types.ObjectId.isValid(majorId)) ? majorId : null;

  const updateData = {
    name, phone, dob, address, semester,
    departmentId: validDepartmentId,
    majorId: validMajorId,
    mainSkills: finalSkills
  };

  if (validGpa !== undefined) {
    updateData.gpa = validGpa;
  }

  if (privacySettings) {
    try {
      updateData.privacySettings = typeof privacySettings === 'string'
        ? JSON.parse(privacySettings)
        : privacySettings;
    } catch (e) { }
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

/**
 * Tạo biểu thức chính quy (Regex) cho một ký tự hoặc từ tiếng Việt:
 * Không phân biệt hoa/thường (lowercase), không phân biệt có dấu / không dấu.
 * @param {string} token - Từ khóa cần tạo regex
 */
const createVietnameseTokenRegex = (token) => {
  if (!token) return null;

  const charMap = {
    'a': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'd': '[dđ]',
    'e': '[eèéẻẽẹêềếểễệ]',
    'i': '[iìíỉĩị]',
    'o': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'u': '[uùúủũụưừứửữự]',
    'y': '[yỳýỷỹỵ]'
  };

  const removeAccents = (str) => {
    return str.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase();
  };

  let pattern = '';
  for (let i = 0; i < token.length; i++) {
    const char = token[i];
    const lower = char.toLowerCase();
    const baseChar = removeAccents(lower);
    if (charMap[baseChar]) {
      pattern += charMap[baseChar];
    } else {
      pattern += lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }

  return new RegExp(pattern, 'i');
};

/**
 * Xây dựng điều kiện tìm kiếm bao phủ rộng (Broad Matching):
 * - Hỗ trợ hoa/thường (lowercase), không dấu, có dấu tiếng Việt
 * - Chuẩn hóa loại bỏ khoảng trắng thừa
 * - Khớp tất cả các từ trong tên bất kể thứ tự (ví dụ: gõ "Long Nguyen" vẫn tìm ra "Nguyễn Văn Long")
 * - Khớp cả phần tên email / username
 * @param {string} searchString - Chuỗi tìm kiếm nhập từ client
 */
const buildBroadSearchQuery = (searchString) => {
  if (!searchString || !searchString.trim()) return null;

  const clean = searchString.trim().replace(/\s+/g, ' ');
  const tokens = clean.split(' ').filter(t => t.length > 0);

  if (tokens.length === 0) return null;

  // Tìm theo tên: tất cả các từ khóa nhập vào đều phải xuất hiện trong tên
  const nameConditions = tokens.map(token => ({
    name: { $regex: createVietnameseTokenRegex(token) }
  }));

  const nameMatch = nameConditions.length === 1 ? nameConditions[0] : { $and: nameConditions };

  // Tìm theo email (hỗ trợ khi người dùng nhập email hoặc tiền tố email)
  const escapedSearch = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const emailMatch = { email: { $regex: new RegExp(escapedSearch, 'i') } };

  return {
    $or: [nameMatch, emailMatch]
  };
};

/**
 * Tìm kiếm và lấy danh sách sinh viên / thành viên trong cộng đồng
 * @param {Object} query - Tham số tìm kiếm (search, departmentId, page, limit)
 * @param {string} currentUserId - ID người dùng hiện tại
 */
const searchCommunityUsers = async (query = {}, currentUserId = null) => {
  const { search, departmentId, page = 1, limit = 20 } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const andFilters = [
    { isActive: { $ne: 2 } } // Loại trừ tài khoản bị khóa
  ];

  // Tìm kiếm bao phủ rộng (họ tên tiếng Việt không dấu/có dấu, lowercase, email, dọn khoảng trắng)
  const searchCondition = buildBroadSearchQuery(search);
  if (searchCondition) {
    andFilters.push(searchCondition);
  }

  // Lọc theo ngành học nếu có
  if (departmentId) {
    andFilters.push({ departmentId });
  }

  const filter = andFilters.length === 1 ? andFilters[0] : { $and: andFilters };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name email avatar departmentId majorId semester mainSkills onboardingCompleted averageRating totalReviewsReceived currentPackage lastActiveAt')
      .populate('departmentId', 'name')
      .populate('majorId', 'name')
      .sort({ lastActiveAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter)
  ]);

  return {
    users,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

module.exports = {
  updateOnboardingProfile,
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
  checkPhoneAvailability,
  searchCommunityUsers
};
