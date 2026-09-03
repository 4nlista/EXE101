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

// Routes cơ bản
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to EXE101 Backend!' });
});

// Import tập hợp routes (sẽ tạo sau)
app.use('/api', require('./routes'));

// Global Error Handler (phải nằm cuối cùng)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
