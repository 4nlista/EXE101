import axiosClient from '../utils/axiosClient';

/**
 * Service xử lý toàn bộ các API quản trị hệ thống (/api/admin)
 */
export const adminService = {
  // 1. Thống kê Dashboard
  getStats: async () => {
    return await axiosClient.get('/admin/stats');
  },

  // 2. Quản lý người dùng
  getUsers: async (params = {}) => {
    return await axiosClient.get('/admin/users', { params });
  },

  lockUser: async (userId, reason) => {
    return await axiosClient.put(`/admin/users/${userId}/lock`, { reason });
  },

  unlockUser: async (userId) => {
    return await axiosClient.put(`/admin/users/${userId}/unlock`);
  },

  // 3. Kiểm duyệt dự án
  getProjects: async (params = {}) => {
    return await axiosClient.get('/admin/projects', { params });
  },

  moderateProject: async (projectId, payload) => {
    return await axiosClient.post(`/admin/projects/${projectId}/moderate`, payload);
  },

  // 4. Quản lý Ngành học
  getDepartments: async () => {
    return await axiosClient.get('/admin/departments');
  },

  createDepartment: async (payload) => {
    return await axiosClient.post('/admin/departments', payload);
  },

  toggleDepartmentStatus: async (departmentId) => {
    return await axiosClient.put(`/admin/departments/${departmentId}/toggle`);
  },

  // 5. Quản lý Chuyên ngành
  getMajors: async (departmentId = '') => {
    const params = departmentId ? { departmentId } : {};
    return await axiosClient.get('/admin/majors', { params });
  },

  createMajor: async (payload) => {
    return await axiosClient.post('/admin/majors', payload);
  },

  toggleMajorStatus: async (majorId) => {
    return await axiosClient.put(`/admin/majors/${majorId}/toggle`);
  },

  // 5. Quản lý Kỹ năng
  getSkills: async (params = {}) => {
    return await axiosClient.get('/admin/skills', { params });
  },

  createSkill: async (payload) => {
    return await axiosClient.post('/admin/skills', payload);
  },

  approveSkill: async (skillId) => {
    return await axiosClient.put(`/admin/skills/${skillId}/approve`);
  },

  // 6. Trợ lý Gemini AI
  askAi: async (prompt) => {
    return await axiosClient.post('/admin/ai-chat', { prompt });
  }
};
