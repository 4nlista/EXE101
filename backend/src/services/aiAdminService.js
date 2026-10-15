const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Project = require('../models/Project');
const Subscription = require('../models/Subscription');
const Major = require('../models/Major');
const Skill = require('../models/Skill');
const { IS_ACTIVE } = require('../constants/userEnum');
const { SUBSCRIPTION_STATUS } = require('../constants/subscriptionEnum');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠️ CẢNH BÁO: Chưa cấu hình GEMINI_API_KEY trong file .env.');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Danh sách các mô hình Gemini theo thứ tự ưu tiên (Model Fallback)
// Bao gồm cả các model mới và model ổn định để dự phòng khi có tải cao hoặc nghẽn mạng
const ADMIN_MODELS = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.6-flash'
];

/**
 * Thu thập số liệu thống kê realtime từ cơ sở dữ liệu để làm ngữ cảnh chính xác cho AI
 */
const getLiveSystemSnapshot = async () => {
  try {
    const [
      totalUsers,
      lockedUsers,
      activeUsers,
      vipUsers,
      premiumUsers,
      freeUsers,
      totalProjects,
      projectStatusAggregation,
      revenueAggregation,
      activeSubscriptionsCount,
      totalMajors,
      totalSkills,
      pendingSkills
    ] = await Promise.all([
      User.countDocuments().catch(() => 0),
      User.countDocuments({ isActive: IS_ACTIVE.LOCKED }).catch(() => 0),
      User.countDocuments({ isActive: { $ne: IS_ACTIVE.LOCKED } }).catch(() => 0),
      User.countDocuments({ currentPackage: 'vip' }).catch(() => 0),
      User.countDocuments({ currentPackage: 'premium' }).catch(() => 0),
      User.countDocuments({ currentPackage: 'free' }).catch(() => 0),
      Project.countDocuments().catch(() => 0),
      Project.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).catch(() => []),
      Subscription.aggregate([
        { $match: { status: SUBSCRIPTION_STATUS.ACTIVE } },
        { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
      ]).catch(() => []),
      Subscription.countDocuments({ status: SUBSCRIPTION_STATUS.ACTIVE }).catch(() => 0),
      Major.countDocuments().catch(() => 0),
      Skill.countDocuments().catch(() => 0),
      Skill.countDocuments({ isApproved: false }).catch(() => 0)
    ]);

    const projectStatusMap = {};
    if (Array.isArray(projectStatusAggregation)) {
      projectStatusAggregation.forEach((item) => {
        if (item._id) projectStatusMap[item._id] = item.count;
      });
    }

    const totalRevenue = revenueAggregation && revenueAggregation.length > 0
      ? revenueAggregation[0].totalRevenue
      : 0;

    return {
      nguoiDung: {
        tongSo: totalUsers,
        dangHoatDong: activeUsers,
        biKhoa: lockedUsers,
        goiFree: freeUsers,
        goiVip: vipUsers,
        goiPremium: premiumUsers
      },
      duAn: {
        tongSo: totalProjects,
        chiTietTrangThai: projectStatusMap
      },
      taiChinhDoanhThu: {
        tongDoanhThuThucTeVND: totalRevenue,
        soGoiDangHoatDong: activeSubscriptionsCount
      },
      duLieuDanhMuc: {
        tongSoChuyenNganh: totalMajors,
        tongSoKyNang: totalSkills,
        kyNangChoDuyet: pendingSkills
      }
    };
  } catch (error) {
    console.error('Lỗi khi lấy snapshot dữ liệu hệ thống cho AI Admin:', error);
    return null;
  }
};

/**
 * Gọi Gemini với cơ chế tự động chuyển model dự phòng (Fallback)
 */
const generateAdminContentWithFallback = async (promptText) => {
  let lastError = null;

  for (const modelName of ADMIN_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(promptText);
        const response = await result.response;
        return response.text();
      } catch (error) {
        lastError = error;
        const status = error?.status;
        const isTemporary = status === 503 || status === 429 || error?.message?.includes('503') || error?.message?.includes('high demand') || error?.message?.includes('RESOURCE_EXHAUSTED');

        console.warn(`[AI Admin Warning] Model ${modelName} lần ${attempt} gặp lỗi (${status || error.message?.substring(0, 60)}).`);

        if (isTemporary && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          break;
        }
      }
    }
  }

  throw lastError;
};

/**
 * Xử lý yêu cầu trò chuyện / hỏi thống kê từ Quản trị viên
 * @param {string} prompt - Câu hỏi hoặc yêu cầu của Admin
 * @returns {Promise<{ success: boolean, data?: string, message?: string }>}
 */
const adminChatWithAI = async (prompt) => {
  try {
    // 1. Lấy dữ liệu thống kê realtime từ cơ sở dữ liệu
    const liveStats = await getLiveSystemSnapshot();

    // 2. Xây dựng System Prompt với đầy đủ ngữ cảnh hệ sinh thái UniVerse AI
    const systemPrompt = `Bạn là Trợ lý AI Quản trị viên thông minh và nhạy bén của nền tảng kết nối dự án sinh viên UniVerse AI.
Nhiệm vụ của bạn là hỗ trợ ban quản trị (Admin) nắm bắt tức thời bức tranh toàn cảnh về hệ thống, phân tích các chỉ số vận hành, kiểm tra tài chính, đưa ra cảnh báo rủi ro và tư vấn định hướng phát triển nền tảng.

DƯỚI ĐÂY LÀ DỮ LIỆU THỐNG KÊ REALTIME ĐƯỢC TRÍCH XUẤT TRỰC TIẾP TỪ CƠ SỞ DỮ LIỆU MONGODB:
${JSON.stringify(liveStats, null, 2)}

QUY TẮC PHẢN HỒI (RẤT QUAN TRỌNG):
1. Tính chính xác tuyệt đối:
- Khi trả lời về số lượng người dùng, dự án, doanh thu, chuyên ngành, kỹ năng... PHẢI sử dụng đúng các con số thực tế trong dữ liệu realtime ở trên.
- Tuyệt đối không tự suy đoán hoặc bịa số liệu sai lệch với dữ liệu database được cấp.
2. Văn phong và trình bày:
- Chuyên nghiệp, rành mạch, súc tích, mang tầm nhìn quản trị vận hành.
- Sử dụng định dạng Markdown rõ ràng (tiêu đề nhỏ, in đậm số liệu quan trọng, danh sách gạch đầu dòng dễ quét mắt).
- Khi Admin hỏi về một khía cạnh (ví dụ: doanh thu, dự án), hãy phân tích ngắn gọn ý nghĩa số liệu đó và đưa ra 1-2 lời khuyên quản trị thiết thực nếu phù hợp.
3. Ngôn ngữ: Tiếng Việt chuẩn mực, tôn trọng người dùng.`;

    const fullPrompt = `${systemPrompt}

--- CÂU HỎI / YÊU CẦU CỦA QUẢN TRỊ VIÊN ---
"${prompt}"`;

    const responseText = await generateAdminContentWithFallback(fullPrompt);

    return {
      success: true,
      data: responseText.trim()
    };
  } catch (error) {
    console.error('Lỗi khi gọi AI Admin Chat sau khi đã thử qua các model dự phòng:', error);
    return {
      success: false,
      message: 'Hệ thống AI hiện đang quá tải do lưu lượng truy cập cao. Bạn vui lòng thử lại sau ít phút nhé!'
    };
  }
};

module.exports = {
  adminChatWithAI
};
