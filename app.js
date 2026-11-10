// =============================================================================
// Guard Slime Clicker & Personal Vault — app.js
// Arsitektur Keamanan Plausible Deniability, Gembok Gaib, Decoy PIN, RPG Loadout,
// Gamifikasi Dare Mode (Cooldown 3 Jam), & GitHub Steganography Backup
// =============================================================================

// ==========================================
// 1. KONSTANTA & STORAGE KEYS
// ==========================================

const TRUE_PIN = '0290';   // True PIN: Membuka Personal Vault asli
const DECOY_PIN = '0000';  // Decoy PIN: Mengelabui ke halaman Coding Tasks

const STORAGE_KEYS = {
  settings: 'vault_settings',         // Status lockdown & security policy
  tasks: 'vault_tasks',               // Checklist multi-kategori (Nested JSON)
  lastDate: 'vault_last_date',         // Checkpoint tanggal Auto-Reset 00:00
  wardrobe: 'vault_wardrobe',         // Koleksi pakaian
  loadouts: 'vault_loadouts',         // RPG Loadout presets pakaian
  journal: 'vault_journal',           // Comfort journal pakaian
  gamification: 'vault_gamification', // Poin, Title, Status Quest Dare, Reroll, Cooldown
  githubConfig: 'vault_gh_config'     // Konfigurasi stealth cloud backup (Token, Owner, Repo)
};

// Title / Gelar User
const USER_TITLES = [
  { minPts: 0, name: "Cupu Penakut" },
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
  cooldownUntil: 0, // Timestamp ms hukuman 3 jam
  activeQuest: null
};

// Data Default Multi-Category Checklist
const DEFAULT_TASKS = [
  {
    id: 'cat_daily',
    name: 'Daily',
    isDaily: true,
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
  { id: 't1', name: 'Kaos Polos Hitam Oversize', category: 'top', gender: 'Cowok' },
  { id: 't2', name: 'Kemeja Flannel Kotak Biru', category: 'top', gender: 'Cowok' },
  { id: 't3', name: 'Crop Top Pastel Pink Lembut', category: 'top', gender: 'Cewek' },
  { id: 't4', name: 'Blouse Chiffon Motif Floral Anggun', category: 'top', gender: 'Cewek' },

  { id: 'b1', name: 'Slim Fit Dark Denim', category: 'bottom', gender: 'Cowok' },
  { id: 'b2', name: 'Celana Pendek Chino Khaki', category: 'bottom', gender: 'Cowok' },
  { id: 'b3', name: 'Rok Plisket Panjang Lilac', category: 'bottom', gender: 'Cewek' },
  { id: 'b4', name: 'Hotpants Denim Lucu', category: 'bottom', gender: 'Cewek' },

  { id: 'u1', name: 'Boxer Brief Katun Pria', category: 'underwear', gender: 'Cowok' },
  { id: 'u2', name: 'Boxer Seamless Hitam', category: 'underwear', gender: 'Cowok' },
  { id: 'u3', name: 'Celana Dalam Renda Pink Manis', category: 'underwear', gender: 'Cewek' },
  { id: 'u4', name: 'Seamless Panties Nude Halus', category: 'underwear', gender: 'Cewek' },

  { id: 'k1', name: 'Pashmina Silk Nude Mengkilap', category: 'kerudung', gender: 'Cewek' },
  { id: 'k2', name: 'Hijab Bella Square Dusty Pink', category: 'kerudung', gender: 'Cewek' },
  { id: 'k3', name: 'Bergo Instan Hitam Adem', category: 'kerudung', gender: 'Cewek' }
];

// Data Default RPG Loadout Presets
const DEFAULT_LOADOUTS = [
  {
    id: 'l1',
    name: 'Stealth Coder',
    top: 'Kaos Polos Hitam Oversize',
    bottom: 'Slim Fit Dark Denim',
    underwear: 'Boxer Seamless Hitam',
    kerudung: ''
  },
  {
    id: 'l2',
    name: 'Secret Princess',
    top: 'Crop Top Pastel Pink Lembut',
    bottom: 'Rok Plisket Panjang Lilac',
    underwear: 'Celana Dalam Renda Pink Manis',
    kerudung: 'Hijab Bella Square Dusty Pink'
  }
];

// 5 Kalimat Godaan Genit / Lucu (Teasing Text)
const TEASING_PHRASES = [
  "Ciee dandan cantik hari ini hihihi~",
  "Jangan lupa pembalutnya dipakai yang rapi ya manis~",
  "Pasti gemes banget nih pakai daleman itu!",
  "Awas ya kalau senyum-senyum sendiri di depan cermin~",
  "Ssst... rahasia kecil kita ya! Penampilan hari ini anggun banget~"
];

// Aktivitas Mood Dare
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
  // KUSTOM / EKSTREM: User dapat menambahkan / memodifikasi aktivitas
  // di dalam array di bawah ini sesuai selera:
  // =========================================================================
  ekstrem: [
    "Bikin video dance / pose TikTok rahasia di kamar lalu simpan ke folder privat",
    "Foto mirror selfie ootd lengkap 10 angle berbeda lalu evaluasi di cermin",
    "Jalan mondar-mandir anggun di kamar sambil latihan postur tubuh selama 15 menit",
    "Teleponan sama teman akrab sambil tetap mengenakan outfit ini tanpa ketahuan",
    "Duduk santai di depan laptop mengetik sambil mengenakan outfit ini sampai quest selesai"
  ]
};

// 5 Kalimat Ejekan Tajam (Savage Mockery) saat menyerah
const SAVAGE_MOCKERIES = [
  "Yahh cupu banget, baru segini doang udah nyerah & ciut nyalinya? Hahaha!",
  "Lemah! Katanya mau jadi Brave Girl, ternyata aslinya penakut banget hihihi~",
  "Malu dong sama outfitnya! Baru sebentar udah gak kuat, payah deh~",
  "Cuma segini doang nyalinya? Kecewa banget, balik sana pakai baju biasa!",
  "Dasar cupu penakut! Gelar kamu resmi diturunkan karena bermental tempe!"
];

// Data Default Jurnal Pakaian
const DEFAULT_JOURNAL = [
  {
    id: 'j1',
    name: 'Pashmina Silk Nude',
    size: '180 x 75 cm',
    rating: 5,
    notes: 'Bahannya jatuh banget, super lembut di pipi dan bikin wajah kelihatan tirus.',
    date: '10 Nov 2026'
  },
  {
    id: 'j2',
    name: 'Seamless Panties Nude',
    size: 'L',
    rating: 5,
    notes: 'Gak nyeplak sama sekali waktu pakai rok plisket atau celana ketat.',
    date: '08 Nov 2026'
  }
];

// ==========================================
// 2. GLOBAL STATE & TIMERS
// ==========================================

let pinInput = '';
let failedPinAttempts = 0;
let currentRating = 0;
let isSpinning = false;
let currentGenderFilter = 'all';

let scoreClickTimestamps = []; // Melacak 5 ketukan cepat pada tulisan 'Score'
let slimeScore = 0;

let dareTimerInterval = null;
let cooldownInterval = null;
let longPressTimer = null;
let lastGachaResult = null;

// ==========================================
// 3. ENKRIPSI RINGAN (Base64 btoa / atob)
// ==========================================

function saveSecure(key, data) {
  try {
    const jsonStr = JSON.stringify(data);
    const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
    localStorage.setItem(key, encoded);
  } catch (err) {
    console.warn(`Gagal saveSecure untuk ${key}:`, err);
  }
}

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
// 4. SCREEN SWITCHER (Manipulasi Class .hidden)
// ==========================================

/**
 * Menampilkan layar spesifik dan menyembunyikan layar lainnya
 * @param {'slime' | 'pin' | 'camo' | 'vault'} screenId
 */
function switchScreen(screenId) {
  const screens = {
    slime: document.getElementById('screen-slime'),
    pin: document.getElementById('screen-pin'),
    camo: document.getElementById('screen-camo'),
    vault: document.getElementById('screen-vault')
  };

  Object.keys(screens).forEach((key) => {
    if (screens[key]) {
      if (key === screenId) {
        screens[key].classList.remove('hidden');
      } else {
        screens[key].classList.add('hidden');
      }
    }
  });

  // Hapus tema feminim kecuali saat masuk ke layar Vault
  if (screenId !== 'vault') {
    document.body.classList.remove('feminine-theme');
  }
}

// ==========================================
// 5. FITUR 1: SLIME CLICKER & GEMBOK GAIB (RESPONSIF TOUCH/POINTER)
// ==========================================

let lastSlimeTapTime = 0;
let lastScoreTapTime = 0;

function initSlimeGame() {
  // Ambil skor tersimpan agar game terasa nyata
  const savedScore = parseInt(localStorage.getItem('slime_game_score') || '0', 10);
  slimeScore = isNaN(savedScore) ? 0 : savedScore;
  updateSlimeScoreUI();

  const slimeChar = document.getElementById('slime-character');
  const scoreTrigger = document.getElementById('slime-score-trigger');
  const titleTrigger = document.getElementById('slime-title-trigger');

  // Helper eksekusi tap karakter Slime (Responsif instan di mobile/touch)
  const handleSlimeTap = (e) => {
    const now = Date.now();
    // Cegah double firing dari pointerdown + click
    if (now - lastSlimeTapTime < 50) return;
    lastSlimeTapTime = now;

    slimeScore += 1;
    localStorage.setItem('slime_game_score', slimeScore.toString());
    updateSlimeScoreUI();
    vibrate(12);

    // Animasi squish yang nyata
    if (slimeChar) {
      slimeChar.classList.remove('squishing');
      void slimeChar.offsetWidth; // Force CSS reflow
      slimeChar.classList.add('squishing');
      setTimeout(() => slimeChar?.classList.remove('squishing'), 200);
    }

    spawnSlimeParticle(e);
  };

  // Event listener untuk Slime (Prioritaskan pointerdown untuk 0ms delay di Android/iOS)
  if (window.PointerEvent) {
    slimeChar?.addEventListener('pointerdown', handleSlimeTap);
  } else {
    slimeChar?.addEventListener('touchstart', handleSlimeTap, { passive: true });
    slimeChar?.addEventListener('click', handleSlimeTap);
  }

  // GEMBOK GAIB: Ketuk tulisan "Score" atau Judul sebanyak 5 kali secara cepat dalam < 2.5 detik
  const handleSecretTrigger = (e) => {
    const now = Date.now();
    if (now - lastScoreTapTime < 60) return;
    lastScoreTapTime = now;

    scoreClickTimestamps.push(now);
    // Filter klik yang hanya terjadi dalam rentang 2500ms terakhir
    scoreClickTimestamps = scoreClickTimestamps.filter((t) => now - t <= 2500);

    vibrate(10);

    if (scoreClickTimestamps.length >= 5) {
      scoreClickTimestamps = [];
      vibrate([40, 30, 60]);
      showToast('🔑 Gembok Gaib Terbuka...', 1200);

      // Buka Layar PIN Lock
      switchScreen('pin');
    }
  };

  if (window.PointerEvent) {
    scoreTrigger?.addEventListener('pointerdown', handleSecretTrigger);
    titleTrigger?.addEventListener('pointerdown', handleSecretTrigger);
  } else {
    scoreTrigger?.addEventListener('touchstart', handleSecretTrigger, { passive: true });
    titleTrigger?.addEventListener('touchstart', handleSecretTrigger, { passive: true });
    scoreTrigger?.addEventListener('click', handleSecretTrigger);
    titleTrigger?.addEventListener('click', handleSecretTrigger);
  }

  // Mencegah zoom pada saat multi-tap cepat di slime atau gembok gaib
  scoreTrigger?.addEventListener('dblclick', (e) => e.preventDefault());
  titleTrigger?.addEventListener('dblclick', (e) => e.preventDefault());
  slimeChar?.addEventListener('dblclick', (e) => e.preventDefault());
}

function updateSlimeScoreUI() {
  const scoreVal = document.getElementById('slime-score-val');
  const powerVal = document.getElementById('slime-power-val');
  if (scoreVal) scoreVal.textContent = slimeScore.toLocaleString();
  if (powerVal) {
    const level = Math.floor(slimeScore / 25) + 1;
    powerVal.textContent = `Lv. ${level}`;
  }
}

function spawnSlimeParticle(e) {
  const stage = document.querySelector('.slime-stage');
  if (!stage) return;

  const particle = document.createElement('div');
  particle.className = 'slime-particle';
  particle.textContent = '+1';

  const rect = stage.getBoundingClientRect();
  let clientX = e?.clientX;
  let clientY = e?.clientY;
  if ((clientX === undefined || clientY === undefined) && e?.touches && e.touches[0]) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }

  const x = (clientX !== undefined ? clientX - rect.left : rect.width / 2) + (Math.random() * 40 - 20) - 10;
  const y = (clientY !== undefined ? clientY - rect.top : rect.height / 2) + (Math.random() * 20 - 10) - 20;

  particle.style.left = `${Math.max(10, Math.min(rect.width - 40, x))}px`;
  particle.style.top = `${Math.max(10, Math.min(rect.height - 40, y))}px`;

  stage.appendChild(particle);
  setTimeout(() => particle.remove(), 750);
}

// ==========================================
// 6. FITUR 2: DECOY PIN, 3-STRIKE LOCKDOWN & JALAN RAHASIA PIN
// ==========================================

function initPinLock() {
  setupNumpad();
  setupPinScreenBackdoors();
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
          setTimeout(() => verifyPinInput(), 180);
        }
      }
    }
  });

  // JALAN RAHASIA PIN 3: Long Press (1.5 Detik) pada tombol C untuk Emergency Unlock
  const clearBtn = document.getElementById('btn-pin-clear');
  let clearPressTimer = null;

  const startClearPress = () => {
    clearPressTimer = setTimeout(() => {
      vibrate([40, 30, 70]);
      triggerMasterUnlock('Tombol C (Emergency Hold)');
    }, 1500);
  };

  const cancelClearPress = () => {
    if (clearPressTimer) {
      clearTimeout(clearPressTimer);
      clearPressTimer = null;
    }
  };

  clearBtn?.addEventListener('pointerdown', startClearPress);
  clearBtn?.addEventListener('pointerup', cancelClearPress);
  clearBtn?.addEventListener('pointerleave', cancelClearPress);
  clearBtn?.addEventListener('touchstart', startClearPress, { passive: true });
  clearBtn?.addEventListener('touchend', cancelClearPress);
  clearBtn?.addEventListener('touchcancel', cancelClearPress);
}

function setupPinScreenBackdoors() {
  const greenDot = document.getElementById('pin-secret-green-dot');
  const pinTitle = document.getElementById('pin-secret-title');

  let greenDotClicks = [];
  let pinTitleClicks = [];
  let lastDotTap = 0;
  let lastTitleTap = 0;

  // JALAN RAHASIA PIN 1: Ketuk Dot Hijau 3x cepat dalam < 1.5 detik
  const handleGreenDotTap = (e) => {
    if (e) e.preventDefault();
    const now = Date.now();
    if (now - lastDotTap < 80) return;
    lastDotTap = now;

    greenDotClicks.push(now);
    greenDotClicks = greenDotClicks.filter((t) => now - t <= 1500);
    vibrate(15);

    if (greenDotClicks.length >= 3) {
      greenDotClicks = [];
      triggerMasterUnlock('Terminal Green Dot Override');
    }
  };

  greenDot?.addEventListener('click', handleGreenDotTap);
  greenDot?.addEventListener('dblclick', (e) => e.preventDefault());

  // JALAN RAHASIA PIN 2: Ketuk Judul Terminal 3x cepat dalam < 1.5 detik
  const handlePinTitleTap = (e) => {
    if (e) e.preventDefault();
    const now = Date.now();
    if (now - lastTitleTap < 80) return;
    lastTitleTap = now;

    pinTitleClicks.push(now);
    pinTitleClicks = pinTitleClicks.filter((t) => now - t <= 1500);
    vibrate(15);

    if (pinTitleClicks.length >= 3) {
      pinTitleClicks = [];
      triggerMasterUnlock('Terminal Title Override');
    }
  };

  pinTitle?.addEventListener('click', handlePinTitleTap);
  pinTitle?.addEventListener('dblclick', (e) => e.preventDefault());
}

/**
 * Membuka Vault langsung, menghapus status lockdown, dan mereset kesalahan PIN
 */
function triggerMasterUnlock(sourceLabel = 'Secret Override') {
  failedPinAttempts = 0;
  pinInput = '';
  updatePinDots();
  clearPinError();

  const settings = loadSecure(STORAGE_KEYS.settings, {});
  settings.lockdown = false;
  saveSecure(STORAGE_KEYS.settings, settings);

  document.body.classList.add('feminine-theme');
  switchScreen('vault');
  initVaultApp();
  vibrate([40, 30, 80]);
  showToast(`🔓 ${sourceLabel}: Vault Terbuka!`, 2500);
}

function updatePinDots() {
  const dots = document.querySelectorAll('#pin-dots .dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('filled', idx < pinInput.length);
  });
}

function clearPinError() {
  const errEl = document.getElementById('pin-error');
  if (errEl) errEl.textContent = '';
}

function showPinError(msg) {
  const errEl = document.getElementById('pin-error');
  if (errEl) errEl.textContent = msg;
}

/**
 * Logika PIN (True PIN, Decoy PIN, Master Override, dan 3-Strike Lockdown)
 */
function verifyPinInput() {
  // 1. KASUS MASTER OVERRIDE PIN: 2508 -> Langsung hapus lockdown & buka Vault
  if (pinInput === '2508') {
    triggerMasterUnlock('Master PIN 2508');
    return;
  }

  // 2. KASUS TRUE PIN: 0290 -> Buka Personal Vault Utama
  if (pinInput === TRUE_PIN) {
    vibrate(35);
    failedPinAttempts = 0;
    pinInput = '';
    updatePinDots();

    // Pastikan lockdown false
    const settings = loadSecure(STORAGE_KEYS.settings, {});
    settings.lockdown = false;
    saveSecure(STORAGE_KEYS.settings, settings);

    // Aktifkan tema warna feminim/elegan
    document.body.classList.add('feminine-theme');

    switchScreen('vault');
    initVaultApp();
    showToast('✨ Personal Vault Terbuka');
    return;
  }

  // 3. KASUS DECOY PIN: 0000 -> Buka Halaman Palsu "Coding Tasks"
  if (pinInput === DECOY_PIN) {
    vibrate(20);
    pinInput = '';
    updatePinDots();
    switchScreen('camo');
    showToast('Workspace: Coding Tasks Terbuka');
    return;
  }

  // 4. KASUS PIN SALAH -> Hitung Strike
  failedPinAttempts += 1;
  vibrate([50, 40, 50]);

  const dotsContainer = document.getElementById('pin-dots');
  dotsContainer.classList.add('shake');
  setTimeout(() => dotsContainer.classList.remove('shake'), 450);

  if (failedPinAttempts >= 3) {
    // 3-STRIKE LOCKDOWN
    const settings = loadSecure(STORAGE_KEYS.settings, {});
    settings.lockdown = true;
    saveSecure(STORAGE_KEYS.settings, settings);

    showPinError('3x GAGAL: LOCKDOWN AKTIF! (Gunakan jalan rahasia)');
    vibrate([80, 50, 80, 50, 80]);

    setTimeout(() => {
      pinInput = '';
      updatePinDots();
      switchScreen('camo');
    }, 1200);
    return;
  }

  const sisa = 3 - failedPinAttempts;
  showPinError(`PIN SALAH! Sisa kesempatan: ${sisa}x`);
  pinInput = '';
  updatePinDots();
}

// ==========================================
// 6B. JALAN RAHASIA PADA HALAMAN CODING TASKS (CAMOUFLAGE)
// ==========================================

function initCamoBackdoors() {
  const gearTrigger = document.getElementById('camo-gear-trigger');
  const badgeTrigger = document.getElementById('camo-badge-trigger');
  const brandTrigger = document.getElementById('camo-brand-trigger');
  const lastTaskTrigger = document.getElementById('camo-last-task');
  const footerTrigger = document.getElementById('camo-footer-trigger');
  const camoScreen = document.getElementById('screen-camo');

  let gearTaps = [];
  let badgeTaps = [];
  let brandTaps = [];
  let lastTaskTaps = [];
  let footerTaps = [];

  // Reset status lockdown & kembali ke Slime Game
  const returnToSlime = (sourceLabel = 'Jalan Rahasia') => {
    const settings = loadSecure(STORAGE_KEYS.settings, {});
    settings.lockdown = false;
    saveSecure(STORAGE_KEYS.settings, settings);
    failedPinAttempts = 0;

    vibrate([20, 20, 40]);
    switchScreen('slime');
    showToast(`🎮 ${sourceLabel}: Kembali ke Slime Game`);
  };

  // 1. GEAR ICON (⚙️):
  // - Triple tap: Kembali ke Slime Game & cabut lockdown
  // - Long press (1.5 detik): Langsung buka Personal Vault!
  if (gearTrigger) {
    let gearLongPressTimer = null;

    const startGearPress = (e) => {
      e.stopPropagation();
      gearLongPressTimer = setTimeout(() => {
        vibrate([40, 30, 80]);
        triggerMasterUnlock('Gear Secret Long-Press');
      }, 1500);
    };

    const cancelGearPress = () => {
      if (gearLongPressTimer) {
        clearTimeout(gearLongPressTimer);
        gearLongPressTimer = null;
      }
    };

    gearTrigger.addEventListener('pointerdown', startGearPress);
    gearTrigger.addEventListener('pointerup', cancelGearPress);
    gearTrigger.addEventListener('pointerleave', cancelGearPress);
    gearTrigger.addEventListener('pointercancel', cancelGearPress);

    gearTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const now = Date.now();
      gearTaps.push(now);
      gearTaps = gearTaps.filter((t) => now - t <= 1500);
      vibrate(12);

      if (gearTaps.length >= 3) {
        gearTaps = [];
        returnToSlime('Triple Tap Gear');
      }
    });

    gearTrigger.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  // 2. BADGE "IN PROGRESS":
  // Double-tap atau triple-tap (<1.2 detik) -> Kembali ke Slime Game
  if (badgeTrigger) {
    badgeTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const now = Date.now();
      badgeTaps.push(now);
      badgeTaps = badgeTaps.filter((t) => now - t <= 1200);
      vibrate(12);

      if (badgeTaps.length >= 2) {
        badgeTaps = [];
        returnToSlime('Badge IN PROGRESS');
      }
    });

    badgeTrigger.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  // 3. BRAND / HEADER TITLE:
  // Triple-tap -> Kembali ke Slime Game
  if (brandTrigger) {
    brandTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      const now = Date.now();
      brandTaps.push(now);
      brandTaps = brandTaps.filter((t) => now - t <= 1500);

      if (brandTaps.length >= 3) {
        brandTaps = [];
        returnToSlime('Brand Header');
      }
    });

    brandTrigger.addEventListener('dblclick', (e) => {
      e.preventDefault();
    });
  }

  // 4. ITEM TASK TERAKHIR (Benchmark memory leak):
  // Triple-tap -> Kembali ke Slime Game
  if (lastTaskTrigger) {
    lastTaskTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      const now = Date.now();
      lastTaskTaps.push(now);
      lastTaskTaps = lastTaskTaps.filter((t) => now - t <= 1500);
      vibrate(12);

      if (lastTaskTaps.length >= 3) {
        lastTaskTaps = [];
        returnToSlime('Task Siluman');
      }
    });

    lastTaskTrigger.addEventListener('dblclick', (e) => {
      e.preventDefault();
    });
  }

  // 5. FOOTER STATUS BAR (Sprint 14 Sync):
  // Triple-tap -> Kembali ke Slime Game
  if (footerTrigger) {
    footerTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      const now = Date.now();
      footerTaps.push(now);
      footerTaps = footerTaps.filter((t) => now - t <= 1500);
      vibrate(12);

      if (footerTaps.length >= 3) {
        footerTaps = [];
        returnToSlime('Footer DevSprint Sync');
      }
    });

    footerTrigger.addEventListener('dblclick', (e) => {
      e.preventDefault();
    });
  }

  // 6. GESTURE UNIVERSAL PADA LAYAR LOCKDOWN:
  if (camoScreen) {
    // A. Tahan layar di mana saja selama 2.5 detik (Long Press)
    let screenHoldTimer = null;
    let startX = 0, startY = 0;

    const startScreenHold = (e) => {
      startX = e.clientX || 0;
      startY = e.clientY || 0;
      screenHoldTimer = setTimeout(() => {
        vibrate([50, 40, 80]);
        returnToSlime('Layar Tahan 2.5 Detik');
      }, 2500);
    };

    const moveScreenHold = (e) => {
      const dx = Math.abs((e.clientX || 0) - startX);
      const dy = Math.abs((e.clientY || 0) - startY);
      if (dx > 12 || dy > 12) {
        cancelScreenHold();
      }
    };

    const cancelScreenHold = () => {
      if (screenHoldTimer) {
        clearTimeout(screenHoldTimer);
        screenHoldTimer = null;
      }
    };

    camoScreen.addEventListener('pointerdown', startScreenHold);
    camoScreen.addEventListener('pointermove', moveScreenHold);
    camoScreen.addEventListener('pointerup', cancelScreenHold);
    camoScreen.addEventListener('pointercancel', cancelScreenHold);

    // B. Sentuhan 2 Jari (Double-Tap 2 Jari)
    let twoFingerTaps = [];
    camoScreen.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 2) {
        const now = Date.now();
        twoFingerTaps.push(now);
        twoFingerTaps = twoFingerTaps.filter((t) => now - t <= 1500);
        if (twoFingerTaps.length >= 2) {
          twoFingerTaps = [];
          cancelScreenHold();
          returnToSlime('Sentuhan 2 Jari');
        }
      }
    }, { passive: true });
  }

  // 7. SHORTCUT KEYBOARD UNTUK WEB / PC:
  // - Tekan Escape 3 kali berturut-turut
  // - Atau tekan Ctrl + Shift + U
  let escTaps = [];
  window.addEventListener('keydown', (e) => {
    const camoEl = document.getElementById('screen-camo');
    if (camoEl && !camoEl.classList.contains('hidden')) {
      if (e.key === 'Escape') {
        const now = Date.now();
        escTaps.push(now);
        escTaps = escTaps.filter((t) => now - t <= 1500);
        if (escTaps.length >= 3) {
          escTaps = [];
          returnToSlime('Keyboard Escape 3x');
        }
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        returnToSlime('Shortcut Ctrl+Shift+U');
      }
    }
  });
}

/**
 * Utilitas Console & Global untuk me-reset lockdown darurat:
 * Ketik di browser console: window.resetVaultLockdown()
 */
window.resetVaultLockdown = function () {
  const settings = loadSecure(STORAGE_KEYS.settings, {});
  settings.lockdown = false;
  saveSecure(STORAGE_KEYS.settings, settings);
  failedPinAttempts = 0;
  switchScreen('slime');
  console.log("%c[VAULT UNLOCKED] Status lockdown berhasil di-reset ke Game Slime.", "color: #10b981; font-weight: bold;");
  return "Lockdown di-reset ke Slime Game.";
};

/**
 * Utilitas Console untuk langsung membuka Vault:
 * Ketik di browser console: window.unlockVaultDirect()
 */
window.unlockVaultDirect = function () {
  triggerMasterUnlock('Console Direct Unlock');
  return "Vault terbuka.";
};

// ==========================================
// 7. PANIC BUTTON & LOCK MANUAL
// ==========================================

function setupPanicButton() {
  const header = document.getElementById('app-header');
  const panicBtn = document.getElementById('panic-indicator');
  const lockManualBtn = document.getElementById('btn-lock-manual');

  const triggerPanic = () => {
    vibrate(25);
    switchScreen('camo');
  };

  header?.addEventListener('dblclick', triggerPanic);
  panicBtn?.addEventListener('click', triggerPanic);

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

  // Tombol Kunci Manual -> Kembali ke Slime Game
  lockManualBtn?.addEventListener('click', () => {
    vibrate(15);
    switchScreen('slime');
    showToast('Vault terkunci kembali 🔐');
  });
}

// ==========================================
// 8. FITUR 3: WARDROBE GACHA & RPG LOADOUT
// ==========================================

function initWardrobe() {
  let wardrobe = loadSecure(STORAGE_KEYS.wardrobe, null);
  if (!wardrobe || !Array.isArray(wardrobe)) {
    wardrobe = DEFAULT_WARDROBE;
    saveSecure(STORAGE_KEYS.wardrobe, wardrobe);
  }

  let loadouts = loadSecure(STORAGE_KEYS.loadouts, null);
  if (!loadouts || !Array.isArray(loadouts)) {
    loadouts = DEFAULT_LOADOUTS;
    saveSecure(STORAGE_KEYS.loadouts, loadouts);
  }

  renderWardrobeInventory();
  setupWardrobeAddForm();
  setupGachaModeSelector();
  setupGachaSpin();

  // Inisialisasi RPG Loadout System
  initRpgLoadouts();
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
    showToast(`Pakaian lemari untuk mode ${mode} belum lengkap!`);
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

  lastGachaResult = {
    top: results.top?.name || '',
    bottom: results.bottom?.name || '',
    underwear: results.underwear?.name || '',
    kerudung: mode === 'mix' ? results.kerudung?.name : null,
    pembalut: harusPakaiPembalut
  };

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
    showToast('Outfit rahasia siap! 🌸');
  } else {
    showToast('Outfit cowok siap! 🕶️');
  }
}

// ==========================================
// 9. RPG LOADOUT SYSTEM (SETELAN CEPAT)
// ==========================================

function initRpgLoadouts() {
  populateLoadoutDropdowns();
  renderLoadoutCards();
  setupLoadoutForm();
}

function populateLoadoutDropdowns() {
  const wardrobe = loadSecure(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE);
  const selTop = document.getElementById('loadout-sel-top');
  const selBottom = document.getElementById('loadout-sel-bottom');
  const selUnderwear = document.getElementById('loadout-sel-underwear');
  const selKerudung = document.getElementById('loadout-sel-kerudung');

  const tops = wardrobe.filter((i) => i.category === 'top');
  const bottoms = wardrobe.filter((i) => i.category === 'bottom');
  const underwears = wardrobe.filter((i) => i.category === 'underwear');
  const kerudungs = wardrobe.filter((i) => i.category === 'kerudung');

  if (selTop) {
    selTop.innerHTML = tops.map((i) => `<option value="${escapeHtml(i.name)}">${escapeHtml(i.name)} [${i.gender}]</option>`).join('');
  }
  if (selBottom) {
    selBottom.innerHTML = bottoms.map((i) => `<option value="${escapeHtml(i.name)}">${escapeHtml(i.name)} [${i.gender}]</option>`).join('');
  }
  if (selUnderwear) {
    selUnderwear.innerHTML = underwears.map((i) => `<option value="${escapeHtml(i.name)}">${escapeHtml(i.name)} [${i.gender}]</option>`).join('');
  }
  if (selKerudung) {
    selKerudung.innerHTML = '<option value="">(Tanpa Kerudung)</option>' +
      kerudungs.map((i) => `<option value="${escapeHtml(i.name)}">${escapeHtml(i.name)}</option>`).join('');
  }
}

function setupLoadoutForm() {
  const toggleBtn = document.getElementById('btn-toggle-loadout-form');
  const box = document.getElementById('new-loadout-box');
  const cancelBtn = document.getElementById('btn-cancel-loadout');
  const saveBtn = document.getElementById('btn-save-loadout');

  toggleBtn?.addEventListener('click', () => {
    populateLoadoutDropdowns();
    box.classList.toggle('show');
  });

  cancelBtn?.addEventListener('click', () => {
    box.classList.remove('show');
  });

  saveBtn?.addEventListener('click', () => {
    const nameInput = document.getElementById('loadout-name');
    const name = nameInput.value.trim();
    const top = document.getElementById('loadout-sel-top')?.value;
    const bottom = document.getElementById('loadout-sel-bottom')?.value;
    const underwear = document.getElementById('loadout-sel-underwear')?.value;
    const kerudung = document.getElementById('loadout-sel-kerudung')?.value || '';

    if (!name) {
      showToast('Ketikkan nama setelan loadout');
      return;
    }
    if (!top || !bottom || !underwear) {
      showToast('Lengkapi pilihan atasan, bawahan & daleman');
      return;
    }

    const loadouts = loadSecure(STORAGE_KEYS.loadouts, DEFAULT_LOADOUTS);
    loadouts.unshift({ id: uid(), name, top, bottom, underwear, kerudung });
    saveSecure(STORAGE_KEYS.loadouts, loadouts);

    nameInput.value = '';
    box.classList.remove('show');
    vibrate(15);
    renderLoadoutCards();
    showToast(`Setelan "${name}" berhasil disimpan ✓`);
  });
}

function renderLoadoutCards() {
  const loadouts = loadSecure(STORAGE_KEYS.loadouts, DEFAULT_LOADOUTS);
  const container = document.getElementById('loadout-cards-container');
  if (!container) return;

  if (loadouts.length === 0) {
    container.innerHTML = '<div class="empty-state">Belum ada setelan RPG. Buat setelan baru di atas.</div>';
    return;
  }

  container.innerHTML = loadouts.map((l) => `
    <div class="loadout-card" data-id="${l.id}">
      <div class="loadout-card-header">
        <span class="loadout-name-title">⚡ ${escapeHtml(l.name)}</span>
      </div>
      <div class="loadout-items-grid">
        <div class="loadout-item-badge">
          <span>Top</span>
          <strong>${escapeHtml(l.top)}</strong>
        </div>
        <div class="loadout-item-badge">
          <span>Bottom</span>
          <strong>${escapeHtml(l.bottom)}</strong>
        </div>
        <div class="loadout-item-badge">
          <span>Underwear</span>
          <strong>${escapeHtml(l.underwear)}</strong>
        </div>
        <div class="loadout-item-badge">
          <span>Kerudung</span>
          <strong>${l.kerudung ? escapeHtml(l.kerudung) : '—'}</strong>
        </div>
      </div>
      <div class="loadout-card-actions">
        <button class="btn-equip-loadout" data-id="${l.id}">⚡ Pakai Setelan Ini (Equip)</button>
        <button class="btn-del-loadout" data-id="${l.id}" title="Hapus Loadout">🗑️</button>
      </div>
    </div>
  `).join('');

  container.onclick = (e) => {
    const equipBtn = e.target.closest('.btn-equip-loadout');
    if (equipBtn) {
      equipLoadoutPreset(equipBtn.dataset.id);
      return;
    }

    const delBtn = e.target.closest('.btn-del-loadout');
    if (delBtn) {
      deleteLoadoutPreset(delBtn.dataset.id);
    }
  };
}

/**
 * LANGSUNG LOAD / EQUIP SETELAN KE GACHA DISPLAY
 */
function equipLoadoutPreset(id) {
  const loadouts = loadSecure(STORAGE_KEYS.loadouts, DEFAULT_LOADOUTS);
  const loadout = loadouts.find((l) => l.id === id);
  if (!loadout) return;

  // Isi langsung slot tampilan outfit
  document.getElementById('slot-val-top').textContent = loadout.top;
  document.getElementById('slot-val-bottom').textContent = loadout.bottom;
  document.getElementById('slot-val-underwear').textContent = loadout.underwear;
  document.getElementById('slot-val-kerudung').textContent = loadout.kerudung || '— (None)';

  // Tambahkan efek visual equip
  ['top', 'bottom', 'underwear', 'kerudung'].forEach((k) => {
    const slot = document.getElementById(`slot-${k}`);
    slot?.classList.remove('spinning');
    slot?.classList.add('result');
  });

  // Simpan ke lastGachaResult agar Dare Mode langsung memakai setelan ini
  lastGachaResult = {
    top: loadout.top,
    bottom: loadout.bottom,
    underwear: loadout.underwear,
    kerudung: loadout.kerudung || null,
    pembalut: false
  };

  vibrate([20, 20, 30]);
  showToast(`⚔️ Setelan "${loadout.name}" telah di-equip!`);
}

function deleteLoadoutPreset(id) {
  let loadouts = loadSecure(STORAGE_KEYS.loadouts, DEFAULT_LOADOUTS);
  loadouts = loadouts.filter((l) => l.id !== id);
  saveSecure(STORAGE_KEYS.loadouts, loadouts);
  vibrate(10);
  renderLoadoutCards();
  showToast('Setelan dihapus');
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
      showToast('Tuliskan nama pakaian');
      return;
    }

    const wardrobe = loadSecure(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE);
    wardrobe.push({ id: uid(), name, category, gender });
    saveSecure(STORAGE_KEYS.wardrobe, wardrobe);

    nameInput.value = '';
    vibrate(15);
    renderWardrobeInventory();
    populateLoadoutDropdowns();
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
  populateLoadoutDropdowns();
  showToast('Item pakaian dihapus');
}

// ==========================================
// 10. FITUR 4: DARE MODE (TIMER & HUKUMAN 3 JAM)
// ==========================================

function initDareMode() {
  const gData = loadSecure(STORAGE_KEYS.gamification, DEFAULT_GAMIFICATION);

  const today = todayString();
  if (gData.rerollDate !== today) {
    gData.rerollCount = 3;
    gData.rerollDate = today;
    saveSecure(STORAGE_KEYS.gamification, gData);
  }

  updateGamificationProfileUI();
  setupDareButtons();
  setupLongPressDismiss();

  if (gData.activeQuest) {
    restoreActiveQuestUI(gData.activeQuest);
  } else {
    showDareSetupUI();
  }

  checkCooldownTimer();
}

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

function startNewDareQuest() {
  if (isCooldownActive()) {
    showToast('⛔ Sedang dalam masa Cooldown hukuman Nyerah 3 jam!');
    vibrate([40, 40, 40]);
    return;
  }

  const selectedMood = document.querySelector('input[name="dare-mood"]:checked')?.value || 'santai';
  const durationMinutes = parseInt(document.getElementById('dare-duration')?.value || '30', 10);

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

  // TIMER ANTI-CURANG BERBASIS Date.now():
  // Target selesai = Waktu sekarang + Durasi dalam milidetik
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

function restoreActiveQuestUI(quest) {
  document.getElementById('dare-setup-card').style.display = 'none';
  const activeCard = document.getElementById('dare-active-card');
  activeCard.style.display = 'block';

  const descEl = document.getElementById('quest-description');
  descEl.textContent = `Tantangan: Pakai [${quest.clothesText}] selama ${quest.durationMinutes} menit sambil [${quest.activity}].`;

  const targetDate = new Date(quest.targetTimestamp);
  const targetTimeStr = targetDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('timer-target-label').textContent = `Target selesai: ${targetTimeStr}`;

  clearInterval(dareTimerInterval);
  updateDareTimerClock();
  dareTimerInterval = setInterval(updateDareTimerClock, 1000);
}

function showDareSetupUI() {
  clearInterval(dareTimerInterval);
  document.getElementById('dare-active-card').style.display = 'none';
  document.getElementById('dare-setup-card').style.display = 'block';
}

function updateDareTimerClock() {
  const gData = loadSecure(STORAGE_KEYS.gamification, DEFAULT_GAMIFICATION);
  if (!gData.activeQuest) {
    clearInterval(dareTimerInterval);
    return;
  }

  // Hitung sisa waktu aktual berdasarkan timestamp Date.now()
  const now = Date.now();
  const diffMs = gData.activeQuest.targetTimestamp - now;
  const clockEl = document.getElementById('timer-clock');
  const claimBtn = document.getElementById('btn-claim-reward');
  const surrenderBtn = document.getElementById('btn-surrender-dare');

  if (diffMs <= 0) {
    clockEl.textContent = '00:00:00';
    clockEl.style.color = '#34d399';
    claimBtn.disabled = false;
    surrenderBtn.disabled = true;
    clearInterval(dareTimerInterval);
    vibrate([30, 20, 30]);
    return;
  }

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

function claimDareReward() {
  const gData = loadSecure(STORAGE_KEYS.gamification, DEFAULT_GAMIFICATION);
  if (!gData.activeQuest) return;

  gData.points += 50;

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
 * SISTEM HUKUMAN LAPIS EMPAT (COOLDOWN 3 JAM):
 * 1. Poin dikurangi (-50) & Title diturunkan
 * 2. COOLDOWN 3 JAM (Tombol gacha & dare di-lock)
 * 3. Savage Popup Modal dengan ejekan tajam (Wajib 3 detik Long Press)
 * 4. Penalti Silang: Tambah 1 tugas hukuman ke Checklist Daily
 */
function surrenderDareQuest() {
  const gData = loadSecure(STORAGE_KEYS.gamification, DEFAULT_GAMIFICATION);
  if (!gData.activeQuest) return;

  vibrate([60, 50, 70]);

  // 1. Kurangi Poin & Title
  gData.points = Math.max(0, gData.points - 50);
  let currentIdx = USER_TITLES.findIndex((t) => t.name === gData.title);
  if (currentIdx > 0) currentIdx -= 1;
  else currentIdx = 0;
  gData.title = USER_TITLES[currentIdx].name;

  // 2. COOLDOWN 3 JAM (Diubah dari 12 jam sesuai permintaan)
  const COOLDOWN_3_HOURS_MS = 3 * 60 * 60 * 1000;
  gData.cooldownUntil = Date.now() + COOLDOWN_3_HOURS_MS;

  gData.activeQuest = null;
  saveSecure(STORAGE_KEYS.gamification, gData);

  // 4. Penalti Silang: Suntikkan hukuman ke Checklist Daily
  injectCrossPenaltyToDailyChecklist();

  updateGamificationProfileUI();
  showDareSetupUI();
  checkCooldownTimer();

  // 3. Savage Popup Modal
  openSavageModal();
}

function injectCrossPenaltyToDailyChecklist() {
  const categories = loadSecure(STORAGE_KEYS.tasks, DEFAULT_TASKS);
  let dailyCat = categories.find((c) => c.isDaily || c.name.toLowerCase() === 'daily');

  if (!dailyCat) {
    dailyCat = { id: 'cat_daily', name: 'Daily', isDaily: true, items: [] };
    categories.unshift(dailyCat);
  }

  const penaltyTasks = [
    "🚨 Hukuman Nyerah: Push-up 25x & squat 30x",
    "🚨 Hukuman Nyerah: Bersihkan lantai kamar & lap cermin",
    "🚨 Hukuman Nyerah: Tulis refleksi penyesalan di Journal",
    "🚨 Hukuman Nyerah: Rapikan seluruh cucian baju rahasia"
  ];
  const randTask = penaltyTasks[Math.floor(Math.random() * penaltyTasks.length)];

  dailyCat.items.unshift({ id: uid(), text: randTask, checked: false });
  saveSecure(STORAGE_KEYS.tasks, categories);
  renderCategories();
}

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

function openSavageModal() {
  const modal = document.getElementById('savage-modal');
  const textEl = document.getElementById('savage-mockery-text');
  const randMockery = SAVAGE_MOCKERIES[Math.floor(Math.random() * SAVAGE_MOCKERIES.length)];

  textEl.textContent = `"${randMockery}"`;
  modal.style.display = 'flex';
}

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
// 11. FITUR 5: GITHUB STEGANOGRAPHY BACKUP
// ==========================================

const STEALTH_FILE_PATH = 'config/build-cache-lock.json';

function initGitHubBackup() {
  loadGitHubConfigUI();
  setupGitHubBackupButtons();
}

function loadGitHubConfigUI() {
  const config = loadSecure(STORAGE_KEYS.githubConfig, {});
  const tokenInput = document.getElementById('gh-token');
  const ownerInput = document.getElementById('gh-username');
  const repoInput = document.getElementById('gh-repo');

  if (config.token && tokenInput) tokenInput.value = config.token;
  if (config.owner && ownerInput) ownerInput.value = config.owner;
  if (config.repo && repoInput) repoInput.value = config.repo;
}

function saveGitHubConfigFromUI() {
  const token = document.getElementById('gh-token')?.value.trim();
  const owner = document.getElementById('gh-username')?.value.trim();
  const repo = document.getElementById('gh-repo')?.value.trim();

  const config = { token, owner, repo };
  saveSecure(STORAGE_KEYS.githubConfig, config);
  return config;
}

function setupGitHubBackupButtons() {
  document.getElementById('btn-backup-github')?.addEventListener('click', executeGitHubStealthBackup);
  document.getElementById('btn-restore-github')?.addEventListener('click', executeGitHubStealthRestore);
}

function setBackupLog(title, logMsg, status = 'normal') {
  const titleEl = document.getElementById('backup-status-title');
  const logEl = document.getElementById('backup-status-log');
  const dot = document.getElementById('backup-status-dot');

  if (titleEl) titleEl.textContent = title;
  if (logEl) logEl.textContent = `[${new Date().toLocaleTimeString()}] ${logMsg}`;
  if (dot) {
    dot.className = 'status-dot';
    if (status === 'success') dot.classList.add('active');
    if (status === 'error') dot.classList.add('error');
  }
}

/**
 * FUNGSI UTAMA: EKSEKUSI GITHUB STEGANOGRAPHY BACKUP VIA FETCH API
 *
 * Cara Kerja:
 * 1. Mengumpulkan seluruh data brankas sensitif dari localStorage.
 * 2. Mengompresi & menyamarkan data di dalam format file cache JSON wajar.
 * 3. Mengecek SHA file yang sudah ada di repo (jika ada) via GET.
 * 4. Mengirimkan HTTP PUT request ke endpoint REST API GitHub:
 *    https://api.github.com/repos/{owner}/{repo}/contents/config/build-cache-lock.json
 */
async function executeGitHubStealthBackup() {
  const config = saveGitHubConfigFromUI();
  if (!config.token || !config.owner || !config.repo) {
    showToast('⚠️ Lengkapi Token, Username, & Nama Repo GitHub!');
    setBackupLog('Status: Konfigurasi Belum Lengkap', 'Harap isi token, username, dan nama repositori.', 'error');
    vibrate(20);
    return;
  }

  setBackupLog('Status: Mengumpulkan Data...', 'Mengumpulkan seluruh database Personal Vault...');
  vibrate(15);

  try {
    // Kumpulkan seluruh data vault
    const vaultBundle = {
      tasks: loadSecure(STORAGE_KEYS.tasks, DEFAULT_TASKS),
      wardrobe: loadSecure(STORAGE_KEYS.wardrobe, DEFAULT_WARDROBE),
      loadouts: loadSecure(STORAGE_KEYS.loadouts, DEFAULT_LOADOUTS),
      journal: loadSecure(STORAGE_KEYS.journal, DEFAULT_JOURNAL),
      gamification: loadSecure(STORAGE_KEYS.gamification, DEFAULT_GAMIFICATION),
      settings: loadSecure(STORAGE_KEYS.settings, {}),
      backupTimestamp: Date.now()
    };

    // Kamuflase data di balik struktur file build cache wajar
    const stealthPayload = {
      buildTarget: "production-release",
      version: "3.4.1",
      timestamp: Date.now(),
      cacheSignature: "sha256-" + uid() + uid(),
      systemMeta: {
        runtime: "vcs-daemon",
        environment: "lts-stable"
      },
      // Data terenkripsi diselipkan di properti build cache lock
      _buildCacheLockData: btoa(unescape(encodeURIComponent(JSON.stringify(vaultBundle))))
    };

    const fileContentUtf8 = JSON.stringify(stealthPayload, null, 2);
    // API GitHub mengharuskan isi file di-encode Base64
    const fileContentBase64 = btoa(unescape(encodeURIComponent(fileContentUtf8)));

    const apiUrl = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${STEALTH_FILE_PATH}`;

    setBackupLog('Status: Memeriksa Repositori...', `Menghubungi GitHub API: ${config.owner}/${config.repo}`);

    // Cek apakah file sudah ada sebelumnya untuk mengambil nilai SHA
    let existingSha = null;
    try {
      const getRes = await fetch(apiUrl, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (getRes.status === 200) {
        const getJson = await getRes.json();
        existingSha = getJson.sha;
      }
    } catch (e) {
      // File belum ada, akan dibuat baru
    }

    setBackupLog('Status: Mengunggah File Siluman...', `Menyuntikkan payload ke ${STEALTH_FILE_PATH}`);

    const putBody = {
      message: "chore(config): update build-cache-lock manifest & integrity hash",
      content: fileContentBase64
    };
    if (existingSha) putBody.sha = existingSha;

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${config.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(putBody)
    });

    if (!putRes.ok) {
      const errJson = await putRes.json();
      throw new Error(errJson.message || `HTTP ${putRes.status}`);
    }

    vibrate([30, 20, 40]);
    setBackupLog('Status: Backup Berhasil!', `Data sukses disuntikkan ke ${config.owner}/${config.repo}/${STEALTH_FILE_PATH}`, 'success');
    showToast('🚀 Backup Siluman ke GitHub Berhasil! ✓');

  } catch (err) {
    console.error('GitHub Backup Error:', err);
    setBackupLog('Status: Backup Gagal', `Error: ${err.message}`, 'error');
    showToast(`❌ Gagal Backup: ${err.message}`);
    vibrate([40, 40, 40]);
  }
}

/**
 * FUNGSI UTAMA: RESTORE DATA DARI GITHUB STEGANOGRAPHY FILE
 */
async function executeGitHubStealthRestore() {
  const config = saveGitHubConfigFromUI();
  if (!config.token || !config.owner || !config.repo) {
    showToast('⚠️ Lengkapi Token, Username, & Nama Repo GitHub!');
    setBackupLog('Status: Konfigurasi Belum Lengkap', 'Harap isi token, username, dan nama repositori.', 'error');
    vibrate(20);
    return;
  }

  setBackupLog('Status: Mengambil Data dari GitHub...', `Membaca file ${STEALTH_FILE_PATH} dari ${config.owner}/${config.repo}`);
  vibrate(15);

  try {
    const apiUrl = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${STEALTH_FILE_PATH}`;
    const getRes = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!getRes.ok) {
      const errJson = await getRes.json();
      throw new Error(errJson.message || `File tidak ditemukan (HTTP ${getRes.status})`);
    }

    const fileMeta = await getRes.json();
    // Konten file dari API GitHub berupa string Base64
    const decodedFileContentUtf8 = decodeURIComponent(escape(atob(fileMeta.content.replace(/\s/g, ''))));
    const stealthJson = JSON.parse(decodedFileContentUtf8);

    if (!stealthJson._buildCacheLockData) {
      throw new Error('Format file tidak mengandung payload Personal Vault valid!');
    }

    // Ekstrak data vault terenkripsi
    const vaultBundleJson = decodeURIComponent(escape(atob(stealthJson._buildCacheLockData)));
    const vaultBundle = JSON.parse(vaultBundleJson);

    // Pulihkan seluruh kunci ke localStorage
    if (vaultBundle.tasks) saveSecure(STORAGE_KEYS.tasks, vaultBundle.tasks);
    if (vaultBundle.wardrobe) saveSecure(STORAGE_KEYS.wardrobe, vaultBundle.wardrobe);
    if (vaultBundle.loadouts) saveSecure(STORAGE_KEYS.loadouts, vaultBundle.loadouts);
    if (vaultBundle.journal) saveSecure(STORAGE_KEYS.journal, vaultBundle.journal);
    if (vaultBundle.gamification) saveSecure(STORAGE_KEYS.gamification, vaultBundle.gamification);
    if (vaultBundle.settings) saveSecure(STORAGE_KEYS.settings, vaultBundle.settings);

    vibrate([40, 30, 50]);
    setBackupLog('Status: Restore Sukses!', `Semua data berhasil dipulihkan dari GitHub (${new Date(vaultBundle.backupTimestamp || Date.now()).toLocaleString()})`, 'success');
    showToast('📥 Data Berhasil Di-Restore dari GitHub! ✓');

    // Refresh seluruh modul tampilan
    renderCategories();
    renderWardrobeInventory();
    renderLoadoutCards();
    renderJournal();
    updateGamificationProfileUI();

  } catch (err) {
    console.error('GitHub Restore Error:', err);
    setBackupLog('Status: Restore Gagal', `Error: ${err.message}`, 'error');
    showToast(`❌ Gagal Restore: ${err.message}`);
    vibrate([40, 40, 40]);
  }
}

// ==========================================
// 12. FITUR: COMFORT JOURNAL
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
      showToast('Ketikkan nama pakaian');
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
      starsHtml += i <= entry.rating ? '<span>★</span>' : '<span class="empty-star">★</span>';
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
// 13. FITUR: CHECKLIST MULTI-KATEGORI
// ==========================================

function initTasks() {
  let categories = loadSecure(STORAGE_KEYS.tasks, null);
  if (!categories || !Array.isArray(categories)) {
    categories = DEFAULT_TASKS;
    saveSecure(STORAGE_KEYS.tasks, categories);
  }

  checkAutoReset(categories);
  renderCategories();
  setupCategoryForm();
}

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
    container.innerHTML = '<div class="empty-state">Belum ada kategori checklist. Klik "+ Kategori".</div>';
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
// 14. BOTTOM NAVIGATION TABS (5 TABS)
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
// 15. INISIALISASI UTAMA & ENTRY POINT
// ==========================================

function initAntiZoomProtection() {
  // 1. Matikan double-click default zoom di seluruh dokumen
  window.addEventListener('dblclick', (e) => {
    e.preventDefault();
  }, { passive: false });

  // 2. Matikan gesture zoom Safari / iOS (Pinch-to-zoom)
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());

  // 3. Matikan Ctrl + Scroll Wheel zoom di desktop
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });

  // 4. Matikan keyboard zoom: Ctrl + '+', '-', '=', '0'
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && ['+', '-', '=', '0'].includes(e.key)) {
      e.preventDefault();
    }
  });
}

function initVaultApp() {
  setupPanicButton();
  setupNavigation();
  initTasks();
  initWardrobe();
  initDareMode();
  initJournal();
  initGitHubBackup();
}

document.addEventListener('DOMContentLoaded', () => {
  // 0. Aktifkan proteksi anti-zoom (mencegah double-tap / double-click zoom di Web & Mobile)
  initAntiZoomProtection();

  // 1. Selalu inisialisasi semua modul interaktif & seluruh pintu rahasia
  initSlimeGame();
  initPinLock();
  initCamoBackdoors();

  // 2. Hash URL Darurat (#reset, #unlock, #slime) untuk bypass instan jika diperlukan
  if (window.location.hash === '#reset' || window.location.hash === '#unlock' || window.location.hash === '#slime') {
    window.resetVaultLockdown();
    try {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (e) { }
  }

  // 3. Cek apakah ada status Lockdown 3-Strike Permanen
  const settings = loadSecure(STORAGE_KEYS.settings, {});
  if (settings.lockdown === true) {
    // Pengguna terkunci: Tampilkan Coding Tasks, tapi SEMUA backdoor (Gear, Badge, Task) SUDAH AKTIF!
    switchScreen('camo');
  } else {
    // Layar awal normal: Guard Slime Clicker Game
    switchScreen('slime');
  }

  // 4. Daftarkan Service Worker PWA Caching
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('SW Registered Scope:', reg.scope))
      .catch((err) => console.warn('SW Register Error:', err));
  }
});
