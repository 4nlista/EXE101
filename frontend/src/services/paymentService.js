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
  },

  // Lấy lịch sử giao dịch
  getMyTransactions: async (fromDate, toDate) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);
    
    let url = '/payment/my-transactions';
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await axiosClient.get(url);
    return response;
  },

  // Lấy chi tiết 1 đơn hàng PENDING
  getTransactionInfo: async (orderId) => {
    const response = await axiosClient.get(`/payment/transaction/${orderId}`);
    return response;
  },

  // Hủy giao dịch
  cancelPayment: async (orderId) => {
    const response = await axiosClient.post('/payment/cancel', { orderId });
    return response;
  }
};

export default paymentService;
