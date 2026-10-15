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

// Danh sách mô hình Gemini theo thứ tự ưu tiên (Model Fallback)
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
 * Loại bỏ toàn bộ emoji và ký tự màu mè đặc biệt
 */
const stripEmojis = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}]/gu, '')
    .trim();
};

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
 * Gọi Gemini với cấu hình JSON và chuyển đổi mô hình dự phòng (Fallback)
 */
const generateAdminJsonWithFallback = async (promptText) => {
  let lastError = null;

  for (const modelName of ADMIN_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json'
          }
        });
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
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
const adminChatWithAI = async (prompt) => {
  try {
    // 1. Lấy dữ liệu thống kê realtime từ cơ sở dữ liệu MongoDB
    const liveStats = await getLiveSystemSnapshot();

    // 2. Xây dựng System Prompt với yêu cầu cấu trúc JSON phục vụ giao diện Form và Bảng
    const systemPrompt = `Bạn là Trợ lý AI Quản trị viên của nền tảng UniVerse AI.
Nhiệm vụ của bạn là phân tích dữ liệu, báo cáo chỉ số vận hành và đưa ra khuyến nghị quản trị thực tế.

DƯỚI ĐÂY LÀ DỮ LIỆU THỐNG KÊ REALTIME TRÍCH XUẤT TỪ CƠ SỞ DỮ LIỆU MONGODB:
${JSON.stringify(liveStats, null, 2)}

QUY TẮC PHẢN HỒI (BẮT BUỘC TUÂN THỦ NGHIÊM NGẶT):
1. TUYỆT ĐỐI KHÔNG dùng bất kỳ biểu tượng cảm xúc (emoji như tên lửa, bóng đèn, ngọn lửa, biểu đồ, mặt cười...) hay icon sặc sỡ nào trong toàn bộ nội dung.
2. PHẢI TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON hợp lệ theo schema sau:
{
  "title": "Tiêu đề ngắn gọn của báo cáo/phân tích (ví dụ: Báo cáo tổng quan người dùng và dự án)",
  "summary": "Tóm tắt ngắn gọn câu trả lời trong 1 đến 2 câu súc tích",
  "metrics": [
    {
      "label": "Tên chỉ số (ví dụ: Tổng người dùng, Dự án đang mở, Doanh thu)",
      "value": "Giá trị số hoặc chuỗi (ví dụ: 9 người, 23 dự án, 0 VNĐ)",
      "badge": "Ghi chú ngắn gọn (ví dụ: 100% hoạt động, Đang tuyển thành viên)"
    }
  ],
  "table": {
    "title": "Tên bảng dữ liệu chi tiết (nếu có, hoặc để null nếu không cần bảng)",
    "headers": ["Cột 1", "Cột 2", "Cột 3"],
    "rows": [
      ["Dòng 1", "Giá trị 1", "Ghi chú/Tỷ lệ 1"]
    ]
  },
  "insights": "Nhận định quản trị về số liệu này (hoặc null nếu câu hỏi chào hỏi đơn giản)",
  "recommendations": "Lời khuyên vận hành hoặc giải pháp quản trị cho Admin (hoặc null nếu không cần thiết)"
}
3. Tính xác thực: Chỉ dùng các số liệu trong dữ liệu realtime được cấp, không tự bịa số liệu.
4. Ngôn ngữ: Tiếng Việt trang nhã, chuyên nghiệp, chuẩn mực.`;

    const fullPrompt = `${systemPrompt}

--- CÂU HỎI / YÊU CẦU CỦA QUẢN TRỊ VIÊN ---
"${prompt}"`;

    const rawResponse = await generateAdminJsonWithFallback(fullPrompt);
    const cleanedJsonText = stripEmojis(rawResponse);

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedJsonText);
    } catch (parseErr) {
      console.warn('Lỗi parse JSON từ Gemini, fallback sang format text:', parseErr);
      parsedData = {
        title: 'Báo cáo thống kê',
        summary: cleanedJsonText.replace(/```json/gi, '').replace(/```/g, '').trim(),
        metrics: [],
        table: null,
        insights: null,
        recommendations: null
      };
    }

    return {
      success: true,
      data: parsedData
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
