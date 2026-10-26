const mysql = require('mysql2');

// Buat koneksi ke database MySQL

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 4000,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
});

db.connect((err) => {
  if (err) {
    console.error('❌ Gagal terkoneksi ke Database MySQL:', err.message);
    return;
  }
  console.log('✅ Berhasil terhubung ke Database MySQL (titik_temu_db)');
});

module.exports = db;