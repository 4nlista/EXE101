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
// Ưu tiên gemini-2.5-flash (tốc độ nhanh, ổn định cao), dự phòng gemini-1.5-flash, gemini-2.0-flash, gemini-1.5-pro, gemini-flash-latest, gemini-3.5-flash, gemini-3.6-flash
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.6-flash'
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
    const systemPrompt = `Bạn là một trợ lý AI thông minh và thân thiện của nền tảng UniVerse.
Nhiệm vụ của bạn là trò chuyện, tư vấn và giúp sinh viên tìm kiếm dự án phù hợp với kỹ năng, ngành học và định hướng cá nhân.

QUY TẮC PHẢN HỒI (RẤT QUAN TRỌNG):
1. VĂN PHONG TỰ NHIÊN, NGẮN GỌN VÀ THÂN THIỆN:
- Nói chuyện tự nhiên, gần gũi, súc tích như một người anh/người bạn cố vấn.
- TUYỆT ĐỐI KHÔNG trả lời dài dòng lê thê, KHÔNG viết bài luận văn, KHÔNG dùng các tiêu đề cứng nhắc (như "Nhận định tổng quan", "Điểm tương đồng (+)", "Điểm còn thiếu (-)", "Lời khuyên định hướng (💡)").
- Nội dung trả lời (replyMessage) chỉ nên gói gọn trong 2 - 4 câu (hoặc 2 - 3 ý ngắn gọn), tập trung thẳng vào:
  + Vì sao dự án này phù hợp / điểm cộng lớn nhất.
  + Điểm cần lưu ý hoặc kỹ năng cần bổ sung thêm (nếu có).
  + Gợi ý bạn sinh viên bấm vào xem chi tiết thẻ dự án bên dưới.

2. QUY TẮC HIỂN THỊ THẺ DỰ ÁN (recommendedProjects) - BẮT BUỘC:
- BẤT KỲ KHI NÀO sinh viên muốn tìm dự án, hỏi gợi ý dự án, yêu cầu chọn 1 dự án bất kỳ để xem phù hợp hay không, hoặc hỏi về các dự án cụ thể:
  => BẮT BUỘC PHẢI chọn dự án từ danh sách được cung cấp và đưa vào mảng "recommendedProjects" (từ 1 đến tối đa 3 dự án) để giao diện hiển thị thẻ Card Project cho sinh viên bấm xem chi tiết!
- KHÔNG ĐƯỢC để mảng "recommendedProjects" rỗng khi đang nói về một hay nhiều dự án.
- Chỉ để mảng "recommendedProjects: []" khi:
  + Sinh viên chỉ chào hỏi thông thường ("Xin chào", "Hello").
  + Sinh viên hỏi các câu hỏi kiến thức ngoài lề ("MVC là gì?", "Cách học React?", "Vẽ ERD thế nào?").
  + Hoặc danh sách dự án đang mở không có dự án nào.

3. DỮ LIỆU DỰ ÁN:
- "projectId" và "projectTitle" PHẢI lấy CHÍNH XÁC từ trường "_id" và "title" của dự án trong danh sách được cung cấp, tuyệt đối không tự bịa ID.
- "matchPercent": Đánh giá mức độ phù hợp từ 0 đến 100%.

ĐỊNH DẠNG JSON BẮT BUỘC:
{
  "replyMessage": "Nội dung trả lời tự nhiên, ngắn gọn (2-4 câu)",
  "recommendedProjects": [
    {
      "projectId": "_id của dự án (lấy từ danh sách)",
      "projectTitle": "title của dự án (lấy từ danh sách)",
      "matchPercent": 85,
      "skills": ["Kỹ năng 1", "Kỹ năng 2"],
      "reason": "Lý do ngắn gọn 1 câu"
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

// Helper: Đọc chữ từ file PDF qua URL (hỗ trợ cả pdf-parse v2 PDFParse class và v1 function)
const extractTextFromPdfUrl = async (pdfUrl) => {
  try {
    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
      timeout: 10000 // Tối đa 10s tải file
    });

    // Thư viện pdf-parse v2 (class PDFParse)
    if (pdfParse && pdfParse.PDFParse) {
      const parser = new pdfParse.PDFParse(new Uint8Array(response.data));
      await parser.load();
      const text = await parser.getText();
      return text ? text.trim() : null;
    }

    // Fallback nếu là hàm function trực tiếp (pdf-parse v1)
    if (typeof pdfParse === 'function') {
      const data = await pdfParse(response.data);
      return data?.text ? data.text.trim() : null;
    }

    return null;
  } catch (error) {
    console.warn('Lưu ý: Không thể trích xuất text từ file PDF (có thể là file ảnh scan hoặc đường dẫn giới hạn):', error?.message || error);
    return null;
  }
};

/**
 * Phân tích độ phù hợp của ứng viên dựa trên cả CV tải lên và Hồ sơ năng lực cá nhân (kỹ năng, ngành, kinh nghiệm)
 * @param {object} candidateData - Thông tin ứng viên (kỹ năng cá nhân, ngành, học kỳ, lịch sử dự án, cvText...)
 * @param {object} projectData - Thông tin dự án (yêu cầu ứng viên, mô tả, ngành tuyển...)
 * @returns {Promise<object>} Kết quả JSON phân tích gồm matchPercent, summary, strengths, weaknesses, recommendation
 */
const matchApplicantWithAI = async (candidateData, projectData) => {
  try {
    const systemPrompt = `Bạn là một chuyên gia tuyển dụng nhân sự (HR) và cố vấn ghép đội ngũ dự án của nền tảng UniVerse.
Nhiệm vụ của bạn là đánh giá độ phù hợp của một ứng viên đối với bài đăng tuyển thành viên dự án.

NGUỒN DỮ LIỆU ĐÁNH GIÁ:
1. Hồ sơ năng lực trên hệ thống: Kỹ năng cá nhân (mainSkills), Ngành/Chuyên ngành đào tạo, Học kỳ hiện tại, Điểm GPA, Lịch sử dự án đã làm, và Ghi chú ứng tuyển.
2. Nội dung văn bản trích xuất từ CV của ứng viên (nếu có file đính kèm).
3. Bối cảnh dự án: Tiêu đề, Mô tả công việc, Yêu cầu ứng viên, Ngành học cần tuyển và Mục tiêu điểm số.

QUY TẮC ĐÁNH GIÁ:
- matchPercent (0 - 100): Điểm số đánh giá mức độ phù hợp tổng thể giữa ứng viên và dự án.
- summary: Tóm tắt nhận định chung ngắn gọn và xúc tích (2-3 câu).
- strengths: Mảng chứa 2 - 4 điểm mạnh vượt trội của ứng viên (kỹ năng khớp yêu cầu, kinh nghiệm thực chiến, chuyên ngành phù hợp...).
- weaknesses: Mảng chứa 1 - 3 điểm còn thiếu hoặc cần lưu ý (chưa thấy kinh nghiệm về mảng X, kỳ học còn mới...).
- recommendation: Lời khuyên cụ thể và thực tế cho Chủ dự án (Ví dụ: Nên duyệt ngay / Nên phỏng vấn thêm về kỹ năng Y / Chưa phù hợp với vị trí này).

ĐỊNH DẠNG JSON BẮT BUỘC:
{
  "matchPercent": 85,
  "summary": "Ứng viên có kỹ năng chuyên môn rất phù hợp với dự án...",
  "strengths": [
    "Kỹ năng chính đáp ứng tốt yêu cầu...",
    "Có kinh nghiệm làm dự án tương tự..."
  ],
  "weaknesses": [
    "Cần bổ sung thêm kỹ năng..."
  ],
  "recommendation": "Đề xuất duyệt hoặc phỏng vấn nhanh về..."
}`;

    const promptText = `
${systemPrompt}

--- THÔNG TIN DỰ ÁN ---
Tiêu đề dự án: ${projectData.title || 'Không có'}
Mô tả dự án: ${projectData.description || 'Không có'}
Yêu cầu ứng viên: ${projectData.candidateRequirements || 'Không có'}
Ngành học cần tuyển: ${(projectData.departments || []).join(', ') || 'Tất cả các ngành'}
Mục tiêu điểm số của dự án: ${projectData.gradeTarget || 'Không đặt mục tiêu'}

--- HỒ SƠ ỨNG VIÊN ---
Họ và tên: ${candidateData.name || 'Ứng viên'}
Ngành học: ${candidateData.department || 'Chưa cập nhật'}
Chuyên ngành: ${candidateData.major || 'Chưa cập nhật'}
Học kỳ hiện tại: ${candidateData.semester ? 'Kỳ ' + candidateData.semester : 'Chưa cập nhật'}
Điểm GPA: ${candidateData.gpa || 'Chưa cung cấp'}
Kỹ năng cá nhân (mainSkills): ${(candidateData.mainSkills || []).join(', ') || 'Chưa cập nhật danh sách kỹ năng'}
Ghi chú khi nộp đơn: ${candidateData.note || 'Không có ghi chú'}
Lịch sử dự án đã tham gia: ${JSON.stringify(candidateData.projectHistory || [], null, 2)}

--- NỘI DUNG TRÍCH XUẤT TỪ CV ỨNG VIÊN ---
${candidateData.cvText ? candidateData.cvText : '(Không có văn bản trích xuất từ file CV hoặc file dạng ảnh scan, hãy tập trung phân tích kỹ năng cá nhân và hồ sơ hệ thống ở trên)'}
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
    return { success: false, message: 'Lỗi hệ thống khi phân tích CV và kỹ năng' };
  }
};

module.exports = {
  genAI,
  testAiConnection,
  recommendProjectsWithAI,
  extractTextFromPdfUrl,
  matchApplicantWithAI
};
