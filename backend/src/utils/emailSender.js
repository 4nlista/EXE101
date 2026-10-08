const nodemailer = require('nodemailer');

/**
 * Khởi tạo transporter gửi email
 * Dùng host trực tiếp smtp.gmail.com trên port 465 (SSL) để tránh bị timeout hoặc rớt pool kết nối trên Render
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL trực tiếp
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: true
    }
  });
};

/**
 * Hàm gửi email chung
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} htmlContent - Nội dung email định dạng HTML
 * @returns {Promise<boolean>} - Trả về true nếu gửi thành công, false nếu thất bại
 */
const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Nếu chưa cấu hình EMAIL_USER hoặc EMAIL_PASS
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('----------------------------------------------------');
      console.log('⚠️ CẢNH BÁO: CHƯA CẤU HÌNH EMAIL_USER HOẶC EMAIL_PASS TRONG BIẾN MÔI TRƯỜNG');
      console.log(`[Giả lập gửi Email tới: ${to}]`);
      console.log(`[Tiêu đề: ${subject}]`);
      console.log('----------------------------------------------------');
      return false;
    }

    const mailer = createTransporter();
    const mailOptions = {
      from: `"UniVerse AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    };

    const info = await mailer.sendMail(mailOptions);
    console.log('✅ Email OTP đã gửi thành công tới:', to, '| Response:', info.response);
    return true;
  } catch (error) {
    console.error('❌ Lỗi gửi email qua Nodemailer:', error.message);
    return false;
  }
};

module.exports = sendEmail;
