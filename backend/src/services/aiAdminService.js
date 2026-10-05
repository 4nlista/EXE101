const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Project = require('../models/Project');
const Subscription = require('../models/Subscription');
const { SUBSCRIPTION_STATUS } = require('../constants/subscriptionEnum');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// ==========================================
// CÁC HÀM THỐNG KÊ TỪ DATABASE (TOOLS)
// ==========================================

const getTotalUsers = async () => {
  try {
    const total = await User.countDocuments();
    return { success: true, data: { totalUsers: total } };
  } catch (error) {
    return { success: false, message: 'Lỗi khi đếm user' };
  }
};

const getProjectStats = async () => {
  try {
    const stats = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const result = {};
    stats.forEach(item => {
      result[item._id] = item.count;
    });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: 'Lỗi khi thống kê dự án' };
  }
};

const getTotalRevenue = async () => {
  try {
    const revenue = await Subscription.aggregate([
      { $match: { status: SUBSCRIPTION_STATUS.ACTIVE } },
      { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
    ]);
    return { success: true, data: { totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0 } };
  } catch (error) {
    return { success: false, message: 'Lỗi khi tính doanh thu' };
  }
};

// ==========================================
// CẤU HÌNH FUNCTION CALLING CHO GEMINI
// ==========================================

const tools = [
  {
    functionDeclarations: [
      {
        name: 'getTotalUsers',
        description: 'Lấy tổng số lượng người dùng (sinh viên, chủ dự án) đang có trên toàn bộ hệ thống.'
      },
      {
        name: 'getProjectStats',
        description: 'Lấy thống kê số lượng dự án theo từng trạng thái (ví dụ: open, closed, completed, cancelled).'
      },
      {
        name: 'getTotalRevenue',
        description: 'Tính tổng doanh thu (tiền thật) thu được từ các gói đăng ký VIP và PREMIUM của người dùng.'
      }
    ]
  }
];

// Mapping tên hàm từ Gemini trả về sang hàm chạy thực tế trong Node.js
const functionMapping = {
  getTotalUsers: getTotalUsers,
  getProjectStats: getProjectStats,
  getTotalRevenue: getTotalRevenue
};

// ==========================================
// HÀM XỬ LÝ CHÍNH
// ==========================================

const ADMIN_MODELS = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];

const adminChatWithAI = async (prompt) => {
  let lastError = null;

  for (const modelName of ADMIN_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          tools: tools
        });

        const chat = model.startChat();

        // 1. Gửi tin nhắn của Admin cho AI (AI sẽ quyết định xem có cần gọi hàm không)
        const result = await chat.sendMessage(prompt);
        let response = result.response;

        // 2. Nếu AI yêu cầu gọi hàm (Function Calling)
        if (response.functionCalls && response.functionCalls().length > 0) {
          const call = response.functionCalls()[0];
          const functionName = call.name;
          
          console.log(`[AI Admin] Đang gọi hàm thống kê: ${functionName}`);

          // Chạy hàm tương ứng trong Node.js
          if (functionMapping[functionName]) {
            const apiResponse = await functionMapping[functionName]();
            
            // 3. Gửi kết quả thống kê thực tế ngược lại cho AI để AI nói chuyện
            const secondResult = await chat.sendMessage([{
              functionResponse: {
                name: functionName,
                response: apiResponse
              }
            }]);
            
            response = secondResult.response;
          }
        }

        // Trả về câu văn trả lời cuối cùng của AI
        return { success: true, data: response.text() };
      } catch (error) {
        lastError = error;
        const status = error?.status;
        const isTemporary = status === 503 || status === 429 || error?.message?.includes('503') || error?.message?.includes('high demand');

        console.warn(`[AI Admin Warning] Model ${modelName} lần ${attempt} gặp lỗi (${status || error.message?.substring(0, 60)}).`);

        if (isTemporary && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          break;
        }
      }
    }
  }

  console.error('Lỗi khi gọi AI Admin Chat sau khi thử các model dự phòng:', lastError);
  return { success: false, message: 'Hệ thống AI Admin đang quá tải. Vui lòng thử lại sau.' };
};

module.exports = {
  adminChatWithAI
};
