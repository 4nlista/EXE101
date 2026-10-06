const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { SUBSCRIPTION_STATUS, PACKAGE_TYPE } = require('../constants/subscriptionEnum');

const runSubscriptionCron = () => {
  // Chạy vào 00:00 mỗi đêm
  cron.schedule('0 0 * * *', async () => {
    console.log('--- CRON JOB: Bắt đầu quét các gói Subscription hết hạn ---');
    try {
      const now = new Date();
      
      const expiredSubs = await Subscription.find({
        status: SUBSCRIPTION_STATUS.ACTIVE,
        endDate: { $lt: now }
      });

      if (expiredSubs.length > 0) {
        for (const sub of expiredSubs) {
          sub.status = SUBSCRIPTION_STATUS.EXPIRED;
          await sub.save();

          // Đưa user về gói FREE
          await User.findByIdAndUpdate(sub.userId, {
            currentPackage: PACKAGE_TYPE.FREE
          });
        }
        console.log(`✅ Đã hạ cấp ${expiredSubs.length} tài khoản về gói FREE.`);
      } else {
        console.log('Không có tài khoản nào hết hạn hôm nay.');
      }
    } catch (error) {
      console.error('❌ Lỗi khi chạy CRON JOB quét Subscription:', error);
    }
  });

  // Chạy mỗi 15 phút một lần: Dọn dẹp đơn hàng PENDING quá hạn (15 phút)
  cron.schedule('*/15 * * * *', async () => {
    console.log('--- CRON JOB: Bắt đầu dọn dẹp các đơn hàng PENDING quá hạn ---');
    try {
      const TransactionModel = require('../models/Transaction');
      const { TRANSACTION_STATUS } = require('../constants/transactionEnum');
      
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000); // 15 phút trước

      const result = await TransactionModel.updateMany({
        status: TRANSACTION_STATUS.PENDING,
        createdAt: { $lt: fifteenMinsAgo }
      }, {
        $set: { status: TRANSACTION_STATUS.FAILED, description: 'Đã hủy do quá thời gian thanh toán (15 phút)' }
      });

      if (result.modifiedCount > 0) {
        console.log(`✅ Đã hủy ${result.modifiedCount} đơn hàng PENDING rác.`);
      } else {
        console.log('Không có đơn hàng PENDING rác nào.');
      }
    } catch (error) {
      console.error('❌ Lỗi khi chạy CRON JOB dọn dẹp đơn hàng PENDING:', error);
    }
  });
};

module.exports = runSubscriptionCron;
