const axios = require('axios');
const nodemailer = require('nodemailer');

/**
 * Khởi tạo transporter gửi email SMTP (fallback khi không dùng Brevo)
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '',
      pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : ''
    },
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: true
    }
  });
};

/**
 * Hàm gửi email qua Brevo REST API (HTTPS Cổng 443)
 * Giải pháp hoàn hảo cho Render Free do Render chặn các cổng SMTP 25, 465, 587
 */
const sendEmailViaBrevo = async (to, subject, htmlContent) => {
  const apiKey = process.env.BREVO_API_KEY.trim();
  const senderEmail = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : 'nguyenan182167@gmail.com';

  const payload = {
    sender: {
      name: 'UniVerse AI',
      email: senderEmail
    },
    to: [
      {
        email: to
      }
    ],
    subject,
    htmlContent
  };

  const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      'accept': 'application/json'
    },
    timeout: 10000 // 10 giây timeout
  });

  console.log('✅ [Brevo HTTPS] Email OTP đã gửi thành công tới:', to, '| MessageId:', response.data.messageId);
  return true;
};

/**
 * Hàm gửi email chính của hệ thống
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} htmlContent - Nội dung email định dạng HTML
 * @returns {Promise<boolean>} - Trả về true nếu gửi thành công, false nếu thất bại
 */
const sendEmail = async (to, subject, htmlContent) => {
  // 1. Ưu tiên gửi qua Brevo HTTP API (Port 443 - không bao giờ bị chặn trên Render)
  if (process.env.BREVO_API_KEY) {
    try {
      return await sendEmailViaBrevo(to, subject, htmlContent);
    } catch (brevoErr) {
      console.error('❌ Lỗi gửi email qua Brevo API:', brevoErr.response ? brevoErr.response.data : brevoErr.message);
      // Tiếp tục fallback sang SMTP phía dưới nếu Brevo gặp sự cố
    }
  }

  // 2. Fallback: Gửi qua Nodemailer SMTP nếu có EMAIL_USER và EMAIL_PASS
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const mailer = createTransporter();
      const mailOptions = {
        from: `"UniVerse AI" <${process.env.EMAIL_USER.trim()}>`,
        to,
        subject,
        html: htmlContent
      };

      const info = await mailer.sendMail(mailOptions);
      console.log('✅ [Nodemailer SMTP] Email OTP đã gửi thành công tới:', to, '| Response:', info.response);
      return true;
    } catch (smtpErr) {
      console.error('❌ Lỗi gửi email qua Nodemailer SMTP:', smtpErr.message);
      return false;
    }
  }

  // 3. Cảnh báo nếu chưa cấu hình bất kỳ biến môi trường nào
  console.log('----------------------------------------------------');
  console.log('⚠️ CẢNH BÁO: CHƯA CẤU HÌNH BREVO_API_KEY HOẶC EMAIL_USER/EMAIL_PASS TRONG BIẾN MÔI TRƯỜNG');
  console.log(`[Giả lập gửi Email tới: ${to}]`);
  console.log(`[Tiêu đề: ${subject}]`);
  console.log('----------------------------------------------------');
  return false;
};

module.exports = sendEmail;
