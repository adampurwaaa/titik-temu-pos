// 1. Hubungkan frontend ke server backend Node.js / Socket.io
const socket = io();

socket.on('connect', () => {
  console.log('✅ Terhubung ke Server Backend Titik Temu, Socket ID:', socket.id);
});

// 2. Menerima data pesanan awal dari database saat halaman dibuka
socket.on('init_orders', (orders) => {
  console.log('📋 Data Pesanan dari Database:', orders);
  if (!Array.isArray(orders)) return;
  orders.forEach(raw => ingestServerOrder(raw, { hydrating: true }));
  refreshOrderViews();
});

socket.on('order_received', (newOrder) => {
  console.log('⚡ Pesanan Baru Masuk dari Server:', newOrder);

  // Data dari server/MySQL diubah dulu ke bentuk order internal (ordersState),
  // sehingga lolos filter getPendingQrOrders() dan getKdsTickets().
  const { order, isNew } = ingestServerOrder(newOrder);
  if (!order) return;

  refreshOrderViews();

  // Notifikasi hanya untuk order yang benar-benar baru di browser ini
  // (browser pengirim sudah punya order-nya lewat createOrder lokal).
  if (isNew && order.source === 'customer' && order.kasirStatus === 'pending') {
    if (appState.currentScreen === 'kasir') {
      showToast(`📲 Pesanan baru ${order.table} (#${order.id}) masuk ke Kasir!`, 'success');
      playNotificationTone();
    }
  }
});
const RECIPE_MATERIAL_MAP = {
  coffee: 'mat-1',
  milk: 'mat-2',
  chicken: 'mat-3',
  rice: 'mat-4',
  oil: 'mat-5',
  carbonara: 'mat-6'
};
/**
 * TITIK TEMU — Modern Café ERP & Ordering System
 * Master Application Controller & State Engine
 */

// ===================================================================
// 1. MASTER MENU CATALOG WITH AUTHENTIC DUMMY PHOTOS
// ===================================================================
const MENU_DATA = [
  // --- KOPI ---
  {
    id: 'kopi-1',
    name: 'Kopi Susu Titik Temu',
    category: 'kopi',
    categoryName: 'Kopi',
    price: 28000,
    desc: 'Espresso house blend khas Titik Temu dengan susu creamy dan gula aren organik pilihan.',
    img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    tag: 'Best Seller',
    tagClass: 'bg-[#C2622D] text-white',
    available: true,
    recipe: { coffee: 18, milk: 150 }
  },
  {
    id: 'kopi-2',
    name: 'Americano',
    category: 'kopi',
    categoryName: 'Kopi',
    price: 25000,
    desc: 'Double shot espresso murni dari biji kopi Arabika dengan air mineral segar panas/dingin.',
    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    tag: 'Klasik',
    tagClass: 'bg-stone-800 text-white',
    available: true,
    recipe: { coffee: 18 }
  },
  {
    id: 'kopi-3',
    name: 'Espresso Solo',
    category: 'kopi',
    categoryName: 'Kopi',
    price: 20000,
    desc: 'Ekstraksi 30ml espresso murni berkarakter tebal dengan crema emas keemasan sempurna.',
    img: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80',
    tag: 'Bold',
    tagClass: 'bg-stone-800 text-white',
    available: true,
    recipe: { coffee: 18 }
  },
  {
    id: 'kopi-4',
    name: 'Caramel Macchiato',
    category: 'kopi',
    categoryName: 'Kopi',
    price: 35000,
    desc: 'Espresso berlapis susu vanila lembut dengan saus karamel lezat di atasnya.',
    img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    tag: 'Recommended',
    tagClass: 'bg-[#C2622D] text-white',
    available: true,
    recipe: { coffee: 18, milk: 160 }
  },

  // --- NON-KOPI ---
  {
    id: 'non-1',
    name: 'Matcha Latte',
    category: 'non-kopi',
    categoryName: 'Non-Kopi',
    price: 32000,
    desc: 'Matcha Uji Kyoto autentik dipadukan dengan steamed milk lembut dan latte art.',
    img: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    tag: 'Best Seller',
    tagClass: 'bg-emerald-700 text-white',
    available: true,
    recipe: { milk: 180 }
  },
  {
    id: 'non-2',
    name: 'Artisan Tea Blend',
    category: 'non-kopi',
    categoryName: 'Non-Kopi',
    price: 26000,
    desc: 'Seduhan teh bunga telang, melati, dan chamomile dalam teko kaca transparan.',
    img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    tag: 'Calming',
    tagClass: 'bg-amber-700 text-white',
    available: true,
    recipe: {}
  },
  {
    id: 'non-3',
    name: 'Chocolate Warm / Ice',
    category: 'non-kopi',
    categoryName: 'Non-Kopi',
    price: 30000,
    desc: 'Cokelat Belgia hitam 70% dengan susu segar bertekstur kental pekat dan aroma semerbak.',
    img: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80',
    tag: 'Rich',
    tagClass: 'bg-amber-900 text-white',
    available: true,
    recipe: { milk: 180 }
  },

  // --- MAKANAN RINGAN (SNACKS) ---
  {
    id: 'snack-1',
    name: 'Kentang Goreng (French Fries)',
    category: 'makanan-ringan',
    categoryName: 'Makanan Ringan',
    price: 24000,
    desc: 'Kentang goreng crinkle-cut renyah keemasan dalam mangkuk dengan saus cocolan spesial.',
    img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    tag: 'Favorit',
    tagClass: 'bg-stone-700 text-white',
    available: true,
    recipe: { oil: 50 }
  },
  {
    id: 'snack-2',
    name: 'Mix Platter Titik Temu',
    category: 'makanan-ringan',
    categoryName: 'Makanan Ringan',
    price: 38000,
    desc: 'Kombinasi sosis bratwurst panggang, chicken nugget, kentang goreng, dan saus tartar.',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    tag: 'Best Seller',
    tagClass: 'bg-[#C2622D] text-white',
    available: true,
    recipe: { chicken: 100, oil: 60 }
  },
  {
    id: 'snack-3',
    name: 'Croissant Butter',
    category: 'makanan-ringan',
    categoryName: 'Makanan Ringan',
    price: 26000,
    desc: 'Pastry khas Prancis berlapis renyah flaky dengan mentega murni panggang harum.',
    img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    tag: 'Fresh Baked',
    tagClass: 'bg-amber-600 text-white',
    available: true,
    recipe: {}
  },
  {
    id: 'snack-4',
    name: 'Toast Garlic Bread',
    category: 'makanan-ringan',
    categoryName: 'Makanan Ringan',
    price: 24000,
    desc: 'Roti baguette panggang renyah dengan olesan garlic herb butter dan peterseli cincang.',
    img: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=600&q=80',
    tag: 'Aromatic',
    tagClass: 'bg-stone-700 text-white',
    available: true,
    recipe: {}
  },
  {
    id: 'snack-5',
    name: 'Roti Bakar Cokelat Keju',
    category: 'makanan-ringan',
    categoryName: 'Makanan Ringan',
    price: 28000,
    desc: 'Roti tebal panggang isi cokelat lumer berpadu parutan keju cheddar melimpah.',
    img: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=600&q=80',
    tag: 'Manis Gurih',
    tagClass: 'bg-[#C2622D] text-white',
    available: true,
    recipe: {}
  },

  // --- MAKANAN BERAT (MAIN COURSE) ---
  {
    id: 'meal-1',
    name: 'Nasi Goreng Titik Temu',
    category: 'makanan-berat',
    categoryName: 'Makanan Berat',
    price: 38000,
    desc: 'Nasi goreng bumbu racikan rahasia, telur mata sapi, potongan ayam suwir, dan kerupuk.',
    img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    tag: 'Best Seller',
    tagClass: 'bg-[#C2622D] text-white',
    available: true,
    recipe: { rice: 120, chicken: 100, oil: 40 }
  },
  {
    id: 'meal-2',
    name: 'Rice Bowl Chicken Teriyaki',
    category: 'makanan-berat',
    categoryName: 'Makanan Berat',
    price: 42000,
    desc: 'Ayam panggang saus teriyaki manis gurih di atas nasi jepang pulen dengan taburan wijen.',
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    tag: 'Recommended',
    tagClass: 'bg-[#C2622D] text-white',
    available: true,
    recipe: { rice: 120, chicken: 150 }
  },
  {
    id: 'meal-3',
    name: 'Spaghetti Carbonara',
    category: 'makanan-berat',
    categoryName: 'Makanan Berat',
    price: 45000,
    desc: 'Pasta al dente dalam saus krim keju parmesan gurih dengan potongan smoked beef renyah.',
    img: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80',
    tag: 'Chef Choice',
    tagClass: 'bg-stone-800 text-white',
    available: true,
    recipe: { carbonara: 60, milk: 80 }
  },
  {
    id: 'meal-4',
    name: 'Mie Goreng Spesial',
    category: 'makanan-berat',
    categoryName: 'Makanan Berat',
    price: 35000,
    desc: 'Mie telur kenyal ditumis dengan udang, bakso, sayuran hijau segar, dan bumbu kecap manis.',
    img: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    tag: 'Favorit',
    tagClass: 'bg-stone-700 text-white',
    available: true,
    recipe: { oil: 30 }
  },
  {
    id: 'meal-5',
    name: 'Chicken Katsu Curry',
    category: 'makanan-berat',
    categoryName: 'Makanan Berat',
    price: 44000,
    desc: 'Fillet dada ayam renyah bertabur tepung roti dengan kuah kari jepang kental wangi di atas nasi.',
    img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    tag: 'Must Try',
    tagClass: 'bg-[#C2622D] text-white',
    available: true,
    recipe: { rice: 120, chicken: 140, oil: 50 }
  },

  // --- DESSERT ---
  {
    id: 'dessert-1',
    name: 'Brownies Ice Cream',
    category: 'dessert',
    categoryName: 'Dessert',
    price: 32000,
    desc: 'Fudgy brownies cokelat hangat disajikan dengan satu scoop es krim vanila lembut.',
    img: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=600&q=80',
    tag: 'Best Seller',
    tagClass: 'bg-[#C2622D] text-white',
    available: true,
    recipe: {}
  },
  {
    id: 'dessert-2',
    name: 'Lava Cake',
    category: 'dessert',
    categoryName: 'Dessert',
    price: 34000,
    desc: 'Kue cokelat panggang dengan lelehan cokelat lumer hangat saat dipotong sendok.',
    img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    tag: 'Decadent',
    tagClass: 'bg-amber-900 text-white',
    available: true,
    recipe: {}
  },
  {
    id: 'dessert-3',
    name: 'Cheese Cake',
    category: 'dessert',
    categoryName: 'Dessert',
    price: 36000,
    desc: 'Irisan kue keju panggang New York creamy dengan dasar biskuit mentega dan selai berry.',
    img: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
    tag: 'Delight',
    tagClass: 'bg-amber-700 text-white',
    available: true,
    recipe: {}
  }
];

// ===================================================================
// 2. RAW MATERIALS INVENTORY (ERP Auto-Deduct)
// ===================================================================
let RAW_INVENTORY = [
  { id: 'mat-1', name: 'Biji Kopi Arabica Blend', cat: 'Minuman', current: 12.5, unit: 'kg', min: 3.0, status: 'Aman', deductRule: '18g / cup kopi' },
  { id: 'mat-2', name: 'Susu UHT Fresh Milk', cat: 'Minuman', current: 4.2, unit: 'L', min: 10.0, status: 'Kritis', deductRule: '150ml / cup latte' },
  { id: 'mat-3', name: 'Daging Ayam Fillet', cat: 'Makanan', current: 8.0, unit: 'kg', min: 5.0, status: 'Aman', deductRule: '150g / porsi ayam' },
  { id: 'mat-4', name: 'Beras Pandan Wangi', cat: 'Makanan', current: 22.0, unit: 'kg', min: 10.0, status: 'Aman', deductRule: '120g / porsi nasi' },
  { id: 'mat-5', name: 'Minyak Goreng Sawit', cat: 'Makanan', current: 3.5, unit: 'L', min: 5.0, status: 'Menipis', deductRule: '50ml / porsi goreng' },
  { id: 'mat-6', name: 'Bumbu Carbonara', cat: 'Makanan', current: 2.1, unit: 'kg', min: 1.5, status: 'Aman', deductRule: '60g / porsi pasta' }
];

// ===================================================================
// 3. APPLICATION STATE STORE
// ===================================================================
const appState = {
  currentScreen: 'portal',

  // Table Session State
  customerTable: 'Meja 05',
  customerSelectedCat: 'semua',
  customerCart: [],
  customerActiveOrder: null,

  // Customization modal temporary state
  modalItem: null,
  modalQty: 1,
  modalDrinkOptions: { ice: 'Normal Ice', sugar: 'Normal Sweet', size: 'Regular' },
  modalFoodOptions: { spicy: 'Sedang', toppings: [] },
  modalNotes: '',

  // Kasir POS State
  kasirSelectedCat: 'semua',
  kasirCart: [],
  kasirActiveTab: 'walkin',

  // Dapur KDS State
  kdsSoundEnabled: true,

  // Owner Analytics Data
  salesHistory: [
    { day: 'Kamis', val: 3.8 },
    { day: 'Jumat', val: 4.5 },
    { day: 'Sabtu', val: 5.6 },
    { day: 'Minggu', val: 5.8 },
    { day: 'Senin', val: 3.9 },
    { day: 'Selasa', val: 4.1 },
    { day: 'Hari ini', val: 4.68 }
  ],
  hourlyHeatmap: [
    { hour: '09:00', orders: 4, level: 1 },
    { hour: '10:00', orders: 7, level: 1 },
    { hour: '11:00', orders: 12, level: 2 },
    { hour: '12:00', orders: 28, level: 4 },
    { hour: '13:00', orders: 24, level: 3 },
    { hour: '14:00', orders: 15, level: 2 },
    { hour: '15:00', orders: 18, level: 2 },
    { hour: '16:00', orders: 22, level: 3 },
    { hour: '17:00', orders: 26, level: 3 },
    { hour: '18:00', orders: 35, level: 4 },
    { hour: '19:00', orders: 32, level: 4 },
    { hour: '20:00', orders: 19, level: 2 }
  ]
};

// ===================================================================
// 3b. ORDERS STATE — SINGLE SOURCE OF TRUTH (Customer -> Kasir -> Dapur)
// ===================================================================
// Every order (self-order QR or walk-in) lives here. Kasir queue and KDS board
// are derived views of this array; status changes are written back to it.
//
// Order shape:
// {
//   id, table, source: 'customer' | 'walkin', time, createdAt,
//   payMethod, payStatus,
//   kasirStatus: 'pending' | 'confirmed' | 'cancelled',
//   items: [{ menuId, name, category, qty, options, notes, price }],
//   total,
//   tickets: { bar|kitchen|pos: { status: 'wait' | 'cook' | 'ready', startedAt, archived, items } }
// }
const ordersState = [];

const STATIONS = {
  bar: { tag: 'Bar Minuman', color: 'text-blue-400 bg-blue-500/10' },
  kitchen: { tag: 'Dapur Makanan', color: 'text-amber-400 bg-amber-500/10' },
  pos: { tag: 'Dapur POS', color: 'text-stone-400 bg-stone-500/10' }
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isDrinkCategory(category) {
  return category === 'kopi' || category === 'non-kopi';
}

function findOrder(orderId) {
  return ordersState.find(o => o.id === orderId);
}

function generateOrderId(table) {
  const tableNum = table.replace('Meja ', '');
  let id;
  do {
    id = `TT-${tableNum}-${Math.floor(100 + Math.random() * 900)}`;
  } while (findOrder(id));
  return id;
}

function generateWalkInOrderId() {
  let id;
  do {
    id = `POS-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (findOrder(id));
  return id;
}

function buildTickets(source, normalizedItems, now) {
  const tickets = {};
  const addTicket = (station, list) => {
    if (list.length === 0) return;
    tickets[station] = {
      status: 'wait',
      startedAt: now,
      archived: false,
      items: list.map(i => ({
        name: i.name,
        qty: i.qty,
        notes: [i.options, i.notes].filter(Boolean).join(' · ') || (station === 'pos' ? 'Pesanan Kasir' : '')
      }))
    };
  };

  if (source === 'walkin') {
    addTicket('pos', normalizedItems);
  } else {
    addTicket('bar', normalizedItems.filter(i => isDrinkCategory(i.category)));
    addTicket('kitchen', normalizedItems.filter(i => !isDrinkCategory(i.category)));
  }
  return tickets;
}

function createOrder({ id, table, source, payMethod, payStatus, kasirStatus, items, total }) {
  const now = Date.now();

  const normalizedItems = items.map(i => ({
    menuId: i.menuId,
    name: i.name,
    category: i.category,
    qty: i.qty,
    options: i.options || '',
    notes: i.notes || '',
    price: i.price
  }));

  const order = {
    id,
    table,
    source,
    time: getCurrentTimeFormatted(),
    createdAt: now,
    payMethod,
    payStatus,
    // Pesanan QR customer selalu menunggu konfirmasi kasir; walk-in langsung terkonfirmasi.
    kasirStatus: kasirStatus || (source === 'walkin' ? 'confirmed' : 'pending'),
    items: normalizedItems,
    total: total ?? normalizedItems.reduce((sum, i) => sum + i.price * i.qty, 0),
    tickets: buildTickets(source, normalizedItems, now)
  };

  ordersState.push(order);
  return order;
}

// -------------------------------------------------------------------
// Sinkronisasi real-time dari Socket.io -> ordersState -> tampilan Kasir/KDS
// -------------------------------------------------------------------
function mapServerStatusToKasirStatus(raw) {
  if (raw.kasirStatus) return raw.kasirStatus;
  const status = String(raw.status ?? 'pending').toLowerCase();
  if (['cancelled', 'canceled', 'batal', 'dibatalkan'].includes(status)) return 'cancelled';
  if (['confirmed', 'diproses', 'processing', 'paid', 'completed', 'done', 'selesai', 'served'].includes(status)) return 'confirmed';
  return 'pending';
}

// Ubah payload dari server/MySQL (snake_case, items bisa berupa string JSON, angka bisa string)
// menjadi bentuk order internal yang dipakai seluruh view.
function normalizeServerOrder(raw, { hydrating = false } = {}) {
  if (!raw || typeof raw !== 'object') return null;

  let rawItems = raw.items;
  if (typeof rawItems === 'string') {
    try { rawItems = JSON.parse(rawItems); } catch (e) { rawItems = []; }
  }
  if (!Array.isArray(rawItems)) rawItems = [];

  const items = rawItems.map(i => {
    const menuId = i.menuId ?? i.menu_id ?? i.id;
    const menuItem = MENU_DATA.find(m => m.id === menuId);
    return {
      menuId,
      name: i.name ?? i.item_name ?? (menuItem ? menuItem.name : 'Item'),
      category: i.category ?? (menuItem ? menuItem.category : ''),
      qty: Number(i.qty ?? i.quantity ?? 1),
      options: i.options || '',
      notes: i.notes || '',
      price: Number(i.price ?? i.unit_price ?? (menuItem ? menuItem.price : 0))
    };
  });

  const table = raw.table ?? raw.table_number ?? 'Meja -';
  const source = raw.source || 'customer';
  const kasirStatus = mapServerStatusToKasirStatus(raw);
  const parsedCreated = Date.parse(raw.createdAt ?? raw.created_at);
  const createdAt = Number.isNaN(parsedCreated) ? Date.now() : parsedCreated;
  const id = String(raw.id ?? raw.order_id ?? '') || generateOrderId(String(table));

  const tickets = (raw.tickets && typeof raw.tickets === 'object' && !Array.isArray(raw.tickets))
    ? raw.tickets
    : buildTickets(source, items, createdAt);

  // Saat memuat riwayat dari database, order yang sudah bukan "pending" tidak boleh
  // memunculkan ulang tiket di KDS.
  if (hydrating && kasirStatus !== 'pending') {
    Object.values(tickets).forEach(t => { t.archived = true; });
  }

  const d = new Date(createdAt);
  const payMethod = raw.payMethod ?? raw.payment_method ?? '';

  return {
    id,
    table,
    source,
    time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} WIB`,
    createdAt,
    payMethod,
    payStatus: raw.payStatus ?? payMethod,
    kasirStatus,
    items,
    total: Number(raw.total ?? raw.total_amount ?? items.reduce((sum, i) => sum + i.price * i.qty, 0)),
    tickets
  };
}

// Masukkan order dari server ke ordersState (tanpa duplikat). Order yang sudah ada
// (mis. dibuat lokal oleh browser pengirim) tidak ditimpa agar status kasir tidak ter-reset.
function ingestServerOrder(raw, options) {
  const normalized = normalizeServerOrder(raw, options);
  if (!normalized) return { order: null, isNew: false };

  const existing = findOrder(normalized.id);
  if (existing) return { order: existing, isNew: false };

  ordersState.push(normalized);
  return { order: normalized, isNew: true };
}

// Render ulang semua tampilan turunan dari ordersState. Error dicatat, tidak ditelan diam-diam.
function refreshOrderViews() {
  const safely = (label, fn) => {
    try { fn(); } catch (e) { console.error(`[refreshOrderViews] ${label} gagal:`, e); }
  };

  // Daftar antrean QR + badge selalu diperbarui (DOM-nya selalu ada walau tab/screen tersembunyi).
  safely('renderPosQrOrders', renderPosQrOrders);

  if (appState.currentScreen === 'dapur') {
    safely('renderKdsBoard', renderKdsBoard);
  }
  if (appState.currentScreen === 'customer') {
    safely('syncCustomerTracker', syncCustomerTracker);
  }
}

// Kasir view: self-order QR orders still awaiting cashier confirmation (newest first)
function getPendingQrOrders() {
  return ordersState
    .filter(o => o.source === 'customer' && o.kasirStatus === 'pending')
    .slice()
    .reverse();
}

// KDS view: one ticket per station per order (newest first)
function getKdsTickets() {
  const tickets = [];
  ordersState.forEach(order => {
    if (order.kasirStatus === 'cancelled') return;
    Object.entries(order.tickets).forEach(([station, ticket]) => {
      if (ticket.archived) return;
      const meta = STATIONS[station];
      tickets.push({
        id: `${order.id}__${station}`,
        orderId: order.id,
        table: order.table,
        catTag: meta.tag,
        catColor: meta.color,
        startedAt: ticket.startedAt,
        status: ticket.status,
        items: ticket.items
      });
    });
  });
  return tickets.sort((a, b) => b.startedAt - a.startedAt);
}

function findKdsTicket(ticketId) {
  const [orderId, station] = ticketId.split('__');
  const order = findOrder(orderId);
  const ticket = order && order.tickets[station];
  return ticket ? { order, ticket } : null;
}

// Derive the customer's live tracker step from the real order/ticket statuses
function syncCustomerTracker() {
  const active = appState.customerActiveOrder;
  if (!active) {
    renderCustomerLiveTracker();
    return;
  }

  const order = findOrder(active.id);
  if (!order || order.kasirStatus === 'cancelled') {
    appState.customerActiveOrder = null;
    renderCustomerLiveTracker();
    return;
  }

  const tickets = Object.values(order.tickets);
  const allReady = tickets.length > 0 && tickets.every(t => t.status === 'ready');
  const anyStarted = tickets.some(t => t.status !== 'wait');

  if (allReady) {
    active.step = 3;
    active.status = 'Siap Disajikan';
  } else if (anyStarted) {
    active.step = 2;
    active.status = 'Sedang Disiapkan';
  } else {
    active.step = 1;
    active.status = 'Menunggu';
  }
  renderCustomerLiveTracker();
}

// ===================================================================
// 4. PORTAL INITIALIZATION & DUAL AUTH CONTROLLER
// ===================================================================
function initTableDropdowns() {
  const portalSelect = document.getElementById('portalTableSelect');
  const quickSelect = document.getElementById('quickSwitchTableSelect');

  let optionsHtml = '';
  for (let i = 1; i <= 20; i++) {
    const num = i < 10 ? `0${i}` : `${i}`;
    const isDefault = num === '05' ? 'selected' : '';
    optionsHtml += `<option value="Meja ${num}" ${isDefault}>🪑 Meja ${num} — Dine In</option>`;
  }

  if (portalSelect) portalSelect.innerHTML = optionsHtml;
  if (quickSelect) quickSelect.innerHTML = optionsHtml;
}

// Pelanggan Entry Confirmation
function submitCustomerEntry() {
  const select = document.getElementById('portalTableSelect');
  const chosenTable = select ? select.value : 'Meja 05';

  appState.customerTable = chosenTable;
  updateCustomerHeaderTableText();
  navigate('customer');
  showToast(`Selamat datang di ${chosenTable}! Silakan pilih menu Anda.`, 'success');
}

// Quick Switcher inside Customer View
function openTableSwitcherModal() {
  const quickSelect = document.getElementById('quickSwitchTableSelect');
  if (quickSelect) quickSelect.value = appState.customerTable;
  document.getElementById('tableSwitcherModal').classList.remove('hidden');
}

function closeTableSwitcherModal() {
  document.getElementById('tableSwitcherModal').classList.add('hidden');
}

function confirmQuickTableSwitch() {
  const quickSelect = document.getElementById('quickSwitchTableSelect');
  if (quickSelect) {
    appState.customerTable = quickSelect.value;
    updateCustomerHeaderTableText();
    closeTableSwitcherModal();
    showToast(`Nomor meja diubah menjadi ${appState.customerTable}!`, 'info');
  }
}

function updateCustomerHeaderTableText() {
  const tagEl = document.getElementById('custActiveTableTag');
  const checkEl = document.getElementById('checkoutTableTitle');
  if (tagEl) tagEl.textContent = `${appState.customerTable} · Dine In`;
  if (checkEl) checkEl.textContent = `${appState.customerTable} · Dine In`;
}

// Staff & Management Login
function autoFillDemoCredentials() {
  const role = document.getElementById('loginRole').value;
  quickFillRole(role);
}

function quickFillRole(role) {
  const roleSelect = document.getElementById('loginRole');
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPass');

  if (roleSelect) roleSelect.value = role;

  if (role === 'kasir') {
    emailInput.value = 'kasir@titiktemu.id';
    passInput.value = '123456';
  } else if (role === 'dapur') {
    emailInput.value = 'dapur@titiktemu.id';
    passInput.value = '123456';
  } else if (role === 'owner') {
    emailInput.value = 'owner@titiktemu.id';
    passInput.value = '123456';
  }
}

function handleStaffLogin(event) {
  event.preventDefault();
  const role = document.getElementById('loginRole').value;
  const email = document.getElementById('loginEmail').value;

  showToast(`Login berhasil! Masuk sebagai ${email}`, 'success');
  navigate(role);
}

// Unified Page Navigation (SPA Router)
function navigate(targetScreen) {
  const screens = ['portal', 'customer', 'kasir', 'dapur', 'owner'];
  screens.forEach(s => {
    const el = document.getElementById(`screen-${s}`);
    if (el) {
      if (s === targetScreen) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  appState.currentScreen = targetScreen;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (targetScreen === 'customer') {
    renderCustomerMenu();
    updateCustomerCartUI();
    syncCustomerTracker();
  } else if (targetScreen === 'kasir') {
    renderPosCatalog();
    renderPosCart();
    renderPosQrOrders();
  } else if (targetScreen === 'dapur') {
    renderKdsBoard();
    updateKdsMetrics();
  } else if (targetScreen === 'owner') {
    renderOwnerDashboard();
  }
}

// ===================================================================
// 5. CUSTOMER PORTAL CONTROLLER (Catalog & Modals)
// ===================================================================
function filterCustomerCategory(cat, btnEl) {
  appState.customerSelectedCat = cat;
  document.querySelectorAll('#customerCategoryPills .cust-cat-pill').forEach(b => {
    b.className = 'cust-cat-pill px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white text-stone-700 border border-[#E8DECE] hover:bg-stone-100 transition';
  });
  if (btnEl) {
    btnEl.className = 'cust-cat-pill active px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-[#1C1614] text-white shadow-sm transition';
  }

  const titleEl = document.getElementById('custSectionTitle');
  if (titleEl) {
    titleEl.textContent = cat === 'semua' ? 'Semua Pilihan Menu' : btnEl.textContent.trim();
  }

  renderCustomerMenu();
}

function renderCustomerMenu() {
  const grid = document.getElementById('customerMenuGrid');
  if (!grid) return;

  const filtered = MENU_DATA.filter(item => {
    if (appState.customerSelectedCat === 'semua') return true;
    return item.category === appState.customerSelectedCat;
  });

  grid.innerHTML = filtered.map(item => `
    <div onclick="openCustomModal('${item.id}')" class="bg-white rounded-2xl border border-[#E8DECE] overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group">
      <div class="relative h-28 bg-stone-200 overflow-hidden">
        <img src="${item.img}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80';" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        ${item.tag ? `<span class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold shadow ${item.tagClass}">${item.tag}</span>` : ''}
      </div>
      <div class="p-3 flex flex-col flex-grow justify-between">
        <div>
          <h4 class="text-xs font-bold text-[#1C1614] leading-tight mb-1 group-hover:text-[#C2622D] transition">${item.name}</h4>
          <p class="text-[10px] text-stone-500 line-clamp-2 leading-relaxed mb-2">${item.desc}</p>
        </div>
        <div class="flex items-center justify-between mt-auto pt-2 border-t border-stone-100">
          <span class="text-xs font-black text-[#C2622D]">${formatRupiah(item.price)}</span>
          <span class="w-6 h-6 rounded-lg bg-[#FAF7F2] group-hover:bg-[#C2622D] group-hover:text-white border border-[#E8DECE] text-stone-800 flex items-center justify-center text-xs font-bold transition">+</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Modal Kustomisasi
function openCustomModal(itemId) {
  const item = MENU_DATA.find(m => m.id === itemId);
  if (!item) return;

  appState.modalItem = item;
  appState.modalQty = 1;
  appState.modalDrinkOptions = { ice: 'Normal Ice', sugar: 'Normal Sweet', size: 'Regular' };
  appState.modalFoodOptions = { spicy: 'Sedang', toppings: [] };

  document.getElementById('modalItemImg').src = item.img;
  document.getElementById('modalItemName').textContent = item.name;
  document.getElementById('modalItemCat').textContent = item.categoryName;
  document.getElementById('modalItemPrice').textContent = formatRupiah(item.price);
  document.getElementById('modalQtyNum').textContent = '1';

  // Dynamic Options per Category
  const optionsContainer = document.getElementById('modalDynamicOptions');
  if (item.category === 'kopi' || item.category === 'non-kopi') {
    optionsContainer.innerHTML = `
      <div>
        <label class="text-[11px] font-bold text-stone-700 block mb-1.5">Tingkat Es (Ice Level):</label>
        <div class="grid grid-cols-3 gap-2" id="drinkIceOpts">
          <button type="button" onclick="setDrinkOpt('ice', 'Normal Ice', this)" class="py-1.5 bg-[#FAF7F2] border-2 border-[#C2622D] text-[#C2622D] rounded-xl text-xs font-bold">Normal</button>
          <button type="button" onclick="setDrinkOpt('ice', 'Less Ice', this)" class="py-1.5 bg-[#FAF7F2] border border-stone-200 text-stone-700 rounded-xl text-xs font-medium">Less Ice</button>
          <button type="button" onclick="setDrinkOpt('ice', 'No Ice', this)" class="py-1.5 bg-[#FAF7F2] border border-stone-200 text-stone-700 rounded-xl text-xs font-medium">No Ice</button>
        </div>
      </div>
      <div>
        <label class="text-[11px] font-bold text-stone-700 block mb-1.5">Tingkat Manis (Sugar Level):</label>
        <div class="grid grid-cols-3 gap-2" id="drinkSugarOpts">
          <button type="button" onclick="setDrinkOpt('sugar', 'Normal Sweet', this)" class="py-1.5 bg-[#FAF7F2] border-2 border-[#C2622D] text-[#C2622D] rounded-xl text-xs font-bold">Normal</button>
          <button type="button" onclick="setDrinkOpt('sugar', 'Less Sugar', this)" class="py-1.5 bg-[#FAF7F2] border border-stone-200 text-stone-700 rounded-xl text-xs font-medium">Less Sugar</button>
          <button type="button" onclick="setDrinkOpt('sugar', 'Zero Sugar', this)" class="py-1.5 bg-[#FAF7F2] border border-stone-200 text-stone-700 rounded-xl text-xs font-medium">No Sugar</button>
        </div>
      </div>
      <div>
        <label class="text-[11px] font-bold text-stone-700 block mb-1.5">Ukuran Cup:</label>
        <div class="grid grid-cols-2 gap-2" id="drinkSizeOpts">
          <button type="button" onclick="setDrinkOpt('size', 'Regular', this)" class="py-1.5 bg-[#FAF7F2] border-2 border-[#C2622D] text-[#C2622D] rounded-xl text-xs font-bold">Regular</button>
          <button type="button" onclick="setDrinkOpt('size', 'Large (+5rb)', this)" class="py-1.5 bg-[#FAF7F2] border border-stone-200 text-stone-700 rounded-xl text-xs font-medium">Large (+5rb)</button>
        </div>
      </div>
      <div>
        <label class="text-[11px] font-bold text-stone-700 block mb-1">Catatan Barista:</label>
        <input type="text" id="modalSpecialNotesInput" placeholder="Misal: Extra sedotan, dipisah es..." class="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none" />
      </div>
    `;
  } else if (item.category === 'makanan-ringan' || item.category === 'makanan-berat') {
    optionsContainer.innerHTML = `
      <div>
        <label class="text-[11px] font-bold text-stone-700 block mb-1.5">Tingkat Pedas (Spicy Level):</label>
        <div class="grid grid-cols-3 gap-2" id="foodSpicyOpts">
          <button type="button" onclick="setFoodOpt('spicy', 'Tidak Pedas', this)" class="py-1.5 bg-[#FAF7F2] border border-stone-200 text-stone-700 rounded-xl text-xs font-medium">Tidak Pedas</button>
          <button type="button" onclick="setFoodOpt('spicy', 'Sedang', this)" class="py-1.5 bg-[#FAF7F2] border-2 border-[#C2622D] text-[#C2622D] rounded-xl text-xs font-bold">Sedang</button>
          <button type="button" onclick="setFoodOpt('spicy', 'Pedas Mantap', this)" class="py-1.5 bg-[#FAF7F2] border border-stone-200 text-stone-700 rounded-xl text-xs font-medium">Pedas 🔥</button>
        </div>
      </div>
      <div>
        <label class="text-[11px] font-bold text-stone-700 block mb-1.5">Extra Topping Pilihan:</label>
        <div class="grid grid-cols-3 gap-2">
          <button type="button" onclick="toggleFoodTopping('+Telur (+5rb)', 5000, this)" class="py-1.5 bg-[#FAF7F2] border border-stone-200 text-stone-700 rounded-xl text-[11px] font-semibold">+ Telur (+5rb)</button>
          <button type="button" onclick="toggleFoodTopping('+Keju (+4rb)', 4000, this)" class="py-1.5 bg-[#FAF7F2] border border-stone-200 text-stone-700 rounded-xl text-[11px] font-semibold">+ Keju (+4rb)</button>
          <button type="button" onclick="toggleFoodTopping('+Sambal (+3rb)', 3000, this)" class="py-1.5 bg-[#FAF7F2] border border-stone-200 text-stone-700 rounded-xl text-[11px] font-semibold">+ Sambal (+3rb)</button>
        </div>
      </div>
      <div>
        <label class="text-[11px] font-bold text-stone-700 block mb-1">Catatan Koki:</label>
        <input type="text" id="modalSpecialNotesInput" placeholder="Misal: Ayam dipisah, tanpa bawang..." class="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none" />
      </div>
    `;
  } else {
    // Dessert
    optionsContainer.innerHTML = `
      <div>
        <label class="text-[11px] font-bold text-stone-700 block mb-1.5">Suhu Penyajian:</label>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="py-1.5 bg-[#FAF7F2] border-2 border-[#C2622D] text-[#C2622D] rounded-xl text-xs font-bold">Dingin Segar</button>
          <button type="button" class="py-1.5 bg-[#FAF7F2] border border-stone-200 text-stone-700 rounded-xl text-xs font-medium">Hangat Lembut</button>
        </div>
      </div>
      <div>
        <label class="text-[11px] font-bold text-stone-700 block mb-1">Catatan Tambahan:</label>
        <input type="text" id="modalSpecialNotesInput" placeholder="Misal: Sendok 2 buah..." class="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none" />
      </div>
    `;
  }

  updateModalTotalCalculation();
  document.getElementById('customModal').classList.remove('hidden');
}

function closeCustomModal() {
  document.getElementById('customModal').classList.add('hidden');
}

function setDrinkOpt(group, val, el) {
  appState.modalDrinkOptions[group] = val;
  el.parentElement.querySelectorAll('button').forEach(b => {
    b.className = 'py-1.5 bg-[#FAF7F2] border border-stone-200 text-stone-700 rounded-xl text-xs font-medium';
  });
  el.className = 'py-1.5 bg-[#FAF7F2] border-2 border-[#C2622D] text-[#C2622D] rounded-xl text-xs font-bold';
  updateModalTotalCalculation();
}

function setFoodOpt(group, val, el) {
  appState.modalFoodOptions[group] = val;
  el.parentElement.querySelectorAll('button').forEach(b => {
    b.className = 'py-1.5 bg-[#FAF7F2] border border-stone-200 text-stone-700 rounded-xl text-xs font-medium';
  });
  el.className = 'py-1.5 bg-[#FAF7F2] border-2 border-[#C2622D] text-[#C2622D] rounded-xl text-xs font-bold';
  updateModalTotalCalculation();
}

function toggleFoodTopping(name, price, el) {
  const idx = appState.modalFoodOptions.toppings.findIndex(t => t.name === name);
  if (idx >= 0) {
    appState.modalFoodOptions.toppings.splice(idx, 1);
    el.className = 'py-1.5 bg-[#FAF7F2] border border-stone-200 text-stone-700 rounded-xl text-[11px] font-semibold';
  } else {
    appState.modalFoodOptions.toppings.push({ name, price });
    el.className = 'py-1.5 bg-[#FAF7F2] border-2 border-[#C2622D] text-[#C2622D] rounded-xl text-[11px] font-bold';
  }
  updateModalTotalCalculation();
}

function changeModalQty(delta) {
  appState.modalQty = Math.max(1, appState.modalQty + delta);
  document.getElementById('modalQtyNum').textContent = appState.modalQty;
  updateModalTotalCalculation();
}

function updateModalTotalCalculation() {
  if (!appState.modalItem) return;
  let unit = appState.modalItem.price;

  if (appState.modalDrinkOptions.size && appState.modalDrinkOptions.size.includes('+5rb')) {
    unit += 5000;
  }
  if (appState.modalFoodOptions.toppings) {
    appState.modalFoodOptions.toppings.forEach(t => unit += t.price);
  }

  const total = unit * appState.modalQty;
  document.getElementById('modalTotalPrice').textContent = formatRupiah(total);
}

function confirmAddToCart() {
  const item = appState.modalItem;
  if (!item) return;

  const notesInput = document.getElementById('modalSpecialNotesInput');
  const notes = notesInput ? notesInput.value.trim() : '';

  let optsText = '';
  let unitPrice = item.price;

  if (item.category === 'kopi' || item.category === 'non-kopi') {
    optsText = `${appState.modalDrinkOptions.ice}, ${appState.modalDrinkOptions.sugar}, ${appState.modalDrinkOptions.size}`;
    if (appState.modalDrinkOptions.size.includes('+5rb')) unitPrice += 5000;
  } else if (item.category === 'makanan-ringan' || item.category === 'makanan-berat') {
    const topStr = appState.modalFoodOptions.toppings.map(t => t.name).join(', ');
    optsText = `Pedas: ${appState.modalFoodOptions.spicy}${topStr ? ' · ' + topStr : ''}`;
    appState.modalFoodOptions.toppings.forEach(t => unitPrice += t.price);
  } else {
    optsText = 'Standar Kafe';
  }

  appState.customerCart.push({
    id: 'cart-' + Date.now(),
    menuId: item.id,
    name: item.name,
    category: item.category,
    price: unitPrice,
    qty: appState.modalQty,
    options: optsText,
    notes: notes
  });

  closeCustomModal();
  updateCustomerCartUI();
  showToast(`+${appState.modalQty} ${item.name} berhasil masuk keranjang!`, 'success');
}

function updateCustomerCartUI() {
  const totalItems = appState.customerCart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = appState.customerCart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  const cartBar = document.getElementById('customerCartBar');
  if (totalItems > 0) {
    cartBar.classList.remove('hidden');
    document.getElementById('cartTotalItemsBadge').textContent = totalItems;
    document.getElementById('cartTotalPriceText').textContent = formatRupiah(totalPrice);
  } else {
    cartBar.classList.add('hidden');
  }
}

// Checkout Drawer (Customer)
function openCustomerCheckout() {
  const listContainer = document.getElementById('checkoutItemsList');
  if (appState.customerCart.length === 0) {
    listContainer.innerHTML = `
      <div class="py-8 text-center text-stone-400">
        <div class="text-3xl mb-2">☕</div>
        <p class="text-xs font-semibold text-stone-600">Belum ada item di keranjang.</p>
        <p class="text-[11px] text-stone-400 mt-1">Silakan pilih menu favorit Anda.</p>
      </div>
    `;
    showToast('Belum ada item di keranjang. Silakan pilih menu favorit Anda.', 'warn');
    return;
  }

  listContainer.innerHTML = appState.customerCart.map((item, idx) => `
    <div class="flex items-center justify-between p-2.5 bg-[#FAF7F2] rounded-xl border border-stone-200/70">
      <div class="pr-2 flex-grow">
        <div class="text-xs font-bold text-[#1C1614] leading-tight">${item.name}</div>
        <div class="text-[10px] text-stone-500">${item.options}</div>
        ${item.notes ? `<div class="text-[9px] text-[#C2622D] font-medium">Catatan: "${item.notes}"</div>` : ''}
        <div class="text-xs font-black text-[#C2622D] mt-0.5">${formatRupiah(item.price * item.qty)}</div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <div class="flex items-center gap-1 bg-white border border-[#E8DECE] rounded-lg p-0.5 shadow-sm">
          <button onclick="changeCustomerCartQty(${idx}, -1)" class="w-6 h-6 rounded-md bg-[#FAF7F2] hover:bg-[#C2622D] hover:text-white flex items-center justify-center font-black text-xs text-stone-700 transition" title="Kurangi porsi">
            −
          </button>
          <span class="text-xs font-black w-5 text-center text-[#1C1614]">${item.qty}</span>
          <button onclick="changeCustomerCartQty(${idx}, 1)" class="w-6 h-6 rounded-md bg-[#FAF7F2] hover:bg-[#C2622D] hover:text-white flex items-center justify-center font-black text-xs text-stone-700 transition" title="Tambah porsi">
            +
          </button>
        </div>
        <button onclick="removeCustomerCartItem(${idx})" class="w-6 h-6 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center text-xs transition" title="Hapus item">
          🗑
        </button>
      </div>
    </div>
  `).join('');

  const totalPrice = appState.customerCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  document.getElementById('checkoutFinalTotal').textContent = formatRupiah(totalPrice);

  const checkEl = document.getElementById('checkoutTableTitle');
  if (checkEl) checkEl.textContent = `${appState.customerTable} · Dine In`;

  document.getElementById('checkoutModal').classList.remove('hidden');
}

function changeCustomerCartQty(index, delta) {
  if (!appState.customerCart[index]) return;
  appState.customerCart[index].qty += delta;

  if (appState.customerCart[index].qty <= 0) {
    const removedName = appState.customerCart[index].name;
    appState.customerCart.splice(index, 1);
    showToast(`${removedName} dihapus dari keranjang`, 'info');
  }

  updateCustomerCartUI();

  if (appState.customerCart.length === 0) {
    closeCheckoutModal();
  } else {
    openCustomerCheckout();
  }
}

function closeCheckoutModal() {
  document.getElementById('checkoutModal').classList.add('hidden');
}

function closeCustomerCheckout() {
  closeCheckoutModal();
}

function removeCustomerCartItem(index) {
  if (!appState.customerCart[index]) return;
  const removedName = appState.customerCart[index].name;
  appState.customerCart.splice(index, 1);
  showToast(`${removedName} dihapus dari keranjang`, 'info');
  updateCustomerCartUI();
  if (appState.customerCart.length === 0) {
    closeCheckoutModal();
  } else {
    openCustomerCheckout();
  }
}

// QRIS Countdown Timer State
let qrisTimerInterval = null;
let qrisSecondsRemaining = 299; // 04:59

function submitCustomerOrderToKitchen() {
  if (appState.customerCart.length === 0) {
    showToast('Keranjang Anda masih kosong!', 'warn');
    return;
  }

  const totalAmount = appState.customerCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const payMethod = document.querySelector('input[name="custPayMethod"]:checked')?.value || 'QRIS';
  const orderId = generateOrderId(appState.customerTable);

  // If QRIS: Trigger Interactive QRIS Simulation Modal
  if (payMethod === 'QRIS') {
    appState.pendingQrisOrder = {
      id: orderId,
      table: appState.customerTable,
      totalAmount: totalAmount,
      items: [...appState.customerCart],
      payMethod: 'QRIS'
    };

    closeCheckoutModal();
    openQrisModal(orderId, totalAmount);
    return;
  }

  // If Kasir (Cash): Directly finalize order
  finalizeOrderPlacement(orderId, appState.customerTable, totalAmount, 'Bayar Kasir (Cash)', [...appState.customerCart]);
}

function openQrisModal(orderId, totalAmount) {
  const modal = document.getElementById('qrisPaymentModal');
  document.getElementById('qrisModalTotalAmount').textContent = formatRupiah(totalAmount);
  document.getElementById('qrisTableInfo').textContent = `${appState.customerTable} · Order #${orderId}`;

  // 04:59 countdown timer
  qrisSecondsRemaining = 299;
  updateQrisTimerDisplay();

  clearInterval(qrisTimerInterval);
  qrisTimerInterval = setInterval(() => {
    qrisSecondsRemaining--;
    if (qrisSecondsRemaining <= 0) {
      clearInterval(qrisTimerInterval);
      cancelQrisPayment();
      showToast('Waktu pembayaran QRIS telah kedaluwarsa. Silakan ulangi checkout.', 'error');
    } else {
      updateQrisTimerDisplay();
    }
  }, 1000);

  modal.classList.remove('hidden');
}

function updateQrisTimerDisplay() {
  const mins = Math.floor(qrisSecondsRemaining / 60);
  const secs = qrisSecondsRemaining % 60;
  const timerEl = document.getElementById('qrisCountdownTimer');
  if (timerEl) {
    timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

function cancelQrisPayment() {
  clearInterval(qrisTimerInterval);
  document.getElementById('qrisPaymentModal').classList.add('hidden');
  // Re-open checkout drawer so user can change payment method or continue
  if (appState.customerCart.length > 0) {
    openCustomerCheckout();
  }
}

function simulateQrisSuccess() {
  clearInterval(qrisTimerInterval);
  document.getElementById('qrisPaymentModal').classList.add('hidden');

  if (!appState.pendingQrisOrder) return;
  const { id, table, totalAmount, items } = appState.pendingQrisOrder;

  finalizeOrderPlacement(id, table, totalAmount, 'Sudah Bayar (QRIS)', items);
  appState.pendingQrisOrder = null;
  showToast(`🎉 Pembayaran QRIS Berhasil! Pesanan #${id} diteruskan ke Dapur & Kasir.`, 'success');
}

function finalizeOrderPlacement(orderId, table, totalAmount, statusPay, items) {
    const isQris = statusPay.includes('QRIS');
    
    // 1. Susun objek data pesanan yang lengkap sesuai database
    const orderData = {
        id: orderId,
        table: table,
        table_number: table,
        customerName: 'Pelanggan Meja ' + table,
        items: items,
        total: totalAmount,
        total_amount: totalAmount,
        payMethod: isQris ? 'QRIS' : 'Bayar Kasir (Cash)',
        payment_method: isQris ? 'QRIS' : 'Bayar Kasir (Cash)',
        payStatus: statusPay,
        status: 'pending',
        source: 'customer',
        createdAt: new Date().toISOString()
    };

    // 🔴 KIRIM KE SERVER BACKEND VIA SOCKET.IO KE DATABASE MYSQL:
    socket.emit('new_order', orderData);
    console.log('📦 Pesanan dikirim ke server backend:', orderData);

    // (Fungsi lama createOrder lokal kamu bisa dibiarkan atau digantikan sepenuhnya)
    createOrder(orderData);

    // 2. Audio alert simulation for Kitchen
    if (appState.kdsSoundEnabled) {
        playNotificationTone();
    }
    
    // 3. Auto deduct raw materials
    deductInventoryForOrder(items);


  // 4. Activate live order tracker on Customer View
  appState.customerActiveOrder = {
    id: orderId,
    table: table,
    status: 'Menunggu',
    step: 1
  };
  renderCustomerLiveTracker();

  // Reset cart
  appState.customerCart = [];
  updateCustomerCartUI();
  closeCheckoutModal();

  if (!isQris) {
    showToast(`🛎️ Pesanan ${orderId} (${table}) sukses dikirim ke Dapur & Kasir!`, 'success');
  }
}

function renderCustomerLiveTracker() {
  const tracker = document.getElementById('customerLiveTracker');
  if (!appState.customerActiveOrder) {
    tracker.classList.add('hidden');
    return;
  }

  tracker.classList.remove('hidden');
  const { step } = appState.customerActiveOrder;

  const c1 = document.getElementById('stepCircle1');
  const c2 = document.getElementById('stepCircle2');
  const c3 = document.getElementById('stepCircle3');
  const l1 = document.getElementById('stepLine1');
  const l2 = document.getElementById('stepLine2');

  c1.className = `w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow ${step >= 1 ? 'bg-[#C2622D] text-white' : 'bg-white border-2 border-stone-300 text-stone-500'}`;
  l1.className = `flex-grow h-0.5 mx-1 -mt-3.5 transition ${step >= 2 ? 'bg-[#C2622D]' : 'bg-stone-300'}`;
  c2.className = `w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? 'bg-[#C2622D] text-white shadow' : 'bg-white border-2 border-stone-300 text-stone-500'}`;
  l2.className = `flex-grow h-0.5 mx-1 -mt-3.5 transition ${step >= 3 ? 'bg-[#C2622D]' : 'bg-stone-300'}`;
  c3.className = `w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 3 ? 'bg-emerald-600 text-white shadow' : 'bg-white border-2 border-stone-300 text-stone-500'}`;
}

// ===================================================================
// 6. KASIR / POS CONTROLLER
// ===================================================================
function filterPosCat(cat, btnEl) {
  appState.kasirSelectedCat = cat;
  document.querySelectorAll('#posCategoryTabs .pos-cat-tab').forEach(b => {
    b.className = 'pos-cat-tab px-3.5 py-1.5 bg-white text-stone-700 border border-[#E8DECE] text-xs font-semibold rounded-xl hover:bg-stone-100 whitespace-nowrap';
  });
  if (btnEl) {
    btnEl.className = 'pos-cat-tab active px-3.5 py-1.5 bg-[#1C1614] text-white text-xs font-bold rounded-xl shadow-sm whitespace-nowrap';
  }
  renderPosCatalog();
}

function quickPosFilter(type) {
  const searchInput = document.getElementById('posSearchInput');
  searchInput.value = 'Best Seller';
  renderPosCatalog();
}

function renderPosCatalog() {
  const grid = document.getElementById('posProductGrid');
  if (!grid) return;

  const query = (document.getElementById('posSearchInput')?.value || '').toLowerCase();

  const filtered = MENU_DATA.filter(item => {
    const matchCat = appState.kasirSelectedCat === 'semua' || item.category === appState.kasirSelectedCat;
    const matchQuery = item.name.toLowerCase().includes(query) ||
      item.categoryName.toLowerCase().includes(query) ||
      (item.tag && item.tag.toLowerCase().includes(query));
    return matchCat && matchQuery;
  });

  grid.innerHTML = filtered.map(item => `
    <div onclick="addPosWalkInItem('${item.id}')" class="bg-white rounded-xl border border-[#E8DECE] p-2 flex flex-col hover:border-[#C2622D] hover:shadow-md transition cursor-pointer group">
      <img src="${item.img}" alt="${item.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80';" class="w-full h-20 object-cover rounded-lg mb-2" />
      <h5 class="text-xs font-bold text-[#1C1614] line-clamp-1 group-hover:text-[#C2622D]">${item.name}</h5>
      <span class="text-[10px] text-stone-400 mb-1">${item.categoryName}</span>
      <span class="text-xs font-extrabold text-[#C2622D] mt-auto">${formatRupiah(item.price)}</span>
    </div>
  `).join('');
}

function switchPosTab(tab) {
  appState.kasirActiveTab = tab;
  const btnWalkIn = document.getElementById('posTabWalkIn');
  const btnQr = document.getElementById('posTabQr');
  const panelWalkIn = document.getElementById('posPanelWalkIn');
  const panelQr = document.getElementById('posPanelQr');

  if (tab === 'walkin') {
    btnWalkIn.className = 'flex-1 py-3 text-xs font-bold text-[#C2622D] border-b-2 border-[#C2622D] bg-white transition';
    btnQr.className = 'flex-1 py-3 text-xs font-bold text-stone-500 hover:text-stone-800 transition flex items-center justify-center gap-1.5';
    panelWalkIn.classList.remove('hidden');
    panelQr.classList.add('hidden');
  } else {
    btnWalkIn.className = 'flex-1 py-3 text-xs font-bold text-stone-500 hover:text-stone-800 transition';
    btnQr.className = 'flex-1 py-3 text-xs font-bold text-[#C2622D] border-b-2 border-[#C2622D] bg-white transition flex items-center justify-center gap-1.5';
    panelWalkIn.classList.add('hidden');
    panelQr.classList.remove('hidden');
    renderPosQrOrders();
  }
}

function addPosWalkInItem(itemId) {
  const item = MENU_DATA.find(m => m.id === itemId);
  if (!item) return;

  const existing = appState.kasirCart.find(c => c.menuId === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    appState.kasirCart.push({
      menuId: item.id,
      name: item.name,
      price: item.price,
      qty: 1
    });
  }

  renderPosCart();
  showToast(`+1 ${item.name} ke tagihan walk-in`, 'info');
}

function changePosCartQty(index, delta) {
  appState.kasirCart[index].qty += delta;
  if (appState.kasirCart[index].qty <= 0) {
    appState.kasirCart.splice(index, 1);
  }
  renderPosCart();
}

function clearPosCart() {
  appState.kasirCart = [];
  renderPosCart();
  showToast('Keranjang kasir dikosongkan', 'warn');
}

function renderPosCart() {
  const container = document.getElementById('posCartItemList');
  if (!container) return;

  if (appState.kasirCart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 text-stone-400">
        <span class="text-3xl block mb-2">🛒</span>
        <span class="text-xs font-medium">Belum ada pesanan yang dipilih.<br>Silakan pilih menu dari daftar di sebelah kiri.</span>
      </div>
    `;
    updatePosSummary(0);
    return;
  }

  container.innerHTML = appState.kasirCart.map((item, idx) => `
    <div class="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F2] border border-stone-100">
      <div class="pr-2">
        <div class="text-xs font-bold text-[#1C1614] leading-tight">${item.name}</div>
        <div class="text-[10px] text-stone-400">${formatRupiah(item.price)}</div>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5">
          <button onclick="changePosCartQty(${idx}, -1)" class="w-5 h-5 rounded flex items-center justify-center font-bold text-xs hover:bg-stone-100">−</button>
          <span class="text-xs font-bold w-4 text-center">${item.qty}</span>
          <button onclick="changePosCartQty(${idx}, 1)" class="w-5 h-5 rounded flex items-center justify-center font-bold text-xs hover:bg-stone-100">+</button>
        </div>
        <span class="text-xs font-extrabold text-stone-800 w-16 text-right">${formatRupiah(item.price * item.qty)}</span>
      </div>
    </div>
  `).join('');

  const subtotal = appState.kasirCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  updatePosSummary(subtotal);
}

function updatePosSummary(subtotal) {
  const tax = Math.round(subtotal * 0.10);
  const total = subtotal + tax;

  document.getElementById('posSubtotalText').textContent = formatRupiah(subtotal);
  document.getElementById('posTaxText').textContent = formatRupiah(tax);
  document.getElementById('posTotalText').textContent = formatRupiah(total);
}

// QR Table Orders in Kasir
function renderPosQrOrders() {
  renderPosConfirmedOrders();
  const container = document.getElementById('posQrOrdersContainer');
  const badge = document.getElementById('posQrBadgeCount');
  const pendingOrders = getPendingQrOrders();
  if (badge) badge.textContent = pendingOrders.length;

  if (!container) return;

  if (pendingOrders.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 text-stone-400">
        <span class="text-3xl block mb-2">📲</span>
        <span class="text-xs font-medium">Tidak ada pesanan QR meja baru saat ini.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = pendingOrders.map(order => `
    <div class="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8DECE] shadow-sm">
      <div class="flex items-center justify-between mb-2">
        <div>
          <span class="text-xs font-black text-[#C2622D]">${order.table}</span>
          <span class="text-[10px] text-stone-400 ml-1">#${order.id}</span>
        </div>
        <span class="text-[9px] font-bold px-2 py-0.5 rounded-full ${order.payMethod === 'QRIS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${order.payMethod}</span>
      </div>
      <div class="text-[11px] text-stone-700 space-y-1 mb-2">
        ${order.items.map(it => `<div>• <b>${it.qty}x</b> ${it.name} <span class="text-stone-400">(${escapeHtml(it.options)}${it.notes ? ' · Note: ' + escapeHtml(it.notes) : ''})</span></div>`).join('')}
      </div>
      <div class="flex items-center justify-between pt-2 border-t border-stone-200">
        <span class="text-xs font-black text-stone-800">${formatRupiah(order.total)}</span>
        <div class="flex gap-1.5">
          <button onclick="validateQrOrder('${order.id}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow transition">
            ✅ Konfirmasi Pesanan
          </button>
          <button onclick="cancelQrOrder('${order.id}')" class="px-2 py-1 bg-stone-200 hover:bg-red-100 hover:text-red-700 font-semibold text-[10px] rounded-lg transition" title="Batalkan pesanan">
            ✕
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function validateQrOrder(orderId) {
  const order = findOrder(orderId);
  if (!order || order.kasirStatus !== 'pending') return;

  order.kasirStatus = 'confirmed';
  showToast(`Pesanan #${order.id} (${order.table}) telah dikonfirmasi dan diproses.`, 'success');
  renderPosQrOrders();
  openPosPaymentDone(order.id);
}

function cancelQrOrder(orderId) {
  const order = findOrder(orderId);
  if (!order || order.kasirStatus !== 'pending') return;

  order.kasirStatus = 'cancelled';
  deductInventoryForOrder(order.items, -1);
  showToast(`Pesanan #${order.id} dibatalkan.`, 'warn');
  renderPosQrOrders();
  syncCustomerTracker();
}

// POS Cash Payment Modal
function openPosPaymentModal() {
  if (appState.kasirCart.length === 0) {
    showToast('Keranjang kasir masih kosong!', 'warn');
    return;
  }

  const subtotal = appState.kasirCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const total = subtotal + Math.round(subtotal * 0.10);

  document.getElementById('posModalDueAmount').textContent = formatRupiah(total);
  document.getElementById('posModalDueAmount').setAttribute('data-val', total);
  document.getElementById('posCashInput').value = '';
  document.getElementById('posChangeText').textContent = 'Rp 0';

  document.getElementById('posPaymentModal').classList.remove('hidden');
}

function closePosPaymentModal() {
  document.getElementById('posPaymentModal').classList.add('hidden');
}

function calcPosCashChange() {
  const total = parseFloat(document.getElementById('posModalDueAmount').getAttribute('data-val') || 0);
  const given = parseFloat(document.getElementById('posCashInput').value || 0);
  const change = given - total;

  const changeText = document.getElementById('posChangeText');
  if (change >= 0) {
    changeText.textContent = formatRupiah(change);
    changeText.className = 'text-base font-black text-emerald-700';
  } else {
    changeText.textContent = `Kurang ${formatRupiah(Math.abs(change))}`;
    changeText.className = 'text-base font-black text-red-500';
  }
}

function setPosCashExact() {
  const total = parseFloat(document.getElementById('posModalDueAmount').getAttribute('data-val') || 0);
  document.getElementById('posCashInput').value = total;
  calcPosCashChange();
}

function addPosCashPreset(amt) {
  const current = parseFloat(document.getElementById('posCashInput').value || 0);
  document.getElementById('posCashInput').value = current + amt;
  calcPosCashChange();
}

function confirmPosTransaction() {
  const total = parseFloat(document.getElementById('posModalDueAmount').getAttribute('data-val') || 0);
  const given = parseFloat(document.getElementById('posCashInput').value || total);

  if (given < total) {
    showToast('Uang tunai yang diterima kurang!', 'error');
    return;
  }

  const orderId = generateWalkInOrderId();
  const items = appState.kasirCart.map(c => {
    const menuItem = MENU_DATA.find(m => m.id === c.menuId);
    return {
      menuId: c.menuId,
      name: c.name,
      category: menuItem ? menuItem.category : '',
      qty: c.qty,
      options: '',
      notes: '',
      price: c.price
    };
  });

  deductInventoryForOrder(items);

  const order = createOrder({
    id: orderId,
    table: 'Walk-In Kasir',
    source: 'walkin',
    payMethod: 'Cash',
    payStatus: 'Sudah Bayar (Cash)',
    kasirStatus: 'confirmed',
    items,
    total
  });
  order.cashReceived = given;

  closePosPaymentModal();
  clearPosCart();
  renderPosConfirmedOrders();
  showToast(`✅ Transaksi ${orderId} berhasil diproses & dicatat!`, 'success');
  openPosPaymentDone(orderId);
}

// ===================================================================
// Thermal Receipt (preview + browser print)
// Reads from ordersState only; never mutates order status.
// ===================================================================
const RECEIPT_CAFE = {
  name: 'TITIK TEMU',
  tagline: 'Coffee & Eatery',
  address: 'Jl. Cimone Jaya No. 10, Kota Tangerang',
  phone: 'Telp: 0856-4787-1828'
};
const RECEIPT_CASHIER = 'Ahmad Rifai';

function formatReceiptDateTime(timestamp) {
  const d = new Date(timestamp);
  const date = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':');
  return { date, time: `${time} WIB` };
}

function buildReceiptDataFromOrder(order) {
  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = order.total;
  const isCash = /cash/i.test(order.payMethod || '');
  const received = isCash && typeof order.cashReceived === 'number' ? order.cashReceived : null;

  return {
    id: order.id,
    table: order.table,
    orderType: order.source === 'walkin' ? 'Takeaway' : 'Dine In',
    timestamp: order.createdAt,
    items: order.items,
    subtotal,
    tax: Math.max(0, total - subtotal),
    total,
    method: isCash ? 'Cash' : 'QRIS',
    received,
    change: received !== null ? Math.max(0, received - total) : null,
    draft: false
  };
}

function buildReceiptDataFromCart() {
  const items = appState.kasirCart.map(c => ({
    name: c.name, qty: c.qty, price: c.price, options: '', notes: ''
  }));
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.10);
  const total = subtotal + tax;
  const cashInput = parseFloat(document.getElementById('posCashInput').value || 0);
  const received = cashInput >= total ? cashInput : total;

  return {
    id: 'DRAFT',
    table: 'Walk-In Kasir',
    orderType: 'Takeaway',
    timestamp: Date.now(),
    items,
    subtotal,
    tax,
    total,
    method: 'Cash',
    received,
    change: received - total,
    draft: true
  };
}

function renderReceipt(data) {
  const { date, time } = formatReceiptDateTime(data.timestamp);

  const itemsHtml = data.items.map(i => {
    const detail = [];
    if (i.options) detail.push(`<div class="rc-note">- ${escapeHtml(i.options)}</div>`);
    if (i.notes) detail.push(`<div class="rc-note">Catatan: ${escapeHtml(i.notes)}</div>`);
    return `
      <div class="rc-item">
        <div class="rc-item-name">${escapeHtml(i.name)}</div>
        <div class="rc-row">
          <span>${i.qty} x ${formatRupiah(i.price)}</span>
          <span>${formatRupiah(i.price * i.qty)}</span>
        </div>
        ${detail.join('')}
      </div>`;
  }).join('');

  const paymentRows = [`<div class="rc-row"><span>Metode Bayar</span><span>${data.method}</span></div>`];
  if (data.received !== null) {
    paymentRows.push(`<div class="rc-row"><span>Tunai Diterima</span><span>${formatRupiah(data.received)}</span></div>`);
    paymentRows.push(`<div class="rc-row"><span>Kembalian</span><span>${formatRupiah(data.change)}</span></div>`);
  }

  document.getElementById('receiptPrintArea').innerHTML = `
    ${data.draft ? '<div class="rc-draft">*** PRATINJAU - BELUM DIBAYAR ***</div>' : ''}
    <div class="rc-center">
      <div class="rc-brand">${RECEIPT_CAFE.name}</div>
      <div>${RECEIPT_CAFE.tagline}</div>
      <div>${RECEIPT_CAFE.address}</div>
      <div>${RECEIPT_CAFE.phone}</div>
    </div>
    <div class="rc-divider"></div>
    <div class="rc-meta">
      <div class="rc-row"><span>Tanggal</span><span>${date}</span></div>
      <div class="rc-row"><span>Jam</span><span>${time}</span></div>
      <div class="rc-row"><span>No. Pesanan</span><span>${escapeHtml(data.id)}</span></div>
      <div class="rc-row"><span>Meja</span><span>${escapeHtml(data.table)}</span></div>
      <div class="rc-row"><span>Tipe</span><span>${data.orderType}</span></div>
      <div class="rc-row"><span>Kasir</span><span>${RECEIPT_CASHIER}</span></div>
    </div>
    <div class="rc-divider"></div>
    ${itemsHtml}
    <div class="rc-divider"></div>
    <div class="rc-row"><span>Subtotal</span><span>${formatRupiah(data.subtotal)}</span></div>
    ${data.tax > 0 ? `<div class="rc-row"><span>PB1 / Pajak (10%)</span><span>${formatRupiah(data.tax)}</span></div>` : ''}
    <div class="rc-row rc-total"><span>TOTAL</span><span>${formatRupiah(data.total)}</span></div>
    <div class="rc-divider"></div>
    ${paymentRows.join('')}
    <div class="rc-divider"></div>
    <div class="rc-center">
      <div>Terima kasih atas kunjungan Anda</div>
      <div>di Titik Temu!</div>
      <div class="rc-foot">Simpan struk ini sebagai bukti pembayaran</div>
    </div>`;
}

function openReceiptModal() {
  document.body.classList.add('receipt-open');
  document.getElementById('receiptModal').classList.remove('hidden');
  setReceiptPaper(appState.receiptPaper || '80');
}

function setReceiptPaper(size) {
  appState.receiptPaper = size;
  const area = document.getElementById('receiptPrintArea');
  area.classList.remove('receipt-58', 'receipt-80');
  area.classList.add(`receipt-${size}`);

  ['58', '80'].forEach(s => {
    const btn = document.getElementById(`receiptPaper${s}`);
    btn.className = `px-3 py-1 text-[11px] font-bold rounded-md transition ${s === size ? 'bg-white text-stone-900' : 'text-stone-300 hover:text-white'}`;
    btn.setAttribute('aria-pressed', s === size ? 'true' : 'false');
  });
}

function openReceipt(orderId) {
  const order = findOrder(orderId);
  if (!order) {
    showToast('Data pesanan tidak ditemukan.', 'error');
    return;
  }
  renderReceipt(buildReceiptDataFromOrder(order));
  openReceiptModal();
}

// Pratinjau dari modal pembayaran (sebelum transaksi dikonfirmasi)
function printThermalReceiptPreview() {
  if (appState.kasirCart.length === 0) {
    showToast('Keranjang kasir masih kosong!', 'warn');
    return;
  }
  renderReceipt(buildReceiptDataFromCart());
  openReceiptModal();
}

function printReceipt() {
  window.print();
}

function closeReceiptModal() {
  document.getElementById('receiptModal').classList.add('hidden');
  document.body.classList.remove('receipt-open');
}

// Modal "Transaksi Selesai" dengan opsi Cetak Struk
function openPosPaymentDone(orderId) {
  const order = findOrder(orderId);
  if (!order) return;

  const data = buildReceiptDataFromOrder(order);
  const row = (label, value) =>
    `<div class="flex justify-between"><span class="text-stone-500">${label}</span><span class="font-bold text-stone-800">${value}</span></div>`;

  document.getElementById('posDoneSummary').innerHTML = [
    row('No. Pesanan', escapeHtml(order.id)),
    row('Meja', escapeHtml(order.table)),
    row('Metode', data.method),
    row('Total', formatRupiah(data.total)),
    data.received !== null ? row('Kembalian', formatRupiah(data.change)) : ''
  ].join('');

  const modal = document.getElementById('posPaymentDoneModal');
  modal.dataset.orderId = order.id;
  modal.classList.remove('hidden');
}

function closePosPaymentDone() {
  document.getElementById('posPaymentDoneModal').classList.add('hidden');
}

function printReceiptFromDone() {
  const orderId = document.getElementById('posPaymentDoneModal').dataset.orderId;
  closePosPaymentDone();
  openReceipt(orderId);
}

// Kasir: daftar transaksi terkonfirmasi dengan tombol Cetak Struk
function renderPosConfirmedOrders() {
  const container = document.getElementById('posConfirmedOrdersContainer');
  if (!container) return;

  const confirmed = ordersState
    .filter(o => o.kasirStatus === 'confirmed')
    .slice()
    .reverse()
    .slice(0, 20);

  if (confirmed.length === 0) {
    container.innerHTML = `<div class="text-center py-4 text-[11px] text-stone-400">Belum ada transaksi terkonfirmasi.</div>`;
    return;
  }

  container.innerHTML = confirmed.map(order => `
    <div class="flex items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-[#E8DECE]">
      <div class="min-w-0">
        <div class="text-[11px] font-black text-stone-800 truncate">${escapeHtml(order.table)} <span class="text-stone-400 font-medium">#${escapeHtml(order.id)}</span></div>
        <div class="text-[10px] text-stone-500">${formatRupiah(order.total)} · ${/cash/i.test(order.payMethod) ? 'Cash' : 'QRIS'}</div>
      </div>
      <button onclick="openReceipt('${order.id}')" class="shrink-0 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-700 text-white font-bold text-[10px] rounded-lg transition">
        🖨️ Cetak Struk
      </button>
    </div>
  `).join('');
}

// ===================================================================
// 7. DAPUR / KDS CONTROLLER (Kitchen Display System)
// ===================================================================
function toggleKdsSoundAlert() {
  appState.kdsSoundEnabled = !appState.kdsSoundEnabled;
  const btn = document.getElementById('kdsSoundToggle');
  if (appState.kdsSoundEnabled) {
    btn.textContent = '🔔 Suara Alert: ON';
    btn.className = 'cursor-pointer px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 select-none';
    playNotificationTone();
    showToast('Alert Suara KDS diaktifkan', 'info');
  } else {
    btn.textContent = '🔕 Suara Alert: OFF';
    btn.className = 'cursor-pointer px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 select-none';
    showToast('Alert Suara KDS dinonaktifkan', 'warn');
  }
}

function renderKdsBoard() {
  const colWait = document.getElementById('kdsColWait');
  const colCook = document.getElementById('kdsColCook');
  const colReady = document.getElementById('kdsColReady');

  if (!colWait || !colCook || !colReady) return;

  const waitOrders = getKdsTickets().filter(o => o.status === 'wait');
  const cookOrders = getKdsTickets().filter(o => o.status === 'cook');
  const readyOrders = getKdsTickets().filter(o => o.status === 'ready');

  document.getElementById('colWaitBadge').textContent = waitOrders.length;
  document.getElementById('colCookBadge').textContent = cookOrders.length;
  document.getElementById('colReadyBadge').textContent = readyOrders.length;

  colWait.innerHTML = waitOrders.length > 0
    ? waitOrders.map(o => createKdsCardHtml(o, 'wait')).join('')
    : '<div class="text-center py-8 text-stone-500 text-xs font-medium">Tidak ada antrean pesanan saat ini.</div>';

  colCook.innerHTML = cookOrders.length > 0
    ? cookOrders.map(o => createKdsCardHtml(o, 'cook')).join('')
    : '<div class="text-center py-8 text-stone-500 text-xs font-medium">Belum ada pesanan yang sedang disiapkan.</div>';

  colReady.innerHTML = readyOrders.length > 0
    ? readyOrders.map(o => createKdsCardHtml(o, 'ready')).join('')
    : '<div class="text-center py-8 text-stone-500 text-xs font-medium">Belum ada pesanan yang siap disajikan.</div>';

  updateKdsMetrics();
}

function createKdsCardHtml(order, col) {
  const elapsedSec = Math.floor((Date.now() - order.startedAt) / 1000);
  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Urgent alert if > 15 minutes
  const isUrgent = mins >= 15;

  let btnHtml = '';
  if (col === 'wait') {
    btnHtml = `
      <button onclick="advanceKdsStatus('${order.id}', 'cook')" class="w-full py-2 bg-gradient-to-r from-[#C2622D] to-[#AB5424] hover:from-[#CF6B33] text-white font-bold text-xs rounded-xl shadow">
        🍳 Mulai Menyiapkan
      </button>
    `;
  } else if (col === 'cook') {
    btnHtml = `
      <button onclick="advanceKdsStatus('${order.id}', 'ready')" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
        ✅ Siap Disajikan
      </button>
    `;
  } else {
    btnHtml = `
      <button onclick="archiveKdsOrder('${order.id}')" class="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs rounded-xl">
        📦 Selesai / Diarsipkan
      </button>
    `;
  }

  return `
    <div class="p-3.5 rounded-xl bg-[#231A17] border-2 ${isUrgent ? 'kds-card-urgent' : 'border-[#362722]'} flex flex-col gap-2.5 shadow-md">
      <div class="flex items-center justify-between pb-2 border-b border-stone-800">
        <div>
          <span class="text-sm font-black text-white">${order.table}</span>
          <span class="text-[10px] text-stone-400 ml-1">#${order.orderId}</span>
        </div>
        <div id="kdsTimer-${order.id}" class="text-[11px] font-bold px-2 py-0.5 rounded-full ${isUrgent ? 'bg-red-500 text-white' : 'bg-stone-800 text-stone-300'}">
          ⏱️ ${timeFormatted}
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <span class="text-[9px] font-bold px-2 py-0.5 rounded ${order.catColor}">${order.catTag}</span>
        ${isUrgent ? '<span class="text-[9px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400">⚠️ Prioritas (&gt;15m)</span>' : ''}
      </div>

      <div class="space-y-1 text-xs text-stone-200">
        ${order.items.map(it => `
          <div>• <b>${it.qty}x</b> ${it.name} ${it.notes ? `<div class="text-[10px] text-amber-400 pl-3 font-medium">📝 ${escapeHtml(it.notes)}</div>` : ''}</div>
        `).join('')}
      </div>

      <div class="pt-1 mt-auto">
        ${btnHtml}
      </div>
    </div>
  `;
}

function advanceKdsStatus(ticketId, newStatus) {
  const found = findKdsTicket(ticketId);
  if (!found) return;

  const { order, ticket } = found;
  ticket.status = newStatus;
  renderKdsBoard();

  // Keep the customer's live tracker in sync with the single orders state
  const isActiveCustomerOrder = appState.customerActiveOrder && appState.customerActiveOrder.id === order.id;
  syncCustomerTracker();

  if (isActiveCustomerOrder) {
    if (newStatus === 'cook') {
      showToast(`${order.table}: Pesanan sedang disiapkan di dapur.`, 'info');
    } else if (newStatus === 'ready') {
      showToast(`${order.table}: Pesanan siap disajikan ke meja!`, 'success');
    }
  }
}

function archiveKdsOrder(ticketId) {
  const found = findKdsTicket(ticketId);
  if (!found) return;

  found.ticket.archived = true;
  renderKdsBoard();
  showToast(`Pesanan ${found.order.table} selesai disajikan dan telah diarsipkan.`, 'success');
}

function updateKdsMetrics() {
  const wait = getKdsTickets().filter(o => o.status === 'wait').length;
  const cook = getKdsTickets().filter(o => o.status === 'cook').length;
  const ready = getKdsTickets().filter(o => o.status === 'ready').length;
  const urgent = getKdsTickets().filter(o => Math.floor((Date.now() - o.startedAt) / 60000) >= 15).length;

  document.getElementById('kdsStatWait').textContent = wait;
  document.getElementById('kdsStatCook').textContent = cook;
  document.getElementById('kdsStatReady').textContent = ready;
  document.getElementById('kdsStatUrgent').textContent = urgent;
}

// Live KDS Timer Updater (Every second)
setInterval(() => {
  if (appState.currentScreen === 'dapur') {
    getKdsTickets().forEach(o => {
      const el = document.getElementById(`kdsTimer-${o.id}`);
      if (el) {
        const sec = Math.floor((Date.now() - o.startedAt) / 1000);
        const mins = Math.floor(sec / 60);
        const remSec = sec % 60;
        el.textContent = `⏱️ ${mins.toString().padStart(2, '0')}:${remSec.toString().padStart(2, '0')}`;
      }
    });
  }
}, 1000);

// ===================================================================
// 8. OWNER DASHBOARD CONTROLLER (Analytics & Recipe ERP)
// ===================================================================
function renderOwnerDashboard() {
  renderOwnerSalesBars();
  renderOwnerHeatmap();
  renderOwnerInventoryTable();
  renderOwnerMenuManagementTable();
}

function scrollToOwnerSection(secId) {
  const el = document.getElementById(secId);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function renderOwnerSalesBars() {
  const container = document.getElementById('ownerSalesBars');
  if (!container) return;

  const maxVal = 7.0;
  container.innerHTML = appState.salesHistory.map(item => {
    const heightPercent = Math.round((item.val / maxVal) * 100);
    return `
      <div class="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer">
        <div class="w-full max-w-[34px] rounded-t-lg bg-gradient-to-t from-[#913B0E] to-[#C2622D] group-hover:from-[#C2622D] group-hover:to-[#D97736] transition-all relative" style="height:${heightPercent}%">
          <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-stone-700 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-white px-1.5 py-0.5 rounded shadow">
            Rp ${item.val} Jt
          </span>
        </div>
        <span class="text-[10px] font-semibold text-stone-500 mt-2">${item.day}</span>
      </div>
    `;
  }).join('');
}

function renderOwnerHeatmap() {
  const grid = document.getElementById('ownerHeatmapGrid');
  const labels = document.getElementById('ownerHeatmapLabels');
  if (!grid || !labels) return;

  grid.innerHTML = appState.hourlyHeatmap.map(cell => {
    let bg = 'bg-orange-100';
    if (cell.level === 2) bg = 'bg-orange-200';
    if (cell.level === 3) bg = 'bg-orange-400';
    if (cell.level === 4) bg = 'bg-[#C2622D]';

    return `
      <div class="${bg} aspect-square rounded-md cursor-pointer hover:scale-110 transition shadow-sm"
           title="${cell.hour}: ${cell.orders} Transaksi"
           onclick="showToast('${cell.hour}: ${cell.orders} pesanan diproses', 'info')">
      </div>
    `;
  }).join('');

  labels.innerHTML = appState.hourlyHeatmap.map(cell => `
    <div>${cell.hour.slice(0, 2)}</div>
  `).join('');
}

function renderOwnerInventoryTable() {
  const tbody = document.getElementById('ownerInventoryTbody');
  if (!tbody) return;

  tbody.innerHTML = RAW_INVENTORY.map(item => {
    let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (item.status === 'Kritis') badgeClass = 'bg-red-50 text-red-700 border-red-200';
    else if (item.status === 'Menipis') badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';

    return `
      <tr class="border-b border-stone-100 hover:bg-stone-50 transition">
        <td class="py-3 font-bold text-[#1C1614]">${item.name}</td>
        <td class="py-3 text-stone-500">${item.cat}</td>
        <td class="py-3 font-extrabold text-stone-800">${item.current.toFixed(1)} ${item.unit}</td>
        <td class="py-3">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}">${item.status}</span>
        </td>
        <td class="py-3 text-[11px] text-stone-400">
          <span class="text-emerald-500">●</span> ${item.deductRule}
        </td>
      </tr>
    `;
  }).join('');
}

function renderOwnerMenuManagementTable() {
  const tbody = document.getElementById('ownerMenuTbody');
  if (!tbody) return;

  tbody.innerHTML = MENU_DATA.map(item => `
    <tr class="border-b border-stone-100 hover:bg-stone-50 transition">
      <td class="py-2.5 flex items-center gap-2.5">
        <img src="${item.img}" alt="${item.name}" class="w-8 h-8 rounded-lg object-cover" />
        <span class="font-bold text-[#1C1614]">${item.name}</span>
      </td>
      <td class="py-2.5 text-stone-500">${item.categoryName}</td>
      <td class="py-2.5 font-bold text-[#C2622D]">${formatRupiah(item.price)}</td>
      <td class="py-2.5">
        <label class="toggle-switch align-middle">
          <input type="checkbox" ${item.available ? 'checked' : ''} onchange="toggleMenuAvailability('${item.id}', this)" />
          <span class="toggle-slider"></span>
        </label>
        <span class="text-[11px] font-semibold ml-2 ${item.available ? 'text-emerald-600' : 'text-red-500'}">
          ${item.available ? 'Tersedia' : 'Habis (Sold Out)'}
        </span>
      </td>
    </tr>
  `).join('');
}

function toggleMenuAvailability(itemId, checkbox) {
  const item = MENU_DATA.find(m => m.id === itemId);
  if (!item) return;

  item.available = checkbox.checked;
  showToast(`Menu "${item.name}" diubah menjadi: ${item.available ? 'Tersedia' : 'Habis'}`, item.available ? 'success' : 'warn');

  if (appState.currentScreen === 'customer') renderCustomerMenu();
  if (appState.currentScreen === 'kasir') renderPosCatalog();
}



// direction = 1 deducts stock, direction = -1 restores stock (e.g. cancelled order)
function deductInventoryForOrder(cartItems, direction = 1) {
  cartItems.forEach(cartItem => {
    const menuItem = MENU_DATA.find(m => m.id === cartItem.menuId);
    if (!menuItem || !menuItem.recipe) return;

    Object.entries(menuItem.recipe).forEach(([ingredient, amount]) => {
      const inv = RAW_INVENTORY.find(i => i.id === RECIPE_MATERIAL_MAP[ingredient]);
      if (inv) inv.current = Math.max(0, inv.current - (direction * amount * cartItem.qty) / 1000);
    });
  });

  RAW_INVENTORY.forEach(i => {
    if (i.current <= i.min * 0.5) i.status = 'Kritis';
    else if (i.current <= i.min) i.status = 'Menipis';
    else i.status = 'Aman';
  });

  if (appState.currentScreen === 'owner') {
    renderOwnerInventoryTable();
  }
}

function restockAllIngredients() {
  RAW_INVENTORY.forEach(i => {
    if (i.status === 'Kritis' || i.status === 'Menipis') {
      i.current += i.min * 1.5;
      i.status = 'Aman';
    }
  });
  renderOwnerInventoryTable();
  showToast('🚚 Bahan baku berhasil direstock dari supplier!', 'success');
}

// ===================================================================
// 9. UTILITIES & SOUND SYNTHESIZER
// ===================================================================
function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
}

function getCurrentTimeFormatted() {
  const now = new Date();
  const hrs = now.getHours().toString().padStart(2, '0');
  const mins = now.getMinutes().toString().padStart(2, '0');
  return `${hrs}:${mins} WIB`;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  let borderColor = 'border-[#C2622D]';
  if (type === 'success') borderColor = 'border-emerald-500';
  if (type === 'warn') borderColor = 'border-amber-500';
  if (type === 'error') borderColor = 'border-red-500';

  toast.className = `bg-[#1C1614] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border-l-4 ${borderColor} flex items-center gap-2 pointer-events-auto transition-all transform duration-300 translate-x-4 opacity-0`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-4', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('translate-x-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Web Audio API Beep Generator for KDS Kitchen Alerts
function playNotificationTone() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    // Autoplay policy fallback
  }
}

// Global Clocks
setInterval(() => {
  const timeStr = getCurrentTimeFormatted();
  const fullStr = new Date().toTimeString().split(' ')[0] + ' WIB';

  const posClock = document.getElementById('kasirLiveClock');
  const ownerClock = document.getElementById('ownerLiveClock');
  const kdsClock = document.getElementById('kdsLiveClock');

  if (posClock) posClock.textContent = timeStr;
  if (ownerClock) ownerClock.textContent = timeStr;
  if (kdsClock) kdsClock.textContent = fullStr;
}, 1000);

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTableDropdowns();
  updateCustomerHeaderTableText();
  navigate('portal');
});
