import { useMutation } from '@tanstack/react-query';
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
