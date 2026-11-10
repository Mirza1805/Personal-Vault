// =============================================================================
// Personal Vault — app.js
// Aplikasi Utilitas Privat, Wardrobe Gacha & Gamifikasi Dare Mode Anti-Curang
// 100% Client-Side dengan Dynamic Theming & Enkripsi Ringan Base64
// =============================================================================

// ==========================================
// 1. KONSTANTA, DATA DEFAULT & STORAGE KEYS
// ==========================================

const DEFAULT_PIN = '1805';

// Kunci-kunci penyimpanan terenkripsi di localStorage
const STORAGE_KEYS = {
  settings: 'vault_settings',       // PIN terenkripsi Base64
  tasks: 'vault_tasks',             // Checklist multi-kategori (Nested JSON)
  lastDate: 'vault_last_date',       // Tanggal terakhir app dibuka untuk Auto-Reset
  wardrobe: 'vault_wardrobe',       // Koleksi pakaian (Top, Bottom, Underwear, Kerudung)
  journal: 'vault_journal',         // Comfort journal pakaian
  gamification: 'vault_gamification'// Poin, Title, Status Quest Dare, Reroll, Cooldown
};

// Daftar Title / Gelar User berdasarkan perolehan Poin
const USER_TITLES = [
  { minPts: 0,   name: "Cupu Penakut" },
  { minPts: 100, name: "Pemula Ragu" },
  { minPts: 150, name: "Sweetheart" },
  { minPts: 200, name: "Brave Girl" },
  { minPts: 300, name: "Queen of Glam" },
  { minPts: 500, name: "Legendary Vault Goddess" }
];

// Data Default Gamifikasi
const DEFAULT_GAMIFICATION = {
  points: 100,
  title: "Brave Girl",
  rerollCount: 3,
  rerollDate: '',
  cooldownUntil: 0, // Timestamp ms hukuman 12 jam
  activeQuest: null // Objek quest yang sedang berjalan
};

// Data Default Multi-Category Checklist
const DEFAULT_TASKS = [
  {
    id: 'cat_daily',
    name: 'Daily',
    isDaily: true, // Kategori ini otomatis di-reset saat lewat pukul 00:00 tengah malam
    items: [
      { id: 'd1', text: 'Merapikan kasur & ventilasi kamar pagi hari', checked: false },
      { id: 'd2', text: 'Minum 2 liter air putih & suplemen vitamin', checked: false },
      { id: 'd3', text: 'Skincare pagi & sunscreen sebelum beraktivitas', checked: false },
      { id: 'd4', text: 'Stretching tubuh / workout ringan 20 menit', checked: false },
      { id: 'd5', text: 'Catat journal kenyamanan pakaian hari ini', checked: false }
    ]
  },
  {
    id: 'cat_weekend',
    name: 'Weekend',
    isDaily: false,
    items: [
      { id: 'w1', text: 'Cuci pakaian rahasia dengan deterjen lembut & jemur', checked: false },
      { id: 'w2', text: 'Ganti seprai & sarung bantal kasur', checked: false },
      { id: 'w3', text: 'Servis motor & cek tekanan ban', checked: false },
      { id: 'w4', text: 'Rapi-rapi lemari pakaian tersembunyi', checked: false }
    ]
  },
  {
    id: 'cat_belanja',
    name: 'Belanja',
    isDaily: false,
    items: [
      { id: 'b1', text: 'Sampo & conditioner beraroma lembut', checked: false },
      { id: 'b2', text: 'Sabun mandi cair pelembab', checked: false },
      { id: 'b3', text: 'Pembalut bersayap (Night & Day pack)', checked: false },
      { id: 'b4', text: 'Micellar water & kapas wajah', checked: false }
    ]
  }
];

// Data Default Koleksi Pakaian
const DEFAULT_WARDROBE = [
  // --- Tops (Atasan) ---
  { id: 't1', name: 'Kaos Polos Hitam Oversize', category: 'top', gender: 'Cowok' },
  { id: 't2', name: 'Kemeja Flannel Kotak Biru', category: 'top', gender: 'Cowok' },
  { id: 't3', name: 'Crop Top Pastel Pink Lembut', category: 'top', gender: 'Cewek' },
  { id: 't4', name: 'Blouse Chiffon Motif Floral Anggun', category: 'top', gender: 'Cewek' },

  // --- Bottoms (Bawahan) ---
  { id: 'b1', name: 'Slim Fit Dark Denim', category: 'bottom', gender: 'Cowok' },
  { id: 'b2', name: 'Celana Pendek Chino Khaki', category: 'bottom', gender: 'Cowok' },
  { id: 'b3', name: 'Rok Plisket Panjang Lilac', category: 'bottom', gender: 'Cewek' },
  { id: 'b4', name: 'Hotpants Denim Lucu', category: 'bottom', gender: 'Cewek' },

  // --- Underwear (Daleman) ---
  { id: 'u1', name: 'Boxer Brief Katun Pria', category: 'underwear', gender: 'Cowok' },
  { id: 'u2', name: 'Boxer Seamless Hitam', category: 'underwear', gender: 'Cowok' },
  { id: 'u3', name: 'Celana Dalam Renda Pink Manis', category: 'underwear', gender: 'Cewek' },
  { id: 'u4', name: 'Seamless Panties Nude Halus', category: 'underwear', gender: 'Cewek' },

  // --- Kerudung ---
  { id: 'k1', name: 'Pashmina Silk Nude Mengkilap', category: 'kerudung', gender: 'Cewek' },
  { id: 'k2', name: 'Hijab Bella Square Dusty Pink', category: 'kerudung', gender: 'Cewek' },
  { id: 'k3', name: 'Bergo Instan Hitam Adem', category: 'kerudung', gender: 'Cewek' }
];

// 5 Contoh Kalimat Godaan Genit / Lucu (Teasing Text System)
const TEASING_PHRASES = [
  "Ciee dandan cantik hari ini hihihi~",
  "Jangan lupa pembalutnya dipakai yang rapi ya manis~",
  "Pasti gemes banget nih pakai daleman itu!",
  "Awas ya kalau senyum-senyum sendiri di depan cermin~",
  "Ssst... rahasia kecil kita ya! Penampilan hari ini anggun banget~"
];

// Aktivitas Mood untuk Tantangan Dare
const MOOD_ACTIVITIES = {
  santai: [
    "Nonton drakor / anime 1 episode santai di kasur",
    "Seduh teh hangat & dengerin musik lofi di kamar",
    "Perawatan muka / maskeran santai sambil mirror selfie",
    "Baca buku / novel favorit sambil tiduran",
    "Nyalain lilin aromaterapi / diffuser sambil rileks"
  ],
  produktif: [
    "Beresin & rapihin lemari pakaian rahasia",
    "Belajar coding / selesaikan tugas harian 45 menit",
    "Workout ringan, squat 30x, dan stretching tubuh",
    "Sapu & pel lantai kamar sampai wangi & kinclong",
    "Journaling mendalam tentang perasaan & evaluasi outfit"
  ],
  // =========================================================================
  // KUSTOM / EKSTREM: User dapat menambahkan / mengubah aktivitas ekstrem
  // di dalam array di bawah ini sesuai kenyamanan masing-masing:
  // =========================================================================
  ekstrem: [
    "Bikin video dance / pose TikTok rahasia di kamar lalu simpan ke arsip pribadi",
    "Foto mirror selfie ootd lengkap 10 angle berbeda lalu evaluasi di cermin",
    "Jalan mondar-mandir anggun di kamar sambil latihan postur tubuh selama 15 menit",
    "Teleponan sama teman akrab sambil tetap mengenakan outfit ini tanpa ketahuan",
    "Duduk santai di depan laptop mengetik sambil mengenakan outfit ini sampai quest selesai"
  ]
};

// 5 Kalimat Ejekan Tajam (Savage Mockery) saat menekan tombol Nyerah
const SAVAGE_MOCKERIES = [
  "Yahh cupu banget, baru segini doang udah nyerah & ciut nyalinya? Hahaha!",
  "Lemah! Katanya mau jadi Brave Girl, ternyata aslinya penakut banget hihihi~",
  "Malu dong sama outfitnya! Baru sebentar udah gak kuat, payah deh~",
  "Cuma segini doang nyalinya? Kecewa banget, balik sana pakai baju biasa!",
  "Dasar cupu penakut! Gelar kamu resmi diturunkan karena bermental tempe!"
];

// Contoh Data Default Jurnal Pakaian
const DEFAULT_JOURNAL = [
  {
    id: 'j1',
    name: 'Pashmina Silk Nude',
    size: '180 x 75 cm',
    rating: 5,
    notes: 'Bahannya jatuh banget, super lembut di pipi dan bikin wajah kelihatan tirus. Wangi softener tahan seharian.',
    date: '10 Nov 2026'
  },
  {
    id: 'j2',
    name: 'Seamless Panties Nude',
    size: 'L',
    rating: 5,
    notes: 'Gak nyeplak sama sekali waktu pakai rok plisket atau celana ketat. Karet pinggang sangat elastis dan adem.',
    date: '08 Nov 2026'
  }
];

// ==========================================
// 2. GLOBAL STATE & TIMERS
// ==========================================

let pinInput = '';
let currentRating = 0;
let isSpinning = false;
let currentGenderFilter = 'all';

let dareTimerInterval = null;
let cooldownInterval = null;
let autoLockTimeout = null;

let longPressTimer = null;
const AUTO_LOCK_MS = 3 * 60 * 1000; // 3 Menit Auto-Lock

// Menyimpan hasil gacha terakhir untuk dipakai di Dare Mode
let lastGachaResult = null;

// ==========================================
// 3. ENKRIPSI RINGAN (btoa / atob) & HELPER
// ==========================================

/**
 * Simpan data sensitif ke localStorage terenkripsi Base64 btoa()
 */
function saveSecure(key, data) {
  try {
    const jsonStr = JSON.stringify(data);
    const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
    localStorage.setItem(key, encoded);
  } catch (err) {
    console.warn(`Gagal saveSecure untuk ${key}:`, err);
  }
}

/**
 * Muat data sensitif dari localStorage ter-decode atob()
 */
function loadSecure(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    const decoded = decodeURIComponent(escape(atob(raw)));
    return JSON.parse(decoded);
  } catch (err) {
    console.warn(`Gagal loadSecure untuk ${key}, fallback:`, err);
    return defaultVal;
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

function showToast(message, duration = 2200) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), duration);
}

function vibrate(pattern = 15) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==========================================
// 4. FITUR 1: PIN LOCK, THEME & AUTO-LOCK
// ==========================================

/**
 * Inisialisasi Layar Lock (Stealth Mode)
 */
function initPin() {
  document.body.classList.remove('feminine-theme');

  const settings = loadSecure(STORAGE_KEYS.settings, null);
  if (!settings || !settings.pin) {
    saveSecure(STORAGE_KEYS.settings, { pin: DEFAULT_PIN });
  }

  setupNumpad();
  setupAutoLockListener();
}

function setupNumpad() {
  const numpad = document.querySelector('.numpad');
  if (!numpad) return;

  numpad.addEventListener('click', (e) => {
    const btn = e.target.closest('.num-btn');
    if (!btn) return;
    vibrate(12);

    const num = btn.dataset.num;
    const action = btn.dataset.action;

    if (action === 'clear') {
      pinInput = '';
      updatePinDots();
      clearPinError();
    } else if (action === 'back') {
      pinInput = pinInput.slice(0, -1);
      updatePinDots();
      clearPinError();
    } else if (num !== undefined) {
      if (pinInput.length < 4) {
        pinInput += num;
        updatePinDots();
        clearPinError();

        if (pinInput.length === 4) {
          setTimeout(() => verifyPin(), 160);
        }
      }
    }
  });
}

function updatePinDots() {
  const dots = document.querySelectorAll('#pin-dots .dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('filled', idx < pinInput.length);
  });
}

/**
 * Verifikasi PIN:
 * Membuka UI utama, beralih ke tema Feminim (CSS Variables), dan menyalakan timer.
 */
function verifyPin() {
  const settings = loadSecure(STORAGE_KEYS.settings, { pin: DEFAULT_PIN });
  const savedPin = settings.pin;

  if (pinInput === savedPin) {
    vibrate(35);

    // Dynamic Theming: Ganti variabel warna ke tema feminim elegan
    document.body.classList.add('feminine-theme');

    document.getElementById('pin-screen').style.display = 'none';
    document.getElementById('camo-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';

    pinInput = '';
    updatePinDots();

    initApp();
    resetAutoLockTimer();
  } else {
    vibrate([50, 40, 50]);
    const dotsContainer = document.getElementById('pin-dots');
    dotsContainer.classList.add('shake');
    showPinError('ACCESS DENIED: PIN SALAH');

    setTimeout(() => {
      dotsContainer.classList.remove('shake');
      pinInput = '';
      updatePinDots();
    }, 550);
  }
}

function showPinError(msg) {
  const el = document.getElementById('pin-error');
  if (el) el.textContent = msg;
}

function clearPinError() {
  const el = document.getElementById('pin-error');
  if (el) el.textContent = '';
}

/**
 * Panic Button:
 * Double-click / Double-tap pada Header menyembunyikan UI utama dan
 * menampilkan halaman dummy "Coding Tasks".
 */
function setupPanicButton() {
  const header = document.getElementById('app-header');
  const panicBtn = document.getElementById('panic-indicator');
  const lockManualBtn = document.getElementById('btn-lock-manual');

  const triggerPanic = () => {
    vibrate(30);
    document.body.classList.remove('feminine-theme');
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('pin-screen').style.display = 'none';
    document.getElementById('camo-screen').style.display = 'block';
  };

  header?.addEventListener('dblclick', triggerPanic);
  panicBtn?.addEventListener('click', triggerPanic);

  // Tombol Kunci Manual
  lockManualBtn?.addEventListener('click', () => {
    vibrate(20);
    lockVault();
    showToast('Vault berhasil dikunci 🔐');
  });

  // Mobile double-tap detector
  let lastTap = 0;
  header?.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 350) {
      e.preventDefault();
      triggerPanic();
    }
    lastTap = now;
  });
}

/**
 * Auto-Lock: Kunci otomatis jika layar tidak disentuh/diklik selama 3 menit
 */
function setupAutoLockListener() {
  const userEvents = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
  userEvents.forEach((evt) => {
    window.addEventListener(evt, resetAutoLockTimer, { passive: true });
  });
}

function resetAutoLockTimer() {
  clearTimeout(autoLockTimeout);
  const mainApp = document.getElementById('main-app');
  if (mainApp && mainApp.style.display !== 'none') {
    autoLockTimeout = setTimeout(() => {
      lockVault();
      showToast('🔒 Auto-lock: Terkunci otomatis karena tidak aktif selama 3 menit');
    }, AUTO_LOCK_MS);
  }
}

function lockVault() {
  document.body.classList.remove('feminine-theme');
  document.getElementById('main-app').style.display = 'none';
  document.getElementById('camo-screen').style.display = 'none';
  document.getElementById('pin-screen').style.display = 'flex';
  pinInput = '';
  updatePinDots();
  clearPinError();
}

// ==========================================
// 5. FITUR 2: MULTI-CATEGORY CHECKLIST
// ==========================================

function initTasks() {
  let categories = loadSecure(STORAGE_KEYS.tasks, null);
  if (!categories || !Array.isArray(categories)) {
    categories = DEFAULT_TASKS;
    saveSecure(STORAGE_KEYS.tasks, categories);
  }

  // Pengecekan krusial: Auto-Reset kategori Daily saat pergantian hari
  checkAutoReset(categories);

  renderCategories();
  setupCategoryForm();
}

/**
 * Auto-Reset Harian:
 * Mengecek apakah tanggal hari ini sudah berganti (lewat jam 00:00).
 * Jika ya, reset semua checkbox pada kategori 'Daily' menjadi false.
 */
function checkAutoReset(categories) {
  const today = todayString();
  const lastDate = loadSecure(STORAGE_KEYS.lastDate, null);

  if (lastDate !== today) {
    let hasReset = false;

    categories.forEach((cat) => {
      const isDailyCat = cat.isDaily || cat.name.toLowerCase() === 'daily';
      if (isDailyCat && Array.isArray(cat.items)) {
        cat.items.forEach((item) => {
          if (item.checked) {
            item.checked = false;
            hasReset = true;
          }
        });
      }
    });

    saveSecure(STORAGE_KEYS.tasks, categories);
    saveSecure(STORAGE_KEYS.lastDate, today);

    if (lastDate !== null && hasReset) {
      setTimeout(() => {
        showToast('✨ Checklist kategori Daily otomatis di-reset untuk hari baru!');
      }, 500);
    }
  }
}

function renderCategories() {
  const categories = loadSecure(STORAGE_KEYS.tasks, DEFAULT_TASKS);
  const container = document.getElementById('category-list-container');
  if (!container) return;

  if (categories.length === 0) {
    container.innerHTML = '<div class="empty-state">Belum ada kategori checklist. Klik "+ Kategori" untuk membuat baru.</div>';
    updateProgress();
    return;
  }

  container.innerHTML = categories.map((cat) => {
    const totalItems = cat.items ? cat.items.length : 0;
    const doneItems = cat.items ? cat.items.filter((i) => i.checked).length : 0;
    const isDailyCat = cat.isDaily || cat.name.toLowerCase() === 'daily';

    const itemsHtml = totalItems === 0
      ? '<div class="empty-state">Belum ada tugas di kategori ini</div>'
      : cat.items.map((item) => `
          <div class="item-row ${item.checked ? 'checked' : ''}" data-cat-id="${cat.id}" data-item-id="${item.id}">
            <div class="item-checkbox"></div>
            <span class="item-text">${escapeHtml(item.text)}</span>
            <button class="item-del-btn" data-cat-id="${cat.id}" data-item-id="${item.id}" title="Hapus Tugas">✕</button>
          </div>
        `).join('');

    return `
      <div class="category-card" data-cat-id="${cat.id}">
        <div class="category-header">
          <div class="category-title-group">
            <span class="category-title">${escapeHtml(cat.name)}</span>
            ${isDailyCat ? '<span class="daily-badge">DAILY</span>' : ''}
            <span class="category-count">(${doneItems}/${totalItems})</span>
          </div>
          <button class="btn-del-cat" data-cat-id="${cat.id}" title="Hapus Kategori">🗑️</button>
        </div>

        <div class="category-items">
          ${itemsHtml}
        </div>

        <div class="category-add-row">
          <input type="text" class="input-field input-add-subitem" data-cat-id="${cat.id}" placeholder="+ Tambah tugas ke ${escapeHtml(cat.name)}..." maxlength="80">
          <button class="btn-add-item" data-cat-id="${cat.id}">+</button>
        </div>
      </div>
    `;
  }).join('');

  updateProgress();
  setupCategoryEventListeners();
}

function setupCategoryEventListeners() {
  const container = document.getElementById('category-list-container');
  if (!container) return;

  container.onclick = (e) => {
    const delCatBtn = e.target.closest('.btn-del-cat');
    if (delCatBtn) {
      e.stopPropagation();
      deleteCategory(delCatBtn.dataset.catId);
      return;
    }

    const delItemBtn = e.target.closest('.item-del-btn');
    if (delItemBtn) {
      e.stopPropagation();
      deleteSubItem(delItemBtn.dataset.catId, delItemBtn.dataset.itemId);
      return;
    }

    const addItemBtn = e.target.closest('.btn-add-item');
    if (addItemBtn) {
      const catId = addItemBtn.dataset.catId;
      const input = container.querySelector(`.input-add-subitem[data-cat-id="${catId}"]`);
      if (input) submitNewSubItem(catId, input);
      return;
    }

    const row = e.target.closest('.item-row');
    if (row) {
      toggleSubItem(row.dataset.catId, row.dataset.itemId);
    }
  };

  container.onkeydown = (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('input-add-subitem')) {
      const catId = e.target.dataset.catId;
      submitNewSubItem(catId, e.target);
    }
  };
}

function submitNewSubItem(catId, inputEl) {
  const text = inputEl.value.trim();
  if (!text) {
    showToast('Tuliskan nama tugas terlebih dahulu');
    return;
  }

  const categories = loadSecure(STORAGE_KEYS.tasks, DEFAULT_TASKS);
  const cat = categories.find((c) => c.id === catId);
  if (!cat) return;

  if (!Array.isArray(cat.items)) cat.items = [];
  cat.items.push({ id: uid(), text, checked: false });
  saveSecure(STORAGE_KEYS.tasks, categories);

  inputEl.value = '';
  vibrate(12);
  renderCategories();
  showToast('Tugas ditambahkan ✓');
}

function toggleSubItem(catId, itemId) {
  const categories = loadSecure(STORAGE_KEYS.tasks, DEFAULT_TASKS);
  const cat = categories.find((c) => c.id === catId);
  if (!cat || !cat.items) return;

  const item = cat.items.find((i) => i.id === itemId);
  if (item) {
    item.checked = !item.checked;
    vibrate(item.checked ? 18 : 10);
    saveSecure(STORAGE_KEYS.tasks, categories);
    renderCategories();
  }
}

function deleteSubItem(catId, itemId) {
  const categories = loadSecure(STORAGE_KEYS.tasks, DEFAULT_TASKS);
  const cat = categories.find((c) => c.id === catId);
  if (!cat || !cat.items) return;

  cat.items = cat.items.filter((i) => i.id !== itemId);
  saveSecure(STORAGE_KEYS.tasks, categories);
  vibrate(10);
  renderCategories();
  showToast('Tugas dihapus');
}

function deleteCategory(catId) {
  let categories = loadSecure(STORAGE_KEYS.tasks, DEFAULT_TASKS);
  categories = categories.filter((c) => c.id !== catId);
  saveSecure(STORAGE_KEYS.tasks, categories);
  vibrate(15);
  renderCategories();
  showToast('Kategori dihapus');
}

function setupCategoryForm() {
  const toggleBtn = document.getElementById('btn-toggle-cat-form');
  const cancelBtn = document.getElementById('btn-cancel-cat');
  const saveBtn = document.getElementById('btn-save-cat');
  const box = document.getElementById('new-category-box');
  const nameInput = document.getElementById('input-cat-name');
  const dailyCheckbox = document.getElementById('input-cat-daily');

  toggleBtn?.addEventListener('click', () => {
    box.classList.toggle('show');
    if (box.classList.contains('show')) nameInput?.focus();
  });

  cancelBtn?.addEventListener('click', () => {
    box.classList.remove('show');
    nameInput.value = '';
    dailyCheckbox.checked = false;
  });

  saveBtn?.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) {
      showToast('Nama kategori tidak boleh kosong');
      return;
    }

    const categories = loadSecure(STORAGE_KEYS.tasks, DEFAULT_TASKS);
    categories.push({
      id: uid(),
      name,
      isDaily: dailyCheckbox.checked,
      items: []
    });

    saveSecure(STORAGE_KEYS.tasks, categories);

    nameInput.value = '';
    dailyCheckbox.checked = false;
    box.classList.remove('show');

    vibrate(15);
    renderCategories();
    showToast('Kategori baru tersimpan ✓');
  });
}

function updateProgress() {
  const categories = loadSecure(STORAGE_KEYS.tasks, DEFAULT_TASKS);
  let total = 0;
  let done = 0;

  categories.forEach((cat) => {
    if (Array.isArray(cat.items)) {
      total += cat.items.length;
      done += cat.items.filter((i) => i.checked).length;
    }
  });

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const bar = document.getElementById('progress-bar');
  const text = document.getElementById('progress-text');
  if (bar) bar.style.width = pct + '%';
  if (text) text.textContent = pct + '%';
}

// ==========================================
// 6. FITUR 3: WARDROBE GACHA & TEASING
// ==========================================

function initWardrobe() {
  let wardrobe = loadSecure(STORAGE_KEYS.wardrobe, null);
  if (!wardrobe || !Array.isArray(wardrobe)) {
    wardrobe = DEFAULT_WARDROBE;
    saveSecure(STORAGE_KEYS.wardrobe, wardrobe);
  }

  renderWardrobeInventory();
  setupWardrobeAddForm();
  setupGachaModeSelector();
  setupGachaSpin();
}

function setupGachaModeSelector() {
  const radios = document.querySelectorAll('input[name="gacha-mode"]');
  const hintBanner = document.getElementById('mode-hint-banner');
  const pembalutBox = document.getElementById('pembalut-box');
  const teasingBox = document.getElementById('teasing-box');

  radios.forEach((r) => {
    r.addEventListener('change', () => {
      const mode = getSelectedGachaMode();
      vibrate(10);

      if (mode === 'cowok') {
        hintBanner.textContent = 'Mode Cowok: Hanya mengacak pakaian cowok. Kerudung & pembalut dinonaktifkan.';
        pembalutBox.style.display = 'none';
        teasingBox.style.display = 'none';
        document.getElementById('slot-val-kerudung').textContent = '— (Off)';
      } else {
        hintBanner.textContent = 'Mode Mix/Feminim: Mengacak pakaian cowok & cewek / full cewek, termasuk Kerudung & 50% RNG Pembalut!';
        pembalutBox.style.display = 'flex';
        document.getElementById('slot-val-kerudung').textContent = '—';
      }
    });
  });
}

function getSelectedGachaMode() {
  const selected = document.querySelector('input[name="gacha-mode"]:checked');
  return selected ? selected.value : 'cowok';
}

function getFilteredPool(category, mode) {
  const wardrobe = loadSecure(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE);
  if (mode === 'cowok') {
    return wardrobe.filter((i) => i.category === category && i.gender === 'Cowok');
  }
  return wardrobe.filter((i) => i.category === category);
}

function setupGachaSpin() {
  document.getElementById('btn-spin')?.addEventListener('click', spinGacha);
}

function spinGacha() {
  if (isSpinning) return;

  // Cek apakah user sedang dalam masa Cooldown hukuman 12 jam
  if (isCooldownActive()) {
    showToast('⛔ Akses Spin di-lock karena hukuman Nyerah!');
    vibrate([40, 40, 40]);
    return;
  }

  const mode = getSelectedGachaMode();
  const topPool = getFilteredPool('top', mode);
  const bottomPool = getFilteredPool('bottom', mode);
  const underwearPool = getFilteredPool('underwear', mode);
  const kerudungPool = getFilteredPool('kerudung', mode);

  if (topPool.length === 0 || bottomPool.length === 0 || underwearPool.length === 0) {
    showToast(`Pakaian di lemari untuk mode ${mode} belum lengkap!`);
    return;
  }

  isSpinning = true;
  vibrate(30);

  const spinBtn = document.getElementById('btn-spin');
  spinBtn.disabled = true;
  spinBtn.classList.add('spinning-btn');

  const teasingBox = document.getElementById('teasing-box');
  teasingBox.style.display = 'none';

  const pembalutBox = document.getElementById('pembalut-box');
  const pembalutStatus = document.getElementById('pembalut-status');
  if (mode === 'mix') {
    pembalutBox.style.display = 'flex';
    pembalutStatus.textContent = 'Mengacak...';
    pembalutStatus.className = 'pembalut-status';
  }

  const slots = ['top', 'bottom', 'underwear'];
  if (mode === 'mix') slots.push('kerudung');

  const stopTimes = { top: 700, bottom: 1300, underwear: 1900, kerudung: 2400 };
  const results = {};
  const intervals = {};

  slots.forEach((slotKey) => {
    const slotEl = document.getElementById(`slot-${slotKey}`);
    const valEl = document.getElementById(`slot-val-${slotKey}`);

    let pool = topPool;
    if (slotKey === 'bottom') pool = bottomPool;
    else if (slotKey === 'underwear') pool = underwearPool;
    else if (slotKey === 'kerudung') pool = kerudungPool;

    slotEl.classList.remove('result');
    slotEl.classList.add('spinning');
    valEl.classList.add('cycling');

    intervals[slotKey] = setInterval(() => {
      if (pool.length > 0) {
        const rand = pool[Math.floor(Math.random() * pool.length)];
        valEl.textContent = rand.name;
      }
    }, 80);

    setTimeout(() => {
      clearInterval(intervals[slotKey]);

      if (pool.length > 0) {
        const finalItem = pool[Math.floor(Math.random() * pool.length)];
        results[slotKey] = finalItem;
        valEl.textContent = finalItem.name;
      } else {
        valEl.textContent = 'Tidak Ada';
      }

      valEl.classList.remove('cycling');
      slotEl.classList.remove('spinning');
      slotEl.classList.add('result');
      vibrate(18);

      const isLastSlot = (mode === 'mix' && slotKey === 'kerudung') || (mode === 'cowok' && slotKey === 'underwear');
      if (isLastSlot) {
        finalizeGachaSpin(mode, results, spinBtn);
      }
    }, stopTimes[slotKey]);
  });
}

function finalizeGachaSpin(mode, results, spinBtn) {
  isSpinning = false;
  spinBtn.disabled = false;
  spinBtn.classList.remove('spinning-btn');

  let harusPakaiPembalut = false;

  // RNG Pembalut 50% khusus mode Mix/Feminim
  if (mode === 'mix') {
    const pembalutStatus = document.getElementById('pembalut-status');
    const rng = Math.random() < 0.5;

    if (rng) {
      harusPakaiPembalut = true;
      pembalutStatus.textContent = 'HARUS PAKAI PEMBALUT 🩸';
      pembalutStatus.className = 'pembalut-status wajib';
    } else {
      pembalutStatus.textContent = 'TIDAK PERLU PEMBALUT ✨';
      pembalutStatus.className = 'pembalut-status aman';
    }
  }

  // Simpan hasil gacha terakhir agar bisa di-load ke Dare Mode
  lastGachaResult = {
    top: results.top?.name || '',
    bottom: results.bottom?.name || '',
    underwear: results.underwear?.name || '',
    kerudung: mode === 'mix' ? results.kerudung?.name : null,
    pembalut: harusPakaiPembalut
  };

  // Teasing System: Tampilkan teks godaan jika item cewek, kerudung, atau pembalut terpilih
  let triggerTeasing = false;
  if (results.top && results.top.gender === 'Cewek') triggerTeasing = true;
  if (results.bottom && results.bottom.gender === 'Cewek') triggerTeasing = true;
  if (results.underwear && results.underwear.gender === 'Cewek') triggerTeasing = true;
  if (results.kerudung && results.kerudung.gender === 'Cewek') triggerTeasing = true;
  if (harusPakaiPembalut) triggerTeasing = true;

  if (triggerTeasing) {
    const teasingBox = document.getElementById('teasing-box');
    const teasingMessage = document.getElementById('teasing-message');
    const randIdx = Math.floor(Math.random() * TEASING_PHRASES.length);
    teasingMessage.textContent = TEASING_PHRASES[randIdx];
    teasingBox.style.display = 'block';
    vibrate([20, 20, 30]);
    showToast('Outfit rahasia hari ini siap! 🌸');
  } else {
    showToast('Outfit cowok hari ini siap! 🕶️');
  }
}

function setupWardrobeAddForm() {
  document.getElementById('btn-add-wardrobe')?.addEventListener('click', () => {
    const nameInput = document.getElementById('wardrobe-name');
    const catInput = document.getElementById('wardrobe-category');
    const genderInput = document.getElementById('wardrobe-gender');

    const name = nameInput.value.trim();
    const category = catInput.value;
    const gender = genderInput.value;

    if (!name) {
      showToast('Tuliskan nama pakaian terlebih dahulu');
      return;
    }

    const wardrobe = loadSecure(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE);
    wardrobe.push({ id: uid(), name, category, gender });
    saveSecure(STORAGE_KEYS.wardrobe, wardrobe);

    nameInput.value = '';
    vibrate(15);
    renderWardrobeInventory();
    showToast('Pakaian disimpan ke lemari ✓');
  });

  const filterPills = document.querySelectorAll('.filter-gender-group .filter-pill');
  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentGenderFilter = pill.dataset.filter;
      renderWardrobeInventory();
    });
  });
}

function renderWardrobeInventory() {
  const wardrobe = loadSecure(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE);
  const container = document.getElementById('wardrobe-inventory-container');
  if (!container) return;

  const categories = [
    { key: 'top', label: '👕 Top (Atasan)' },
    { key: 'bottom', label: '👖 Bottom (Bawahan)' },
    { key: 'underwear', label: '🩲 Underwear (Daleman)' },
    { key: 'kerudung', label: '🧕 Kerudung' }
  ];

  let html = '';
  categories.forEach((cat) => {
    let items = wardrobe.filter((i) => i.category === cat.key);
    if (currentGenderFilter !== 'all') {
      items = items.filter((i) => i.gender === currentGenderFilter);
    }

    html += `
      <div class="wardrobe-cat-group">
        <div class="wardrobe-cat-title">${cat.label} (${items.length})</div>
    `;

    if (items.length === 0) {
      html += '<div class="empty-state">Tidak ada pakaian di kategori ini</div>';
    } else {
      items.forEach((item) => {
        html += `
          <div class="wardrobe-item-pill">
            <div class="wardrobe-item-left">
              <span class="item-gender-tag ${item.gender}">${item.gender}</span>
              <span class="wardrobe-item-name">${escapeHtml(item.name)}</span>
            </div>
            <button class="wardrobe-del-btn" data-id="${item.id}" title="Hapus Pakaian">✕</button>
          </div>
        `;
      });
    }
    html += '</div>';
  });

  container.innerHTML = html;

  container.onclick = (e) => {
    const btn = e.target.closest('.wardrobe-del-btn');
    if (btn) {
      deleteWardrobeItem(btn.dataset.id);
    }
  };
}

function deleteWardrobeItem(id) {
  let wardrobe = loadSecure(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE);
  wardrobe = wardrobe.filter((i) => i.id !== id);
  saveSecure(STORAGE_KEYS.wardrobe, wardrobe);
  vibrate(10);
  renderWardrobeInventory();
  showToast('Item pakaian dihapus');
}

// ==========================================
// 7. FITUR 4: DARE MODE (GAMIFIKASI & TIMER)
// ==========================================

function initDareMode() {
  const gData = loadSecure(STORAGE_KEYS.gamification, DEFAULT_GAMIFICATION);

  // Reset limit reroll harian (3x) jika hari sudah berganti
  const today = todayString();
  if (gData.rerollDate !== today) {
    gData.rerollCount = 3;
    gData.rerollDate = today;
    saveSecure(STORAGE_KEYS.gamification, gData);
  }

  updateGamificationProfileUI();
  setupDareButtons();
  setupLongPressDismiss();

  // Pulihkan quest aktif jika ada yang sedang berjalan
  if (gData.activeQuest) {
    restoreActiveQuestUI(gData.activeQuest);
  } else {
    showDareSetupUI();
  }

  // Periksa apakah masa cooldown 12 jam masih aktif
  checkCooldownTimer();
}

/**
 * Update UI Poin & Title
 */
function updateGamificationProfileUI() {
  const gData = loadSecure(STORAGE_KEYS.gamification, DEFAULT_GAMIFICATION);
  const ptsEl = document.getElementById('user-points');
  const titleEl = document.getElementById('user-title');

  if (ptsEl) ptsEl.textContent = `${gData.points} Pts`;
  if (titleEl) titleEl.textContent = gData.title;

  const rerollTag = document.getElementById('reroll-remaining-tag');
  const rerollBtnCount = document.getElementById('reroll-count-btn');
  if (rerollTag) rerollTag.textContent = `Reroll: ${gData.rerollCount}/3`;
  if (rerollBtnCount) rerollBtnCount.textContent = gData.rerollCount;
}

function setupDareButtons() {
  document.getElementById('btn-start-dare')?.addEventListener('click', startNewDareQuest);
  document.getElementById('btn-reroll-dare')?.addEventListener('click', rerollDareActivity);
  document.getElementById('btn-claim-reward')?.addEventListener('click', claimDareReward);
  document.getElementById('btn-surrender-dare')?.addEventListener('click', surrenderDareQuest);
}

/**
 * Generate Quest Baru:
 * Format: "Tantangan: Pakai [Hasil Gacha] selama [Durasi] sambil [Aktivitas dari Mood]"
 */
function startNewDareQuest() {
  if (isCooldownActive()) {
    showToast('⛔ Sedang dalam masa Cooldown hukuman Nyerah 12 jam!');
    vibrate([40, 40, 40]);
    return;
  }

  const selectedMood = document.querySelector('input[name="dare-mood"]:checked')?.value || 'santai';
  const durationMinutes = parseInt(document.getElementById('dare-duration')?.value || '30', 10);

  // Ambil outfit dari hasil gacha terakhir atau acak cepat dari lemari
  let outfitDesc = '';
  if (lastGachaResult) {
    outfitDesc = `${lastGachaResult.top}, ${lastGachaResult.bottom}, ${lastGachaResult.underwear}`;
    if (lastGachaResult.kerudung) outfitDesc += `, ${lastGachaResult.kerudung}`;
    if (lastGachaResult.pembalut) outfitDesc += ` (+ Pembalut)`;
  } else {
    const wardrobe = loadSecure(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE);
    const tops = wardrobe.filter((i) => i.category === 'top');
    const bottoms = wardrobe.filter((i) => i.category === 'bottom');
    const underwears = wardrobe.filter((i) => i.category === 'underwear');

    const t = tops[Math.floor(Math.random() * tops.length)]?.name || 'Kaos';
    const b = bottoms[Math.floor(Math.random() * bottoms.length)]?.name || 'Celana';
    const u = underwears[Math.floor(Math.random() * underwears.length)]?.name || 'Daleman';
    outfitDesc = `${t}, ${b}, ${u}`;
  }

  const moodList = MOOD_ACTIVITIES[selectedMood] || MOOD_ACTIVITIES.santai;
  const activity = moodList[Math.floor(Math.random() * moodList.length)];

  // Timer Anti-Curang: Timestamp target dihitung dari waktu sekarang + durasi
  const targetTimestamp = Date.now() + durationMinutes * 60 * 1000;

  const quest = {
    clothesText: outfitDesc,
    durationMinutes,
    targetTimestamp,
    mood: selectedMood,
    activity
  };

  const gData = loadSecure(STORAGE_KEYS.gamification, DEFAULT_GAMIFICATION);
  gData.activeQuest = quest;
  saveSecure(STORAGE_KEYS.gamification, gData);

  vibrate(30);
  restoreActiveQuestUI(quest);
  showToast('⚔️ Tantangan dimulai! Waktu berjalan!');
}

/**
 * Tampilkan UI Quest yang sedang berlangsung beserta Anti-Cheat Timer
 */
function restoreActiveQuestUI(quest) {
  document.getElementById('dare-setup-card').style.display = 'none';
  const activeCard = document.getElementById('dare-active-card');
  activeCard.style.display = 'block';

  const descEl = document.getElementById('quest-description');
  descEl.textContent = `Tantangan: Pakai [${quest.clothesText}] selama ${quest.durationMinutes} menit sambil [${quest.activity}].`;

  const targetDate = new Date(quest.targetTimestamp);
  const targetTimeStr = targetDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('timer-target-label').textContent = `Target selesai: ${targetTimeStr}`;

  // Nyalakan countdown timer
  clearInterval(dareTimerInterval);
  updateDareTimerClock();
  dareTimerInterval = setInterval(updateDareTimerClock, 1000);
}

function showDareSetupUI() {
  clearInterval(dareTimerInterval);
  document.getElementById('dare-active-card').style.display = 'none';
  document.getElementById('dare-setup-card').style.display = 'block';
}

/**
 * Ticker Timer Anti-Curang:
 * Berpatokan langsung pada targetTimestamp sehingga timer tetap akurat
 * meski browser di-refresh, ditutup, atau layar terkunci.
 */
function updateDareTimerClock() {
  const gData = loadSecure(STORAGE_KEYS.gamification, DEFAULT_GAMIFICATION);
  if (!gData.activeQuest) {
    clearInterval(dareTimerInterval);
    return;
  }

  const now = Date.now();
  const diffMs = gData.activeQuest.targetTimestamp - now;
  const clockEl = document.getElementById('timer-clock');
  const claimBtn = document.getElementById('btn-claim-reward');
  const surrenderBtn = document.getElementById('btn-surrender-dare');

  if (diffMs <= 0) {
    // Timer selesai: User berhasil!
    clockEl.textContent = '00:00:00';
    clockEl.style.color = '#34d399';
    claimBtn.disabled = false;
    surrenderBtn.disabled = true;
    clearInterval(dareTimerInterval);
    vibrate([30, 20, 30]);
    return;
  }

  // Format Jam : Menit : Detik
  const totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  clockEl.textContent = `${hh}:${mm}:${ss}`;
  clockEl.style.color = 'var(--accent)';
  claimBtn.disabled = true;
  surrenderBtn.disabled = false;
}

/**
 * Reroll Aktivitas: Maksimal 3x Sehari
 */
function rerollDareActivity() {
  const gData = loadSecure(STORAGE_KEYS.gamification, DEFAULT_GAMIFICATION);
  if (!gData.activeQuest) return;

  if (gData.rerollCount <= 0) {
    showToast('⚠️ Batas reroll hari ini (3x) sudah habis!');
    vibrate(10);
    return;
  }

  gData.rerollCount -= 1;
  const moodList = MOOD_ACTIVITIES[gData.activeQuest.mood] || MOOD_ACTIVITIES.santai;
  let newAct = moodList[Math.floor(Math.random() * moodList.length)];

  // Pastikan tidak sama persis dengan yang sebelumnya jika memungkinkan
  if (newAct === gData.activeQuest.activity && moodList.length > 1) {
    newAct = moodList.find((a) => a !== gData.activeQuest.activity) || newAct;
  }

  gData.activeQuest.activity = newAct;
  saveSecure(STORAGE_KEYS.gamification, gData);

  vibrate(15);
  restoreActiveQuestUI(gData.activeQuest);
  updateGamificationProfileUI();
  showToast(`Aktivitas di-reroll! Sisa ${gData.rerollCount}x`);
}

/**
 * Klaim Hadiah Quest Selesai (+50 Poin & Evaluasi Kenaikan Title)
 */
function claimDareReward() {
  const gData = loadSecure(STORAGE_KEYS.gamification, DEFAULT_GAMIFICATION);
  if (!gData.activeQuest) return;

  gData.points += 50;

  // Evaluasi kenaikan title berdasarkan poin baru
  for (let i = USER_TITLES.length - 1; i >= 0; i--) {
    if (gData.points >= USER_TITLES[i].minPts) {
      gData.title = USER_TITLES[i].name;
      break;
    }
  }

  gData.activeQuest = null;
  saveSecure(STORAGE_KEYS.gamification, gData);

  vibrate([40, 30, 50, 30, 60]);
  updateGamificationProfileUI();
  showDareSetupUI();
  showToast('🎉 Selamat! +50 Poin berhasil diklaim & quest tuntas!');
}

/**
 * SISTEM HUKUMAN LAPIS EMPAT (Saat Tombol "Nyerah" Ditekan):
 * 1. Pengurangan Poin (-50) & Title Turun
 * 2. Cooldown 12 Jam (Gacha & Dare di-disable)
 * 3. Savage Popup Modal dengan Ejekan Tajam (Wajib Long Press 3 Detik untuk tutup)
 * 4. Penalti Silang: Otomatis tambahkan 1 tugas baru ke kategori Daily Checklist
 */
function surrenderDareQuest() {
  const gData = loadSecure(STORAGE_KEYS.gamification, DEFAULT_GAMIFICATION);
  if (!gData.activeQuest) return;

  vibrate([60, 50, 70]);

  // 1. Pengurangan Poin & Title
  gData.points = Math.max(0, gData.points - 50);

  // Turunkan title ke level bawah
  let currentIdx = USER_TITLES.findIndex((t) => t.name === gData.title);
  if (currentIdx > 0) currentIdx -= 1;
  else currentIdx = 0;
  gData.title = USER_TITLES[currentIdx].name;

  // 2. Cooldown 12 Jam
  const COOLDOWN_12_HOURS_MS = 12 * 60 * 60 * 1000;
  gData.cooldownUntil = Date.now() + COOLDOWN_12_HOURS_MS;

  // Hapus quest yang gagal
  gData.activeQuest = null;
  saveSecure(STORAGE_KEYS.gamification, gData);

  // 4. Penalti Silang: Tambahkan tugas hukuman ke Checklist Daily
  injectCrossPenaltyToDailyChecklist();

  // Update UI Profile & Mulai Countdown Cooldown
  updateGamificationProfileUI();
  showDareSetupUI();
  checkCooldownTimer();

  // 3. Savage Popup Modal Ejekan Tajam
  openSavageModal();
}

/**
 * Penalti Silang ke Checklist Daily
 */
function injectCrossPenaltyToDailyChecklist() {
  const categories = loadSecure(STORAGE_KEYS.tasks, DEFAULT_TASKS);
  let dailyCat = categories.find((c) => c.isDaily || c.name.toLowerCase() === 'daily');

  if (!dailyCat) {
    dailyCat = { id: 'cat_daily', name: 'Daily', isDaily: true, items: [] };
    categories.unshift(dailyCat);
  }

  const penaltyTasks = [
    "🚨 Hukuman Nyerah: Push-up 20x & minum 1 gelas air",
    "🚨 Hukuman Nyerah: Bersihkan lantai kamar & rapikan cermin",
    "🚨 Hukuman Nyerah: Squat 30x & stretching 10 menit",
    "🚨 Hukuman Nyerah: Tulis refleksi penyesalan di Journal",
    "🚨 Hukuman Nyerah: Bereskan cucian & setrika pakaian"
  ];
  const randTask = penaltyTasks[Math.floor(Math.random() * penaltyTasks.length)];

  dailyCat.items.unshift({
    id: uid(),
    text: randTask,
    checked: false
  });

  saveSecure(STORAGE_KEYS.tasks, categories);
  renderCategories();
}

/**
 * Cek apakah masa Cooldown hukuman 12 jam sedang berlangsung
 */
function isCooldownActive() {
  const gData = loadSecure(STORAGE_KEYS.gamification, DEFAULT_GAMIFICATION);
  return gData.cooldownUntil && gData.cooldownUntil > Date.now();
}

function checkCooldownTimer() {
  clearInterval(cooldownInterval);
  const banner = document.getElementById('cooldown-banner');
  const spinBtn = document.getElementById('btn-spin');
  const startDareBtn = document.getElementById('btn-start-dare');

  const tick = () => {
    const gData = loadSecure(STORAGE_KEYS.gamification, DEFAULT_GAMIFICATION);
    const now = Date.now();

    if (gData.cooldownUntil && gData.cooldownUntil > now) {
      banner.style.display = 'flex';
      if (spinBtn) spinBtn.disabled = true;
      if (startDareBtn) startDareBtn.disabled = true;

      const remainingMs = gData.cooldownUntil - now;
      const totalSec = Math.floor(remainingMs / 1000);
      const hh = String(Math.floor(totalSec / 3600)).padStart(2, '0');
      const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
      const ss = String(totalSec % 60).padStart(2, '0');

      document.getElementById('cooldown-countdown').textContent = `${hh}:${mm}:${ss}`;
    } else {
      banner.style.display = 'none';
      if (spinBtn) spinBtn.disabled = false;
      if (startDareBtn) startDareBtn.disabled = false;
      clearInterval(cooldownInterval);
    }
  };

  tick();
  cooldownInterval = setInterval(tick, 1000);
}

/**
 * Tampilkan Savage Modal saat menyerah
 */
function openSavageModal() {
  const modal = document.getElementById('savage-modal');
  const textEl = document.getElementById('savage-mockery-text');
  const randMockery = SAVAGE_MOCKERIES[Math.floor(Math.random() * SAVAGE_MOCKERIES.length)];

  textEl.textContent = `"${randMockery}"`;
  modal.style.display = 'flex';
}

/**
 * Logika Long Press 3 Detik untuk Menutup Savage Modal:
 * User harus menahan tombol selama 3000ms tanpa melepasnya.
 */
function setupLongPressDismiss() {
  const btn = document.getElementById('btn-longpress-dismiss');
  const bar = document.getElementById('longpress-bar');
  const modal = document.getElementById('savage-modal');
  if (!btn || !bar) return;

  const startPress = (e) => {
    e.preventDefault();
    vibrate(15);
    bar.classList.add('filling');

    clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => {
      // Sukses menahan 3 detik penuh
      vibrate([40, 30, 40]);
      bar.classList.remove('filling');
      modal.style.display = 'none';
      showToast('Kekalahan diakui. Jalani hukumanmu dengan patuh!');
    }, 3000);
  };

  const cancelPress = () => {
    clearTimeout(longPressTimer);
    bar.classList.remove('filling');
  };

  btn.addEventListener('mousedown', startPress);
  btn.addEventListener('touchstart', startPress, { passive: false });

  btn.addEventListener('mouseup', cancelPress);
  btn.addEventListener('mouseleave', cancelPress);
  btn.addEventListener('touchend', cancelPress);
  btn.addEventListener('touchcancel', cancelPress);
}

// ==========================================
// 8. FITUR 5: COMFORT JOURNAL
// ==========================================

function initJournal() {
  const journal = loadSecure(STORAGE_KEYS.journal, null);
  if (!journal || !Array.isArray(journal)) {
    saveSecure(STORAGE_KEYS.journal, DEFAULT_JOURNAL);
  }

  setupStarRating();
  setupJournalForm();
  renderJournal();
}

function setupStarRating() {
  const stars = document.querySelectorAll('#star-rating .star');
  currentRating = 0;

  stars.forEach((star) => {
    star.addEventListener('click', () => {
      currentRating = parseInt(star.dataset.val, 10);
      vibrate(12);
      updateStarDisplay();
    });
  });
}

function updateStarDisplay() {
  const stars = document.querySelectorAll('#star-rating .star');
  stars.forEach((star) => {
    const val = parseInt(star.dataset.val, 10);
    star.classList.toggle('active', val <= currentRating);
  });
}

function setupJournalForm() {
  document.getElementById('btn-save-journal')?.addEventListener('click', () => {
    const nameInput = document.getElementById('journal-name');
    const sizeInput = document.getElementById('journal-size');
    const notesInput = document.getElementById('journal-notes');

    const name = nameInput.value.trim();
    const size = sizeInput.value.trim();
    const notes = notesInput.value.trim();

    if (!name) {
      showToast('Tuliskan nama pakaian terlebih dahulu');
      return;
    }
    if (currentRating === 0) {
      showToast('Pilih rating kenyamanan (1-5 bintang)');
      return;
    }

    const journal = loadSecure(STORAGE_KEYS.journal, DEFAULT_JOURNAL);
    journal.unshift({
      id: uid(),
      name,
      size: size || 'Free Size',
      rating: currentRating,
      notes: notes || '',
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    });

    saveSecure(STORAGE_KEYS.journal, journal);

    nameInput.value = '';
    sizeInput.value = '';
    notesInput.value = '';
    currentRating = 0;
    updateStarDisplay();

    vibrate(16);
    renderJournal();
    showToast('Catatan jurnal tersimpan ✓');
  });
}

function renderJournal() {
  const journal = loadSecure(STORAGE_KEYS.journal, DEFAULT_JOURNAL);
  const container = document.getElementById('journal-cards-container');
  if (!container) return;

  if (journal.length === 0) {
    container.innerHTML = '<div class="empty-state">Belum ada catatan jurnal pakaian.</div>';
    return;
  }

  container.innerHTML = journal.map((entry) => {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      starsHtml += i <= entry.rating
        ? '<span>★</span>'
        : '<span class="empty-star">★</span>';
    }

    return `
      <div class="journal-card" data-id="${entry.id}">
        <div class="journal-card-header">
          <span class="journal-card-title">${escapeHtml(entry.name)}</span>
          <button class="journal-card-del" data-id="${entry.id}" title="Hapus Catatan">✕</button>
        </div>
        <div class="journal-card-meta">
          <span class="meta-chip">Ukuran: <strong>${escapeHtml(entry.size)}</strong></span>
          <span class="journal-stars">${starsHtml}</span>
        </div>
        ${entry.notes ? `<div class="journal-notes-text">${escapeHtml(entry.notes)}</div>` : ''}
        <div class="journal-date">${escapeHtml(entry.date)}</div>
      </div>
    `;
  }).join('');

  container.onclick = (e) => {
    const btn = e.target.closest('.journal-card-del');
    if (btn) deleteJournalEntry(btn.dataset.id);
  };
}

function deleteJournalEntry(id) {
  let journal = loadSecure(STORAGE_KEYS.journal, DEFAULT_JOURNAL);
  journal = journal.filter((j) => j.id !== id);
  saveSecure(STORAGE_KEYS.journal, journal);
  vibrate(10);
  renderJournal();
  showToast('Catatan jurnal dihapus');
}

// ==========================================
// 9. BOTTOM NAVIGATION TAB
// ==========================================

function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      switchTab(tabName);
      vibrate(10);

      navBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function switchTab(tabName) {
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach((tab) => tab.classList.remove('active'));

  const target = document.getElementById(`tab-${tabName}`);
  if (target) target.classList.add('active');

  const progressWrap = document.getElementById('progress-wrap');
  if (progressWrap) {
    progressWrap.style.display = tabName === 'tasks' ? 'block' : 'none';
  }
}

// ==========================================
// 10. INISIALISASI UTAMA & ENTRY POINT
// ==========================================

function initApp() {
  setupPanicButton();
  setupNavigation();
  initTasks();
  initWardrobe();
  initDareMode();
  initJournal();
}

document.addEventListener('DOMContentLoaded', () => {
  // Mulai pada layar Lock (Stealth Mode)
  initPin();

  // Daftarkan Service Worker PWA Cache
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('SW Registered Scope:', reg.scope))
      .catch((err) => console.warn('SW Register Error:', err));
  }
});
