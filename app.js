// ==========================================
// Personal Vault — app.js
// Aplikasi manajemen tugas & inventaris pakaian
// 100% client-side, tanpa backend
// ==========================================

// === KONSTANTA & KONFIGURASI ===
const DEFAULT_PIN = '1805';
const STORAGE_KEYS = {
  settings: 'vault_settings',
  tasks: 'vault_tasks',
  lastDate: 'vault_last_date',
  wardrobe: 'vault_wardrobe',
  journal: 'vault_journal'
};

// Data default agar aplikasi tidak crash saat pertama kali dibuka
const DEFAULT_TASKS = {
  daily: [
    { id: 'd1', text: 'Merapikan tempat tidur', checked: false },
    { id: 'd2', text: 'Olahraga 30 menit', checked: false },
    { id: 'd3', text: 'Minum 8 gelas air', checked: false },
    { id: 'd4', text: 'Baca buku 20 menit', checked: false },
    { id: 'd5', text: 'Journaling / refleksi', checked: false }
  ],
  weekend: [
    { id: 'w1', text: 'Cuci baju', checked: false },
    { id: 'w2', text: 'Bersih-bersih kamar', checked: false },
    { id: 'w3', text: 'Grocery shopping', checked: false },
    { id: 'w4', text: 'Meal prep untuk minggu depan', checked: false }
  ]
};

const DEFAULT_WARDROBE = {
  underwear: ['Boxer Hitam', 'Brief Abu-abu'],
  tops: ['Kaos Polos Hitam', 'Kemeja Biru Navy'],
  bottoms: ['Jeans Gelap', 'Celana Pendek Khaki']
};

// === STATE ===
let pinInput = '';
let currentRating = 0;
let isSpinning = false;

// ==========================================
// UTILITAS
// ==========================================

/** Enkripsi sederhana Base64 */
function encode(str) {
  try { return btoa(unescape(encodeURIComponent(str))); }
  catch { return btoa(str); }
}

/** Dekripsi Base64 */
function decode(str) {
  try { return decodeURIComponent(escape(atob(str))); }
  catch { try { return atob(str); } catch { return ''; } }
}

/** Ambil data dari localStorage, return defaultVal jika kosong/error */
function getStorage(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

/** Simpan data ke localStorage */
function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write gagal:', e);
  }
}

/** Generate ID unik sederhana */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

/** Tampilkan toast notification */
function showToast(message, duration = 2000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), duration);
}

/** Getarkan device jika didukung */
function vibrate(ms = 15) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

/** Format tanggal ke string YYYY-MM-DD */
function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ==========================================
// SISTEM PIN LOCK
// ==========================================

/**
 * Inisialisasi PIN:
 * - Jika belum pernah set, simpan PIN default (ter-encode Base64)
 * - Setup event listener untuk numpad
 */
function initPin() {
  const settings = getStorage(STORAGE_KEYS.settings, null);
  if (!settings || !settings.pin) {
    // Pertama kali: simpan PIN default yang di-encode
    setStorage(STORAGE_KEYS.settings, { pin: encode(DEFAULT_PIN) });
  }
  setupNumpad();
}

/** Pasang event listener ke tombol numpad */
function setupNumpad() {
  const numpad = document.querySelector('.numpad');
  if (!numpad) return;

  numpad.addEventListener('click', (e) => {
    const btn = e.target.closest('.num-btn');
    if (!btn) return;
    vibrate();

    const num = btn.dataset.num;
    const action = btn.dataset.action;

    if (action === 'clear') {
      pinInput = '';
      updatePinDots();
      clearPinError();
    } else if (action === 'back') {
      pinInput = pinInput.slice(0, -1);
      updatePinDots();
    } else if (num !== undefined) {
      if (pinInput.length < 4) {
        pinInput += num;
        updatePinDots();
        // Otomatis verifikasi saat 4 digit sudah dimasukkan
        if (pinInput.length === 4) {
          setTimeout(() => verifyPin(), 200);
        }
      }
    }
  });
}

/** Update tampilan dot indikator PIN */
function updatePinDots() {
  const dots = document.querySelectorAll('#pin-dots .dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < pinInput.length);
  });
}

/** Verifikasi PIN yang dimasukkan */
function verifyPin() {
  const settings = getStorage(STORAGE_KEYS.settings, { pin: encode(DEFAULT_PIN) });
  const savedPin = decode(settings.pin);

  if (pinInput === savedPin) {
    // PIN benar — buka aplikasi utama
    vibrate(30);
    document.getElementById('pin-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';
    initApp();
  } else {
    // PIN salah — animasi shake & reset
    vibrate([50, 30, 50]);
    const dotsContainer = document.getElementById('pin-dots');
    dotsContainer.classList.add('shake');
    showPinError('PIN salah');
    setTimeout(() => {
      dotsContainer.classList.remove('shake');
      pinInput = '';
      updatePinDots();
    }, 600);
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

// ==========================================
// KAMUFLASE / PANIC BUTTON
// ==========================================

/**
 * Setup Panic Button:
 * Event listener double-click/double-tap pada header.
 * Saat di-trigger, semua UI utama disembunyikan dan
 * diganti halaman dummy "Coding Tasks".
 */
function setupPanicButton() {
  const header = document.getElementById('app-header');
  if (!header) return;

  header.addEventListener('dblclick', activateCamouflage);

  // Fallback: double-tap untuk mobile (karena dblclick bisa tidak responsif di iOS)
  let lastTap = 0;
  header.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 350) {
      e.preventDefault();
      activateCamouflage();
    }
    lastTap = now;
  });
}

/** Aktifkan mode kamuflase — sembunyikan semua, tampilkan halaman palsu */
function activateCamouflage() {
  vibrate(20);
  document.getElementById('main-app').style.display = 'none';
  document.getElementById('camo-screen').style.display = 'block';
}

// ==========================================
// TASK MANAGEMENT
// ==========================================

/**
 * Inisialisasi Tasks:
 * 1. Muat data tugas dari localStorage (atau gunakan default)
 * 2. Cek apakah perlu auto-reset (hari sudah berganti)
 * 3. Render semua tugas ke DOM
 */
function initTasks() {
  let tasks = getStorage(STORAGE_KEYS.tasks, null);

  // Jika belum ada data, gunakan default
  if (!tasks) {
    tasks = DEFAULT_TASKS;
    setStorage(STORAGE_KEYS.tasks, tasks);
  }

  // Pastikan kedua kategori ada
  if (!tasks.daily) tasks.daily = [];
  if (!tasks.weekend) tasks.weekend = [];

  // Jalankan auto-reset check
  checkAutoReset(tasks);

  // Render tasks & setup event
  renderTasks();
  setupTaskAddButtons();
}

/**
 * LOGIKA AUTO-RESET HARIAN (Fitur Penting):
 *
 * Cara kerja:
 * - Setiap kali app dibuka, bandingkan tanggal hari ini dengan
 *   tanggal terakhir yang tersimpan di localStorage (key: vault_last_date).
 * - Jika tanggal berbeda (artinya sudah lewat jam 00:00 / hari berganti),
 *   maka semua tugas kategori "Daily" di-reset (checked = false).
 * - Tugas "Weekend" TIDAK ikut di-reset (hanya reset manual oleh user).
 * - Setelah reset, simpan tanggal hari ini sebagai tanggal terakhir.
 */
function checkAutoReset(tasks) {
  const today = todayString();
  const lastDate = getStorage(STORAGE_KEYS.lastDate, null);

  if (lastDate !== today) {
    // Hari sudah berganti — reset semua tugas Daily
    if (tasks.daily && tasks.daily.length > 0) {
      tasks.daily.forEach((task) => {
        task.checked = false;
      });
    }

    // Simpan data tugas yang sudah di-reset
    setStorage(STORAGE_KEYS.tasks, tasks);
    // Simpan tanggal hari ini sebagai checkpoint
    setStorage(STORAGE_KEYS.lastDate, today);

    // Tampilkan notifikasi jika ini bukan pertama kali (lastDate pernah ada)
    if (lastDate !== null) {
      setTimeout(() => showToast('✨ Daily tasks telah di-reset!'), 500);
    }
  }
}

/** Render seluruh daftar tugas ke dalam DOM */
function renderTasks() {
  const tasks = getStorage(STORAGE_KEYS.tasks, DEFAULT_TASKS);

  renderTaskList('daily-tasks', tasks.daily || [], 'daily');
  renderTaskList('weekend-tasks', tasks.weekend || [], 'weekend');
  updateProgress();
}

/** Render satu kategori task list */
function renderTaskList(containerId, items, category) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = '<div class="empty-state">Belum ada tugas</div>';
    return;
  }

  container.innerHTML = items.map((task) => `
    <div class="task-item ${task.checked ? 'checked' : ''}" data-id="${task.id}" data-cat="${category}">
      <div class="task-checkbox"></div>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <button class="task-delete" data-id="${task.id}" data-cat="${category}" aria-label="Delete">✕</button>
    </div>
  `).join('');

  // Event delegation: toggle & delete
  container.addEventListener('click', handleTaskClick);
}

/** Handle click pada task item (toggle checkbox atau delete) */
function handleTaskClick(e) {
  const deleteBtn = e.target.closest('.task-delete');
  if (deleteBtn) {
    e.stopPropagation();
    deleteTask(deleteBtn.dataset.cat, deleteBtn.dataset.id);
    return;
  }

  const item = e.target.closest('.task-item');
  if (item) {
    toggleTask(item.dataset.cat, item.dataset.id);
  }
}

/** Toggle status checked pada sebuah tugas */
function toggleTask(category, taskId) {
  const tasks = getStorage(STORAGE_KEYS.tasks, DEFAULT_TASKS);
  const list = tasks[category];
  if (!list) return;

  const task = list.find((t) => t.id === taskId);
  if (task) {
    task.checked = !task.checked;
    vibrate(task.checked ? 20 : 10);
    setStorage(STORAGE_KEYS.tasks, tasks);
    renderTasks();
  }
}

/** Hapus tugas dari daftar */
function deleteTask(category, taskId) {
  const tasks = getStorage(STORAGE_KEYS.tasks, DEFAULT_TASKS);
  if (!tasks[category]) return;
  tasks[category] = tasks[category].filter((t) => t.id !== taskId);
  setStorage(STORAGE_KEYS.tasks, tasks);
  vibrate(10);
  renderTasks();
  showToast('Tugas dihapus');
}

/** Setup tombol tambah tugas */
function setupTaskAddButtons() {
  document.getElementById('btn-add-daily')?.addEventListener('click', () => {
    addTask('daily', 'input-daily-task');
  });
  document.getElementById('btn-add-weekend')?.addEventListener('click', () => {
    addTask('weekend', 'input-weekend-task');
  });

  // Enter key juga bisa dipakai
  document.getElementById('input-daily-task')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask('daily', 'input-daily-task');
  });
  document.getElementById('input-weekend-task')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask('weekend', 'input-weekend-task');
  });
}

/** Tambah tugas baru ke kategori tertentu */
function addTask(category, inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const text = input.value.trim();
  if (!text) {
    showToast('Tulis nama tugas dulu');
    return;
  }

  const tasks = getStorage(STORAGE_KEYS.tasks, DEFAULT_TASKS);
  if (!tasks[category]) tasks[category] = [];
  tasks[category].push({ id: uid(), text, checked: false });
  setStorage(STORAGE_KEYS.tasks, tasks);

  input.value = '';
  vibrate();
  renderTasks();
  showToast('Tugas ditambahkan ✓');
}

/**
 * Update progress bar:
 * Hitung persentase tugas yang sudah dicentang dari TOTAL semua tugas
 * (daily + weekend), lalu update width progress bar.
 */
function updateProgress() {
  const tasks = getStorage(STORAGE_KEYS.tasks, DEFAULT_TASKS);
  const all = [...(tasks.daily || []), ...(tasks.weekend || [])];
  const total = all.length;
  const done = all.filter((t) => t.checked).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const bar = document.getElementById('progress-bar');
  const text = document.getElementById('progress-text');
  if (bar) bar.style.width = pct + '%';
  if (text) text.textContent = pct + '%';
}

// ==========================================
// WARDROBE GACHA (Randomizer Pakaian)
// ==========================================

/**
 * Inisialisasi Wardrobe:
 * Muat data inventaris pakaian dari localStorage.
 * Jika kosong, gunakan data default.
 */
function initWardrobe() {
  let wardrobe = getStorage(STORAGE_KEYS.wardrobe, null);
  if (!wardrobe) {
    wardrobe = DEFAULT_WARDROBE;
    setStorage(STORAGE_KEYS.wardrobe, wardrobe);
  }

  renderWardrobeList();
  setupWardrobeForm();
  setupGacha();
}

/** Render daftar inventaris pakaian per kategori */
function renderWardrobeList() {
  const wardrobe = getStorage(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE);
  const container = document.getElementById('wardrobe-list');
  if (!container) return;

  const categories = [
    { key: 'underwear', label: '🩲 Underwear' },
    { key: 'tops', label: '👕 Tops' },
    { key: 'bottoms', label: '👖 Bottoms' }
  ];

  let html = '';
  categories.forEach((cat) => {
    const items = wardrobe[cat.key] || [];
    html += `<div class="wardrobe-category">
      <div class="wardrobe-cat-title">${cat.label} (${items.length})</div>`;

    if (items.length === 0) {
      html += '<div class="empty-state">Kosong</div>';
    } else {
      items.forEach((item, idx) => {
        html += `<div class="wardrobe-item-row">
          <span>${escapeHtml(item)}</span>
          <button class="wardrobe-item-del" data-cat="${cat.key}" data-idx="${idx}" aria-label="Delete">✕</button>
        </div>`;
      });
    }
    html += '</div>';
  });

  container.innerHTML = html;

  // Event delegation untuk delete
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.wardrobe-item-del');
    if (btn) {
      removeWardrobeItem(btn.dataset.cat, parseInt(btn.dataset.idx));
    }
  });
}

/** Setup form tambah item wardrobe */
function setupWardrobeForm() {
  document.getElementById('btn-add-wardrobe')?.addEventListener('click', () => {
    const category = document.getElementById('wardrobe-category')?.value;
    const name = document.getElementById('wardrobe-item-name')?.value.trim();

    if (!name) {
      showToast('Tulis nama pakaian dulu');
      return;
    }

    const wardrobe = getStorage(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE);
    if (!wardrobe[category]) wardrobe[category] = [];
    wardrobe[category].push(name);
    setStorage(STORAGE_KEYS.wardrobe, wardrobe);

    document.getElementById('wardrobe-item-name').value = '';
    vibrate();
    renderWardrobeList();
    showToast('Item ditambahkan ✓');
  });
}

/** Hapus item dari inventaris */
function removeWardrobeItem(category, index) {
  const wardrobe = getStorage(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE);
  if (!wardrobe[category]) return;
  wardrobe[category].splice(index, 1);
  setStorage(STORAGE_KEYS.wardrobe, wardrobe);
  vibrate(10);
  renderWardrobeList();
  showToast('Item dihapus');
}

/**
 * SETUP GACHA (Randomizer Pakaian):
 * Saat tombol "Generate Outfit" diklik:
 * 1. Cek apakah setiap kategori punya minimal 1 item
 * 2. Jalankan animasi "slot machine" selama ~2 detik
 * 3. Tampilkan hasil akhir
 */
function setupGacha() {
  document.getElementById('btn-spin')?.addEventListener('click', spinGacha);
}

/**
 * LOGIKA GACHA / SPIN:
 *
 * Cara kerja animasi:
 * - Setiap kategori (underwear, tops, bottoms) punya slot display
 * - Saat spin dimulai, setInterval mengacak teks di setiap slot
 *   dengan interval 80ms (terasa cepat seperti slot machine)
 * - Setiap slot berhenti di waktu berbeda (staggered):
 *   Underwear berhenti di 800ms, Tops di 1400ms, Bottoms di 2000ms
 * - Saat slot berhenti, item final dipilih secara acak (Math.random)
 * - Efek visual: class "spinning" ditambah saat berputar,
 *   diganti "result" saat berhenti
 */
function spinGacha() {
  if (isSpinning) return;

  const wardrobe = getStorage(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE);
  const cats = ['underwear', 'tops', 'bottoms'];

  // Validasi: setiap kategori harus punya minimal 1 item
  for (const cat of cats) {
    if (!wardrobe[cat] || wardrobe[cat].length === 0) {
      showToast(`Kategori ${cat} masih kosong!`);
      return;
    }
  }

  isSpinning = true;
  vibrate(30);

  const btn = document.getElementById('btn-spin');
  btn.disabled = true;
  btn.classList.add('spinning-btn');

  // Timing berhenti untuk setiap slot (ms) — staggered
  const stopTimes = { underwear: 800, tops: 1400, bottoms: 2000 };
  const results = {};
  const intervals = {};

  cats.forEach((cat) => {
    const slotEl = document.getElementById(`slot-${cat}`);
    const valEl = document.getElementById(`slot-val-${cat}`);
    const items = wardrobe[cat];

    slotEl.classList.remove('result');
    slotEl.classList.add('spinning');
    valEl.classList.add('cycling');

    // Animasi: ganti teks secara acak setiap 80ms
    intervals[cat] = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * items.length);
      valEl.textContent = items[randomIdx];
    }, 80);

    // Berhenti setelah waktu yang ditentukan
    setTimeout(() => {
      clearInterval(intervals[cat]);

      // Pilih hasil akhir secara acak
      const finalIdx = Math.floor(Math.random() * items.length);
      results[cat] = items[finalIdx];
      valEl.textContent = results[cat];

      // Ganti efek visual
      valEl.classList.remove('cycling');
      slotEl.classList.remove('spinning');
      slotEl.classList.add('result');
      vibrate(15);

      // Jika ini slot terakhir (bottoms), selesaikan spin
      if (cat === 'bottoms') {
        isSpinning = false;
        btn.disabled = false;
        btn.classList.remove('spinning-btn');
        showToast('Outfit hari ini sudah siap! 🎉');
      }
    }, stopTimes[cat]);
  });
}

// ==========================================
// COMFORT & SIZE JOURNAL
// ==========================================

/** Inisialisasi Journal */
function initJournal() {
  const journal = getStorage(STORAGE_KEYS.journal, []);
  if (!Array.isArray(journal)) setStorage(STORAGE_KEYS.journal, []);

  setupStarRating();
  setupJournalForm();
  renderJournal();
}

/** Setup star rating interaktif */
function setupStarRating() {
  const stars = document.querySelectorAll('#star-rating .star');
  currentRating = 0;

  stars.forEach((star) => {
    star.addEventListener('click', () => {
      currentRating = parseInt(star.dataset.val);
      vibrate(10);
      updateStarDisplay();
    });
  });
}

/** Update tampilan bintang berdasarkan currentRating */
function updateStarDisplay() {
  const stars = document.querySelectorAll('#star-rating .star');
  stars.forEach((star) => {
    const val = parseInt(star.dataset.val);
    star.classList.toggle('active', val <= currentRating);
  });
}

/** Setup form journal */
function setupJournalForm() {
  document.getElementById('btn-add-journal')?.addEventListener('click', () => {
    const name = document.getElementById('journal-name')?.value.trim();
    const size = document.getElementById('journal-size')?.value.trim();
    const notes = document.getElementById('journal-notes')?.value.trim();

    if (!name) {
      showToast('Tulis nama item dulu');
      return;
    }
    if (currentRating === 0) {
      showToast('Beri rating kenyamanan');
      return;
    }

    const journal = getStorage(STORAGE_KEYS.journal, []);
    journal.unshift({
      id: uid(),
      name,
      size: size || '-',
      rating: currentRating,
      notes: notes || '',
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    });
    setStorage(STORAGE_KEYS.journal, journal);

    // Reset form
    document.getElementById('journal-name').value = '';
    document.getElementById('journal-size').value = '';
    document.getElementById('journal-notes').value = '';
    currentRating = 0;
    updateStarDisplay();

    vibrate();
    renderJournal();
    showToast('Journal entry tersimpan ✓');
  });
}

/** Render kartu-kartu journal dari localStorage */
function renderJournal() {
  const journal = getStorage(STORAGE_KEYS.journal, []);
  const container = document.getElementById('journal-cards');
  if (!container) return;

  if (journal.length === 0) {
    container.innerHTML = '<div class="empty-state">Belum ada catatan journal</div>';
    return;
  }

  container.innerHTML = journal.map((entry) => {
    // Render bintang rating
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      starsHtml += i <= entry.rating
        ? '<span>★</span>'
        : '<span class="empty-star">★</span>';
    }

    return `
    <div class="journal-card" data-id="${entry.id}">
      <div class="journal-card-header">
        <span class="journal-card-name">${escapeHtml(entry.name)}</span>
        <button class="journal-card-del" data-id="${entry.id}" aria-label="Delete">✕</button>
      </div>
      <div class="journal-card-meta">
        <span class="journal-meta-item">📏 <strong>${escapeHtml(entry.size)}</strong></span>
        <span class="journal-card-stars">${starsHtml}</span>
      </div>
      ${entry.notes ? `<div class="journal-card-notes">${escapeHtml(entry.notes)}</div>` : ''}
      <div class="journal-card-date">${escapeHtml(entry.date)}</div>
    </div>`;
  }).join('');

  // Event delegation: delete journal entry
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.journal-card-del');
    if (btn) deleteJournalEntry(btn.dataset.id);
  });
}

/** Hapus entry journal */
function deleteJournalEntry(entryId) {
  let journal = getStorage(STORAGE_KEYS.journal, []);
  journal = journal.filter((e) => e.id !== entryId);
  setStorage(STORAGE_KEYS.journal, journal);
  vibrate(10);
  renderJournal();
  showToast('Entry dihapus');
}

// ==========================================
// NAVIGASI TAB
// ==========================================

/** Setup navigasi tab di bottom nav */
function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      switchTab(tabName);
      vibrate(10);

      // Update active state di navigasi
      navBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

/** Ganti tab yang aktif */
function switchTab(tabName) {
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach((tab) => tab.classList.remove('active'));

  const target = document.getElementById(`tab-${tabName}`);
  if (target) target.classList.add('active');

  // Tampilkan/sembunyikan progress bar (hanya di tab Tasks)
  const progressContainer = document.getElementById('progress-container');
  if (progressContainer) {
    progressContainer.style.display = tabName === 'tasks' ? 'block' : 'none';
  }
}

// ==========================================
// UTILITAS KEAMANAN
// ==========================================

/** Escape HTML untuk mencegah XSS saat render data user */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==========================================
// INISIALISASI APLIKASI
// ==========================================

/**
 * Fungsi init utama — dipanggil setelah PIN berhasil diverifikasi.
 * Menginisialisasi semua modul fitur.
 */
function initApp() {
  setupPanicButton();
  setupNavigation();
  initTasks();
  initWardrobe();
  initJournal();
}

/**
 * Entry point:
 * - Inisialisasi PIN system
 * - Register Service Worker untuk PWA offline support
 */
document.addEventListener('DOMContentLoaded', () => {
  // Mulai dengan PIN screen
  initPin();

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('SW registered:', reg.scope))
      .catch((err) => console.warn('SW registration failed:', err));
  }
});

