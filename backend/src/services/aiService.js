const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const axios = require('axios');

// Kiểm tra xem đã có API Key chưa
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠️ CẢNH BÁO: Chưa cấu hình GEMINI_API_KEY trong file .env. Các chức năng AI sẽ bị lỗi.');
}

// Khởi tạo SDK
const genAI = new GoogleGenerativeAI(apiKey);

// Danh sách các mô hình Gemini theo thứ tự ưu tiên (Model Fallback)
// Ưu tiên gemini-2.5-flash (tốc độ nhanh, ổn định cao), dự phòng gemini-3.6-flash, gemini-3.5-flash, gemini-flash-latest
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest'
];

/**
 * Hàm helper gọi Gemini với cơ chế tự động chuyển đổi mô hình dự phòng (Fallback)
 * và tự động thử lại khi gặp lỗi 503 (Service Unavailable / Quá tải) hoặc 429
 * @param {string} promptText - Toàn bộ nội dung prompt
 * @param {object} customConfig - Cấu hình generationConfig (như responseMimeType: "application/json")
 * @returns {Promise<string>} Nội dung text trả về từ AI
 */
const generateContentWithFallback = async (promptText, customConfig = {}) => {
  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    // Thử tối đa 2 lần cho mỗi model trước khi chuyển sang model dự phòng kế tiếp
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            ...customConfig
          }
        });

        const result = await model.generateContent(promptText);
        const response = await result.response;
        return response.text();
      } catch (error) {
        lastError = error;
        const status = error?.status;
        const isTemporary = status === 503 || status === 429 || error?.message?.includes('503') || error?.message?.includes('high demand');

        console.warn(`[AI Warning] Model ${modelName} lần ${attempt} gặp lỗi (${status || error.message?.substring(0, 60)}).`);

        if (isTemporary && attempt < 2) {
          // Tạm dừng 1 giây để vượt qua đợt nghẽn mạng ngắn hạn của Google
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          // Chuyển sang model dự phòng kế tiếp
          break;
        }
      }
    }
  }

  // Ném lỗi cuối cùng nếu tất cả các model đều thất bại
  throw lastError;
};

// Hàm helper để test kết nối
const testAiConnection = async () => {
  try {
    const text = await generateContentWithFallback('Xin chào, đây là hệ thống UniVerse gọi test. Hãy trả lời ngắn gọn.');
    return {
      success: true,
      message: text
    };
  } catch (error) {
    console.error('Lỗi khi gọi test AI:', error);
    return {
      success: false,
      message: 'Không thể kết nối với Gemini. Vui lòng kiểm tra lại API Key.'
    };
  }
};

// ==========================================
// TÍNH NĂNG A: ĐỀ XUẤT DỰ ÁN CHO SINH VIÊN
// ==========================================
const recommendProjectsWithAI = async (userProfile, projects, userPrompt, chatHistoryText) => {
  try {
    const systemPrompt = `Bạn là một chuyên gia tư vấn tuyển dụng dự án sinh viên của hệ thống UniVerse.
Nhiệm vụ của bạn là trò chuyện, hỗ trợ và định hướng cho sinh viên tìm kiếm dự án phù hợp với kỹ năng, ngành học và mục tiêu cá nhân.

QUY TẮC PHẢN HỒI VÀ TRÌNH BÀY (RẤT QUAN TRỌNG):
1. VĂN PHONG VÀ CẤU TRÚC TRÌNH BÀY:
- Trả lời tự nhiên, thấu hiểu, mang tính cố vấn chuyên nghiệp.
- TUYỆT ĐỐI KHÔNG viết thành một khối chữ liền tù tì không xuống dòng (wall of text).
- Phải phân đoạn mạch lạc bằng dấu xuống dòng (\\n\\n) và sử dụng các gạch đầu dòng (-) rõ ràng khi liệt kê các ý.
- Tránh các câu xã giao rườm rà lặp đi lặp lại ở đầu câu (như "Chào bạn, cảm ơn bạn đã hỏi về..."). Đi thẳng vào nội dung giải đáp.

2. KHI SINH VIÊN HỎI LÝ DO / TẠI SAO / CÁCH TÍNH % PHÙ HỢP CỦA DỰ ÁN:
- Cung cấp câu trả lời có chiều sâu, lập luận phù hợp và thỏa đáng dựa trên hồ sơ sinh viên và yêu cầu thực tế của dự án.
- BẮT BUỘC trình bày theo cấu trúc phân đoạn rõ ràng:
  + Nhận định tổng quan: Đánh giá khái quát mức độ tương thích giữa hồ sơ của sinh viên và dự án.
  + Điểm tương đồng / Điểm mạnh (+): Gạch đầu dòng cụ thể kỹ năng hoặc thế mạnh nào của sinh viên đáp ứng tốt tiêu chí của dự án.
  + Điểm còn thiếu / Khác biệt (-): Gạch đầu dòng rõ ràng những yêu cầu dự án cần mà sinh viên chưa có hoặc còn chênh lệch chuyên môn.
  + Lời khuyên định hướng (💡): Lời khuyên thực tế để sinh viên cải thiện cơ hội hoặc gợi ý hướng đi tiếp theo.
- Trường "recommendedProjects" trong trường hợp này để mảng rỗng [] (trừ khi sinh viên nói rõ muốn tìm thêm dự án khác).

3. KHI SINH VIÊN CÓ NHU CẦU TÌM DỰ ÁN / TÌM TEAM:
- Phân tích hồ sơ và danh sách dự án đang mở để chọn TỐI ĐA 5 dự án phù hợp nhất đưa vào "recommendedProjects".
- Ở "replyMessage", tóm tắt ngắn gọn lý do vì sao những dự án này được đề xuất.
- Trường "projectTitle" PHẢI lấy ĐÚNG từ trường "title" của dự án trong danh sách, KHÔNG ĐƯỢC tự bịa.

4. KHI SINH VIÊN CHỈ CHÀO HỎI XÃ GIAO (Hello, Xin chào...):
- Chào lại thân thiện, hỏi thăm định hướng/kỹ năng để hỗ trợ. Trường "recommendedProjects" phải để mảng rỗng [].

ĐỊNH DẠNG JSON BẮT BUỘC:
{
  "replyMessage": "Nội dung trả lời của bạn (có phân đoạn, xuống dòng \\n\\n và gạch đầu dòng - rõ ràng)",
  "recommendedProjects": [
    {
      "projectId": "_id của dự án (copy nguyên từ danh sách)",
      "projectTitle": "title của dự án (copy nguyên từ danh sách)",
      "matchPercent": 90,
      "skills": ["Kỹ năng 1", "Kỹ năng 2"],
      "reason": "Lý do vì sao phù hợp (ngắn gọn 1-2 câu)"
    }
  ]
}`;

    const promptText = `
${systemPrompt}

--- DỮ LIỆU ĐẦU VÀO ---
HỒ SƠ SINH VIÊN:
${JSON.stringify(userProfile, null, 2)}

DANH SÁCH DỰ ÁN ĐANG MỞ:
${JSON.stringify(projects, null, 2)}

--- LỊCH SỬ ĐOẠN CHAT TRƯỚC ĐÓ ---
${chatHistoryText}

--- CÂU HỎI MỚI NHẤT CỦA SINH VIÊN ---
"${userPrompt}"
`;

    let responseText = await generateContentWithFallback(promptText, {
      responseMimeType: "application/json"
    });

    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

    // Parse JSON
    const parsedData = JSON.parse(responseText);
    return { success: true, data: parsedData };
  } catch (error) {
    console.error('Lỗi khi gọi AI Recommend sau khi đã thử qua các model dự phòng:', error);
    return { success: false, message: 'Hệ thống AI hiện đang quá tải. Bạn vui lòng thử lại sau ít phút nhé!' };
  }
};

// ==========================================
// TÍNH NĂNG B: AI MATCH % ỨNG VIÊN CHO CHỦ DỰ ÁN
// ==========================================

// Helper: Đọc chữ từ file PDF qua URL
const extractTextFromPdfUrl = async (pdfUrl) => {
  try {
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const data = await pdfParse(response.data);
    return data.text;
  } catch (error) {
    console.error('Lỗi khi đọc file PDF:', error);
    return null;
  }
};

const matchApplicantWithAI = async (projectRequirements, cvText) => {
  try {
    const systemPrompt = `Bạn là một chuyên gia tuyển dụng nhân sự (HR).
Nhiệm vụ của bạn là đánh giá độ phù hợp của 1 ứng viên dựa trên nội dung CV của họ so với Yêu cầu của dự án.
Bạn PHẢI trả về ĐÚNG định dạng JSON như sau:
{
  "matchPercent": 85,
  "matchReason": "Giải thích ngắn gọn từ 3 đến 4 câu lý do tại sao ứng viên được số điểm này. Nêu rõ điểm mạnh và điểm thiếu sót so với yêu cầu."
}`;

    const promptText = `
${systemPrompt}

--- DỮ LIỆU ĐẦU VÀO ---
YÊU CẦU CỦA DỰ ÁN:
${projectRequirements}

NỘI DUNG CV CỦA ỨNG VIÊN (Đã được trích xuất):
${cvText || 'Không trích xuất được hoặc không có CV'}
`;

    let responseText = await generateContentWithFallback(promptText, {
      responseMimeType: "application/json"
    });

    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

    // Parse JSON
    const parsedData = JSON.parse(responseText);
    return { success: true, data: parsedData };
  } catch (error) {
    console.error('Lỗi khi gọi AI Match sau khi đã thử qua các model dự phòng:', error);
    return { success: false, message: 'Lỗi hệ thống khi phân tích CV' };
  }
};

module.exports = {
  genAI,
  testAiConnection,
  recommendProjectsWithAI,
  extractTextFromPdfUrl,
  matchApplicantWithAI
};
