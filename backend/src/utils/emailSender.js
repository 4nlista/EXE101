const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Nếu chưa cấu hình EMAIL_USER, log ra console để test dễ dàng
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('----------------------------------------------------');
      console.log('⚠️ CẢNH BÁO: CHƯA CẤU HÌNH EMAIL_USER TRONG .env');
      console.log(`[Giả lập gửi Email tới: ${to}]`);
      console.log(`[Tiêu đề: ${subject}]`);
      console.log(`[Nội dung: ${htmlContent}]`);
      console.log('----------------------------------------------------');
      return true;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail', // Sử dụng dịch vụ Gmail
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"UniVerse AI" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Không thể gửi email OTP lúc này.');
  }
};

module.exports = sendEmail;
