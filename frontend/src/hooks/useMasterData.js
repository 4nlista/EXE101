import { useQuery } from '@tanstack/react-query';
import { masterDataService } from '../services/masterDataService';

// Helper function để lấy chính xác data bất chấp cấu trúc trả về
const extractData = (res) => {
  // Tránh trường hợp axiosClient trả về { success, data } hoặc bọc thêm lớp nữa
  const data = res?.data?.data || res?.data || res;
  return Array.isArray(data) ? data : [];
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await masterDataService.getDepartments();
      return extractData(res);
    },
    staleTime: Infinity, // Dữ liệu này gần như không bao giờ đổi
  });
};

export const useMajors = (departmentId) => {
  return useQuery({
    queryKey: ['majors', departmentId],
    queryFn: async () => {
      if (!departmentId) return [];
      const res = await masterDataService.getMajors(departmentId);
      return extractData(res);
    },
    enabled: !!departmentId, // Chỉ chạy khi có departmentId
    staleTime: Infinity,
  });
};

export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const res = await masterDataService.getSkills();
      const data = extractData(res);
      // Chuyển đổi sang format react-select
      return data.map(skill => ({ value: skill, label: skill }));
    },
    staleTime: Infinity,
  });
};
