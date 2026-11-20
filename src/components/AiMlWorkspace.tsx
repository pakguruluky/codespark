import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Lock,
  CheckCircle2,
  Play,
  ArrowLeft,
  Star,
  Code2,
  Blocks,
  Sparkles,
  Award,
  Phone,
  MessageCircle,
  KeyRound,
  Cpu,
  Camera,
  CameraOff,
  Upload,
  Download,
  ScanFace,
  Palette,
  RefreshCw,
  Eye,
  Sliders,
} from 'lucide-react';
import type { AiMlProjectId, CertificateRecord, ProgressRecord } from '../types';
import {
  AI_ML_PROJECTS,
  buildAiMlCodeFromSteps,
  getAiMlProjectById,
  type AiMlProjectDefinition,
} from '../data/aiMlProjects';
import { soundEngine } from '../engine/soundEngine';
import { formatWhatsAppUrl } from '../utils/crypto';

interface Props {
  hasAccess: boolean;
  isAdminPreview?: boolean;
  requestedAiMl?: boolean;
  initialProjectId?: AiMlProjectId | null;
  completedProgressMap: Map<string, ProgressRecord>;
  adminPhone?: string;
  adminContactName?: string;
  onRequestUpgrade?: () => void;
  onProjectComplete: (payload: {
    projectId: AiMlProjectId;
    stars: 1 | 2 | 3;
    codeSubmitted: string;
  }) => Promise<{ newCertificate: CertificateRecord | null }>;
  onOpenCertificates?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  INPUT: '#38BDF8',
  PREPROCESS: '#FFE600',
  MODEL: '#C084FC',
  OUTPUT: '#4ADE80',
};

// ===================== SHARED PROCEDURAL SAMPLE SCENES =====================
// Drawn cleanly onto an offscreen canvas so pixel processing works 100% offline/CORS-free

type CartoonSampleId = 'student' | 'panda' | 'city';
type FaceSampleId = 'smile' | 'group' | 'surprised';

interface DetectedFace {
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
  expression: string;
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  nose: { x: number; y: number };
  mouth: { x: number; y: number };
}

function drawCartoonSampleScene(
  ctx: CanvasRenderingContext2D,
  sample: CartoonSampleId,
  w: number,
  h: number
) {
  ctx.clearRect(0, 0, w, h);

  if (sample === 'student') {
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#7DD3FC');
    bg.addColorStop(1, '#E0F2FE');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Sun & hills
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(w * 0.84, h * 0.2, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#86EFAC';
    ctx.beginPath();
    ctx.ellipse(w * 0.25, h * 0.96, 170, 62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4ADE80';
    ctx.beginPath();
    ctx.ellipse(w * 0.78, h * 0.98, 180, 56, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hoodie shoulders
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.94, 86, 58, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(w * 0.5 - 22, h * 0.78, 44, 26);

    // Neck
    ctx.fillStyle = '#F5C6A5';
    ctx.fillRect(w * 0.5 - 16, h * 0.63, 32, 26);

    // Ears
    ctx.fillStyle = '#F3B892';
    ctx.beginPath();
    ctx.arc(w * 0.5 - 52, h * 0.45, 13, 0, Math.PI * 2);
    ctx.arc(w * 0.5 + 52, h * 0.45, 13, 0, Math.PI * 2);
    ctx.fill();

    // Head with soft skin shading
    const skin = ctx.createRadialGradient(w * 0.47, h * 0.4, 10, w * 0.5, h * 0.45, 62);
    skin.addColorStop(0, '#FFE4CC');
    skin.addColorStop(1, '#EBB08A');
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.45, 52, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.28, 56, 36, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.5 - 54, h * 0.3);
    ctx.quadraticCurveTo(w * 0.5 - 20, h * 0.14, w * 0.5 + 54, h * 0.3);
    ctx.quadraticCurveTo(w * 0.5 + 10, h * 0.34, w * 0.5 - 54, h * 0.3);
    ctx.fill();

    // Cheeks
    ctx.fillStyle = 'rgba(244, 114, 182, 0.35)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5 - 28, h * 0.51, 11, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.5 + 28, h * 0.51, 11, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(w * 0.5 - 20, h * 0.43, 11, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.5 + 20, h * 0.43, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(w * 0.5 - 19, h * 0.43, 5.5, 0, Math.PI * 2);
    ctx.arc(w * 0.5 + 21, h * 0.43, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(w * 0.5 - 21, h * 0.41, 2, 0, Math.PI * 2);
    ctx.arc(w * 0.5 + 19, h * 0.41, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows & Nose & Smile
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(w * 0.5 - 30, h * 0.35);
    ctx.quadraticCurveTo(w * 0.5 - 20, h * 0.31, w * 0.5 - 10, h * 0.35);
    ctx.moveTo(w * 0.5 + 10, h * 0.35);
    ctx.quadraticCurveTo(w * 0.5 + 20, h * 0.31, w * 0.5 + 30, h * 0.35);
    ctx.stroke();

    ctx.strokeStyle = '#C27D56';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.46);
    ctx.lineTo(w * 0.5 - 4, h * 0.53);
    ctx.lineTo(w * 0.5 + 4, h * 0.53);
    ctx.stroke();

    ctx.strokeStyle = '#BE123C';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.55, 16, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    return;
  }

  if (sample === 'panda') {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#A7F3D0');
    bg.addColorStop(1, '#34D399');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Bamboo stalks
    ctx.fillStyle = '#059669';
    [34, 62, w - 58, w - 28].forEach((bx) => {
      ctx.fillRect(bx, 0, 12, h);
      ctx.fillStyle = '#047857';
      for (let y = 30; y < h; y += 52) {
        ctx.fillRect(bx - 2, y, 16, 4);
      }
      ctx.fillStyle = '#059669';
    });

    // Panda ears
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(w * 0.5 - 52, h * 0.25, 22, 0, Math.PI * 2);
    ctx.arc(w * 0.5 + 52, h * 0.25, 22, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.86, 66, 52, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.9, 42, 34, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Head
    const headGrad = ctx.createRadialGradient(w * 0.45, h * 0.42, 10, w * 0.5, h * 0.47, 68);
    headGrad.addColorStop(0, '#FFFFFF');
    headGrad.addColorStop(1, '#E2E8F0');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.48, 66, 58, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye patches
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.ellipse(w * 0.5 - 24, h * 0.46, 17, 21, -0.25, 0, Math.PI * 2);
    ctx.ellipse(w * 0.5 + 24, h * 0.46, 17, 21, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(w * 0.5 - 22, h * 0.44, 6, 0, Math.PI * 2);
    ctx.arc(w * 0.5 + 22, h * 0.44, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(w * 0.5 - 21, h * 0.44, 3, 0, Math.PI * 2);
    ctx.arc(w * 0.5 + 21, h * 0.44, 3, 0, Math.PI * 2);
    ctx.fill();

    // Nose & smile
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.56, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w * 0.5 - 8, h * 0.62, 8, 0, Math.PI * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w * 0.5 + 8, h * 0.62, 8, Math.PI * 0.1, Math.PI);
    ctx.stroke();
    return;
  }

  // City sunset scene
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#FB7185');
  sky.addColorStop(0.55, '#FDBA74');
  sky.addColorStop(1, '#FEF08A');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Giant Sun
  ctx.fillStyle = '#FFFBEB';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.45, 48, 0, Math.PI * 2);
  ctx.fill();

  // Clouds
  ctx.fillStyle = '#FFE4E6';
  ctx.beginPath();
  ctx.ellipse(w * 0.22, h * 0.22, 42, 14, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.76, h * 0.26, 48, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Buildings
  const buildings = [
    { x: 16, y: 120, bw: 56, bh: 150, c: '#312E81' },
    { x: 80, y: 84, bw: 62, bh: 186, c: '#4338CA' },
    { x: 152, y: 132, bw: 58, bh: 138, c: '#1E1B4B' },
    { x: 220, y: 95, bw: 66, bh: 175, c: '#3730A3' },
    { x: 294, y: 128, bw: 54, bh: 142, c: '#312E81' },
  ];
  buildings.forEach((b) => {
    ctx.fillStyle = b.c;
    ctx.fillRect(b.x, b.y, b.bw, b.bh);
    ctx.fillStyle = '#FDE047';
    for (let wy = b.y + 14; wy < h - 24; wy += 22) {
      for (let wx = b.x + 10; wx < b.x + b.bw - 12; wx += 18) {
        ctx.fillRect(wx, wy, 9, 12);
      }
    }
  });
}

function drawFaceSampleScene(
  ctx: CanvasRenderingContext2D,
  sample: FaceSampleId,
  w: number,
  h: number
): DetectedFace[] {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#DBEAFE');
  bg.addColorStop(1, '#F8FAFC');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle studio grid lines
  ctx.strokeStyle = 'rgba(148,163,184,0.22)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx < w; gx += 28) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
    ctx.stroke();
  }
  for (let gy = 0; gy < h; gy += 28) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }

  const drawSinglePerson = (
    cx: number,
    cy: number,
    scale: number,
    shirtColor: string,
    hairColor: string,
    mood: 'smile' | 'focus' | 'surprised',
    confidence: number
  ): DetectedFace => {
    const rx = 46 * scale;
    const ry = 54 * scale;

    // Shoulders
    ctx.fillStyle = shirtColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + ry * 1.65, rx * 1.45, ry * 0.85, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = '#EAB694';
    ctx.fillRect(cx - 12 * scale, cy + ry * 0.72, 24 * scale, 24 * scale);

    // Ears
    ctx.fillStyle = '#EAB694';
    ctx.beginPath();
    ctx.arc(cx - rx, cy + 2 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.arc(cx + rx, cy + 2 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Face oval
    const skin = ctx.createRadialGradient(cx - 10 * scale, cy - 10 * scale, 8, cx, cy, ry * 1.15);
    skin.addColorStop(0, '#FFE4CC');
    skin.addColorStop(1, '#E6A882');
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.56, rx * 1.08, ry * 0.58, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    const eyeY = cy - 6 * scale;
    const leftEye = { x: cx - 18 * scale, y: eyeY };
    const rightEye = { x: cx + 18 * scale, y: eyeY };
    const nose = { x: cx, y: cy + 12 * scale };
    const mouth = { x: cx, y: cy + 29 * scale };

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(leftEye.x, leftEye.y, 9 * scale, (mood === 'surprised' ? 9 : 6.5) * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(rightEye.x, rightEye.y, 9 * scale, (mood === 'surprised' ? 9 : 6.5) * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(leftEye.x, leftEye.y, 4.5 * scale, 0, Math.PI * 2);
    ctx.arc(rightEye.x, rightEye.y, 4.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = hairColor;
    ctx.lineWidth = 3 * scale;
    ctx.lineCap = 'round';
    const browLift = mood === 'surprised' ? 18 * scale : 13 * scale;
    ctx.beginPath();
    ctx.moveTo(leftEye.x - 10 * scale, eyeY - browLift);
    ctx.quadraticCurveTo(leftEye.x, eyeY - browLift - 5 * scale, leftEye.x + 9 * scale, eyeY - browLift);
    ctx.moveTo(rightEye.x - 9 * scale, eyeY - browLift);
    ctx.quadraticCurveTo(rightEye.x, eyeY - browLift - 5 * scale, rightEye.x + 10 * scale, eyeY - browLift);
    ctx.stroke();

    // Nose
    ctx.strokeStyle = '#BC7A57';
    ctx.lineWidth = 2.2 * scale;
    ctx.beginPath();
    ctx.moveTo(nose.x, nose.y - 8 * scale);
    ctx.lineTo(nose.x - 4 * scale, nose.y + 2 * scale);
    ctx.lineTo(nose.x + 4 * scale, nose.y + 2 * scale);
    ctx.stroke();

    // Mouth
    if (mood === 'surprised') {
      ctx.fillStyle = '#9F1239';
      ctx.beginPath();
      ctx.ellipse(mouth.x, mouth.y, 9 * scale, 11 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (mood === 'focus') {
      ctx.strokeStyle = '#9F1239';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(mouth.x - 12 * scale, mouth.y);
      ctx.quadraticCurveTo(mouth.x, mouth.y + 3 * scale, mouth.x + 12 * scale, mouth.y - 1 * scale);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#BE123C';
      ctx.lineWidth = 3.2 * scale;
      ctx.beginPath();
      ctx.arc(mouth.x, mouth.y - 6 * scale, 14 * scale, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }

    return {
      x: Math.round(cx - rx - 8 * scale),
      y: Math.round(cy - ry - 10 * scale),
      w: Math.round((rx + 8 * scale) * 2),
      h: Math.round((ry + 10 * scale) * 2),
      confidence,
      expression:
        mood === 'smile' ? 'Senang' : mood === 'surprised' ? 'Terkejut' : 'Fokus',
      leftEye,
      rightEye,
      nose,
      mouth,
    };
  };

  if (sample === 'smile') {
    return [drawSinglePerson(w * 0.5, h * 0.48, 1.05, '#2563EB', '#1E293B', 'smile', 98.6)];
  }
  if (sample === 'surprised') {
    return [drawSinglePerson(w * 0.5, h * 0.48, 1.05, '#7C3AED', '#451A03', 'surprised', 96.4)];
  }
  // Group (2 faces)
  return [
    drawSinglePerson(w * 0.31, h * 0.5, 0.82, '#0EA5E9', '#1E293B', 'smile', 97.9),
    drawSinglePerson(w * 0.7, h * 0.48, 0.82, '#EC4899', '#3F2718', 'focus', 95.2),
  ];
}

// Real YCbCr skin-region face blob estimator for uploaded images & live webcam frames
function detectFacesFromPixels(imageData: ImageData): DetectedFace[] {
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

  // Fallback centered portrait box if lighting/image has low skin match
  if (skinCount < 40 || maxX - minX < 32 || maxY - minY < 32) {
    const bw = Math.round(width * 0.36);
    const bh = Math.round(height * 0.48);
    const bx = Math.round((width - bw) / 2);
    const by = Math.round((height - bh) / 2 - 8);
    return [
      {
        x: bx,
        y: by,
        w: bw,
        h: bh,
        confidence: 88.5,
        expression: 'Terdeteksi',
        leftEye: { x: bx + bw * 0.34, y: by + bh * 0.38 },
        rightEye: { x: bx + bw * 0.66, y: by + bh * 0.38 },
        nose: { x: bx + bw * 0.5, y: by + bh * 0.56 },
        mouth: { x: bx + bw * 0.5, y: by + bh * 0.74 },
      },
    ];
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
      confidence: Math.min(99.1, Math.round((89 + Math.min(skinCount, 400) / 40) * 10) / 10),
      expression: 'Wajah Aktif',
      leftEye: { x: bx + bw * 0.33, y: by + bh * 0.37 },
      rightEye: { x: bx + bw * 0.67, y: by + bh * 0.37 },
      nose: { x: bx + bw * 0.5, y: by + bh * 0.56 },
      mouth: { x: bx + bw * 0.5, y: by + bh * 0.75 },
    },
  ];
}

// Real pixel-level Cartoonizer (Color Quantization + Sobel Edge Outline)
function applyCartoonFilterToCanvas(
  srcCanvas: HTMLCanvasElement,
  dstCanvas: HTMLCanvasElement,
  opts: {
    levels: number;
    edgeThreshold: number;
    style: 'komik' | 'anime' | 'sketsa';
    viewMode: 'cartoon' | 'split' | 'original';
  }
): number {
  const t0 = performance.now();
  const w = srcCanvas.width;
  const h = srcCanvas.height;
  dstCanvas.width = w;
  dstCanvas.height = h;

  const sCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
  const dCtx = dstCanvas.getContext('2d');
  if (!sCtx || !dCtx) return 0;

  const srcData = sCtx.getImageData(0, 0, w, h);
  const src = srcData.data;

  if (opts.viewMode === 'original') {
    dCtx.putImageData(srcData, 0, 0);
    return Math.round((performance.now() - t0) * 10) / 10;
  }

  // Grayscale buffer for Sobel edge detection
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    gray[i] = 0.299 * src[idx] + 0.587 * src[idx + 1] + 0.114 * src[idx + 2];
  }

  const outData = dCtx.createImageData(w, h);
  const out = outData.data;
  const step = 255 / Math.max(2, opts.levels - 1);
  const splitX = Math.floor(w / 2);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const idx = p * 4;

      if (opts.viewMode === 'split' && x < splitX) {
        out[idx] = src[idx];
        out[idx + 1] = src[idx + 1];
        out[idx + 2] = src[idx + 2];
        out[idx + 3] = 255;
        continue;
      }

      // Compute Sobel gradient magnitude
      let mag = 0;
      if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
        const tl = gray[(y - 1) * w + (x - 1)];
        const tc = gray[(y - 1) * w + x];
        const tr = gray[(y - 1) * w + (x + 1)];
        const ml = gray[y * w + (x - 1)];
        const mr = gray[y * w + (x + 1)];
        const bl = gray[(y + 1) * w + (x - 1)];
        const bc = gray[(y + 1) * w + x];
        const br = gray[(y + 1) * w + (x + 1)];

        const gx = -tl + tr - 2 * ml + 2 * mr - bl + br;
        const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
        mag = Math.sqrt(gx * gx + gy * gy);
      }

      const isEdge = mag > opts.edgeThreshold;

      if (opts.style === 'sketsa') {
        const shade = isEdge ? 20 : gray[p] > 165 ? 252 : gray[p] > 105 ? 215 : 150;
        out[idx] = shade;
        out[idx + 1] = shade;
        out[idx + 2] = Math.min(255, shade + 6);
        out[idx + 3] = 255;
        continue;
      }

      if (isEdge) {
        out[idx] = 18;
        out[idx + 1] = 20;
        out[idx + 2] = 28;
        out[idx + 3] = 255;
        continue;
      }

      let r = Math.round(src[idx] / step) * step;
      let g = Math.round(src[idx + 1] / step) * step;
      let b = Math.round(src[idx + 2] / step) * step;

      if (opts.style === 'anime') {
        // Boost saturation & warm brightness
        const avg = (r + g + b) / 3;
        r = Math.min(255, Math.max(0, avg + (r - avg) * 1.45 + 14));
        g = Math.min(255, Math.max(0, avg + (g - avg) * 1.38 + 10));
        b = Math.min(255, Math.max(0, avg + (b - avg) * 1.42 + 12));
      } else {
        // Komik Pop punchy boost
        const avg = (r + g + b) / 3;
        r = Math.min(255, Math.max(0, avg + (r - avg) * 1.25));
        g = Math.min(255, Math.max(0, avg + (g - avg) * 1.25));
        b = Math.min(255, Math.max(0, avg + (b - avg) * 1.25));
      }

      out[idx] = r;
      out[idx + 1] = g;
      out[idx + 2] = b;
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

// ===================== 1. CARTOONIZER AI LIVE LAB =====================

const CartoonizerLiveLab: React.FC<{
  ready: boolean;
  onMissionSuccess: () => void;
}> = ({ ready, onMissionSuccess }) => {
  const [sample, setSample] = useState<CartoonSampleId>('student');
  const [style, setStyle] = useState<'komik' | 'anime' | 'sketsa'>('komik');
  const [levels, setLevels] = useState(5);
  const [edgeThreshold, setEdgeThreshold] = useState(56);
  const [viewMode, setViewMode] = useState<'cartoon' | 'split' | 'original'>('cartoon');
  const [sourceKind, setSourceKind] = useState<'sample' | 'upload' | 'camera'>('sample');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [inferenceMs, setInferenceMs] = useState(0);
  const [testedCount, setTestedCount] = useState(0);
  const [missionCleared, setMissionCleared] = useState(false);

  const srcCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dstCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const uploadedImgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const runCartoonPipeline = useCallback(() => {
    const srcCanvas = srcCanvasRef.current;
    const dstCanvas = dstCanvasRef.current;
    if (!srcCanvas || !dstCanvas) return;

    const w = 360;
    const h = 250;
    srcCanvas.width = w;
    srcCanvas.height = h;
    const sCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
    if (!sCtx) return;

    if (sourceKind === 'sample') {
      drawCartoonSampleScene(sCtx, sample, w, h);
    } else if (sourceKind === 'upload' && uploadedImgRef.current) {
      sCtx.fillStyle = '#0F172A';
      sCtx.fillRect(0, 0, w, h);
      const img = uploadedImgRef.current;
      const scale = Math.max(w / img.width, h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      sCtx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else if (sourceKind === 'camera' && videoRef.current && videoRef.current.readyState >= 2) {
      sCtx.drawImage(videoRef.current, 0, 0, w, h);
    } else {
      drawCartoonSampleScene(sCtx, sample, w, h);
    }

    const ms = applyCartoonFilterToCanvas(srcCanvas, dstCanvas, {
      levels,
      edgeThreshold,
      style,
      viewMode,
    });
    setInferenceMs(ms);
  }, [sample, style, levels, edgeThreshold, viewMode, sourceKind]);

  useEffect(() => {
    runCartoonPipeline();
  }, [runCartoonPipeline]);

  useEffect(() => {
    if (sourceKind !== 'camera') return;
    const timer = window.setInterval(() => {
      runCartoonPipeline();
    }, 140);
    return () => window.clearInterval(timer);
  }, [sourceKind, runCartoonPipeline]);

  const registerTestAction = () => {
    const next = testedCount + 1;
    setTestedCount(next);
    if (ready && !missionCleared) {
      setMissionCleared(true);
      soundEngine.playVictory();
      onMissionSuccess();
    } else {
      soundEngine.playGemCollect();
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    setCameraError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        uploadedImgRef.current = img;
        setSourceKind('upload');
        registerTestAction();
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleToggleCamera = async () => {
    if (sourceKind === 'camera') {
      stopCamera();
      setSourceKind('sample');
      return;
    }
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Kamera tidak tersedia pada peramban ini.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 360, height: 250, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setSourceKind('camera');
      registerTestAction();
    } catch {
      setCameraError('Izin kamera tidak tersedia. Gunakan Sampel Potret atau Unggah Foto!');
      soundEngine.playCrash();
    }
  };

  const handleDownload = () => {
    const canvas = dstCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `codespark-cartoon-${style}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    registerTestAction();
  };

  return (
    <div className="space-y-3">
      <canvas ref={srcCanvasRef} className="hidden" />
      <video ref={videoRef} className="hidden" playsInline muted />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {/* Source Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'student' as const, label: 'Potret Siswa' },
            { id: 'panda' as const, label: 'Panda Studio' },
            { id: 'city' as const, label: 'Kota Senja' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                stopCamera();
                setSample(item.id);
                setSourceKind('sample');
                soundEngine.playButtonClick();
              }}
              className={`px-2.5 py-1 border-2 border-black text-[11px] font-extrabold cursor-pointer ${
                sourceKind === 'sample' && sample === item.id ? 'bg-[#FDBA74]' : 'bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="neo-btn bg-[#FFE600] px-2.5 py-1 text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Unggah Foto
          </button>
          <button
            type="button"
            onClick={() => void handleToggleCamera()}
            className={`neo-btn px-2.5 py-1 text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer ${
              sourceKind === 'camera' ? 'bg-[#FB7185]' : 'bg-[#38BDF8]'
            }`}
          >
            {sourceKind === 'camera' ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                Stop Kamera
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                Kamera
              </>
            )}
          </button>
        </div>
      </div>

      {cameraError && (
        <div className="p-2 bg-[#FB7185]/25 border-2 border-black text-[11px] font-bold">
          {cameraError}
        </div>
      )}

      {/* Live Output Canvas */}
      <div className="relative border-[3px] border-black bg-[#0F172A] overflow-hidden">
        <canvas ref={dstCanvasRef} className="w-full h-auto block" />
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 text-[#FFE600] font-mono text-[10px] font-extrabold border border-white/25">
          {viewMode === 'cartoon'
            ? `KARTUN AI · ${style.toUpperCase()}`
            : viewMode === 'split'
              ? 'ASLI ◀ | ▶ KARTUN AI'
              : 'CITRA ASLI'}
        </div>
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 text-[#4ADE80] font-mono text-[10px] font-bold border border-white/25">
          {inferenceMs} ms
        </div>
      </div>

      {/* Style Presets + View Mode */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: 'komik' as const, label: 'Komik Pop', color: '#FDBA74' },
          { id: 'anime' as const, label: 'Anime Cerah', color: '#C084FC' },
          { id: 'sketsa' as const, label: 'Sketsa Tinta', color: '#E2E8F0' },
        ].map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => {
              setStyle(st.id);
              registerTestAction();
            }}
            className="border-2 border-black py-2 px-2 text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1"
            style={{
              backgroundColor: style === st.id ? st.color : '#FFFFFF',
              boxShadow: style === st.id ? '2px 2px 0px #000' : 'none',
            }}
          >
            <Palette className="w-3.5 h-3.5" />
            {st.label}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="grid sm:grid-cols-2 gap-3 p-3 bg-[#FFFDF7] border-2 border-black text-xs">
        <label className="space-y-1 font-bold block">
          <div className="flex justify-between">
            <span className="inline-flex items-center gap-1">
              <Sliders className="w-3 h-3" />
              Level Warna (Posterize)
            </span>
            <span className="font-mono">{levels}</span>
          </div>
          <input
            type="range"
            min={3}
            max={10}
            value={levels}
            onChange={(e) => setLevels(Number(e.target.value))}
            className="w-full accent-black cursor-pointer"
          />
        </label>

        <label className="space-y-1 font-bold block">
          <div className="flex justify-between">
            <span>Ketebalan Tepi Sobel</span>
            <span className="font-mono">{edgeThreshold}</span>
          </div>
          <input
            type="range"
            min={24}
            max={110}
            value={edgeThreshold}
            onChange={(e) => setEdgeThreshold(Number(e.target.value))}
            className="w-full accent-black cursor-pointer"
          />
        </label>
      </div>

      {/* View Mode & Export Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {[
            { id: 'cartoon' as const, label: 'Hasil Kartun' },
            { id: 'split' as const, label: 'Split 50/50' },
            { id: 'original' as const, label: 'Asli' },
          ].map((vm) => (
            <button
              key={vm.id}
              type="button"
              onClick={() => {
                setViewMode(vm.id);
                soundEngine.playButtonClick();
              }}
              className={`px-2.5 py-1.5 border-2 border-black text-[11px] font-extrabold cursor-pointer ${
                viewMode === vm.id ? 'bg-[#FFE600]' : 'bg-white'
              }`}
            >
              {vm.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="neo-btn bg-[#4ADE80] px-3 py-1.5 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Unduh PNG
        </button>
      </div>

      {!ready && (
        <div className="p-2.5 bg-[#FFE600]/45 border-2 border-black text-xs font-bold">
          Susun semua 4 blok pipeline di kiri lalu klik salah satu gaya kartun di atas untuk menyelesaikan proyek!
        </div>
      )}
    </div>
  );
};

// ===================== 2. FACE DETECTION AI LIVE LAB =====================

const FaceDetectionLiveLab: React.FC<{
  ready: boolean;
  onMissionSuccess: () => void;
}> = ({ ready, onMissionSuccess }) => {
  const [sample, setSample] = useState<FaceSampleId>('smile');
  const [sourceKind, setSourceKind] = useState<'sample' | 'upload' | 'camera'>('sample');
  const [showBox, setShowBox] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showMood, setShowMood] = useState(true);
  const [arFilter, setArFilter] = useState<'none' | 'glasses' | 'crown'>('none');
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [missionCleared, setMissionCleared] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const uploadedImgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const runFaceDetection = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = 360;
    const h = 250;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let faces: DetectedFace[] = [];

    if (sourceKind === 'sample') {
      faces = drawFaceSampleScene(ctx, sample, w, h);
    } else if (sourceKind === 'upload' && uploadedImgRef.current) {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, w, h);
      const img = uploadedImgRef.current;
      const scale = Math.max(w / img.width, h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      faces = detectFacesFromPixels(ctx.getImageData(0, 0, w, h));
    } else if (sourceKind === 'camera' && videoRef.current && videoRef.current.readyState >= 2) {
      ctx.drawImage(videoRef.current, 0, 0, w, h);
      faces = detectFacesFromPixels(ctx.getImageData(0, 0, w, h));
    } else {
      faces = drawFaceSampleScene(ctx, sample, w, h);
    }

    setDetectedFaces(faces);

    // Draw AI-ML Overlays
    faces.forEach((face, idx) => {
      if (showBox) {
        ctx.strokeStyle = '#4ADE80';
        ctx.lineWidth = 3;
        ctx.strokeRect(face.x, face.y, face.w, face.h);

        // Corner brackets
        const cl = 12;
        ctx.strokeStyle = '#FFE600';
        ctx.lineWidth = 4;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(face.x, face.y + cl);
        ctx.lineTo(face.x, face.y);
        ctx.lineTo(face.x + cl, face.y);
        // Top-right
        ctx.moveTo(face.x + face.w - cl, face.y);
        ctx.lineTo(face.x + face.w, face.y);
        ctx.lineTo(face.x + face.w, face.y + cl);
        // Bottom-left
        ctx.moveTo(face.x, face.y + face.h - cl);
        ctx.lineTo(face.x, face.y + face.h);
        ctx.lineTo(face.x + cl, face.y + face.h);
        // Bottom-right
        ctx.moveTo(face.x + face.w - cl, face.y + face.h);
        ctx.lineTo(face.x + face.w, face.y + face.h);
        ctx.lineTo(face.x + face.w, face.y + face.h - cl);
        ctx.stroke();
      }

      if (showMood) {
        const label = `Wajah #${idx + 1} · ${face.expression} (${face.confidence}%)`;
        ctx.font = 'bold 11px monospace';
        const tw = ctx.measureText(label).width + 12;
        const ty = Math.max(20, face.y - 6);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(face.x, ty - 16, tw, 18);
        ctx.strokeStyle = '#4ADE80';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(face.x, ty - 16, tw, 18);
        ctx.fillStyle = '#4ADE80';
        ctx.fillText(label, face.x + 6, ty - 4);
      }

      if (showLandmarks) {
        const pts = [
          { pt: face.leftEye, color: '#38BDF8' },
          { pt: face.rightEye, color: '#38BDF8' },
          { pt: face.nose, color: '#FFE600' },
          { pt: face.mouth, color: '#FB7185' },
        ];
        // Mesh lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(face.leftEye.x, face.leftEye.y);
        ctx.lineTo(face.rightEye.x, face.rightEye.y);
        ctx.lineTo(face.nose.x, face.nose.y);
        ctx.lineTo(face.leftEye.x, face.leftEye.y);
        ctx.moveTo(face.nose.x, face.nose.y);
        ctx.lineTo(face.mouth.x, face.mouth.y);
        ctx.stroke();

        pts.forEach(({ pt, color }) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }

      // AR Filters anchored to detected landmarks
      if (arFilter === 'glasses') {
        const eyeDist = Math.abs(face.rightEye.x - face.leftEye.x);
        const lensW = Math.max(20, eyeDist * 0.62);
        const lensH = Math.max(12, lensW * 0.52);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2.5;
        ctx.fillRect(face.leftEye.x - lensW / 2, face.leftEye.y - lensH / 2, lensW, lensH);
        ctx.strokeRect(face.leftEye.x - lensW / 2, face.leftEye.y - lensH / 2, lensW, lensH);
        ctx.fillRect(face.rightEye.x - lensW / 2, face.rightEye.y - lensH / 2, lensW, lensH);
        ctx.strokeRect(face.rightEye.x - lensW / 2, face.rightEye.y - lensH / 2, lensW, lensH);
        ctx.beginPath();
        ctx.moveTo(face.leftEye.x + lensW / 2, face.leftEye.y);
        ctx.lineTo(face.rightEye.x - lensW / 2, face.rightEye.y);
        ctx.stroke();
      } else if (arFilter === 'crown') {
        const cw = face.w * 0.56;
        const ch = 26;
        const cx = face.x + face.w / 2;
        const baseY = Math.max(28, face.y + 8);
        ctx.fillStyle = '#FFE600';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - cw / 2, baseY);
        ctx.lineTo(cx - cw / 2 + 4, baseY - ch);
        ctx.lineTo(cx - cw * 0.18, baseY - ch * 0.42);
        ctx.lineTo(cx, baseY - ch * 1.15);
        ctx.lineTo(cx + cw * 0.18, baseY - ch * 0.42);
        ctx.lineTo(cx + cw / 2 - 4, baseY - ch);
        ctx.lineTo(cx + cw / 2, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });
  }, [sample, sourceKind, showBox, showLandmarks, showMood, arFilter]);

  useEffect(() => {
    runFaceDetection();
  }, [runFaceDetection]);

  useEffect(() => {
    if (sourceKind !== 'camera') return;
    const timer = window.setInterval(() => {
      runFaceDetection();
    }, 140);
    return () => window.clearInterval(timer);
  }, [sourceKind, runFaceDetection]);

  const markMissionIfReady = () => {
    if (ready && !missionCleared) {
      setMissionCleared(true);
      soundEngine.playVictory();
      onMissionSuccess();
    } else {
      soundEngine.playGemCollect();
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    setCameraError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        uploadedImgRef.current = img;
        setSourceKind('upload');
        markMissionIfReady();
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleToggleCamera = async () => {
    if (sourceKind === 'camera') {
      stopCamera();
      setSourceKind('sample');
      return;
    }
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Kamera tidak tersedia pada peramban ini.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 360, height: 250, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setSourceKind('camera');
      markMissionIfReady();
    } catch {
      setCameraError('Izin kamera tidak tersedia. Gunakan Sampel Potret atau Unggah Foto!');
      soundEngine.playCrash();
    }
  };

  return (
    <div className="space-y-3">
      <video ref={videoRef} className="hidden" playsInline muted />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {/* Source Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'smile' as const, label: '1 Wajah (Senyum)' },
            { id: 'group' as const, label: '2 Wajah (Grup)' },
            { id: 'surprised' as const, label: 'Ekspresi Kaget' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                stopCamera();
                setSample(item.id);
                setSourceKind('sample');
                soundEngine.playButtonClick();
              }}
              className={`px-2.5 py-1 border-2 border-black text-[11px] font-extrabold cursor-pointer ${
                sourceKind === 'sample' && sample === item.id ? 'bg-[#34D399]' : 'bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="neo-btn bg-[#FFE600] px-2.5 py-1 text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Unggah Foto
          </button>
          <button
            type="button"
            onClick={() => void handleToggleCamera()}
            className={`neo-btn px-2.5 py-1 text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer ${
              sourceKind === 'camera' ? 'bg-[#FB7185]' : 'bg-[#38BDF8]'
            }`}
          >
            {sourceKind === 'camera' ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                Stop Kamera
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                Kamera
              </>
            )}
          </button>
        </div>
      </div>

      {cameraError && (
        <div className="p-2 bg-[#FB7185]/25 border-2 border-black text-[11px] font-bold">
          {cameraError}
        </div>
      )}

      {/* Detection Stage */}
      <div className="relative border-[3px] border-black bg-[#0F172A] overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-auto block" />
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/85 text-[#4ADE80] font-mono text-[10px] font-extrabold border border-white/25 inline-flex items-center gap-1.5">
          <ScanFace className="w-3.5 h-3.5" />
          TERDETEKSI: {detectedFaces.length} WAJAH
        </div>
      </div>

      {/* Vision Overlay Toggles */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            setShowBox((v) => !v);
            soundEngine.playButtonClick();
          }}
          className={`border-2 border-black py-1.5 px-2 text-[11px] font-extrabold cursor-pointer ${
            showBox ? 'bg-[#4ADE80]' : 'bg-white'
          }`}
        >
          Kotak Wajah: {showBox ? 'ON' : 'OFF'}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowLandmarks((v) => !v);
            soundEngine.playButtonClick();
          }}
          className={`border-2 border-black py-1.5 px-2 text-[11px] font-extrabold cursor-pointer ${
            showLandmarks ? 'bg-[#38BDF8]' : 'bg-white'
          }`}
        >
          Landmark: {showLandmarks ? 'ON' : 'OFF'}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowMood((v) => !v);
            soundEngine.playButtonClick();
          }}
          className={`border-2 border-black py-1.5 px-2 text-[11px] font-extrabold cursor-pointer ${
            showMood ? 'bg-[#FFE600]' : 'bg-white'
          }`}
        >
          Skor AI: {showMood ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* AR Filter + Scan Verify Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#FFFDF7] border-2 border-black">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-extrabold">Filter AR:</span>
          {[
            { id: 'none' as const, label: 'Off' },
            { id: 'glasses' as const, label: 'Kacamata Cyber' },
            { id: 'crown' as const, label: 'Mahkota Juara' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setArFilter(f.id);
                markMissionIfReady();
              }}
              className={`px-2 py-1 border-2 border-black text-[11px] font-extrabold cursor-pointer ${
                arFilter === f.id ? 'bg-[#C084FC]' : 'bg-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            runFaceDetection();
            markMissionIfReady();
          }}
          className="neo-btn bg-[#4ADE80] px-3 py-1.5 text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          Pindai &amp; Verifikasi
        </button>
      </div>

      {!ready && (
        <div className="p-2.5 bg-[#FFE600]/45 border-2 border-black text-xs font-bold">
          Susun semua 4 blok pipeline Face Detection di kiri lalu uji Filter AR / Pindai untuk menyelesaikan proyek!
        </div>
      )}
    </div>
  );
};

// ===================== MAIN AI-ML WORKSPACE =====================

export const AiMlWorkspace: React.FC<Props> = ({
  hasAccess,
  isAdminPreview = false,
  requestedAiMl = false,
  initialProjectId = null,
  completedProgressMap,
  adminPhone = '',
  adminContactName = 'Admin CodeSpark',
  onRequestUpgrade,
  onProjectComplete,
  onOpenCertificates,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<AiMlProjectId | null>(
    initialProjectId
  );
  const [editorMode, setEditorMode] = useState<'blocks' | 'code'>('blocks');
  const [activeStepIds, setActiveStepIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [completedBanner, setCompletedBanner] = useState<{
    projectTitle: string;
    newCertificate: CertificateRecord | null;
  } | null>(null);

  useEffect(() => {
    setSelectedProjectId(initialProjectId);
  }, [initialProjectId]);

  const isProjectUnlocked = (project: AiMlProjectDefinition): boolean => {
    if (isAdminPreview) return true;
    if (project.order === 1) return true;
    const prev = AI_ML_PROJECTS.find((p) => p.order === project.order - 1);
    return prev ? completedProgressMap.has(prev.id) : true;
  };

  const openProject = (proj: AiMlProjectDefinition) => {
    if (!isProjectUnlocked(proj)) {
      soundEngine.playCrash();
      return;
    }
    soundEngine.playButtonClick();
    setSelectedProjectId(proj.id);
    setCompletedBanner(null);
    if (completedProgressMap.has(proj.id) || isAdminPreview) {
      setActiveStepIds(proj.steps.map((s) => s.id));
    } else {
      setActiveStepIds([proj.steps[0].id]);
    }
  };

  useEffect(() => {
    if (!selectedProjectId) return;
    const proj = getAiMlProjectById(selectedProjectId);
    if (completedProgressMap.has(proj.id) || isAdminPreview) {
      setActiveStepIds(proj.steps.map((s) => s.id));
    } else {
      setActiveStepIds([proj.steps[0].id]);
    }
  }, [selectedProjectId, completedProgressMap, isAdminPreview]);

  // ==================== LOCKED ACCESS GATE ====================
  if (!hasAccess && !isAdminPreview) {
    const waUrl = formatWhatsAppUrl(
      adminPhone,
      `Halo ${adminContactName}, saya ingin mengaktifkan akses Program AI-ML (Cartoonizer & Face Detection) pada akun CodeSpark saya.`
    );

    return (
      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 text-black">
        <div className="neo-card bg-white p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-[3px] border-black">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-[#FDBA74] border-[3px] border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FFE600] border border-black text-[11px] font-extrabold mb-1">
                  <Cpu className="w-3.5 h-3.5" />
                  PROGRAM PANDUAN AI-ML (2 PROYEK VISION)
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
                  Program AI-ML Belum Aktif di Akun Anda
                </h1>
              </div>
            </div>
            {requestedAiMl && (
              <span className="px-3 py-1.5 bg-[#FFE600] border-2 border-black text-xs font-extrabold self-start sm:self-center">
                Permintaan Anda Terkirim ke Admin
              </span>
            )}
          </div>

          <p className="text-sm text-neutral-700 leading-relaxed">
            Program <strong>AI-ML</strong> mengajak siswa membangun dan menguji 2 proyek{' '}
            <strong>Computer Vision &amp; Machine Learning</strong> secara bertahap langsung di browser.
            Minta Admin membuka akses secara manual di akun Anda atau masukkan{' '}
            <strong>Kode Akses yang menyertakan AI-ML</strong>.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {AI_ML_PROJECTS.map((proj) => (
              <div
                key={proj.id}
                className="p-4 bg-[#FFFDF7] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2 opacity-90"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-2 py-0.5 border border-black font-mono text-[11px] font-extrabold"
                    style={{ backgroundColor: proj.accentColor }}
                  >
                    {proj.badge}
                  </span>
                  <Lock className="w-4 h-4 text-neutral-500" />
                </div>
                <div className="font-display font-extrabold text-base">{proj.title}</div>
                <p className="text-xs text-neutral-600 leading-relaxed">{proj.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {onRequestUpgrade && (
              <button
                type="button"
                onClick={onRequestUpgrade}
                className="neo-btn bg-[#FFE600] px-5 py-3 text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                Masukkan Kode Akses AI-ML
              </button>
            )}
            {waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-btn bg-[#4ADE80] px-5 py-3 text-sm font-extrabold inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Hubungi Admin via WhatsApp
              </a>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-100 border-2 border-black text-xs font-bold">
                <Phone className="w-4 h-4" />
                Hubungi Admin/Instruktur Anda untuk mengaktifkan akses AI-ML.
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ==================== PROJECT ROADMAP VIEW ====================
  if (!selectedProjectId) {
    const doneCount = AI_ML_PROJECTS.filter((p) => completedProgressMap.has(p.id)).length;
    const pct = Math.round((doneCount / AI_ML_PROJECTS.length) * 100);

    return (
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-black">
        <div className="neo-card bg-white p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FDBA74] border-2 border-black text-xs font-extrabold mb-2">
              <Cpu className="w-3.5 h-3.5" />
              {isAdminPreview
                ? 'Pratinjau Penuh Admin · Semua Proyek AI-ML Terbuka'
                : 'Program Panduan AI-ML · Terbuka Bertahap'}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
              AI-ML Vision Studio (Cartoonizer &amp; Face Detection)
            </h1>
            <p className="text-xs sm:text-sm text-neutral-700 mt-1">
              Selesaikan Cartoonizer AI terlebih dahulu untuk membuka Face Detection AI dan raih Sertifikat Kelulusan AI-ML!
            </p>
          </div>

          <div className="w-full md:w-64 space-y-1.5 shrink-0">
            <div className="flex justify-between text-xs font-extrabold tabular-nums">
              <span>Progres AI-ML</span>
              <span>
                {doneCount}/{AI_ML_PROJECTS.length} Proyek ({pct}%)
              </span>
            </div>
            <div className="h-3.5 bg-[#FFFDF7] border-2 border-black">
              <div className="h-full bg-[#FDBA74]" style={{ width: `${pct}%` }} />
            </div>
            {doneCount === AI_ML_PROJECTS.length && onOpenCertificates && (
              <button
                type="button"
                onClick={onOpenCertificates}
                className="neo-btn bg-[#FFE600] w-full py-1.5 text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Award className="w-4 h-4" />
                Lihat Sertifikat AI-ML
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {AI_ML_PROJECTS.map((proj) => {
            const prog = completedProgressMap.get(proj.id);
            const unlocked = isProjectUnlocked(proj);
            const completed = Boolean(prog);

            return (
              <div
                key={proj.id}
                className={`neo-card p-6 flex flex-col justify-between gap-4 ${
                  unlocked ? 'bg-white' : 'bg-neutral-100 opacity-85'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="px-2.5 py-1 border-2 border-black font-mono text-xs font-extrabold"
                      style={{ backgroundColor: unlocked ? proj.accentColor : '#E5E5E5' }}
                    >
                      {proj.badge} · {proj.difficulty}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            prog && s <= prog.stars
                              ? 'fill-[#FFE600] text-black'
                              : 'text-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-display text-2xl font-extrabold">{proj.title}</h2>
                    <p className="text-xs sm:text-sm text-neutral-700 mt-1 leading-relaxed">
                      {proj.subtitle}
                    </p>
                  </div>

                  <div className="p-3 bg-[#FFFDF7] border-2 border-black text-xs">
                    <span className="font-extrabold">Konsep AI-ML: </span>
                    <span className="text-neutral-700">{proj.concept}</span>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-black/15 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold inline-flex items-center gap-1.5">
                    {completed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        Selesai
                      </>
                    ) : unlocked ? (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Siap Dikerjakan
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-neutral-600" />
                        Terkunci (Selesaikan Proyek 0{proj.order - 1})
                      </>
                    )}
                  </span>

                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => openProject(proj)}
                    className={`neo-btn px-4 py-2 text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer ${
                      completed ? 'bg-[#FFE600]' : unlocked ? 'bg-[#4ADE80]' : 'bg-neutral-200'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    {completed ? 'Buka Ulang' : unlocked ? 'Mulai Lab AI' : 'Terkunci'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    );
  }

  // ==================== ACTIVE AI-ML PROJECT WORKSPACE ====================
  const project = getAiMlProjectById(selectedProjectId);
  const allStepsReady = project.steps.every((s) => activeStepIds.includes(s.id));
  const generatedCode = buildAiMlCodeFromSteps(project, activeStepIds);
  const nextProject = AI_ML_PROJECTS.find((p) => p.order === project.order + 1);

  const toggleStep = (stepId: string) => {
    soundEngine.playBlockSnap();
    setActiveStepIds((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  };

  const handleSelectAllSteps = () => {
    soundEngine.playBlockSnap();
    setActiveStepIds(project.steps.map((s) => s.id));
  };

  const handleCompleteProject = async () => {
    if (!allStepsReady) {
      soundEngine.playCrash();
      return;
    }
    setSaving(true);
    try {
      const res = await onProjectComplete({
        projectId: project.id,
        stars: 3,
        codeSubmitted: generatedCode,
      });
      setCompletedBanner({
        projectTitle: project.title,
        newCertificate: res.newCertificate,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5 text-black">
      {/* Top Project Bar */}
      <div className="neo-card bg-white p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              setSelectedProjectId(null);
            }}
            className="neo-btn bg-white px-3 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Daftar Proyek AI-ML
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 border-2 border-black font-mono text-[11px] font-extrabold"
                style={{ backgroundColor: project.accentColor }}
              >
                {project.badge}
              </span>
              <h1 className="font-display text-xl font-extrabold">{project.title}</h1>
            </div>
            <p className="text-xs text-neutral-600">{project.concept}</p>
          </div>
        </div>

        <button
          type="button"
          disabled={!allStepsReady || saving}
          onClick={() => void handleCompleteProject()}
          className={`neo-btn px-4 py-2 text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer ${
            allStepsReady ? 'bg-[#4ADE80]' : 'bg-neutral-200 text-neutral-500'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {saving ? 'Menyimpan...' : 'Simpan & Selesaikan Proyek'}
        </button>
      </div>

      {completedBanner && (
        <div className="neo-card bg-[#4ADE80] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="font-display font-extrabold text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Proyek "{completedBanner.projectTitle}" Selesai (3 Bintang)!
            </div>
            <p className="text-xs font-bold">
              {completedBanner.newCertificate
                ? 'Selamat! Seluruh proyek AI-ML tuntas — Sertifikat AI-ML telah diterbitkan otomatis!'
                : nextProject
                  ? `Proyek berikutnya "${nextProject.title}" kini telah terbuka!`
                  : 'Progres AI-ML berhasil tersimpan ke database.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {nextProject && (
              <button
                type="button"
                onClick={() => openProject(nextProject)}
                className="neo-btn bg-[#FFE600] px-4 py-2 text-xs font-extrabold cursor-pointer"
              >
                Lanjut ke {nextProject.title} →
              </button>
            )}
            {completedBanner.newCertificate && onOpenCertificates && (
              <button
                type="button"
                onClick={onOpenCertificates}
                className="neo-btn bg-white px-4 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                Lihat Sertifikat
              </button>
            )}
          </div>
        </div>
      )}

      {/* Split Builder + Interactive AI Vision Stage */}
      <div className="grid lg:grid-cols-12 gap-5 items-start">
        {/* Left: Guided Pipeline Builder */}
        <section className="lg:col-span-5 neo-card bg-white p-5 space-y-4">
          <div className="p-3 bg-[#FFE600]/45 border-2 border-black text-xs leading-relaxed">
            <div className="font-extrabold mb-0.5">Misi Proyek AI-ML:</div>
            <p>{project.mission}</p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setEditorMode('blocks')}
                className={`neo-btn px-3 py-1.5 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer ${
                  editorMode === 'blocks' ? 'bg-[#FDBA74]' : 'bg-white'
                }`}
              >
                <Blocks className="w-3.5 h-3.5" />
                Blok Pipeline ({activeStepIds.length}/{project.steps.length})
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('code')}
                className={`neo-btn px-3 py-1.5 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer ${
                  editorMode === 'code' ? 'bg-[#38BDF8]' : 'bg-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Kode Vision JS
              </button>
            </div>
            <button
              type="button"
              onClick={handleSelectAllSteps}
              className="text-xs font-extrabold underline cursor-pointer hover:text-neutral-600 inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Pasang Semua
            </button>
          </div>

          {editorMode === 'blocks' ? (
            <div className="space-y-2.5">
              {project.steps.map((step, idx) => {
                const active = activeStepIds.includes(step.id);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => toggleStep(step.id)}
                    className={`w-full text-left p-3 border-2 border-black transition-all cursor-pointer ${
                      active
                        ? 'bg-[#FFFDF7] shadow-[3px_3px_0px_0px_#000]'
                        : 'bg-neutral-50 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-6 h-6 border-2 border-black flex items-center justify-center text-xs font-mono font-extrabold shrink-0 ${
                          active ? 'bg-[#4ADE80]' : 'bg-white'
                        }`}
                      >
                        {active ? '✓' : idx + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className="px-1.5 py-0.5 border border-black font-mono text-[10px] font-extrabold"
                            style={{ backgroundColor: CATEGORY_COLORS[step.category] || '#FFE600' }}
                          >
                            {step.category}
                          </span>
                          <span className="font-display font-extrabold text-xs sm:text-sm">
                            {step.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-700 leading-snug">
                          {step.explanation}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3.5 bg-neutral-950 text-[#4ADE80] border-2 border-black font-mono text-xs overflow-x-auto max-h-[380px]">
              <pre className="whitespace-pre-wrap leading-relaxed">{generatedCode}</pre>
            </div>
          )}
        </section>

        {/* Right: Live AI-ML Interactive Simulator */}
        <section className="lg:col-span-7 neo-card bg-white p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 pb-2 border-b-2 border-black">
            <div className="font-display font-extrabold text-base flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Pratinjau Langsung: {project.title}
            </div>
            <span
              className={`px-2 py-0.5 border border-black text-[11px] font-extrabold ${
                allStepsReady ? 'bg-[#4ADE80]' : 'bg-[#FFE600]'
              }`}
            >
              {allStepsReady ? 'Model Siap (4/4 Blok)' : `Rakit Blok (${activeStepIds.length}/4)`}
            </span>
          </div>

          {project.id === 'aiml_cartoonizer' ? (
            <CartoonizerLiveLab
              ready={allStepsReady}
              onMissionSuccess={() => void handleCompleteProject()}
            />
          ) : (
            <FaceDetectionLiveLab
              ready={allStepsReady}
              onMissionSuccess={() => void handleCompleteProject()}
            />
          )}
        </section>
      </div>
    </main>
  );
};
