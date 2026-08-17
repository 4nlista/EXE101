// Trạng thái hoạt động tài khoản
const IS_ACTIVE = {
  OFFLINE: 0,     // Tài khoản không hoạt động (Offline)
  ONLINE: 1,      // Tài khoản đang hoạt động (Online)
  LOCKED: 2       // Tài khoản bị khóa bởi Admin
};

// Loại dự án trong lịch sử dự án cá nhân
const PROJECT_HISTORY_TYPE = {
  PERSONAL: 'personal',   // Dự án cá nhân
  GROUP: 'group'           // Dự án nhóm
};

// Vai trò trong dự án (lịch sử)
const PROJECT_HISTORY_ROLE = {
  LEADER: 'leader',   // Trưởng nhóm
  MEMBER: 'member'    // Thành viên
};

module.exports = { IS_ACTIVE, PROJECT_HISTORY_TYPE, PROJECT_HISTORY_ROLE };
