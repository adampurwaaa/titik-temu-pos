const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path'); // Untuk mengelola path direktori
require('dotenv').config(); // 🔴 WAJIB ADA DI BARIS PALING ATAS

// Import koneksi database & controller
const db = require('./config/database');
const { createOrder, getAllOrders } = require('./controllers/orderController');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// 🟢 DISESUAIKAN: Menyajikan file statis dari root directory (naik satu tingkat dari folder server)
app.use(express.static(path.join(__dirname, '../')));

// Socket.io Setup (Real-time Communication)
const io = new Server(server, {
  cors: {
    origin: '*', // Memungkinkan frontend terhubung
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Test Endpoint REST API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend Titik Temu Café Server is Running!' });
});

// Real-Time Socket Connection
io.on('connection', (socket) => {
  console.log('⚡ User Terhubung ke Socket ID:', socket.id);

  // 1. Kirim data pesanan yang sudah ada di database saat ada user baru terhubung
  getAllOrders((err, orders) => {
    if (!err) {
      socket.emit('init_orders', orders);
    }
  });

  // 2. Event saat Customer mengirim pesanan baru
  socket.on('new_order', (orderData) => {
    console.log('📦 Pesanan Baru Masuk:', orderData.id);

    // Simpan pesanan secara permanen ke Database MySQL
    createOrder(orderData, (err, result) => {
      if (!err) {
        // Jika berhasil disimpan, pancarkan ke Kasir & Dapur secara Real-Time
        io.emit('order_received', orderData);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ User Terputus:', socket.id);
  });
});

// 🟢 DISESUAIKAN: Catch-all route mengarah langsung ke index.html di root directory
app.get(/'*'/, (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Jalankan Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server Titik Temu berjalan di http://localhost:${PORT}`);
});