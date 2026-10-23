const mysql = require('mysql2');

// Buat koneksi ke database MySQL

const db = mysql.createConnection({
    host: process.env.DB_HOST,       // Mengambil dari .env
    user: process.env.DB_USER,       // Mengambil dari .env
    password: process.env.DB_PASSWORD, // Mengambil dari .env
    database: process.env.DB_NAME      // Mengambil dari .env
});

db.connect((err) => {
  if (err) {
    console.error('❌ Gagal terkoneksi ke Database MySQL:', err.message);
    return;
  }
  console.log('✅ Berhasil terhubung ke Database MySQL (titik_temu_db)');
});

module.exports = db;