const db = require('../config/database');

// Fungsi untuk menyimpan pesanan baru ke MySQL
const createOrder = (orderData, callback) => {
  const { id, tableNumber, customerName, items, totalAmount, paymentMethod, status } = orderData;
  
  // Ubah array/object items menjadi string JSON agar bisa disimpan ke kolom TEXT
  const itemsString = JSON.stringify(items);

  const query = `INSERT INTO orders (id, table_number, customer_name, items, total_amount, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.query(query, [id, tableNumber, customerName || 'Tamu', itemsString, totalAmount, paymentMethod, status || 'pending'], (err, results) => {
    if (err) {
      console.error('❌ Gagal menyimpan pesanan ke database:', err.message);
      return callback(err, null);
    }
    callback(null, results);
  });
};

// Fungsi untuk mengambil semua pesanan
const getAllOrders = (callback) => {
  db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, results) => {
    if (err) return callback(err, null);
    // Parse kembali items dari string JSON ke bentuk objek/array aslinya
    const formatted = results.map(row => ({
      ...row,
      items: JSON.parse(row.items)
    }));
    callback(null, formatted);
  });
};

module.exports = { createOrder, getAllOrders };