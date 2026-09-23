import axiosClient from '../utils/axiosClient';

const paymentService = {
  // Tạo Order và lấy thông tin QR Code (VietQR)
  createPayment: async (packageType, amount) => {
    const response = await axiosClient.post('/payment/create_payment', {
      packageType,
      amount
    });
    return response;
  },

  // Client gọi API liên tục (Polling) để kiểm tra trạng thái thanh toán 
  checkPaymentStatus: async (orderId) => {
    const response = await axiosClient.get(`/payment/status/${orderId}`);
    return response;
  },

  // (Chỉ dùng cho DEV/TEST) Giả lập thanh toán thành công
  mockPayment: async (orderId) => {
    const response = await axiosClient.post('/payment/mock_payment', {
      orderId
    });
    return response;
  }
};

export default paymentService;
