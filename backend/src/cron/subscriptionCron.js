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
};

module.exports = runSubscriptionCron;
