import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook xử lý nghiệp vụ Cập nhật hồ sơ (Onboarding)
 */
export const useOnboardingMutation = (setCurrentStep, setErrors) => {
  const navigate = useNavigate();
  const { completeProfile } = useAuth();

  return useMutation({
    mutationFn: (payload) => profileService.updateOnboardingProfile(payload),
    onSuccess: (res) => {
      toast.success('Lưu hồ sơ thành công!');

      // Cập nhật State và Storage thông qua hàm chuẩn của AuthContext
      completeProfile({
        avatar: res.data?.avatar
      });

      // Xóa session
      sessionStorage.removeItem('onboardingStep');
      sessionStorage.removeItem('onboardingForm');

      setTimeout(() => {
        navigate('/feed');
      }, 1500);
    },
    onError: (error) => {
      const errorMsg = error.message || error.response?.data?.message || 'Có lỗi xảy ra khi lưu hồ sơ';
      if (typeof errorMsg === 'string' && errorMsg.includes('duplicate key')) {
        toast.error('Số điện thoại này đã được người khác sử dụng!');
        setCurrentStep(1);
        setErrors({ phone: 'SĐT đã tồn tại trong hệ thống' });
      } else {
        toast.error(errorMsg);
      }
    }
  });
};

// hook lấy dữ liệu profile của user đang đăng nhập
export const useMyProfile = () => {
  return useQuery({
    queryKey: ['myProfile'],  // khóa lưu cache, lưu toàn bộ dư liệu của user X vào memory ram của browser
    queryFn: () => profileService.getMyProfile(),
    staleTime: 5 * 60 * 1000, // Dữ liệu được coi là "tươi mới" trong vòng 5 phút
  });
};

export const usePublicProfile = (id) => {
  return useQuery({
    queryKey: ['publicProfile', id],
    queryFn: () => profileService.getPublicProfile(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const { completeProfile } = useAuth();

  return useMutation({
    mutationFn: (payload) => profileService.updateMyProfile(payload),
    onSuccess: (res) => {
      toast.success('Cập nhật hồ sơ thành công!');
      completeProfile({
        avatar: res.data?.avatar
      });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
    }
  });
};

export const useCreateProjectHistoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => profileService.createProjectHistory(data),
    onSuccess: () => {
      toast.success('Thêm dự án thành công!');
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm dự án');
    }
  });
};

export const useUpdateProjectHistoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => profileService.updateProjectHistory(id, data),
    onSuccess: () => {
      toast.success('Cập nhật dự án thành công!');
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dự án');
    }
  });
};

export const useDeleteProjectHistoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => profileService.deleteProjectHistory(id),
    onSuccess: () => {
      toast.success('Đã xóa dự án!');
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa dự án');
    }
  });
};
