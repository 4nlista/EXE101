import axiosClient from '../utils/axiosClient';

/**
 * Service xử lý các API lấy dữ liệu chung (Master Data)
 */
export const masterDataService = {
  getDepartments: async () => {
    return await axiosClient.get('/departments');
  },
  
  getMajors: async (departmentId) => {
    return await axiosClient.get(`/majors/${departmentId}`);
  },

  getSkills: async () => {
    return await axiosClient.get('/skills');
  }
};
