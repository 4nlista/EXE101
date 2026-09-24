const moment = require('moment');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { TRANSACTION_STATUS, PAYMENT_METHOD } = require('../constants/transactionEnum');
const { PACKAGE_TYPE, SUBSCRIPTION_STATUS } = require('../constants/subscriptionEnum');
const { NOTIFICATION_TYPE } = require('../constants/notificationEnum');
const sendEmail = require('../utils/emailSender');

// Hàm 1: Tạo mã QR thanh toán (Backend trả về link VietQR)
exports.createPaymentUrl = async (req) => {
  const { packageType, amount } = req.body;
  const userId = req.user.id || req.user._id;

  // Lấy giá chuẩn để chống thay đổi amount từ Client
  let trueAmount = 0;
  if (packageType === PACKAGE_TYPE.VIP) trueAmount = 59000;
  else if (packageType === PACKAGE_TYPE.PREMIUM) trueAmount = 139000;
  else throw new Error('Gói dịch vụ không hợp lệ');

  if (amount !== trueAmount) {
    throw new Error('Số tiền thanh toán không khớp với gói dịch vụ');
  }

  // Check chặn hạ cấp
  const activeSub = await Subscription.findOne({
    userId,
    status: SUBSCRIPTION_STATUS.ACTIVE
  });
  if (activeSub && activeSub.packageType === PACKAGE_TYPE.PREMIUM && packageType === PACKAGE_TYPE.VIP) {
    throw new Error('Không thể mua gói VIP khi gói PREMIUM đang còn hiệu lực');
  }

  // Lấy thông tin tài khoản ngân hàng cá nhân từ file .env
  const bankBin = process.env.SEPAY_BANK_BIN || '970422'; // Ví dụ mặc định: MB Bank
  const bankAccount = process.env.SEPAY_BANK_ACCOUNT;
  if (!bankAccount) {
    throw new Error('Chưa cấu hình số tài khoản nhận tiền trong .env');
  }

  // Khởi tạo Transaction ở trạng thái Pending
  const newTransaction = await Transaction.create({
    userId,
    amount: trueAmount,
    paymentMethod: PAYMENT_METHOD.SEPAY,
    description: `Mua_goi_${packageType}`, // metadata
    status: TRANSACTION_STATUS.PENDING
  });

  const orderId = newTransaction._id.toString();

  // Tạo URL ảnh VietQR
  // Cú pháp: https://img.vietqr.io/image/<BANK_BIN>/<ACCOUNT_NO>?amount=<AMOUNT>&addInfo=<CONTENT>
  // Nội dung chuyển khoản phải chứa orderId để Webhook nhận diện được
  const addInfo = `EXE101 ${orderId}`;
  const qrUrl = `https://img.vietqr.io/image/${bankBin}-${bankAccount}-qr_only.png?amount=${trueAmount}&addInfo=${encodeURIComponent(addInfo)}`;

  return { 
    qrUrl,
    orderId,
    amount: trueAmount,
    content: addInfo
  };
};

// Hàm 2: API Polling để Frontend liên tục gọi hỏi trạng thái (Đã thanh toán chưa)
exports.checkPaymentStatus = async (orderId) => {
  const transaction = await Transaction.findById(orderId);
  if (!transaction) throw new Error('Giao dịch không tồn tại');

  return { status: transaction.status };
};

// Hàm 3: Webhook do SePay bắn về mỗi khi tài khoản ngân hàng nhận được tiền
exports.sepayWebhook = async (req) => {
  const { gateway, transactionDate, accountNumber, code, content, transferType, transferAmount } = req.body;

  // Lọc lấy các giao dịch Nạp tiền (in)
  if (transferType !== 'in') {
    return { success: true, message: 'Bỏ qua giao dịch rút tiền' };
  }

  // Tìm orderId trong nội dung chuyển khoản bằng Regex
  // VD: Nội dung là "NGUYEN VAN A CHUYEN TIEN EXE101 64e2b9c3f..."
  const match = content.match(/EXE101\s([a-f0-9]{24})/i);
  if (!match) {
    return { success: true, message: 'Giao dịch không chứa mã Order của hệ thống' };
  }

  const orderId = match[1];

  const transaction = await Transaction.findById(orderId);
  if (!transaction) {
    return { success: true, message: 'Order không tồn tại trên hệ thống' };
  }

  // Nếu giao dịch đã được xử lý từ trước rồi thì bỏ qua
  if (transaction.status !== TRANSACTION_STATUS.PENDING) {
    return { success: true, message: 'Giao dịch này đã được xác nhận trước đó' };
  }

  // Kiểm tra số tiền khách chuyển có đủ hay không
  if (transferAmount < transaction.amount) {
    // Khách chuyển thiếu tiền -> Chuyển sang Failed
    transaction.status = TRANSACTION_STATUS.FAILED;
    transaction.sepayTransactionId = code; 
    transaction.description = `Chuyển thiếu tiền (${transferAmount}đ / ${transaction.amount}đ). Cần Admin xử lý hoàn tiền thủ công.`;
    await transaction.save();

    // Bắn thông báo cho User biết giao dịch lỗi
    const user = await User.findById(transaction.userId);
    if (user) {
      await Notification.create({
        userId: user._id,
        type: NOTIFICATION_TYPE.SUBSCRIPTION,
        title: 'Giao dịch không thành công',
        message: `Bạn đã chuyển thiếu tiền (chỉ gửi ${transferAmount.toLocaleString()}đ). Giao dịch bị hủy. Vui lòng liên hệ bộ phận CSKH để được hoàn tiền.`
      });
    }

    return { success: true, message: 'Giao dịch chuyển thiếu tiền. Chờ Admin xử lý hoàn tiền.' };
  }

  // Xử lý thành công
  transaction.status = TRANSACTION_STATUS.SUCCESS;
  transaction.sepayTransactionId = code; // Mã giao dịch ngân hàng do SePay gửi qua
  transaction.paidAt = new Date(transactionDate);

  const user = await User.findById(transaction.userId);
  const packageType = transaction.description.replace('Mua_goi_', ''); 
  const isUpgradingToPremium = packageType === PACKAGE_TYPE.PREMIUM;

  let activeSub = await Subscription.findOne({ userId: user._id, status: SUBSCRIPTION_STATUS.ACTIVE });
  let startDate = new Date();
  let endDate = moment(startDate).add(30, 'days').toDate();

  if (activeSub) {
    if (activeSub.packageType === packageType) {
      // Gia hạn
      startDate = activeSub.endDate; 
      endDate = moment(startDate).add(30, 'days').toDate();
      activeSub.endDate = endDate;
      await activeSub.save();
      transaction.subscriptionId = activeSub._id;
    } else if (isUpgradingToPremium && activeSub.packageType === PACKAGE_TYPE.VIP) {
      // Nâng cấp
      activeSub.status = SUBSCRIPTION_STATUS.CANCELLED;
      await activeSub.save();
      const newSub = await Subscription.create({
        userId: user._id, packageType, price: transferAmount, startDate, endDate
      });
      transaction.subscriptionId = newSub._id;
    }
  } else {
    // Mua mới
    const newSub = await Subscription.create({
      userId: user._id, packageType, price: transferAmount, startDate, endDate
    });
    transaction.subscriptionId = newSub._id;
  }

  await transaction.save();

  user.currentPackage = packageType;
  await user.save();

  // Tạo thông báo in-app
  await Notification.create({
    userId: user._id,
    type: NOTIFICATION_TYPE.SUBSCRIPTION,
    title: 'Thanh toán thành công',
    content: `Chúc mừng bạn đã nâng cấp tài khoản ${packageType.toUpperCase()}!`
  });

  // Gửi Email
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2e6c80;">Thanh toán thành công!</h2>
      <p>Xin chào <strong>${user.name || user.email}</strong>,</p>
      <p>Cảm ơn bạn đã tin tưởng nâng cấp tài khoản qua mã QR ngân hàng.</p>
      <ul>
        <li><strong>Gói dịch vụ:</strong> ${packageType.toUpperCase()}</li>
        <li><strong>Mã đối soát (Ngân hàng):</strong> ${code}</li>
        <li><strong>Thời hạn đến:</strong> ${moment(endDate).format('HH:mm - DD/MM/YYYY')}</li>
      </ul>
      <p>Hãy trải nghiệm các tính năng cao cấp ngay hôm nay!</p>
    </div>
  `;
  await sendEmail(user.email, 'Xác nhận thanh toán gói dịch vụ thành công', emailHtml);

  // Trả về JSON thành công cho webhook của SePay
  return { success: true, message: 'Xử lý thành công giao dịch SePay' };
};

// Hàm 4: Lấy lịch sử giao dịch thành công của User
exports.getMyTransactions = async (userId, fromDate, toDate) => {
  const query = {
    userId,
    status: TRANSACTION_STATUS.SUCCESS
  };

  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) {
      query.createdAt.$gte = new Date(fromDate);
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      query.createdAt.$lte = to;
    }
  }

  const transactions = await Transaction.find(query).sort({ createdAt: -1 });
  return transactions;
};

// Hàm 5: Lấy thông tin 1 giao dịch để hiển thị QR
exports.getTransactionInfo = async (orderId, userId) => {
  const transaction = await Transaction.findOne({ _id: orderId, userId });
  if (!transaction) throw new Error('Không tìm thấy giao dịch');
  if (transaction.status !== TRANSACTION_STATUS.PENDING) {
    throw new Error('Giao dịch này không còn hợp lệ để thanh toán');
  }

  // Tạo lại thông tin QR giống lúc createPaymentUrl
  const bankId = 'MB'; 
  const accountNo = '0396697192'; 
  const accountName = 'DO TUAN MINH';

  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.jpg?amount=${transaction.amount}&addInfo=EXE101%20${transaction._id}&accountName=${accountName}`;
  
  return {
    orderId: transaction._id,
    amount: transaction.amount,
    content: `EXE101 ${transaction._id}`,
    qrUrl,
    createdAt: transaction.createdAt
  };
};

// Hàm 6: Hủy giao dịch
exports.cancelPayment = async (orderId, userId) => {
  const transaction = await Transaction.findOne({ _id: orderId, userId });
  if (!transaction) throw new Error('Không tìm thấy giao dịch');
  if (transaction.status !== TRANSACTION_STATUS.PENDING) {
    throw new Error('Chỉ có thể hủy giao dịch đang chờ thanh toán');
  }

  transaction.status = TRANSACTION_STATUS.FAILED;
  transaction.description = 'Người dùng chủ động hủy giao dịch';
  await transaction.save();

  return { success: true };
};
