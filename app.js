// =============================================================================
// Personal Vault — app.js
// Aplikasi Utilitas & Inventaris Pribadi (100% Client-Side dengan Dynamic Theming)
// =============================================================================

// ==========================================
// 1. KONFIGURASI, STORAGE KEYS, & DATA DEFAULT
// ==========================================

const DEFAULT_PIN = '1805';

const STORAGE_KEYS = {
  settings: 'vault_settings',   // PIN terenkripsi Base64
  tasks: 'vault_tasks',         // Multi-Category checklist (Nested JSON)
  lastDate: 'vault_last_date',   // Tanggal terakhir app dibuka untuk Auto-Reset
  wardrobe: 'vault_wardrobe',   // Database pakaian ber-tag gender & kategori
  journal: 'vault_journal'      // Catatan kenyamanan, ukuran, & brand
};

// Data Dummy Default untuk Multi-Category Checklist
const DEFAULT_CATEGORIES = [
  {
    id: 'cat_daily',
    name: 'Daily Routine',
    isDaily: true, // Kategori ini akan auto-reset setiap lewat jam 00:00
    items: [
      { id: 'd1', text: 'Merapikan tempat tidur & ventilasi kamar', checked: false },
      { id: 'd2', text: 'Minum 2 liter air putih & vitamin', checked: false },
      { id: 'd3', text: 'Skincare pagi & sunscreen sebelum keluar', checked: false },
      { id: 'd4', text: 'Olahraga ringan / stretching 20 menit', checked: false },
      { id: 'd5', text: 'Catat journal & evaluasi outfit', checked: false }
    ]
  },
  {
    id: 'cat_belanja',
    name: 'Belanja Bulanan',
    isDaily: false,
    items: [
      { id: 'b1', text: 'Sampo & Conditioner wangi lembut', checked: false },
      { id: 'b2', text: 'Sabun mandi cair pelembab', checked: false },
      { id: 'b3', text: 'Pembalut bersayap (Night & Day pack)', checked: false },
      { id: 'b4', text: 'Micellar water & kapas wajah', checked: false },
      { id: 'b5', text: 'Lotion pelembab kulit', checked: false }
    ]
  },
  {
    id: 'cat_weekend',
    name: 'Tugas Weekend',
    isDaily: false,
    items: [
      { id: 'w1', text: 'Cuci pakaian rahasia dengan deterjen lembut & jemur', checked: false },
      { id: 'w2', text: 'Ganti seprai & sarung bantal', checked: false },
      { id: 'w3', text: 'Servis motor & ganti oli rutin', checked: false },
      { id: 'w4', text: 'Bereskan lemari pakaian rahasia', checked: false }
    ]
  }
];

// Data Dummy Default Lemari Pakaian (Cowok & Cewek)
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

// Kata-Kata Godaan (Teasing System) saat hasil spin menyentuh pakaian cewek/pembalut
const TEASING_PHRASES = [
  "Ciee dandan cantik hari ini hihihi~",
  "Jangan lupa pembalutnya dipakai yang rapi ya manis~",
  "Pasti gemes banget nih pakai daleman itu!",
  "Awas ya kalau senyum-senyum sendiri di depan cermin~",
  "Ssst... rahasia kecil kita ya! Penampilan hari ini anggun banget~",
  "Rasa pas dan nyaman banget kan? Nikmati harimu cantik!",
  "Coba dicek lagi di cermin, udah manis banget belum?",
  "Dalemannya lucu banget, bikin betah seharian deh~",
  "Jangan lupa jalan dengan anggun ya hari ini hihihi~"
];

// Data Default Jurnal Kenyamanan & Ukuran
const DEFAULT_JOURNAL = [
  {
    id: 'j1',
    name: 'Pashmina Silk Nude',
    brand: 'Buttonscarves Style',
    size: '180 x 75 cm',
    rating: 5,
    notes: 'Bahannya jatuh banget, super lembut di pipi dan bikin wajah kelihatan tirus. Wangi softener tahan seharian.',
    date: '10 Nov 2026'
  },
  {
    id: 'j2',
    name: 'Seamless Panties Nude',
    brand: 'Sorex',
    size: 'L',
    rating: 5,
    notes: 'Gak nyeplak sama sekali waktu pakai rok plisket atau celana ketat. Karet pinggang sangat elastis dan adem.',
    date: '08 Nov 2026'
  }
];

// ==========================================
// 2. GLOBAL STATE
// ==========================================

let pinInput = '';
let currentRating = 0;
let isSpinning = false;
let currentGenderFilter = 'all';

// ==========================================
// 3. FUNGSI UTILITAS UMUM
// ==========================================

function encode(str) {
  try { return btoa(unescape(encodeURIComponent(str))); }
  catch { return btoa(str); }
}

function decode(str) {
  try { return decodeURIComponent(escape(atob(str))); }
  catch { try { return atob(str); } catch { return ''; } }
}

function getStorage(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Gagal menyimpan ke localStorage:', e);
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

function vibrate(ms = 15) {
  if (navigator.vibrate) navigator.vibrate(ms);
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
// 4. SISTEM PIN LOCK, THEME TRANSITION & PANIC
// ==========================================

/**
 * Inisialisasi Layar PIN (Stealth Mode):
 * Pastikan tema awal adalah Netral/Maskulin (tanpa class .feminine-theme di body).
 */
function initPin() {
  document.body.classList.remove('feminine-theme');

  const settings = getStorage(STORAGE_KEYS.settings, null);
  if (!settings || !settings.pin) {
    setStorage(STORAGE_KEYS.settings, { pin: encode(DEFAULT_PIN) });
  }

  setupNumpad();
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
 * Jika benar:
 * 1. Tambahkan class .feminine-theme ke <body> (Transisi warna ke pink pastel, lilac, & rose gold).
 * 2. Buka layar utama #main-app.
 */
function verifyPin() {
  const settings = getStorage(STORAGE_KEYS.settings, { pin: encode(DEFAULT_PIN) });
  const savedPin = decode(settings.pin);

  if (pinInput === savedPin) {
    vibrate(35);

    // Dynamic Theming: Aktifkan tema feminim/elegan
    document.body.classList.add('feminine-theme');

    document.getElementById('pin-screen').style.display = 'none';
    document.getElementById('camo-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';

    initApp();
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
 * Panic Button / Kamuflase:
 * Double-click atau Double-tap pada Header langsung mengembalikan tema ke netral
 * dan menampilkan halaman dummy "Coding Tasks".
 */
function setupPanicButton() {
  const header = document.getElementById('app-header');
  const panicBtn = document.getElementById('panic-indicator');
  if (!header) return;

  const triggerPanic = () => {
    vibrate(30);
    // Kembalikan tema ke netral/stealth
    document.body.classList.remove('feminine-theme');

    document.getElementById('main-app').style.display = 'none';
    document.getElementById('pin-screen').style.display = 'none';
    document.getElementById('camo-screen').style.display = 'block';
  };

  header.addEventListener('dblclick', triggerPanic);
  panicBtn?.addEventListener('click', triggerPanic);

  // Fallback mobile double-tap
  let lastTap = 0;
  header.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 350) {
      e.preventDefault();
      triggerPanic();
    }
    lastTap = now;
  });
}

// ==========================================
// 5. FITUR: MULTI-CATEGORY CHECKLIST & AUTO-RESET
// ==========================================

/**
 * Inisialisasi checklist multi-kategori:
 * 1. Muat data dari localStorage atau pasang data default
 * 2. Periksa logika Auto-Reset tanggal untuk kategori isDaily: true
 * 3. Render kartu kategori & item
 */
function initTasks() {
  let categories = getStorage(STORAGE_KEYS.tasks, null);
  if (!categories || !Array.isArray(categories)) {
    categories = DEFAULT_CATEGORIES;
    setStorage(STORAGE_KEYS.tasks, categories);
  }

  // Cek pergantian hari & jalankan auto-reset kategori Daily
  checkAutoReset(categories);

  renderCategories();
  setupCategoryForm();
}

/**
 * LOGIKA AUTO-RESET HARIAN (PENTING):
 *
 * Cara Kerja:
 * 1. Ambil tanggal hari ini (YYYY-MM-DD) dan bandingkan dengan 'vault_last_date'.
 * 2. Jika tanggalnya berbeda (sudah lewat pukul 00:00 tengah malam):
 *    - Telusuri seluruh kategori di dalam array.
 *    - Khusus untuk kategori yang memiliki properti `isDaily: true`, reset semua itemnya (checked = false).
 *    - Kategori reguler (isDaily: false / undefined) tetap dipertahankan status centangnya.
 * 3. Simpan kembali data yang telah di-reset dan perbarui 'vault_last_date' ke tanggal hari ini.
 */
function checkAutoReset(categories) {
  const today = todayString();
  const lastDate = getStorage(STORAGE_KEYS.lastDate, null);

  if (lastDate !== today) {
    let hasReset = false;

    categories.forEach((cat) => {
      if (cat.isDaily && Array.isArray(cat.items)) {
        cat.items.forEach((item) => {
          if (item.checked) {
            item.checked = false;
            hasReset = true;
          }
        });
      }
    });

    setStorage(STORAGE_KEYS.tasks, categories);
    setStorage(STORAGE_KEYS.lastDate, today);

    if (lastDate !== null && hasReset) {
      setTimeout(() => {
        showToast('✨ Checklist kategori Daily otomatis di-reset untuk hari baru!');
      }, 500);
    }
  }
}

/**
 * Render seluruh kategori beserta sub-item tugasnya
 */
function renderCategories() {
  const categories = getStorage(STORAGE_KEYS.tasks, DEFAULT_CATEGORIES);
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

    const itemsHtml = totalItems === 0
      ? '<div class="empty-state">Belum ada item di kategori ini</div>'
      : cat.items.map((item) => `
          <div class="item-row ${item.checked ? 'checked' : ''}" data-cat-id="${cat.id}" data-item-id="${item.id}">
            <div class="item-checkbox"></div>
            <span class="item-text">${escapeHtml(item.text)}</span>
            <button class="item-del-btn" data-cat-id="${cat.id}" data-item-id="${item.id}" title="Hapus Item">✕</button>
          </div>
        `).join('');

    return `
      <div class="category-card" data-cat-id="${cat.id}">
        <div class="category-header">
          <div class="category-title-group">
            <span class="category-title">${escapeHtml(cat.name)}</span>
            ${cat.isDaily ? '<span class="daily-badge">DAILY</span>' : ''}
            <span class="category-count">(${doneItems}/${totalItems})</span>
          </div>
          <button class="btn-del-cat" data-cat-id="${cat.id}" title="Hapus Kategori">🗑️</button>
        </div>

        <div class="category-items">
          ${itemsHtml}
        </div>

        <div class="category-add-row">
          <input type="text" class="input-field input-add-subitem" data-cat-id="${cat.id}" placeholder="+ Tambah item ke ${escapeHtml(cat.name)}..." maxlength="80">
          <button class="btn-add-item" data-cat-id="${cat.id}">+</button>
        </div>
      </div>
    `;
  }).join('');

  updateProgress();
  setupCategoryEventListeners();
}

/**
 * Event listener delegasi untuk toggle checkbox, hapus item, dan tambah item di kategori
 */
function setupCategoryEventListeners() {
  const container = document.getElementById('category-list-container');
  if (!container) return;

  container.onclick = (e) => {
    // 1. Hapus Kategori
    const delCatBtn = e.target.closest('.btn-del-cat');
    if (delCatBtn) {
      e.stopPropagation();
      deleteCategory(delCatBtn.dataset.catId);
      return;
    }

    // 2. Hapus Sub-Item
    const delItemBtn = e.target.closest('.item-del-btn');
    if (delItemBtn) {
      e.stopPropagation();
      deleteSubItem(delItemBtn.dataset.catId, delItemBtn.dataset.itemId);
      return;
    }

    // 3. Tombol Tambah Item (+)
    const addItemBtn = e.target.closest('.btn-add-item');
    if (addItemBtn) {
      const catId = addItemBtn.dataset.catId;
      const input = container.querySelector(`.input-add-subitem[data-cat-id="${catId}"]`);
      if (input) submitNewSubItem(catId, input);
      return;
    }

    // 4. Toggle Checkbox Sub-Item
    const row = e.target.closest('.item-row');
    if (row) {
      toggleSubItem(row.dataset.catId, row.dataset.itemId);
    }
  };

  // Enter key pada input sub-item
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
    showToast('Tuliskan nama item terlebih dahulu');
    return;
  }

  const categories = getStorage(STORAGE_KEYS.tasks, DEFAULT_CATEGORIES);
  const cat = categories.find((c) => c.id === catId);
  if (!cat) return;

  if (!Array.isArray(cat.items)) cat.items = [];
  cat.items.push({ id: uid(), text, checked: false });
  setStorage(STORAGE_KEYS.tasks, categories);

  inputEl.value = '';
  vibrate(12);
  renderCategories();
  showToast('Item ditambahkan ✓');
}

function toggleSubItem(catId, itemId) {
  const categories = getStorage(STORAGE_KEYS.tasks, DEFAULT_CATEGORIES);
  const cat = categories.find((c) => c.id === catId);
  if (!cat || !cat.items) return;

  const item = cat.items.find((i) => i.id === itemId);
  if (item) {
    item.checked = !item.checked;
    vibrate(item.checked ? 18 : 10);
    setStorage(STORAGE_KEYS.tasks, categories);
    renderCategories();
  }
}

function deleteSubItem(catId, itemId) {
  const categories = getStorage(STORAGE_KEYS.tasks, DEFAULT_CATEGORIES);
  const cat = categories.find((c) => c.id === catId);
  if (!cat || !cat.items) return;

  cat.items = cat.items.filter((i) => i.id !== itemId);
  setStorage(STORAGE_KEYS.tasks, categories);
  vibrate(10);
  renderCategories();
  showToast('Item dihapus');
}

function deleteCategory(catId) {
  let categories = getStorage(STORAGE_KEYS.tasks, DEFAULT_CATEGORIES);
  categories = categories.filter((c) => c.id !== catId);
  setStorage(STORAGE_KEYS.tasks, categories);
  vibrate(15);
  renderCategories();
  showToast('Kategori dihapus');
}

/**
 * Setup formulir pembuatan kategori baru
 */
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

    const categories = getStorage(STORAGE_KEYS.tasks, DEFAULT_CATEGORIES);
    categories.push({
      id: uid(),
      name,
      isDaily: dailyCheckbox.checked,
      items: []
    });

    setStorage(STORAGE_KEYS.tasks, categories);

    nameInput.value = '';
    dailyCheckbox.checked = false;
    box.classList.remove('show');

    vibrate(15);
    renderCategories();
    showToast('Kategori baru tersimpan ✓');
  });
}

/**
 * Menghitung persentase progres global dari seluruh kategori yang ada
 */
function updateProgress() {
  const categories = getStorage(STORAGE_KEYS.tasks, DEFAULT_CATEGORIES);
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
// 6. FITUR: WARDROBE GACHA, RNG PEMBALUT & TEASING
// ==========================================

/**
 * Inisialisasi lemari pakaian dan generator outfit
 */
function initWardrobe() {
  let wardrobe = getStorage(STORAGE_KEYS.wardrobe, null);
  if (!wardrobe || !Array.isArray(wardrobe)) {
    wardrobe = DEFAULT_WARDROBE;
    setStorage(STORAGE_KEYS.wardrobe, wardrobe);
  }

  renderWardrobeInventory();
  setupWardrobeAddForm();
  setupGachaModeSelector();
  setupGachaSpin();
}

/**
 * Setup Toggle / Radio Filter Mode Gacha
 */
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
        hintBanner.textContent = 'Mode Cowok: Hanya mengacak pakaian ber-tag Cowok (Top, Bottom, Underwear). Kerudung & pembalut dinonaktifkan.';
        pembalutBox.style.display = 'none';
        teasingBox.style.display = 'none';
        document.getElementById('slot-val-kerudung').textContent = '— (Off)';
      } else {
        hintBanner.textContent = 'Mode Mix/Feminim: Mengacak kombinasi pakaian cowok & cewek / full cewek, termasuk Kerudung & 50:50 RNG Pembalut!';
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

/**
 * FUNGSI FILTER ARRAY PAKAIAN (Pemisahan Cowok / Cewek / Kategori):
 *
 * Logika Filter:
 * - getFilteredPool(category, mode):
 *   - Jika mode === 'cowok':
 *       Hanya mengambil item dengan category terkait DAN gender === 'Cowok'.
 *   - Jika mode === 'mix':
 *       Mengambil semua pakaian di category tersebut (Cowok maupun Cewek),
 *       sehingga bisa menghasilkan kombinasi seperti atasan cowok + daleman cewek, dsb.
 */
function getFilteredPool(category, mode) {
  const wardrobe = getStorage(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE);

  if (mode === 'cowok') {
    return wardrobe.filter((item) => item.category === category && item.gender === 'Cowok');
  }

  // Mode Mix / Feminim
  return wardrobe.filter((item) => item.category === category);
}

/**
 * LOGIKA GACHA SPIN, ANIMASI ROLLING, PEMBALUT RNG & TEASING:
 *
 * Alur Kerja:
 * 1. Validasi: Pastikan pool pakaian memiliki item sesuai mode yang dipilih.
 * 2. Slot Machine Rolling: Animasi cepat per 80ms berganti teks.
 * 3. Staggered Stopping:
 *    - Top berhenti di 700ms
 *    - Bottom berhenti di 1300ms
 *    - Underwear berhenti di 1900ms
 *    - Kerudung berhenti di 2400ms (Hanya di mode mix/feminim)
 * 4. RNG Pembalut:
 *    - Di mode Mix/Feminim: Math.random() < 0.5 memutuskan "HARUS PAKAI" atau "TIDAK PERLU".
 * 5. Teasing System (Kata-kata godaan):
 *    - Jika ada item Cewek terpilih ATAU Kerudung dipakai ATAU Pembalut berstatus "HARUS PAKAI",
 *      tampilkan bubble pesan godaan secara acak!
 */
function setupGachaSpin() {
  document.getElementById('btn-spin')?.addEventListener('click', spinGacha);
}

function spinGacha() {
  if (isSpinning) return;

  const mode = getSelectedGachaMode();
  const topPool = getFilteredPool('top', mode);
  const bottomPool = getFilteredPool('bottom', mode);
  const underwearPool = getFilteredPool('underwear', mode);
  const kerudungPool = getFilteredPool('kerudung', mode);

  // Validasi pool kosong
  if (topPool.length === 0) {
    showToast(`Pakaian Top untuk mode ${mode} belum ada!`);
    return;
  }
  if (bottomPool.length === 0) {
    showToast(`Pakaian Bottom untuk mode ${mode} belum ada!`);
    return;
  }
  if (underwearPool.length === 0) {
    showToast(`Pakaian Underwear untuk mode ${mode} belum ada!`);
    return;
  }

  isSpinning = true;
  vibrate(30);

  const spinBtn = document.getElementById('btn-spin');
  spinBtn.disabled = true;
  spinBtn.classList.add('spinning-btn');

  // Sembunyikan teasing box saat spin baru dimulai
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

  const stopTimes = {
    top: 700,
    bottom: 1300,
    underwear: 1900,
    kerudung: 2400
  };

  const results = {};
  const intervals = {};

  slots.forEach((slotKey) => {
    const slotEl = document.getElementById(`slot-${slotKey}`);
    const valEl = document.getElementById(`slot-val-${slotKey}`);

    let pool = [];
    if (slotKey === 'top') pool = topPool;
    else if (slotKey === 'bottom') pool = bottomPool;
    else if (slotKey === 'underwear') pool = underwearPool;
    else if (slotKey === 'kerudung') pool = kerudungPool;

    slotEl.classList.remove('result');
    slotEl.classList.add('spinning');
    valEl.classList.add('cycling');

    // Rolling animation
    intervals[slotKey] = setInterval(() => {
      if (pool.length > 0) {
        const rand = pool[Math.floor(Math.random() * pool.length)];
        valEl.textContent = rand.name;
      }
    }, 80);

    // Kunci hasil
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

      // Cek apakah slot ini adalah yang paling terakhir berhenti
      const isLastSlot = (mode === 'mix' && slotKey === 'kerudung') || (mode === 'cowok' && slotKey === 'underwear');

      if (isLastSlot) {
        finalizeSpin(mode, results, spinBtn);
      }
    }, stopTimes[slotKey]);
  });
}

/**
 * Penyelesaian Spin: Hitung RNG Pembalut & Evaluasi Teasing System
 */
function finalizeSpin(mode, results, spinBtn) {
  isSpinning = false;
  spinBtn.disabled = false;
  spinBtn.classList.remove('spinning-btn');

  let harusPakaiPembalut = false;

  // RNG Pembalut (Hanya di mode mix/feminim)
  if (mode === 'mix') {
    const pembalutStatus = document.getElementById('pembalut-status');
    const rng = Math.random() < 0.5; // Peluang 50:50

    if (rng) {
      harusPakaiPembalut = true;
      pembalutStatus.textContent = 'HARUS PAKAI 🩸';
      pembalutStatus.className = 'pembalut-status wajib';
    } else {
      pembalutStatus.textContent = 'TIDAK PERLU ✨';
      pembalutStatus.className = 'pembalut-status aman';
    }
  }

  // Evaluasi Teasing System:
  // Cek apakah ada item Cewek yang terpilih, atau Kerudung, atau wajib Pembalut
  let triggerTeasing = false;

  if (results.top && results.top.gender === 'Cewek') triggerTeasing = true;
  if (results.bottom && results.bottom.gender === 'Cewek') triggerTeasing = true;
  if (results.underwear && results.underwear.gender === 'Cewek') triggerTeasing = true;
  if (results.kerudung && results.kerudung.gender === 'Cewek') triggerTeasing = true;
  if (harusPakaiPembalut) triggerTeasing = true;

  if (triggerTeasing) {
    const teasingBox = document.getElementById('teasing-box');
    const teasingMessage = document.getElementById('teasing-message');
    const randomTease = TEASING_PHRASES[Math.floor(Math.random() * TEASING_PHRASES.length)];

    teasingMessage.textContent = randomTease;
    teasingBox.style.display = 'block';
    vibrate([20, 20, 30]);
    showToast('Outfit & pesan rahasia siap! 🌸');
  } else {
    showToast('Outfit cowok hari ini siap! 🕶️');
  }
}

/**
 * Formulir Tambah Pakaian Baru ke Lemari
 */
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

    const wardrobe = getStorage(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE);
    wardrobe.push({
      id: uid(),
      name,
      category,
      gender
    });

    setStorage(STORAGE_KEYS.wardrobe, wardrobe);
    nameInput.value = '';
    vibrate(15);
    renderWardrobeInventory();
    showToast('Pakaian disimpan ke lemari ✓');
  });

  // Filter gender pada koleksi lemari
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

/**
 * Render daftar inventaris lemari pakaian
 */
function renderWardrobeInventory() {
  const wardrobe = getStorage(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE);
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
      html += '<div class="empty-state">Tidak ada item di kategori ini</div>';
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

  // Event listener hapus item pakaian
  container.onclick = (e) => {
    const btn = e.target.closest('.wardrobe-del-btn');
    if (btn) {
      deleteWardrobeItem(btn.dataset.id);
    }
  };
}

function deleteWardrobeItem(id) {
  let wardrobe = getStorage(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE);
  wardrobe = wardrobe.filter((i) => i.id !== id);
  setStorage(STORAGE_KEYS.wardrobe, wardrobe);
  vibrate(10);
  renderWardrobeInventory();
  showToast('Item pakaian dihapus');
}

// ==========================================
// 7. FITUR: COMFORT & SIZE JOURNAL
// ==========================================

function initJournal() {
  const journal = getStorage(STORAGE_KEYS.journal, null);
  if (!journal || !Array.isArray(journal)) {
    setStorage(STORAGE_KEYS.journal, DEFAULT_JOURNAL);
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
    const brandInput = document.getElementById('journal-brand');
    const sizeInput = document.getElementById('journal-size');
    const notesInput = document.getElementById('journal-notes');

    const name = nameInput.value.trim();
    const brand = brandInput.value.trim();
    const size = sizeInput.value.trim();
    const notes = notesInput.value.trim();

    if (!name) {
      showToast('Ketikkan nama pakaian');
      return;
    }
    if (currentRating === 0) {
      showToast('Pilih rating kenyamanan (1-5 bintang)');
      return;
    }

    const journal = getStorage(STORAGE_KEYS.journal, DEFAULT_JOURNAL);
    journal.unshift({
      id: uid(),
      name,
      brand: brand || 'No Brand',
      size: size || 'Free Size',
      rating: currentRating,
      notes: notes || '',
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    });

    setStorage(STORAGE_KEYS.journal, journal);

    // Reset Form
    nameInput.value = '';
    brandInput.value = '';
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
  const journal = getStorage(STORAGE_KEYS.journal, DEFAULT_JOURNAL);
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
          <span class="meta-chip">Merk: <strong>${escapeHtml(entry.brand)}</strong></span>
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
  let journal = getStorage(STORAGE_KEYS.journal, DEFAULT_JOURNAL);
  journal = journal.filter((j) => j.id !== id);
  setStorage(STORAGE_KEYS.journal, journal);
  vibrate(10);
  renderJournal();
  showToast('Catatan jurnal dihapus');
}

// ==========================================
// 8. NAVIGASI TAB BOTTOM
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
// 9. INISIALISASI UTAMA & ENTRY POINT
// ==========================================

function initApp() {
  setupPanicButton();
  setupNavigation();
  initTasks();
  initWardrobe();
  initJournal();
}

document.addEventListener('DOMContentLoaded', () => {
  // Buka dalam mode Stealth PIN
  initPin();

  // Daftarkan Service Worker PWA Offline
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('SW Registered Scope:', reg.scope))
      .catch((err) => console.warn('SW Register Error:', err));
  }
});
