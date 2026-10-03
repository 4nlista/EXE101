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

// Hàm helper để test kết nối
const testAiConnection = async () => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const result = await model.generateContent('Xin chào, đây là hệ thống UniVerse gọi test. Hãy trả lời ngắn gọn.');
    const response = await result.response;
    return {
      success: true,
      message: response.text()
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
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const systemPrompt = `Bạn là một chuyên gia tư vấn tuyển dụng dự án sinh viên của hệ thống UniVerse.
Nhiệm vụ của bạn là trò chuyện với sinh viên. NẾU sinh viên có nhu cầu tìm dự án/team, hãy đọc hồ sơ của họ và danh sách dự án đang mở để tìm ra TỐI ĐA 5 dự án phù hợp nhất (dựa vào 'Kỹ năng sinh viên' so với 'Yêu cầu ứng viên').
LƯU Ý QUAN TRỌNG: 
- NẾU câu nói của sinh viên chỉ là chào hỏi (ví dụ: Hello, Xin chào, Chào cơ mà) hoặc tán gẫu thông thường, BẠN CHỈ ĐƯỢC CHÀO LẠI và hỏi xem họ muốn tìm dự án như thế nào. TUYỆT ĐỐI KHÔNG trả về dự án nào (mảng recommendedProjects phải RỖNG).
- Trường projectTitle PHẢI lấy ĐÚNG từ trường "title" của dự án trong danh sách, KHÔNG ĐƯỢC tự bịa.
Bạn PHẢI trả về ĐÚNG định dạng JSON như sau:
{
  "replyMessage": "Câu trả lời của bạn (tự nhiên, thân thiện, giống người thật)",
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

    const result = await model.generateContent(promptText);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

    // Parse JSON
    const parsedData = JSON.parse(responseText);
    return { success: true, data: parsedData };
  } catch (error) {
    console.error('Lỗi khi gọi AI Recommend:', error);
    return { success: false, message: 'Lỗi khi gọi AI. Vui lòng thử lại sau.' };
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
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

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

    const result = await model.generateContent(promptText);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

    // Parse JSON
    const parsedData = JSON.parse(responseText);
    return { success: true, data: parsedData };
  } catch (error) {
    console.error('Lỗi khi gọi AI Match:', error);
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
