import { useMutation } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

/**
 * Hook xử lý nghiệp vụ Cập nhật hồ sơ (Onboarding)
 */
export const useOnboardingMutation = (setCurrentStep, setErrors) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload) => profileService.updateOnboardingProfile(payload),
    onSuccess: (res) => {
      toast.success('Lưu hồ sơ thành công!');

      // Cập nhật LocalStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.onboardingCompleted = true;
      if (res.data && res.data.avatar) storedUser.avatar = res.data.avatar;
      localStorage.setItem('user', JSON.stringify(storedUser));

      // Xóa session
      sessionStorage.removeItem('onboardingStep');
      sessionStorage.removeItem('onboardingForm');

      setTimeout(() => {
        navigate('/');
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
