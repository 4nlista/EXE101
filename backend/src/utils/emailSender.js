const nodemailer = require('nodemailer');

// Khởi tạo transporter dùng chung (pool: true) giúp tái sử dụng kết nối SMTP, tăng tốc độ gửi mail
let transporter = null;

const getTransporter = () => {
  if (!transporter && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      pool: true, // Tái sử dụng kết nối SMTP
      maxConnections: 5,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
};

/**
 * Hàm gửi email chung
 */
const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Nếu chưa cấu hình EMAIL_USER, log ra console để giả lập
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('----------------------------------------------------');
      console.log('⚠️ CẢNH BÁO: CHƯA CẤU HÌNH EMAIL_USER TRONG .env');
      console.log(`[Giả lập gửi Email tới: ${to}]`);
      console.log(`[Tiêu đề: ${subject}]`);
      console.log(`[Nội dung: ${htmlContent}]`);
      console.log('----------------------------------------------------');
      return true;
    }

    const mailer = getTransporter();
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
    console.error('❌ Error sending email:', error.message);
    return false;
  }
};

module.exports = sendEmail;
