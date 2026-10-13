require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Khởi tạo app
const app = express();

// Kết nối DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Route kiểm tra server hoạt động
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to EXE101 Backend!' });
});

// Hỗ trợ webhook SePay ở mọi biến thể URL (kể cả khi SePay cấu hình bắn thẳng vào root domain /)
const paymentController = require('./controllers/paymentController');
app.post(['/', '/payment/sepay_webhook', '/payment/sepay-webhook', '/sepay_webhook', '/sepay-webhook'], paymentController.sepayWebhook);

// Import tập hợp routes chính
app.use('/api', require('./routes'));

// Global Error Handler (phải nằm cuối cùng)
app.use(errorHandler);

const http = require('http');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Khởi tạo Socket.io
initSocket(server);

// Khởi chạy các Cron Job ngầm
require('./cron/subscriptionCron')();
require('./jobs/autoRatingJob')();
require('./jobs/expireProjectJob').initExpireProjectCron();

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
