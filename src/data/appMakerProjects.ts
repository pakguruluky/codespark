import type { AppMakerProjectId } from '../types';

export interface AppMakerStepBlock {
  id: string;
  title: string;
  description: string;
  codeSnippet: string;
  badgeColor: string;
}

export interface AppMakerProjectDef {
  id: AppMakerProjectId;
  order: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  accentColor: string;
  concept: string;
  overview: string;
  learningGoals: string[];
  defaultAppName: string;
  steps: AppMakerStepBlock[];
  starterEnabledStepIds: string[];
}

export const APP_MAKER_PROJECTS: AppMakerProjectDef[] = [
  {
    id: 'app_photogram',
    order: 1,
    title: 'Photogram AI',
    shortTitle: 'Photogram AI',
    subtitle: 'Bangun studio filter foto & generator caption AI otomatis',
    accentColor: '#FB7185',
    concept: 'State UI, CSS Visual Filters & AI Smart Captioning',
    overview:
      'Di proyek pertama App Maker, Anda membangun aplikasi Photogram AI seperti Instagram mini: pengguna dapat memilih foto, menerapkan filter visual secara realtime, membuat caption & tagar AI otomatis, serta mempublikasikannya ke feed.',
    learningGoals: [
      'Menyusun tata letak kartu foto & pemilih galeri interaktif.',
      'Mengatur filter visual (Vivid, Retro, Noir, Cyber Neon) menggunakan state.',
      'Membuat fungsi generator caption & tagar AI berdasarkan suasana foto.',
      'Menambahkan interaksi Like dan publikasi ke daftar feed aplikasi.',
    ],
    defaultAppName: 'Photogram AI Studio',
    starterEnabledStepIds: ['pg_gallery'],
    steps: [
      {
        id: 'pg_gallery',
        title: '1. Galeri & Pemilih Foto',
        description: 'Menampilkan kanvas foto utama beserta tombol ganti foto sampel.',
        codeSnippet: 'app.addComponent("PhotoCanvas", { selectable: true });',
        badgeColor: '#38BDF8',
      },
      {
        id: 'pg_filters',
        title: '2. Mesin Filter Visual',
        description: 'Menambahkan preset filter (Normal, Vivid, Retro, Noir, Neon) realtime.',
        codeSnippet: 'app.addFeature("FilterPresets", ["Normal", "Vivid", "Retro", "Noir", "Neon"]);',
        badgeColor: '#FFE600',
      },
      {
        id: 'pg_ai_caption',
        title: '3. Generator Caption & Tagar AI',
        description: 'Membuat tombol "Buat Caption AI" otomatis sesuai foto dan gaya filter.',
        codeSnippet: 'app.addFeature("AICaptionEngine", { autoHashtags: true });',
        badgeColor: '#C084FC',
      },
      {
        id: 'pg_publish',
        title: '4. Tombol Like & Publikasi Feed',
        description: 'Memungkinkan pengguna menyukai foto dan memposting hasil ke Feed Mini.',
        codeSnippet: 'app.addFeature("FeedPublisher", { likesEnabled: true });',
        badgeColor: '#4ADE80',
      },
    ],
  },
  {
    id: 'app_todo',
    order: 2,
    title: 'Todo App',
    shortTitle: 'Todo App',
    subtitle: 'Buat aplikasi pengelola tugas harian dengan filter & progres',
    accentColor: '#4ADE80',
    concept: 'Array CRUD (Create, Read, Update, Delete) & Filter State',
    overview:
      'Pada proyek kedua, Anda merancang aplikasi Todo App produktivitas nyata. Pengguna bisa menambahkan tugas baru, menandai selesai, menyaring daftar tugas aktif/selesai, dan melihat bar progres otomatis.',
    learningGoals: [
      'Membuat form input untuk menambah item tugas ke dalam array state.',
      'Mengimplementasikan toggle selesai (completed) dan tombol hapus tugas.',
      'Menambahkan filter tampilan (Semua / Aktif / Selesai).',
      'Menghitung persentase penyelesaian tugas secara realtime.',
    ],
    defaultAppName: 'My Daily Todo',
    starterEnabledStepIds: ['td_input'],
    steps: [
      {
        id: 'td_input',
        title: '1. Form Input Tambah Tugas',
        description: 'Menyediakan kolom teks dan tombol tambah tugas baru ke daftar.',
        codeSnippet: 'app.addComponent("TaskInput", { placeholder: "Tulis tugas..." });',
        badgeColor: '#38BDF8',
      },
      {
        id: 'td_toggle',
        title: '2. Centang Selesai & Hapus',
        description: 'Memungkinkan pengguna menandai tugas selesai atau menghapus item.',
        codeSnippet: 'app.addFeature("TaskActions", { toggleDone: true, remove: true });',
        badgeColor: '#4ADE80',
      },
      {
        id: 'td_filter',
        title: '3. Filter Status Tugas',
        description: 'Menambahkan tab filter Semua, Aktif, dan Selesai.',
        codeSnippet: 'app.addFeature("StatusFilter", ["Semua", "Aktif", "Selesai"]);',
        badgeColor: '#FFE600',
      },
      {
        id: 'td_progress',
        title: '4. Indikator Progres Harian',
        description: 'Menampilkan persentase dan bilah progres penyelesaian otomatis.',
        codeSnippet: 'app.addComponent("ProgressTracker", { showPercent: true });',
        badgeColor: '#C084FC',
      },
    ],
  },
  {
    id: 'app_calculator',
    order: 3,
    title: 'Simple Calculator',
    shortTitle: 'Calculator',
    subtitle: 'Rancang kalkulator digital interaktif dengan riwayat hitungan',
    accentColor: '#FFE600',
    concept: 'Event Handling, Expression Parsing & Math Operations',
    overview:
      'Pada proyek ketiga, Anda membangun Simple Calculator yang bekerja secara akurat untuk operasi tambah, kurang, kali, bagi, hapus angka, hingga mencatat riwayat perhitungan terbaru.',
    learningGoals: [
      'Menyusun layar tampilan ekspresi dan hasil angka yang rapi.',
      'Membangun grid tombol angka 0–9 dan titik desimal.',
      'Menghubungkan tombol operator (+, −, ×, ÷, =) ke logika hitung.',
      'Menambahkan tombol Clear (C), Backspace, serta riwayat hitungan.',
    ],
    defaultAppName: 'SparkCalc Digital',
    starterEnabledStepIds: ['calc_display'],
    steps: [
      {
        id: 'calc_display',
        title: '1. Layar Tampilan Angka',
        description: 'Menampilkan angka input saat ini dan ekspresi operasi di bagian atas.',
        codeSnippet: 'app.addComponent("CalcDisplay", { align: "right", digits: 12 });',
        badgeColor: '#38BDF8',
      },
      {
        id: 'calc_digits',
        title: '2. Keypad Angka 0–9',
        description: 'Menyusun tombol angka 0 sampai 9 dan koma desimal yang responsif.',
        codeSnippet: 'app.addComponent("NumberPad", { keys: "0123456789." });',
        badgeColor: '#FFE600',
      },
      {
        id: 'calc_ops',
        title: '3. Operator Aritmatika (+ − × ÷ =)',
        description: 'Menjalankan perhitungan tambah, kurang, kali, bagi, dan hasil sama dengan.',
        codeSnippet: 'app.addFeature("MathEngine", ["+", "-", "*", "/", "="]);',
        badgeColor: '#4ADE80',
      },
      {
        id: 'calc_history',
        title: '4. Clear & Riwayat Hitungan',
        description: 'Menambahkan tombol Reset (C), Hapus 1 digit, dan daftar 3 riwayat terakhir.',
        codeSnippet: 'app.addFeature("CalcHistory", { maxItems: 3, clearButton: true });',
        badgeColor: '#C084FC',
      },
    ],
  },
  {
    id: 'app_color',
    order: 4,
    title: 'Color Generatif',
    shortTitle: 'Color Generatif',
    subtitle: 'Ciptakan generator palet warna HEX, kunci warna & CSS gradien',
    accentColor: '#C084FC',
    concept: 'Algorithmic Generation, HSL/HEX Math & Clipboard API',
    overview:
      'Pada proyek keempat, Anda membuat aplikasi desain Color Generatif! Pengguna bisa menghasilkan 5 palet warna harmonis otomatis, mengunci warna favorit, memilih mode warna, dan menyalin kode HEX/CSS.',
    learningGoals: [
      'Menghasilkan 5 kartu warna HEX secara algoritmik.',
      'Mengatur mode harmoni warna (Acak, Pastel, Neon, Monokrom).',
      'Menambahkan fitur kunci warna (Lock) agar warna terpilih tidak berubah.',
      'Menampilkan pratinjau CSS Gradient dan tombol salin kode HEX.',
    ],
    defaultAppName: 'ColorSpark Generator',
    starterEnabledStepIds: ['clr_swatches'],
    steps: [
      {
        id: 'clr_swatches',
        title: '1. Grid 5 Kartu Palet Warna',
        description: 'Menampilkan 5 swatch warna dengan kode HEX dan tombol Generate.',
        codeSnippet: 'app.addComponent("PaletteSwatches", { count: 5, format: "HEX" });',
        badgeColor: '#C084FC',
      },
      {
        id: 'clr_harmony',
        title: '2. Mode Harmoni Warna',
        description: 'Pilihan algoritma warna: Acak, Pastel, Neon, dan Monokrom.',
        codeSnippet: 'app.addFeature("HarmonyModes", ["Acak", "Pastel", "Neon", "Monokrom"]);',
        badgeColor: '#38BDF8',
      },
      {
        id: 'clr_lock',
        title: '3. Kunci Warna Favorit (Lock)',
        description: 'Mengunci swatch tertentu supaya tetap dipertahankan saat menekan Acak.',
        codeSnippet: 'app.addFeature("SwatchLock", { preserveLocked: true });',
        badgeColor: '#FFE600',
      },
      {
        id: 'clr_gradient',
        title: '4. Pratinjau CSS Gradien & Salin HEX',
        description: 'Menampilkan pratinjau banner linear-gradient dan fitur salin kode warna.',
        codeSnippet: 'app.addFeature("GradientExport", { copyHex: true });',
        badgeColor: '#4ADE80',
      },
    ],
  },
  {
    id: 'app_weather',
    order: 5,
    title: 'Weather App',
    shortTitle: 'Weather App',
    subtitle: 'Bangun aplikasi cuaca multi-kota dengan konversi °C/°F & saran AI',
    accentColor: '#38BDF8',
    concept: 'Data Modeling, Unit Conversion & Dynamic Weather Dashboard',
    overview:
      'Pada proyek puncak App Maker, Anda membangun Weather App lengkap: pemilih kota di Indonesia dan dunia, kartu kondisi cuaca realtime, konversi suhu °C ↔ °F, prakiraan per jam, serta rekomendasi pakaian & aktivitas.',
    learningGoals: [
      'Mengelola data cuaca terstruktur untuk berbagai kota.',
      'Menampilkan suhu utama, kelembapan, kecepatan angin, dan ikon kondisi.',
      'Mengimplementasikan konversi suhu Celsius ke Fahrenheit secara dinamis.',
      'Menyajikan prakiraan 4 jam ke depan serta saran aktivitas cerdas.',
    ],
    defaultAppName: 'CuacaKu Live',
    starterEnabledStepIds: ['wt_cities'],
    steps: [
      {
        id: 'wt_cities',
        title: '1. Pemilih Kota & Kartu Cuaca',
        description: 'Menampilkan pilihan kota (Jakarta, Bandung, Bali, Surabaya, Yogyakarta, Tokyo).',
        codeSnippet: 'app.addComponent("CitySelector", { defaultCity: "Jakarta" });',
        badgeColor: '#38BDF8',
      },
      {
        id: 'wt_metrics',
        title: '2. Detail Kelembapan & Angin',
        description: 'Menampilkan indikator kelembapan udara (%), angin (km/j), dan indeks UV.',
        codeSnippet: 'app.addComponent("WeatherMetrics", ["humidity", "wind", "uv"]);',
        badgeColor: '#4ADE80',
      },
      {
        id: 'wt_unit',
        title: '3. Konversi Satuan °C ↔ °F',
        description: 'Tombol sakelar untuk mengubah seluruh angka suhu ke Celsius atau Fahrenheit.',
        codeSnippet: 'app.addFeature("UnitConverter", { units: ["C", "F"] });',
        badgeColor: '#FFE600',
      },
      {
        id: 'wt_forecast',
        title: '4. Prakiraan Jam & Saran AI',
        description: 'Menampilkan prakiraan 4 slot waktu dan rekomendasi pakaian/aktivitas otomatis.',
        codeSnippet: 'app.addFeature("ForecastAdvisor", { slots: 4, aiTips: true });',
        badgeColor: '#C084FC',
      },
    ],
  },
];

export function getAppMakerProjectById(id: string): AppMakerProjectDef | undefined {
  return APP_MAKER_PROJECTS.find((p) => p.id === id);
}

export function buildProjectCodeFromSteps(
  project: AppMakerProjectDef,
  appTitle: string,
  enabledStepIds: string[]
): string {
  const safeTitle = appTitle.trim() || project.defaultAppName;
  const lines: string[] = [
    `// Proyek App Maker #${project.order}: ${project.title}`,
    `const app = createApp("${safeTitle}");`,
    '',
  ];

  project.steps.forEach((step) => {
    if (enabledStepIds.includes(step.id)) {
      lines.push(`// ${step.title}`);
      lines.push(step.codeSnippet);
    }
  });

  lines.push('');
  lines.push('app.render();');
  return lines.join('\n');
}
