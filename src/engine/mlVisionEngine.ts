import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision';

export interface Point2D {
  x: number;
  y: number;
}

export interface ExpressionScores {
  smile: number;
  surprise: number;
  blink: number;
  focus: number;
}

export interface DetectedFace {
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
  expression: string;
  leftEye: Point2D;
  rightEye: Point2D;
  nose: Point2D;
  mouth: Point2D;
  forehead?: Point2D;
  eyeAngle?: number;
  meshContours?: Point2D[][];
  blendshapes?: ExpressionScores;
  engine?: 'mediapipe' | 'fallback' | 'sample';
}

export type MlEngineStatus = 'idle' | 'loading' | 'ready_gpu' | 'ready_cpu' | 'fallback';

export interface CameraStartResult {
  stream: MediaStream;
  label: string;
  width: number;
  height: number;
}

// Standard MediaPipe 468 Face Mesh key contour index loops
const FACE_OVAL_IDX = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377,
  152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10,
];
const LIPS_OUTER_IDX = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 61,
];
const LEFT_EYE_IDX = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33];
const RIGHT_EYE_IDX = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398, 362];
const LEFT_BROW_IDX = [70, 63, 105, 66, 107];
const RIGHT_BROW_IDX = [300, 293, 334, 296, 336];
const NOSE_BRIDGE_IDX = [168, 6, 197, 195, 5, 4, 1, 19];

const LOCAL_WASM_PATH = '/mediapipe/wasm';
const CDN_WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm';
const LOCAL_MODEL_PATH = '/mediapipe/face_landmarker.task';
const CDN_MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

// ===================== REAL CAMERA UTILITIES =====================

export function stopMediaStream(stream: MediaStream | null | undefined) {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      // ignore
    }
  });
}

export async function startRealCameraStream(
  videoEl: HTMLVideoElement,
  facingMode: 'user' | 'environment' = 'user'
): Promise<CameraStartResult> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      'Browser ini belum mendukung akses kamera (getUserMedia). Pastikan halaman dibuka lewat HTTPS.'
    );
  }

  const constraintAttempts: MediaStreamConstraints[] = [
    {
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30, min: 15 },
      },
      audio: false,
    },
    {
      video: { facingMode },
      audio: false,
    },
    {
      video: true,
      audio: false,
    },
  ];

  let stream: MediaStream | null = null;
  let lastError: unknown = null;

  for (const constraints of constraintAttempts) {
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      break;
    } catch (err) {
      lastError = err;
      const errName = err instanceof DOMException ? err.name : '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        throw new Error(
          'Izin kamera ditolak oleh browser. Klik ikon gembok/kamera di address bar lalu pilih "Izinkan (Allow)" dan coba lagi.'
        );
      }
      if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        throw new Error(
          'Perangkat kamera/webcam tidak ditemukan. Pastikan kamera terpasang atau gunakan fitur Unggah Foto.'
        );
      }
      if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        throw new Error(
          'Kamera sedang dipakai oleh aplikasi lain (Zoom/Meet/tab lain). Tutup aplikasi tersebut lalu coba lagi.'
        );
      }
      // Otherwise retry with looser constraints
    }
  }

  if (!stream) {
    const msg = lastError instanceof Error ? lastError.message : 'Gagal mengakses kamera.';
    throw new Error(`Tidak dapat membuka kamera: ${msg}`);
  }

  videoEl.srcObject = stream;
  videoEl.muted = true;
  videoEl.playsInline = true;
  videoEl.setAttribute('playsinline', 'true');
  videoEl.setAttribute('autoplay', 'true');

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const timeout = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve();
      }
    }, 3500);

    const onReady = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      videoEl
        .play()
        .then(() => resolve())
        .catch(() => resolve());
    };

    if (videoEl.readyState >= 1) {
      onReady();
      return;
    }

    videoEl.addEventListener('loadedmetadata', onReady, { once: true });
    videoEl.addEventListener(
      'error',
      () => {
        if (!settled) {
          settled = true;
          window.clearTimeout(timeout);
          reject(new Error('Stream kamera gagal diputar pada elemen video.'));
        }
      },
      { once: true }
    );
  });

  const videoTrack = stream.getVideoTracks()[0];
  const settings = videoTrack?.getSettings ? videoTrack.getSettings() : {};
  const width = videoEl.videoWidth || settings.width || 640;
  const height = videoEl.videoHeight || settings.height || 480;
  const label = videoTrack?.label || (facingMode === 'user' ? 'Kamera Depan' : 'Kamera Belakang');

  return { stream, label, width, height };
}

/**
 * Draws a video frame or image cleanly with aspect-ratio cover fit and optional horizontal mirror.
 * Returns transform metrics so ML normalized coordinates map pixel-accurately onto the canvas.
 */
export function drawSourceCover(
  ctx: CanvasRenderingContext2D,
  source: HTMLVideoElement | HTMLImageElement,
  canvasW: number,
  canvasH: number,
  mirror: boolean
): { drawW: number; drawH: number; offsetX: number; offsetY: number } {
  const srcW = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth || source.width;
  const srcH = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight || source.height;

  if (!srcW || !srcH) {
    return { drawW: canvasW, drawH: canvasH, offsetX: 0, offsetY: 0 };
  }

  const scale = Math.max(canvasW / srcW, canvasH / srcH);
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  const offsetX = (canvasW - drawW) / 2;
  const offsetY = (canvasH - drawH) / 2;

  ctx.save();
  if (mirror) {
    ctx.translate(canvasW, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, offsetX, offsetY, drawW, drawH);
  ctx.restore();

  return { drawW, drawH, offsetX, offsetY };
}

// ===================== MEDIAPIPE REAL ML FACE LANDMARKER =====================

class MediaPipeFaceEngine {
  private videoLandmarker: FaceLandmarker | null = null;
  private imageLandmarker: FaceLandmarker | null = null;
  private initPromise: Promise<MlEngineStatus> | null = null;
  private imageInitPromise: Promise<boolean> | null = null;
  private status: MlEngineStatus = 'idle';
  private lastVideoTimestamp = -1;

  getStatus(): MlEngineStatus {
    return this.status;
  }

  async ensureLoaded(): Promise<MlEngineStatus> {
    if (this.status === 'ready_gpu' || this.status === 'ready_cpu') {
      return this.status;
    }
    if (this.initPromise) {
      return this.initPromise;
    }

    this.status = 'loading';
    this.initPromise = this.initialize().catch(() => {
      this.status = 'fallback';
      return 'fallback' as MlEngineStatus;
    });

    return this.initPromise;
  }

  async ensureImageReady(): Promise<boolean> {
    await this.ensureLoaded();
    if (this.imageLandmarker) return true;
    if (this.imageInitPromise) return this.imageInitPromise;
    return false;
  }

  private async loadVisionFileset() {
    try {
      return await FilesetResolver.forVisionTasks(LOCAL_WASM_PATH);
    } catch {
      return await FilesetResolver.forVisionTasks(CDN_WASM_PATH);
    }
  }

  private async createLandmarkerWithFallback(
    fileset: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>,
    runningMode: 'VIDEO' | 'IMAGE',
    delegate: 'GPU' | 'CPU'
  ): Promise<FaceLandmarker> {
    const modelPaths = [LOCAL_MODEL_PATH, CDN_MODEL_PATH];
    let lastErr: unknown = null;

    for (const modelAssetPath of modelPaths) {
      try {
        return await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath,
            delegate,
          },
          runningMode,
          numFaces: 4,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: false,
          minFaceDetectionConfidence: 0.45,
          minFacePresenceConfidence: 0.45,
          minTrackingConfidence: 0.45,
        });
      } catch (err) {
        lastErr = err;
      }
    }

    throw lastErr || new Error('Model FaceLandmarker gagal dimuat');
  }

  private async initialize(): Promise<MlEngineStatus> {
    const fileset = await this.loadVisionFileset();

    // Try WebGL GPU delegate first for 60 FPS, seamlessly fall back to WASM CPU delegate
    for (const delegate of ['GPU', 'CPU'] as const) {
      try {
        const videoLm = await this.createLandmarkerWithFallback(fileset, 'VIDEO', delegate);
        this.videoLandmarker = videoLm;
        this.status = delegate === 'GPU' ? 'ready_gpu' : 'ready_cpu';
        // Spin up IMAGE mode instance right away in background and keep its promise awaitable
        this.imageInitPromise = this.createLandmarkerWithFallback(fileset, 'IMAGE', delegate)
          .then((imgLm) => {
            this.imageLandmarker = imgLm;
            return true;
          })
          .catch(() => false);
        return this.status;
      } catch {
        // try next delegate
      }
    }

    this.status = 'fallback';
    return 'fallback';
  }

  detectVideoFrame(
    video: HTMLVideoElement,
    canvasW: number,
    canvasH: number,
    transform: { drawW: number; drawH: number; offsetX: number; offsetY: number },
    mirror: boolean
  ): DetectedFace[] | null {
    if (!this.videoLandmarker || video.readyState < 2 || !video.videoWidth) {
      return null;
    }

    const now = performance.now();
    const ts = now <= this.lastVideoTimestamp ? this.lastVideoTimestamp + 1 : now;
    this.lastVideoTimestamp = ts;

    try {
      const result = this.videoLandmarker.detectForVideo(video, ts);
      return convertLandmarkerResult(result, canvasW, canvasH, transform, mirror);
    } catch {
      return null;
    }
  }

  detectStaticImage(
    source: HTMLImageElement | HTMLCanvasElement,
    canvasW: number,
    canvasH: number,
    transform: { drawW: number; drawH: number; offsetX: number; offsetY: number }
  ): DetectedFace[] | null {
    if (!this.imageLandmarker) {
      return null;
    }
    try {
      const result = this.imageLandmarker.detect(source);
      return convertLandmarkerResult(result, canvasW, canvasH, transform, false);
    } catch {
      return null;
    }
  }
}

function mapLandmark(
  lm: NormalizedLandmark,
  canvasW: number,
  transform: { drawW: number; drawH: number; offsetX: number; offsetY: number },
  mirror: boolean
): Point2D {
  const rawX = transform.offsetX + lm.x * transform.drawW;
  const x = mirror ? canvasW - rawX : rawX;
  const y = transform.offsetY + lm.y * transform.drawH;
  return { x, y };
}

function averageLandmarks(
  landmarks: NormalizedLandmark[],
  indices: number[],
  canvasW: number,
  transform: { drawW: number; drawH: number; offsetX: number; offsetY: number },
  mirror: boolean
): Point2D {
  let sx = 0;
  let sy = 0;
  let count = 0;
  for (const idx of indices) {
    const lm = landmarks[idx];
    if (!lm) continue;
    const pt = mapLandmark(lm, canvasW, transform, mirror);
    sx += pt.x;
    sy += pt.y;
    count++;
  }
  return count > 0 ? { x: sx / count, y: sy / count } : { x: canvasW / 2, y: 120 };
}

function interpretExpression(
  result: FaceLandmarkerResult,
  faceIdx: number
): { label: string; scores: ExpressionScores; confidence: number } {
  const categories = result.faceBlendshapes?.[faceIdx]?.categories;
  if (!categories || categories.length === 0) {
    return {
      label: 'Wajah Terdeteksi',
      scores: { smile: 0, surprise: 0, blink: 0, focus: 0 },
      confidence: 96.5,
    };
  }

  const map = new Map<string, number>();
  for (const c of categories) {
    map.set(c.categoryName, c.score);
  }

  const smile = ((map.get('mouthSmileLeft') ?? 0) + (map.get('mouthSmileRight') ?? 0)) / 2;
  const jawOpen = map.get('jawOpen') ?? 0;
  const browUp = map.get('browInnerUp') ?? 0;
  const eyeWide = ((map.get('eyeWideLeft') ?? 0) + (map.get('eyeWideRight') ?? 0)) / 2;
  const surprise = Math.min(1, Math.max(jawOpen * 0.95, (browUp + eyeWide) * 0.65));
  const blink = ((map.get('eyeBlinkLeft') ?? 0) + (map.get('eyeBlinkRight') ?? 0)) / 2;
  const browDown = ((map.get('browDownLeft') ?? 0) + (map.get('browDownRight') ?? 0)) / 2;
  const squint = ((map.get('eyeSquintLeft') ?? 0) + (map.get('eyeSquintRight') ?? 0)) / 2;
  const focus = Math.min(1, browDown * 0.75 + squint * 0.35);
  const pucker = map.get('mouthPucker') ?? 0;

  let label = 'Netral';
  let confidence = 95.8;

  if (smile > 0.36) {
    label = 'Senang';
    confidence = Math.min(99.5, 92 + smile * 7.5);
  } else if (jawOpen > 0.32 || surprise > 0.48) {
    label = 'Terkejut';
    confidence = Math.min(99.2, 91 + surprise * 8.2);
  } else if (blink > 0.58) {
    label = 'Berkedip';
    confidence = Math.min(98.8, 90 + blink * 8.5);
  } else if (pucker > 0.48) {
    label = 'Ceria / Lucu';
    confidence = Math.min(98.5, 90 + pucker * 8.0);
  } else if (focus > 0.34) {
    label = 'Fokus';
    confidence = Math.min(98.6, 91 + focus * 7.5);
  }

  return {
    label,
    scores: {
      smile: Math.round(smile * 100),
      surprise: Math.round(surprise * 100),
      blink: Math.round(blink * 100),
      focus: Math.round(focus * 100),
    },
    confidence: Math.round(confidence * 10) / 10,
  };
}

function convertLandmarkerResult(
  result: FaceLandmarkerResult,
  canvasW: number,
  canvasH: number,
  transform: { drawW: number; drawH: number; offsetX: number; offsetY: number },
  mirror: boolean
): DetectedFace[] {
  const faces: DetectedFace[] = [];

  result.faceLandmarks.forEach((landmarks, idx) => {
    if (!landmarks || landmarks.length < 400) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const lm of landmarks) {
      const pt = mapLandmark(lm, canvasW, transform, mirror);
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    }

    const rawW = maxX - minX;
    const rawH = maxY - minY;
    if (rawW < 16 || rawH < 16) return;

    const padX = rawW * 0.1;
    const padY = rawH * 0.12;
    const bx = Math.max(2, Math.round(minX - padX));
    const by = Math.max(2, Math.round(minY - padY));
    const bw = Math.min(canvasW - bx - 2, Math.round(rawW + padX * 2));
    const bh = Math.min(canvasH - by - 2, Math.round(rawH + padY * 2));

    const eyeA = averageLandmarks(landmarks, [33, 133, 159, 145], canvasW, transform, mirror);
    const eyeB = averageLandmarks(landmarks, [263, 362, 386, 374], canvasW, transform, mirror);
    const leftEye = eyeA.x <= eyeB.x ? eyeA : eyeB;
    const rightEye = eyeA.x <= eyeB.x ? eyeB : eyeA;

    const nose = mapLandmark(landmarks[1], canvasW, transform, mirror);
    const mouth = averageLandmarks(landmarks, [13, 14, 61, 291], canvasW, transform, mirror);
    const forehead = mapLandmark(landmarks[10], canvasW, transform, mirror);
    const eyeAngle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

    const buildContour = (indices: number[]): Point2D[] =>
      indices
        .filter((i) => Boolean(landmarks[i]))
        .map((i) => mapLandmark(landmarks[i], canvasW, transform, mirror));

    const meshContours = [
      buildContour(FACE_OVAL_IDX),
      buildContour(LIPS_OUTER_IDX),
      buildContour(LEFT_EYE_IDX),
      buildContour(RIGHT_EYE_IDX),
      buildContour(LEFT_BROW_IDX),
      buildContour(RIGHT_BROW_IDX),
      buildContour(NOSE_BRIDGE_IDX),
    ];

    const expr = interpretExpression(result, idx);

    faces.push({
      x: bx,
      y: by,
      w: bw,
      h: bh,
      confidence: expr.confidence,
      expression: expr.label,
      leftEye,
      rightEye,
      nose,
      mouth,
      forehead,
      eyeAngle,
      meshContours,
      blendshapes: expr.scores,
      engine: 'mediapipe',
    });
  });

  return faces;
}

export const mlFaceEngine = new MediaPipeFaceEngine();

// ===================== FALLBACK PIXEL SKIN DETECTOR (OFFLINE SAFE) =====================

export function detectFacesFallbackFromPixels(imageData: ImageData): DetectedFace[] {
  const { data, width, height } = imageData;
  const step = 4;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let skinCount = 0;

  for (let y = Math.floor(height * 0.08); y < Math.floor(height * 0.88); y += step) {
    for (let x = Math.floor(width * 0.08); x < Math.floor(width * 0.92); x += step) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
      if (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173 && r > 70 && r > g && r > b) {
        skinCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (skinCount < 35 || maxX - minX < 32 || maxY - minY < 32) {
    return [];
  }

  const padX = Math.round((maxX - minX) * 0.1);
  const padY = Math.round((maxY - minY) * 0.12);
  const bx = Math.max(4, minX - padX);
  const by = Math.max(4, minY - padY);
  const bw = Math.min(width - bx - 4, maxX - minX + padX * 2);
  const bh = Math.min(height - by - 4, Math.min(maxY - minY + padY * 2, bw * 1.35));

  return [
    {
      x: bx,
      y: by,
      w: bw,
      h: bh,
      confidence: Math.min(95.0, Math.round((84 + Math.min(skinCount, 400) / 40) * 10) / 10),
      expression: 'Terdeteksi (Offline)',
      leftEye: { x: bx + bw * 0.33, y: by + bh * 0.37 },
      rightEye: { x: bx + bw * 0.67, y: by + bh * 0.37 },
      nose: { x: bx + bw * 0.5, y: by + bh * 0.56 },
      mouth: { x: bx + bw * 0.5, y: by + bh * 0.75 },
      forehead: { x: bx + bw * 0.5, y: by + bh * 0.12 },
      eyeAngle: 0,
      engine: 'fallback',
    },
  ];
}

// ===================== HIGH-SPEED 60 FPS CARTOONIZER PROCESSOR =====================

export interface CartoonizerOptions {
  levels: number;
  edgeThreshold: number;
  style: 'komik' | 'anime' | 'sketsa';
  viewMode: 'cartoon' | 'split' | 'original';
  smoothNoise: boolean;
}

export class FastCartoonizerProcessor {
  private w = 0;
  private h = 0;
  private gray: Uint8Array = new Uint8Array(0);
  private smoothR: Uint8Array = new Uint8Array(0);
  private smoothG: Uint8Array = new Uint8Array(0);
  private smoothB: Uint8Array = new Uint8Array(0);
  private outImageData: ImageData | null = null;
  private cachedLevels = -1;
  private quantLut = new Uint8Array(256);

  private ensureBuffers(dCtx: CanvasRenderingContext2D, w: number, h: number) {
    if (this.w === w && this.h === h && this.outImageData) return;
    this.w = w;
    this.h = h;
    const size = w * h;
    this.gray = new Uint8Array(size);
    this.smoothR = new Uint8Array(size);
    this.smoothG = new Uint8Array(size);
    this.smoothB = new Uint8Array(size);
    this.outImageData = dCtx.createImageData(w, h);
  }

  private ensureLut(levels: number) {
    const safeLevels = Math.max(2, Math.min(16, Math.round(levels)));
    if (this.cachedLevels === safeLevels) return;
    this.cachedLevels = safeLevels;
    const step = 255 / (safeLevels - 1);
    for (let i = 0; i < 256; i++) {
      const q = Math.round(i / step) * step;
      this.quantLut[i] = q > 255 ? 255 : q < 0 ? 0 : q;
    }
  }

  process(
    srcCanvas: HTMLCanvasElement,
    dstCanvas: HTMLCanvasElement,
    opts: CartoonizerOptions
  ): number {
    const t0 = performance.now();
    const w = srcCanvas.width;
    const h = srcCanvas.height;
    if (dstCanvas.width !== w) dstCanvas.width = w;
    if (dstCanvas.height !== h) dstCanvas.height = h;

    const sCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
    const dCtx = dstCanvas.getContext('2d');
    if (!sCtx || !dCtx) return 0;

    const srcData = sCtx.getImageData(0, 0, w, h);
    if (opts.viewMode === 'original') {
      dCtx.putImageData(srcData, 0, 0);
      return Math.round((performance.now() - t0) * 10) / 10;
    }

    this.ensureBuffers(dCtx, w, h);
    this.ensureLut(opts.levels);

    const src = srcData.data;
    const gray = this.gray;
    const sR = this.smoothR;
    const sG = this.smoothG;
    const sB = this.smoothB;
    const lut = this.quantLut;
    const outData = this.outImageData!;
    const out = outData.data;

    // Pass 1: Fast 5-tap cross denoising (greatly improves live webcam cartoon cleanliness!) + luma
    if (opts.smoothNoise) {
      for (let y = 0; y < h; y++) {
        const yUp = y > 0 ? y - 1 : 0;
        const yDn = y < h - 1 ? y + 1 : h - 1;
        const row = y * w;
        const rowUp = yUp * w;
        const rowDn = yDn * w;

        for (let x = 0; x < w; x++) {
          const xL = x > 0 ? x - 1 : 0;
          const xR = x < w - 1 ? x + 1 : w - 1;

          const p = row + x;
          const ic = p << 2;
          const il = (row + xL) << 2;
          const ir = (row + xR) << 2;
          const iu = (rowUp + x) << 2;
          const id = (rowDn + x) << 2;

          const r = ((src[ic] << 1) + src[il] + src[ir] + src[iu] + src[id]) / 6;
          const g = ((src[ic + 1] << 1) + src[il + 1] + src[ir + 1] + src[iu + 1] + src[id + 1]) / 6;
          const b = ((src[ic + 2] << 1) + src[il + 2] + src[ir + 2] + src[iu + 2] + src[id + 2]) / 6;

          sR[p] = r;
          sG[p] = g;
          sB[p] = b;
          gray[p] = (77 * r + 150 * g + 29 * b) >> 8;
        }
      }
    } else {
      const size = w * h;
      for (let p = 0; p < size; p++) {
        const idx = p << 2;
        const r = src[idx];
        const g = src[idx + 1];
        const b = src[idx + 2];
        sR[p] = r;
        sG[p] = g;
        sB[p] = b;
        gray[p] = (77 * r + 150 * g + 29 * b) >> 8;
      }
    }

    // Pass 2: Fast Sobel (|gx| + |gy|) + LUT Quantization + Style Vibrance
    const splitX = opts.viewMode === 'split' ? w >> 1 : -1;
    // Scale threshold slightly for Manhattan Sobel approximation (~1.25x Euclidean)
    const highThresh = opts.edgeThreshold * 1.35;
    const lowThresh = highThresh * 0.62;
    const invRange = 1 / Math.max(1, highThresh - lowThresh);
    const isSketsa = opts.style === 'sketsa';
    const isAnime = opts.style === 'anime';

    for (let y = 0; y < h; y++) {
      const row = y * w;
      const interiorY = y > 0 && y < h - 1;
      const rowUp = row - w;
      const rowDn = row + w;

      for (let x = 0; x < w; x++) {
        const p = row + x;
        const idx = p << 2;

        if (x < splitX) {
          out[idx] = src[idx];
          out[idx + 1] = src[idx + 1];
          out[idx + 2] = src[idx + 2];
          out[idx + 3] = 255;
          continue;
        }

        let mag = 0;
        if (interiorY && x > 0 && x < w - 1) {
          const tl = gray[rowUp + x - 1];
          const tc = gray[rowUp + x];
          const tr = gray[rowUp + x + 1];
          const ml = gray[row + x - 1];
          const mr = gray[row + x + 1];
          const bl = gray[rowDn + x - 1];
          const bc = gray[rowDn + x];
          const br = gray[rowDn + x + 1];

          const gx = -tl + tr - (ml << 1) + (mr << 1) - bl + br;
          const gy = -tl - (tc << 1) - tr + bl + (bc << 1) + br;
          mag = (gx < 0 ? -gx : gx) + (gy < 0 ? -gy : gy);
        }

        // Smooth anti-aliased edge strength [0..1]
        const edgeAlpha =
          mag <= lowThresh ? 0 : mag >= highThresh ? 1 : (mag - lowThresh) * invRange;

        if (isSketsa) {
          const gp = gray[p];
          const base = gp > 165 ? 252 : gp > 110 ? 216 : gp > 65 ? 162 : 112;
          const shade = Math.round(base * (1 - edgeAlpha) + 18 * edgeAlpha);
          out[idx] = shade;
          out[idx + 1] = shade;
          out[idx + 2] = shade < 249 ? shade + 6 : 255;
          out[idx + 3] = 255;
          continue;
        }

        let r = lut[sR[p]];
        let g = lut[sG[p]];
        let b = lut[sB[p]];

        const avg = (r + g + b) * 0.333333;
        if (isAnime) {
          r = avg + (r - avg) * 1.45 + 14;
          g = avg + (g - avg) * 1.38 + 10;
          b = avg + (b - avg) * 1.42 + 12;
        } else {
          r = avg + (r - avg) * 1.26;
          g = avg + (g - avg) * 1.26;
          b = avg + (b - avg) * 1.26;
        }

        // Clamp
        r = r > 255 ? 255 : r < 0 ? 0 : r;
        g = g > 255 ? 255 : g < 0 ? 0 : g;
        b = b > 255 ? 255 : b < 0 ? 0 : b;

        if (edgeAlpha > 0) {
          const keep = 1 - edgeAlpha;
          out[idx] = r * keep + 18 * edgeAlpha;
          out[idx + 1] = g * keep + 20 * edgeAlpha;
          out[idx + 2] = b * keep + 28 * edgeAlpha;
        } else {
          out[idx] = r;
          out[idx + 1] = g;
          out[idx + 2] = b;
        }
        out[idx + 3] = 255;
      }
    }

    dCtx.putImageData(outData, 0, 0);

    if (opts.viewMode === 'split') {
      dCtx.strokeStyle = '#FFE600';
      dCtx.lineWidth = 3;
      dCtx.beginPath();
      dCtx.moveTo(splitX, 0);
      dCtx.lineTo(splitX, h);
      dCtx.stroke();
    }

    return Math.round((performance.now() - t0) * 10) / 10;
  }
}
