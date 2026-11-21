import type { AppMakerProjectId } from '../types';
import type { MicrobitProgram } from '../engine/microbitEngine';

export interface AppMakerStepBlock {
  id: string;
  title: string;
  description: string;
  codeSnippet: string;
  badgeColor: string;
}

export interface MicrobitMissionCheck {
  id: string;
  label: string;
  check: (prog: MicrobitProgram) => boolean;
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
  hardwareHint: string;
  learningGoals: string[];
  defaultAppName: string;
  steps: AppMakerStepBlock[];
  starterEnabledStepIds: string[];
  microbitStarter: MicrobitProgram;
  microbitSolution: MicrobitProgram;
  missionChecks: MicrobitMissionCheck[];
}

function hasEvent(prog: MicrobitProgram, evType: string, paramKey?: string, paramVal?: string): boolean {
  return prog.containers.some(
    (c) =>
      c.eventType === evType &&
      c.blocks.length > 0 &&
      (!paramKey || String(c.params[paramKey]) === paramVal)
  );
}

function hasStmtType(prog: MicrobitProgram, stmtType: string): boolean {
  return prog.containers.some((c) => c.blocks.some((b) => b.type === stmtType));
}

export const APP_MAKER_PROJECTS: AppMakerProjectDef[] = [
  {
    id: 'app_photogram',
    order: 1,
    title: 'Flashing Heart & Name Badge',
    shortTitle: 'Flashing Heart',
    subtitle: 'Animasi detak jantung LED 5×5, teks berjalan & sapaan tombol A',
    accentColor: '#1E90FF',
    concept: 'Matriks LED 5×5, Loop Forever & Event Tombol Fisik',
    overview:
      'Di proyek pertama micro:bit, kamu akan memprogram papan BBC micro:bit v2 untuk menampilkan animasi jantung berkedip pada matriks LED 5×5, menggulirkan teks sapaan saat dinyalakan, dan memunculkan ekspresi bahagia + bunyi ketika Tombol A ditekan.',
    hardwareHint: 'Coba klik Tombol A di sisi kiri papan micro:bit setelah menambahkan event on button A!',
    learningGoals: [
      'Memahami perbedaan wadah blok on start (sekali jalan) dan forever (berulang terus).',
      'Mengontrol tampilan ikon dan jeda waktu (pause) pada matriks LED 5×5.',
      'Menambahkan interaksi tombol fisik A dengan efek suara speaker piezo.',
    ],
    defaultAppName: 'flashing-heart',
    starterEnabledStepIds: ['mb1_start', 'mb1_forever'],
    steps: [
      {
        id: 'mb1_start',
        title: '1. Sapaan on start',
        description: 'Menampilkan teks berjalan di LED saat papan micro:bit menyala.',
        codeSnippet: 'basic.showString("HI!")',
        badgeColor: '#1E90FF',
      },
      {
        id: 'mb1_forever',
        title: '2. Animasi Detak Jantung',
        description: 'Mengedipkan ikon Heart dan SmallHeart di dalam loop forever.',
        codeSnippet: 'basic.forever(() => { basic.showIcon(IconNames.Heart); basic.pause(400); })',
        badgeColor: '#1E90FF',
      },
      {
        id: 'mb1_btn_a',
        title: '3. Reaksi Tombol A + Melodi',
        description: 'Saat tombol A ditekan, tampilkan ikon Happy dan bunyikan melodi ba_ding.',
        codeSnippet: 'input.onButtonPressed(Button.A, () => { basic.showIcon(IconNames.Happy); music.startMelody("ba_ding"); })',
        badgeColor: '#D400D4',
      },
    ],
    microbitStarter: {
      containers: [
        {
          id: 'mb_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 's1_str', type: 'show_string', params: { text: 'HI!' } },
          ],
        },
        {
          id: 'mb_forever',
          eventType: 'forever',
          params: {},
          blocks: [
            { id: 's1_h1', type: 'show_icon', params: { icon: 'Heart' } },
            { id: 's1_p1', type: 'pause', params: { ms: 400 } },
            { id: 's1_h2', type: 'show_icon', params: { icon: 'SmallHeart' } },
            { id: 's1_p2', type: 'pause', params: { ms: 400 } },
          ],
        },
      ],
    },
    microbitSolution: {
      containers: [
        {
          id: 'mb_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 's1_str', type: 'show_string', params: { text: 'HI!' } },
          ],
        },
        {
          id: 'mb_forever',
          eventType: 'forever',
          params: {},
          blocks: [
            { id: 's1_h1', type: 'show_icon', params: { icon: 'Heart' } },
            { id: 's1_p1', type: 'pause', params: { ms: 400 } },
            { id: 's1_h2', type: 'show_icon', params: { icon: 'SmallHeart' } },
            { id: 's1_p2', type: 'pause', params: { ms: 400 } },
          ],
        },
        {
          id: 'mb_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 's1_hap', type: 'show_icon', params: { icon: 'Happy' } },
            { id: 's1_mel', type: 'play_melody', params: { melody: 'ba_ding' } },
            { id: 's1_pa', type: 'pause', params: { ms: 600 } },
          ],
        },
      ],
    },
    missionChecks: [
      {
        id: 'c1_forever',
        label: 'Animasi ikon LED berjalan di blok forever',
        check: (p) => hasEvent(p, 'forever') && (hasStmtType(p, 'show_icon') || hasStmtType(p, 'show_leds')),
      },
      {
        id: 'c1_btn',
        label: 'Tambahkan blok event Input: on button [A] pressed',
        check: (p) => hasEvent(p, 'on_button', 'button', 'A'),
      },
      {
        id: 'c1_sound',
        label: 'Tambahkan blok Music (start melody / play tone) untuk umpan balik suara',
        check: (p) => hasStmtType(p, 'play_melody') || hasStmtType(p, 'play_tone'),
      },
    ],
  },
  {
    id: 'app_todo',
    order: 2,
    title: 'Dadu Digital & Penghitung',
    shortTitle: 'Dadu Digital',
    subtitle: 'Sensor goyang (accelerometer) pengacak dadu 1–6 & penghitung skor',
    accentColor: '#D400D4',
    concept: 'Sensor Akselerometer (on shake), Variabel & Angka Acak (Math)',
    overview:
      'Ubah papan micro:bit menjadi Dadu Digital dan Penghitung Skor! Tombol A menambah skor penghitung, tombol B mereset skor, dan saat papan digoyangkan (SHAKE) micro:bit akan mengacak angka 1 sampai 6 dengan efek bunyi.',
    hardwareHint: 'Tekan tombol SHAKE kuning di bawah papan micro:bit untuk melempar dadu digitalmu!',
    learningGoals: [
      'Menyimpan dan mengubah nilai menggunakan blok Variables (counter & dice).',
      'Menggunakan blok Math randint(1, 6) untuk simulasi dadu acak.',
      'Mendeteksi gerakan fisik papan menggunakan blok Input on shake.',
    ],
    defaultAppName: 'dadu-digital',
    starterEnabledStepIds: ['mb2_var', 'mb2_btn_a'],
    steps: [
      {
        id: 'mb2_var',
        title: '1. Inisialisasi counter = 0',
        description: 'Menyiapkan variabel counter di on start dan menampilkan angka 0.',
        codeSnippet: 'counter = 0; basic.showNumber(counter)',
        badgeColor: '#DC143C',
      },
      {
        id: 'mb2_btn_a',
        title: '2. Tombol A Menambah Skor',
        description: 'Setiap klik Tombol A, naikkan counter +1 dan tampilkan angkanya.',
        codeSnippet: 'input.onButtonPressed(Button.A, () => { counter += 1; basic.showNumber(counter); })',
        badgeColor: '#D400D4',
      },
      {
        id: 'mb2_shake',
        title: '3. Lempar Dadu Saat SHAKE',
        description: 'Tambahkan event on shake lalu acak variabel dice (1 sampai 6) + tampilkan.',
        codeSnippet: 'input.onGesture(Gesture.Shake, () => { dice = randint(1, 6); basic.showNumber(dice); })',
        badgeColor: '#9400D3',
      },
    ],
    microbitStarter: {
      containers: [
        {
          id: 'mb_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 's2_set', type: 'set_var', params: { name: 'counter', value: 0 } },
            { id: 's2_shw', type: 'show_var', params: { name: 'counter' } },
          ],
        },
        {
          id: 'mb_forever',
          eventType: 'forever',
          params: {},
          blocks: [],
        },
        {
          id: 'mb_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 's2_inc', type: 'change_var', params: { name: 'counter', delta: 1 } },
            { id: 's2_sa', type: 'show_var', params: { name: 'counter' } },
            { id: 's2_snd', type: 'play_tone', params: { freq: 523, ms: 120 } },
          ],
        },
      ],
    },
    microbitSolution: {
      containers: [
        {
          id: 'mb_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 's2_set', type: 'set_var', params: { name: 'counter', value: 0 } },
            { id: 's2_shw', type: 'show_var', params: { name: 'counter' } },
          ],
        },
        {
          id: 'mb_forever',
          eventType: 'forever',
          params: {},
          blocks: [],
        },
        {
          id: 'mb_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 's2_inc', type: 'change_var', params: { name: 'counter', delta: 1 } },
            { id: 's2_sa', type: 'show_var', params: { name: 'counter' } },
            { id: 's2_snd', type: 'play_tone', params: { freq: 523, ms: 120 } },
          ],
        },
        {
          id: 'mb_btn_b',
          eventType: 'on_button',
          params: { button: 'B' },
          blocks: [
            { id: 's2_rst', type: 'set_var', params: { name: 'counter', value: 0 } },
            { id: 's2_sb', type: 'show_var', params: { name: 'counter' } },
          ],
        },
        {
          id: 'mb_shake',
          eventType: 'on_shake',
          params: {},
          blocks: [
            { id: 's2_rnd', type: 'set_var_random', params: { name: 'dice', min: 1, max: 6 } },
            { id: 's2_sd', type: 'show_var', params: { name: 'dice' } },
            { id: 's2_mel', type: 'play_melody', params: { melody: 'jump_up' } },
          ],
        },
      ],
    },
    missionChecks: [
      {
        id: 'c2_var',
        label: 'Gunakan variabel (set / change / show counter)',
        check: (p) => hasStmtType(p, 'change_var') || hasStmtType(p, 'set_var'),
      },
      {
        id: 'c2_shake',
        label: 'Tambahkan blok event Input: on [shake]',
        check: (p) => hasEvent(p, 'on_shake'),
      },
      {
        id: 'c2_random',
        label: 'Tambahkan blok Math: pick random [1] to [6]',
        check: (p) => hasStmtType(p, 'set_var_random'),
      },
    ],
  },
  {
    id: 'app_calculator',
    order: 3,
    title: 'Piano & Jukebox micro:bit',
    shortTitle: 'Piano & Jukebox',
    subtitle: 'Alat musik sentuh dengan tombol A/B, Logo emas v2 & Pin P0',
    accentColor: '#E63022',
    concept: 'Synthesizer Speaker Piezo, Sentuh Logo v2 & Pin Konektor Emas',
    overview:
      'Manfaatkan speaker piezo bawaan BBC micro:bit v2! Rangkai tombol A, tombol B, sensor sentuh Logo emas di atas layar LED, serta Pin konektor P0 di bagian bawah papan menjadi piano dan jukebox melodi interaktif.',
    hardwareHint: 'Klik tombol A, B, Logo emas di atas LED, dan konektor emas Pin 0 di bawah papan!',
    learningGoals: [
      'Memainkan frekuensi nada musik (C4, E4, G4) dengan blok Music play tone.',
      'Menggunakan sensor sentuh kapasitif baru pada Logo emas micro:bit v2.',
      'Mengaktifkan input pin konektor emas (TouchPin P0) sebagai tuts tambahan.',
    ],
    defaultAppName: 'piano-jukebox',
    starterEnabledStepIds: ['mb3_a', 'mb3_b'],
    steps: [
      {
        id: 'mb3_a',
        title: '1. Nada Do (C) di Tombol A',
        description: 'Menekan tombol A memainkan nada Middle C (262Hz) dan ikon EighthNote.',
        codeSnippet: 'input.onButtonPressed(Button.A, () => { music.playTone(262, 300); })',
        badgeColor: '#E63022',
      },
      {
        id: 'mb3_b',
        title: '2. Nada Mi (E) di Tombol B',
        description: 'Menekan tombol B memainkan nada Middle E (330Hz).',
        codeSnippet: 'input.onButtonPressed(Button.B, () => { music.playTone(330, 300); })',
        badgeColor: '#E63022',
      },
      {
        id: 'mb3_logo_pin',
        title: '3. Sentuh Logo Jukebox & Pin P0',
        description: 'Tambahkan on logo pressed (start melody) dan on pin P0 pressed (play tone G4).',
        codeSnippet: 'input.onLogoEvent(TouchButtonEvent.Pressed, () => { music.startMelody("ode"); })',
        badgeColor: '#D400D4',
      },
    ],
    microbitStarter: {
      containers: [
        {
          id: 'mb_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 's3_ic', type: 'show_icon', params: { icon: 'EighthNote' } },
          ],
        },
        {
          id: 'mb_forever',
          eventType: 'forever',
          params: {},
          blocks: [],
        },
        {
          id: 'mb_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 's3_ta', type: 'play_tone', params: { freq: 262, ms: 300 } },
            { id: 's3_ia', type: 'show_icon', params: { icon: 'EighthNote' } },
          ],
        },
        {
          id: 'mb_btn_b',
          eventType: 'on_button',
          params: { button: 'B' },
          blocks: [
            { id: 's3_tb', type: 'play_tone', params: { freq: 330, ms: 300 } },
            { id: 's3_ib', type: 'show_icon', params: { icon: 'Diamond' } },
          ],
        },
      ],
    },
    microbitSolution: {
      containers: [
        {
          id: 'mb_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 's3_ic', type: 'show_icon', params: { icon: 'EighthNote' } },
          ],
        },
        {
          id: 'mb_forever',
          eventType: 'forever',
          params: {},
          blocks: [],
        },
        {
          id: 'mb_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 's3_ta', type: 'play_tone', params: { freq: 262, ms: 300 } },
            { id: 's3_ia', type: 'show_icon', params: { icon: 'EighthNote' } },
          ],
        },
        {
          id: 'mb_btn_b',
          eventType: 'on_button',
          params: { button: 'B' },
          blocks: [
            { id: 's3_tb', type: 'play_tone', params: { freq: 330, ms: 300 } },
            { id: 's3_ib', type: 'show_icon', params: { icon: 'Diamond' } },
          ],
        },
        {
          id: 'mb_logo',
          eventType: 'on_logo',
          params: {},
          blocks: [
            { id: 's3_ml', type: 'play_melody', params: { melody: 'ode' } },
            { id: 's3_hl', type: 'show_icon', params: { icon: 'Happy' } },
          ],
        },
        {
          id: 'mb_pin0',
          eventType: 'on_pin',
          params: { pin: 'P0' },
          blocks: [
            { id: 's3_tp', type: 'play_tone', params: { freq: 392, ms: 320 } },
            { id: 's3_ip', type: 'show_icon', params: { icon: 'Heart' } },
          ],
        },
      ],
    },
    missionChecks: [
      {
        id: 'c3_tones',
        label: 'Gunakan blok Music: play tone pada tombol A/B',
        check: (p) => hasStmtType(p, 'play_tone'),
      },
      {
        id: 'c3_logo',
        label: 'Tambahkan blok Input: on logo [pressed] + start melody',
        check: (p) => hasEvent(p, 'on_logo') && hasStmtType(p, 'play_melody'),
      },
      {
        id: 'c3_pin',
        label: 'Tambahkan blok Input: on pin [P0] pressed',
        check: (p) => hasEvent(p, 'on_pin'),
      },
    ],
  },
  {
    id: 'app_color',
    order: 4,
    title: 'Termometer & Sensor Cahaya',
    shortTitle: 'Sensor Suhu & Cahaya',
    subtitle: 'Grafik batang LED realtime, pembaca suhu °C & alarm panas otomatis',
    accentColor: '#5C2D91',
    concept: 'Sensor Lingkungan (Suhu & Cahaya), Bar Graph LED & Logika If',
    overview:
      'Bangun alat ukur lingkungan pintar! Matriks LED 5×5 akan menggambar grafik batang (bar graph) intensitas cahaya secara realtime, tombol A menampilkan suhu derajat Celsius, dan logika Logic if membunyikan alarm bila suhu melewati 30°C.',
    hardwareHint: 'Geser slider Suhu Sensor (>30°C) dan Sensor Cahaya di panel kiri untuk menguji alarm!',
    learningGoals: [
      'Memvisualisasikan data sensor dengan blok LED plot bar graph.',
      'Membaca sensor suhu (temperature) dan cahaya (light level) dari papan.',
      'Menerapkan blok Logic if untuk membuat sistem peringatan dini otomatis.',
    ],
    defaultAppName: 'sensor-pintar',
    starterEnabledStepIds: ['mb4_bar', 'mb4_temp'],
    steps: [
      {
        id: 'mb4_bar',
        title: '1. Grafik Batang Sensor Cahaya',
        description: 'Gunakan led.plotBarGraph(lightLevel, 255) di dalam forever.',
        codeSnippet: 'led.plotBarGraph(lightLevel, 255)',
        badgeColor: '#5C2D91',
      },
      {
        id: 'mb4_temp',
        title: '2. Cek Suhu °C lewat Tombol A',
        description: 'Saat tombol A ditekan, tampilkan nilai input.temperature().',
        codeSnippet: 'input.onButtonPressed(Button.A, () => { basic.showNumber(input.temperature()); })',
        badgeColor: '#D400D4',
      },
      {
        id: 'mb4_alarm',
        title: '3. Alarm Logika Jika Suhu > 30°C',
        description: 'Tambahkan blok Logic: if temperature > 30 tampilkan Skull + bunyi alarm.',
        codeSnippet: 'if (temperature > 30) { basic.showIcon(IconNames.Skull); music.startMelody("wawawawaa"); }',
        badgeColor: '#00A4A6',
      },
    ],
    microbitStarter: {
      containers: [
        {
          id: 'mb_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 's4_brt', type: 'set_brightness', params: { value: 255 } },
          ],
        },
        {
          id: 'mb_forever',
          eventType: 'forever',
          params: {},
          blocks: [
            { id: 's4_bar', type: 'plot_bar_graph', params: { source: 'lightLevel', max: 255 } },
            { id: 's4_p', type: 'pause', params: { ms: 250 } },
          ],
        },
        {
          id: 'mb_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 's4_tmp', type: 'show_temperature', params: {} },
          ],
        },
      ],
    },
    microbitSolution: {
      containers: [
        {
          id: 'mb_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 's4_brt', type: 'set_brightness', params: { value: 255 } },
          ],
        },
        {
          id: 'mb_forever',
          eventType: 'forever',
          params: {},
          blocks: [
            { id: 's4_bar', type: 'plot_bar_graph', params: { source: 'lightLevel', max: 255 } },
            {
              id: 's4_if',
              type: 'if_sensor_action',
              params: { source: 'temperature', op: '>', threshold: 30, icon: 'Skull', melody: 'wawawawaa' },
            },
            { id: 's4_p', type: 'pause', params: { ms: 250 } },
          ],
        },
        {
          id: 'mb_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 's4_tmp', type: 'show_temperature', params: {} },
          ],
        },
      ],
    },
    missionChecks: [
      {
        id: 'c4_bar',
        label: 'Tampilkan grafik batang sensor (LED: plot bar graph)',
        check: (p) => hasStmtType(p, 'plot_bar_graph'),
      },
      {
        id: 'c4_temp',
        label: 'Baca nilai sensor suhu (Input: show temperature)',
        check: (p) => hasStmtType(p, 'show_temperature'),
      },
      {
        id: 'c4_if',
        label: 'Tambahkan blok Logic: if [temperature] [>] [30] untuk alarm',
        check: (p) => hasStmtType(p, 'if_sensor_action'),
      },
    ],
  },
  {
    id: 'app_weather',
    order: 5,
    title: 'Radio Telegrap & Stasiun Cuaca',
    shortTitle: 'Radio Telegrap',
    subtitle: 'Komunikasi nirkabel Radio antar papan, kirim pesan & data suhu',
    accentColor: '#E3008C',
    concept: 'Komunikasi Nirkabel Radio (TX/RX Group) & Telemetri IoT',
    overview:
      'Di proyek puncak micro:bit Lab, kamu membangun Stasiun Cuaca & Telegrap Radio! Atur kanal grup radio pada on start, kirim laporan cuaca teks via Tombol A, kirim telemetri suhu via Tombol B, lalu tangkap sinyal masuk di blok on radio received.',
    hardwareHint: 'Tekan Tombol A atau B untuk mengirim sinyal radio dan lihat indikator Radio Grup + respon LED!',
    learningGoals: [
      'Menetapkan kanal grup komunikasi nirkabel dengan radio.setGroup().',
      'Mengirimkan pesan teks dan angka telemetri sensor lewat gelombang radio.',
      'Menangani paket data yang diterima menggunakan event on radio received.',
    ],
    defaultAppName: 'radio-telegrap',
    starterEnabledStepIds: ['mb5_grp', 'mb5_tx_a'],
    steps: [
      {
        id: 'mb5_grp',
        title: '1. Atur Kanal Radio Grup 7',
        description: 'Tetapkan grup radio pada on start agar pemancar & penerima sinkron.',
        codeSnippet: 'radio.setGroup(7)',
        badgeColor: '#E3008C',
      },
      {
        id: 'mb5_tx_a',
        title: '2. Kirim Pesan Cuaca di Tombol A',
        description: 'Kirim teks "CERAH" lewat radio saat Tombol A ditekan.',
        codeSnippet: 'input.onButtonPressed(Button.A, () => { radio.sendString("CERAH"); })',
        badgeColor: '#E3008C',
      },
      {
        id: 'mb5_rx',
        title: '3. Kirim Suhu (Tombol B) & Terima Radio',
        description: 'Tambahkan radio send number (Tombol B) dan event on radio received.',
        codeSnippet: 'radio.onReceivedString(() => { basic.showIcon(IconNames.Yes); music.startMelody("ba_ding"); })',
        badgeColor: '#107C10',
      },
    ],
    microbitStarter: {
      containers: [
        {
          id: 'mb_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 's5_grp', type: 'radio_set_group', params: { group: 7 } },
            { id: 's5_ic', type: 'show_icon', params: { icon: 'Target' } },
          ],
        },
        {
          id: 'mb_forever',
          eventType: 'forever',
          params: {},
          blocks: [],
        },
        {
          id: 'mb_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 's5_tx', type: 'radio_send_string', params: { text: 'CERAH' } },
            { id: 's5_ar', type: 'show_icon', params: { icon: 'ArrowNorth' } },
          ],
        },
      ],
    },
    microbitSolution: {
      containers: [
        {
          id: 'mb_start',
          eventType: 'on_start',
          params: {},
          blocks: [
            { id: 's5_grp', type: 'radio_set_group', params: { group: 7 } },
            { id: 's5_ic', type: 'show_icon', params: { icon: 'Target' } },
          ],
        },
        {
          id: 'mb_forever',
          eventType: 'forever',
          params: {},
          blocks: [],
        },
        {
          id: 'mb_btn_a',
          eventType: 'on_button',
          params: { button: 'A' },
          blocks: [
            { id: 's5_tx', type: 'radio_send_string', params: { text: 'CERAH' } },
            { id: 's5_ar', type: 'show_icon', params: { icon: 'ArrowNorth' } },
          ],
        },
        {
          id: 'mb_btn_b',
          eventType: 'on_button',
          params: { button: 'B' },
          blocks: [
            { id: 's5_tn', type: 'radio_send_number', params: { source: 'temperature' } },
            { id: 's5_tmp', type: 'show_temperature', params: {} },
          ],
        },
        {
          id: 'mb_rx',
          eventType: 'on_radio_received',
          params: {},
          blocks: [
            { id: 's5_ry', type: 'show_icon', params: { icon: 'Yes' } },
            { id: 's5_rm', type: 'play_melody', params: { melody: 'ba_ding' } },
          ],
        },
      ],
    },
    missionChecks: [
      {
        id: 'c5_grp',
        label: 'Atur kanal sinyal dengan Radio: radio set group',
        check: (p) => hasStmtType(p, 'radio_set_group'),
      },
      {
        id: 'c5_tx',
        label: 'Kirim paket data dengan radio send string & radio send number',
        check: (p) => hasStmtType(p, 'radio_send_string') && hasStmtType(p, 'radio_send_number'),
      },
      {
        id: 'c5_rx',
        label: 'Tambahkan blok penerima Radio: on radio received',
        check: (p) => hasEvent(p, 'on_radio_received'),
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
    `// Proyek micro:bit #${project.order}: ${project.title} (${safeTitle})`,
    '',
  ];

  project.steps.forEach((step) => {
    if (enabledStepIds.includes(step.id)) {
      lines.push(`// ${step.title}`);
      lines.push(step.codeSnippet);
    }
  });

  return lines.join('\n');
}
