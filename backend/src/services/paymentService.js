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

  // Nếu đơn đang PENDING nhưng đã quá 60 phút -> tự động chuyển sang FAILED ngay lập tức
  const sixtyMinsAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (transaction.status === TRANSACTION_STATUS.PENDING && transaction.createdAt < sixtyMinsAgo) {
    transaction.status = TRANSACTION_STATUS.FAILED;
    transaction.description = 'Đã hủy do quá thời gian thanh toán (60 phút)';
    await transaction.save();
  }

  return { status: transaction.status };
};

// Hàm 3: Webhook do SePay bắn về mỗi khi tài khoản ngân hàng nhận được tiền
exports.sepayWebhook = async (req) => {
  const { gateway, transactionDate, accountNumber, code, content, transferType, transferAmount } = req.body;

  // Lọc lấy các giao dịch Nạp tiền (in)
  if (transferType !== 'in') {
    console.log(`ℹ️ [SePay Webhook] Bỏ qua giao dịch không phải nạp tiền (transferType = ${transferType})`);
    return { success: true, message: 'Bỏ qua giao dịch rút tiền' };
  }

  // Tìm orderId trong nội dung chuyển khoản bằng Regex
  // Hỗ trợ linh hoạt: "EXE101 64e2b...", "EXE101_64e2b...", "EXE101-64e2b...", "EXE10164e2b..." hoặc trực tiếp mã ObjectId 24 ký tự
  const match = content ? content.match(/(?:EXE101[\s\-_]*)?([a-f0-9]{24})/i) : null;
  if (!match) {
    console.warn('⚠️ [SePay Webhook] Không tìm thấy orderId trong nội dung chuyển khoản:', content);
    return { success: true, message: 'Giao dịch không chứa mã Order của hệ thống' };
  }

  const orderId = match[1];
  console.log(`🔍 [SePay Webhook] Đã trích xuất orderId: ${orderId} từ nội dung: "${content}"`);

  const transaction = await Transaction.findById(orderId);
  if (!transaction) {
    console.warn(`⚠️ [SePay Webhook] Không tìm thấy Transaction trong DB với orderId: ${orderId}`);
    return { success: true, message: 'Order không tồn tại trên hệ thống' };
  }

  // Nếu giao dịch đã được xác nhận thành công trước đó thì bỏ qua (tránh xử lý trùng)
  if (transaction.status === TRANSACTION_STATUS.SUCCESS) {
    console.log(`ℹ️ [SePay Webhook] Đơn ${orderId} đã được xác nhận thành công trước đó, bỏ qua xử lý lặp.`);
    return { success: true, message: 'Giao dịch này đã được xác nhận trước đó' };
  }

  // Lấy mã giao dịch SePay (ưu tiên code -> referenceCode -> id)
  const sepayTxId = code || req.body.referenceCode || req.body.id?.toString() || `SEPAY_${Date.now()}`;

  // Kiểm tra số tiền khách chuyển có đủ hay không
  if (transferAmount < transaction.amount) {
    // Khách chuyển thiếu tiền -> Chuyển sang Failed
    transaction.status = TRANSACTION_STATUS.FAILED;
    transaction.sepayTransactionId = sepayTxId;
    transaction.description = `Chuyển thiếu tiền (${transferAmount}đ / ${transaction.amount}đ). Cần Admin xử lý hoàn tiền thủ công.`;
    await transaction.save();

    // Bắn thông báo cho User biết giao dịch lỗi
    const user = await User.findById(transaction.userId);
    if (user) {
      await Notification.create({
        userId: user._id,
        type: NOTIFICATION_TYPE.SUBSCRIPTION,
        title: 'Giao dịch không thành công',
        content: `Bạn đã chuyển thiếu tiền (chỉ gửi ${transferAmount.toLocaleString()}đ). Giao dịch bị hủy. Vui lòng liên hệ bộ phận CSKH để được hoàn tiền.`
      });
    }

    return { success: true, message: 'Giao dịch chuyển thiếu tiền. Chờ Admin xử lý hoàn tiền.' };
  }

  // Xác định chính xác loại gói từ description hoặc amount (chống lỗi nếu description từng bị ghi đè)
  let packageType = transaction.description?.startsWith('Mua_goi_')
    ? transaction.description.replace('Mua_goi_', '')
    : (transaction.amount === 139000 ? PACKAGE_TYPE.PREMIUM : PACKAGE_TYPE.VIP);

  // Xử lý thành công
  transaction.status = TRANSACTION_STATUS.SUCCESS;
  transaction.description = `Mua_goi_${packageType}`;
  transaction.sepayTransactionId = sepayTxId;
  transaction.paidAt = new Date(transactionDate || Date.now());

  const user = await User.findById(transaction.userId);
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

  // Mã tham chiếu đối soát ngân hàng (khắc phục lỗi code bị null từ SePay webhook)
  const bankRefCode = transaction.sepayTransactionId || sepayTxId || req.body.referenceCode || req.body.id?.toString() || 'N/A';
  const formattedAmount = (transferAmount || transaction.amount || 0).toLocaleString('vi-VN');
  const formattedEndDate = moment(endDate).format('DD/MM/YYYY HH:mm');
  const bankName = gateway || 'Chuyển khoản QR Ngân hàng';
  // Mã hiển thị đơn hàng: Rút gọn 8 ký tự cuối và viết hoa để che giấu MongoDB ObjectId nội bộ
  const displayOrderId = `ORD-${orderId.toString().slice(-8).toUpperCase()}`;

  // Template email xác nhận thanh toán hiện đại, chuẩn nhận diện UniVerse AI
  const emailHtml = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Xác nhận thanh toán thành công - UniVerse AI</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 30px 10px;">
        <tr>
          <td align="center">
            <!-- Khung Email chính -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05);">
              
              <!-- Header Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 35px 30px; text-align: center;">
                  <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">UniVerse AI</h1>
                  <p style="margin: 0; color: #e0e7ff; font-size: 15px; font-weight: 500;">Xác nhận nâng cấp dịch vụ thành công</p>
                </td>
              </tr>

              <!-- Nội dung chính -->
              <tr>
                <td style="padding: 35px 30px;">
                  <!-- Thông báo thành công -->
                  <div style="text-align: center; margin-bottom: 25px;">
                    <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background-color: #ecfdf5; color: #10b981; font-size: 28px; font-weight: bold; margin-bottom: 12px;">✓</div>
                    <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 22px; font-weight: 700;">Thanh toán thành công!</h2>
                    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                      Xin chào <strong style="color: #0f172a;">${user.name || user.email}</strong>, cảm ơn bạn đã nâng cấp gói dịch vụ. Tài khoản của bạn đã được kích hoạt đầy đủ quyền lợi cao cấp.
                    </p>
                  </div>

                  <!-- Bảng chi tiết hóa đơn giao dịch -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; width: 40%;">Gói dịch vụ</td>
                      <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #4f46e5; text-align: right;">
                        <span style="background-color: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">${packageType.toUpperCase()}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Số tiền thanh toán</td>
                      <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 15px; font-weight: 700; color: #0f172a; text-align: right;">${formattedAmount} đ</td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Mã đối soát (Ngân hàng)</td>
                      <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a; text-align: right; font-family: monospace;">${bankRefCode}</td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Mã đơn hàng</td>
                      <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569; text-align: right; font-family: monospace;">${displayOrderId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Cổng thanh toán</td>
                      <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 500; color: #0f172a; text-align: right;">${bankName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 18px; font-size: 13px; color: #64748b;">Thời hạn sử dụng đến</td>
                      <td style="padding: 14px 18px; font-size: 13px; font-weight: 600; color: #10b981; text-align: right;">${formattedEndDate}</td>
                    </tr>
                  </table>

                  <!-- Lời nhắc quyền lợi -->
                  <div style="background-color: #eef2ff; border-left: 4px solid #6366f1; padding: 14px 16px; border-radius: 4px; margin-bottom: 25px;">
                    <p style="margin: 0; font-size: 13px; color: #3730a3; line-height: 1.5;">
                      ✨ Bạn hiện có thể truy cập toàn bộ các mô hình AI tiên tiến, tạo trợ lý chuyên sâu và tận hưởng toàn bộ tiện ích không giới hạn của UniVerse AI.
                    </p>
                  </div>

                  <!-- Nút hành động dẫn về trang đăng nhập của Frontend -->
                  <div style="text-align: center; margin-top: 10px;">
                    <a href="${process.env.CLIENT_URL || 'https://exeuniverseai.vercel.app'}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);">
                      Đăng nhập & Trải nghiệm ngay &rarr;
                    </a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0 0 6px 0; color: #94a3b8; font-size: 12px;">
                    Email này được gửi tự động từ hệ thống thanh toán UniVerse AI.
                  </p>
                  <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                    Nếu cần hỗ trợ, vui lòng phản hồi email này hoặc liên hệ bộ phận CSKH.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  await sendEmail(user.email, 'Xác nhận thanh toán gói dịch vụ thành công - UniVerse AI', emailHtml);

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

  // Kiểm tra nếu đơn quá 60 phút thì chuyển sang FAILED ngay, không cho hiển thị QR
  const sixtyMinsAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (transaction.status === TRANSACTION_STATUS.PENDING && transaction.createdAt < sixtyMinsAgo) {
    transaction.status = TRANSACTION_STATUS.FAILED;
    transaction.description = 'Đã hủy do quá thời gian thanh toán (60 phút)';
    await transaction.save();
  }

  if (transaction.status !== TRANSACTION_STATUS.PENDING) {
    throw new Error('Giao dịch này không còn hợp lệ hoặc đã hết hạn');
  }

  // Tạo lại thông tin QR giống lúc createPaymentUrl
  const bankBin = process.env.SEPAY_BANK_BIN || '970422'; // Mặc định MB
  const bankAccount = process.env.SEPAY_BANK_ACCOUNT || 'VUI LÒNG CẤU HÌNH .ENV';

  const addInfo = `EXE101 ${transaction._id}`;
  const qrUrl = `https://img.vietqr.io/image/${bankBin}-${bankAccount}-qr_only.png?amount=${transaction.amount}&addInfo=${encodeURIComponent(addInfo)}`;

  return {
    orderId: transaction._id,
    amount: transaction.amount,
    content: addInfo,
    qrUrl,
    bankBin,
    bankAccount,
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
