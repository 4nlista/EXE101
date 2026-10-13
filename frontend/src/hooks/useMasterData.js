import { useQuery } from '@tanstack/react-query';
import { masterDataService } from '../services/masterDataService';

// Helper function để lấy chính xác data bất chấp cấu trúc trả về
const extractData = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.data)) return res.data.data;
  return [];
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await masterDataService.getDepartments();
      return extractData(res);
    },
    staleTime: 1000 * 60 * 30, // 30 phút
    placeholderData: [],
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
    staleTime: 1000 * 60 * 30,
    placeholderData: [],
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
    staleTime: 1000 * 60 * 30,
    placeholderData: [],
  });
};
