const mongoose = require('mongoose');
const { PACKAGE_TYPE, SUBSCRIPTION_STATUS } = require('../constants/subscriptionEnum');

// Schema gói đăng ký (VIP / Premium)
const subscriptionSchema = new mongoose.Schema(
  {
    // Người dùng đăng ký gói
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Loại gói: 'vip' | 'premium'
    packageType: {
      type: String,
      enum: Object.values(PACKAGE_TYPE),
      required: true
    },
    // Giá gói (VND): 59000 | 139000
    price: {
      type: Number,
      required: true
    },
    // Ngày bắt đầu hiệu lực
    startDate: {
      type: Date,
      required: true
    },
    // Ngày hết hạn (startDate + 30 ngày)
    endDate: {
      type: Date,
      required: true
    },
    // Tự động gia hạn khi hết hạn
    autoRenew: {
      type: Boolean,
      default: true
    },
    // 'active' | 'expired' | 'cancelled'
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.ACTIVE
    }
  },
  { timestamps: true }
);

// Index: tìm subscription theo user và trạng thái
subscriptionSchema.index({ userId: 1, status: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
