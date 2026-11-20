import type { AiMlProjectId } from '../types';

export interface AiMlStepBlock {
  id: string;
  label: string;
  category: 'INPUT' | 'PREPROCESS' | 'MODEL' | 'OUTPUT';
  codeSnippet: string;
  explanation: string;
}

export interface AiMlProjectDefinition {
  id: AiMlProjectId;
  order: number;
  title: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  difficulty: 'Dasar Vision' | 'Computer Vision';
  concept: string;
  mission: string;
  steps: AiMlStepBlock[];
}

export const AI_ML_PROJECTS: AiMlProjectDefinition[] = [
  {
    id: 'aiml_cartoonizer',
    order: 1,
    title: 'Cartoonizer AI',
    subtitle: 'Ubah foto potret, gambar unggahan, atau tangkapan kamera menjadi ilustrasi gaya kartun & komik secara realtime.',
    badge: 'Proyek AI 01',
    accentColor: '#FDBA74',
    difficulty: 'Dasar Vision',
    concept: 'Image Quantization, Bilateral Smoothing & Sobel Edge Detection',
    mission:
      'Susun 4 blok pipeline Computer Vision Cartoonizer, lalu uji minimal 1 gaya kartun (Komik Pop, Anime Cerah, atau Sketsa Tinta) pada potret sampel, unggahan foto, atau kamera untuk membuka proyek Face Detection!',
    steps: [
      {
        id: 'cz_input',
        label: 'Muat Citra RGB (Kamera / Foto / Sampel)',
        category: 'INPUT',
        codeSnippet: `const frame = vision.loadImage({ source: "camera_or_sample", width: 360, height: 270 });\nconst pixels = frame.getImageData();`,
        explanation: 'Mengambil matriks piksel RGBA (Red, Green, Blue, Alpha) sebagai input mentah bagi pipeline AI.',
      },
      {
        id: 'cz_quantize',
        label: 'Kuantisasi Palet Warna (Posterize)',
        category: 'PREPROCESS',
        codeSnippet: `function quantizeColor(r, g, b, levels = 6) {\n  const step = 255 / (levels - 1);\n  return [Math.round(r / step) * step, Math.round(g / step) * step, Math.round(b / step) * step];\n}`,
        explanation: 'Menyederhanakan jutaan gradasi warna menjadi blok warna cel-shading khas animasi kartun.',
      },
      {
        id: 'cz_edges',
        label: 'Deteksi Tepi Sobel (Garis Tinta Komik)',
        category: 'MODEL',
        codeSnippet: `const edgeMask = vision.sobelEdgeDetect(pixels, { threshold: 58, inkStrength: 0.9 });\n// Menghitung gradien Gx & Gy pada setiap piksel tetangga 3x3`,
        explanation: 'Mendeteksi kontur mata, rambut, dan objek dengan operator gradien Sobel agar muncul garis outline tegas.',
      },
      {
        id: 'cz_render',
        label: 'Gabungkan Lapisan & Ekspor Kartun PNG',
        category: 'OUTPUT',
        codeSnippet: `const cartoon = vision.composeCartoon(quantizedPixels, edgeMask, { style: "komik_pop" });\ncanvas.render(cartoon); // Siap diunduh sebagai PNG`,
        explanation: 'Menggabungkan warna cel-shading dengan garis tinta Sobel lalu menampilkannya di kanvas interaktif.',
      },
    ],
  },
  {
    id: 'aiml_face_detection',
    order: 2,
    title: 'Face Detection AI',
    subtitle: 'Deteksi lokasi wajah, titik landmark (mata, hidung, mulut), skor kepercayaan, dan filter AR secara langsung.',
    badge: 'Proyek AI 02',
    accentColor: '#34D399',
    difficulty: 'Computer Vision',
    concept: 'Bounding Box Regression, YCbCr Skin Clustering & Facial Landmarks',
    mission:
      'Rakit 4 blok pipeline Face Detection AI, aktifkan pemindaian wajah pada sampel potret, foto unggahan, atau webcam, lalu uji toggle Landmark & Filter AR untuk menuntaskan program AI-ML!',
    steps: [
      {
        id: 'fd_model',
        label: 'Inisialisasi Detektor Wajah (Vision Net)',
        category: 'INPUT',
        codeSnippet: `const detector = await aiml.loadFaceDetector({ model: "blaze_face_lite", minConfidence: 0.72 });\nvision.bindCanvas("#face-stage");`,
        explanation: 'Memuat model deteksi wajah ringan yang mampu menganalisis frame gambar langsung di peramban.',
      },
      {
        id: 'fd_bbox',
        label: 'Pindai Kotak Pembatas (Bounding Box)',
        category: 'PREPROCESS',
        codeSnippet: `const faces = detector.detectFaces(frame);\nfaces.forEach((f) => drawBoundingBox(f.x, f.y, f.width, f.height, f.confidence));`,
        explanation: 'Menemukan koordinat [x, y, width, height] tiap wajah beserta tingkat keyakinan model dalam persen.',
      },
      {
        id: 'fd_landmarks',
        label: 'Petakan Titik Landmark (Mata, Hidung, Mulut)',
        category: 'MODEL',
        codeSnippet: `const landmarks = detector.estimateLandmarks(faceBox);\n// Memetakan koordinat mata kiri, mata kanan, ujung hidung & lengkung senyum`,
        explanation: 'Menandai titik anatomi kunci wajah agar sistem memahami orientasi kepala dan ekspresi.',
      },
      {
        id: 'fd_ar',
        label: 'Klasifikasi Ekspresi & Overlay Filter AR',
        category: 'OUTPUT',
        codeSnippet: `const mood = aiml.classifyExpression(landmarks);\nrenderHudOverlay({ faces, landmarks, mood, arFilter: "cyber_glasses" });`,
        explanation: 'Menampilkan label ekspresi wajah serta menempelkan aksesori Augmented Reality tepat di koordinat mata/kepala.',
      },
    ],
  },
];

export function getAiMlProjectById(id: AiMlProjectId): AiMlProjectDefinition {
  return AI_ML_PROJECTS.find((p) => p.id === id) || AI_ML_PROJECTS[0];
}

export function buildAiMlCodeFromSteps(
  project: AiMlProjectDefinition,
  activeStepIds: string[]
): string {
  const ordered = project.steps.filter((s) => activeStepIds.includes(s.id));
  if (ordered.length === 0) {
    return `// Klik blok pipeline di sebelah kiri untuk merakit model AI ${project.title}!\n`;
  }
  return ordered
    .map((s, idx) => `// [${idx + 1}/${project.steps.length}] ${s.label}\n${s.codeSnippet}`)
    .join('\n\n');
}
