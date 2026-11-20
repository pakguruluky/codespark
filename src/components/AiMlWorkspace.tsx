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
  FlipHorizontal2,
  SwitchCamera,
  Pause,
  Loader2,
  Zap,
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
import {
  FastCartoonizerProcessor,
  detectFacesFallbackFromPixels,
  drawSourceCover,
  mlFaceEngine,
  startRealCameraStream,
  stopMediaStream,
  type DetectedFace,
  type MlEngineStatus,
} from '../engine/mlVisionEngine';

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

const CANVAS_W = 480;
const CANVAS_H = 360;

// ===================== SHARED PROCEDURAL SAMPLE SCENES =====================
// Drawn cleanly onto canvas so sample testing works 100% offline/CORS-free

type CartoonSampleId = 'student' | 'panda' | 'city';
type FaceSampleId = 'smile' | 'group' | 'surprised';

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
    ctx.arc(w * 0.84, h * 0.2, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#86EFAC';
    ctx.beginPath();
    ctx.ellipse(w * 0.25, h * 0.96, 220, 82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4ADE80';
    ctx.beginPath();
    ctx.ellipse(w * 0.78, h * 0.98, 240, 74, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hoodie shoulders
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.94, 114, 78, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(w * 0.5 - 28, h * 0.78, 56, 36);

    // Neck
    ctx.fillStyle = '#F5C6A5';
    ctx.fillRect(w * 0.5 - 20, h * 0.63, 40, 34);

    // Ears
    ctx.fillStyle = '#F3B892';
    ctx.beginPath();
    ctx.arc(w * 0.5 - 68, h * 0.45, 17, 0, Math.PI * 2);
    ctx.arc(w * 0.5 + 68, h * 0.45, 17, 0, Math.PI * 2);
    ctx.fill();

    // Head with soft skin shading
    const skin = ctx.createRadialGradient(w * 0.47, h * 0.4, 14, w * 0.5, h * 0.45, 84);
    skin.addColorStop(0, '#FFE4CC');
    skin.addColorStop(1, '#EBB08A');
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.45, 68, 82, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.28, 74, 48, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.5 - 70, h * 0.3);
    ctx.quadraticCurveTo(w * 0.5 - 26, h * 0.14, w * 0.5 + 70, h * 0.3);
    ctx.quadraticCurveTo(w * 0.5 + 14, h * 0.34, w * 0.5 - 70, h * 0.3);
    ctx.fill();

    // Cheeks
    ctx.fillStyle = 'rgba(244, 114, 182, 0.35)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5 - 36, h * 0.51, 14, 9, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.5 + 36, h * 0.51, 14, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(w * 0.5 - 26, h * 0.43, 14, 11, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.5 + 26, h * 0.43, 14, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(w * 0.5 - 25, h * 0.43, 7, 0, Math.PI * 2);
    ctx.arc(w * 0.5 + 27, h * 0.43, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(w * 0.5 - 28, h * 0.41, 2.6, 0, Math.PI * 2);
    ctx.arc(w * 0.5 + 24, h * 0.41, 2.6, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows & Nose & Smile
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(w * 0.5 - 40, h * 0.35);
    ctx.quadraticCurveTo(w * 0.5 - 26, h * 0.31, w * 0.5 - 12, h * 0.35);
    ctx.moveTo(w * 0.5 + 12, h * 0.35);
    ctx.quadraticCurveTo(w * 0.5 + 26, h * 0.31, w * 0.5 + 40, h * 0.35);
    ctx.stroke();

    ctx.strokeStyle = '#C27D56';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.46);
    ctx.lineTo(w * 0.5 - 5, h * 0.53);
    ctx.lineTo(w * 0.5 + 5, h * 0.53);
    ctx.stroke();

    ctx.strokeStyle = '#BE123C';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.55, 22, 0.15 * Math.PI, 0.85 * Math.PI);
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
    [42, 78, w - 76, w - 38].forEach((bx) => {
      ctx.fillRect(bx, 0, 16, h);
      ctx.fillStyle = '#047857';
      for (let y = 36; y < h; y += 64) {
        ctx.fillRect(bx - 3, y, 22, 5);
      }
      ctx.fillStyle = '#059669';
    });

    // Panda ears
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(w * 0.5 - 70, h * 0.25, 29, 0, Math.PI * 2);
    ctx.arc(w * 0.5 + 70, h * 0.25, 29, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.86, 88, 72, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.9, 56, 46, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Head
    const headGrad = ctx.createRadialGradient(w * 0.45, h * 0.42, 14, w * 0.5, h * 0.47, 92);
    headGrad.addColorStop(0, '#FFFFFF');
    headGrad.addColorStop(1, '#E2E8F0');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.48, 88, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye patches
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.ellipse(w * 0.5 - 32, h * 0.46, 22, 28, -0.25, 0, Math.PI * 2);
    ctx.ellipse(w * 0.5 + 32, h * 0.46, 22, 28, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(w * 0.5 - 29, h * 0.44, 8, 0, Math.PI * 2);
    ctx.arc(w * 0.5 + 29, h * 0.44, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(w * 0.5 - 28, h * 0.44, 4, 0, Math.PI * 2);
    ctx.arc(w * 0.5 + 28, h * 0.44, 4, 0, Math.PI * 2);
    ctx.fill();

    // Nose & smile
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.56, 13, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(w * 0.5 - 11, h * 0.62, 11, 0, Math.PI * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w * 0.5 + 11, h * 0.62, 11, Math.PI * 0.1, Math.PI);
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
  ctx.arc(w * 0.5, h * 0.44, 62, 0, Math.PI * 2);
  ctx.fill();

  // Clouds
  ctx.fillStyle = '#FFE4E6';
  ctx.beginPath();
  ctx.ellipse(w * 0.22, h * 0.22, 56, 18, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.76, h * 0.26, 64, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Buildings
  const buildings = [
    { x: 20, y: 170, bw: 76, bh: 210, c: '#312E81' },
    { x: 106, y: 120, bw: 84, bh: 260, c: '#4338CA' },
    { x: 202, y: 186, bw: 78, bh: 194, c: '#1E1B4B' },
    { x: 292, y: 136, bw: 88, bh: 244, c: '#3730A3' },
    { x: 392, y: 182, bw: 72, bh: 198, c: '#312E81' },
  ];
  buildings.forEach((b) => {
    ctx.fillStyle = b.c;
    ctx.fillRect(b.x, b.y, b.bw, b.bh);
    ctx.fillStyle = '#FDE047';
    for (let wy = b.y + 18; wy < h - 24; wy += 28) {
      for (let wx = b.x + 12; wx < b.x + b.bw - 14; wx += 22) {
        ctx.fillRect(wx, wy, 12, 16);
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

  ctx.strokeStyle = 'rgba(148,163,184,0.22)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx < w; gx += 32) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
    ctx.stroke();
  }
  for (let gy = 0; gy < h; gy += 32) {
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
    const rx = 62 * scale;
    const ry = 74 * scale;

    ctx.fillStyle = shirtColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + ry * 1.65, rx * 1.45, ry * 0.85, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#EAB694';
    ctx.fillRect(cx - 16 * scale, cy + ry * 0.72, 32 * scale, 32 * scale);

    ctx.fillStyle = '#EAB694';
    ctx.beginPath();
    ctx.arc(cx - rx, cy + 2 * scale, 13 * scale, 0, Math.PI * 2);
    ctx.arc(cx + rx, cy + 2 * scale, 13 * scale, 0, Math.PI * 2);
    ctx.fill();

    const skin = ctx.createRadialGradient(cx - 12 * scale, cy - 12 * scale, 10, cx, cy, ry * 1.15);
    skin.addColorStop(0, '#FFE4CC');
    skin.addColorStop(1, '#E6A882');
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.56, rx * 1.08, ry * 0.58, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    const eyeY = cy - 8 * scale;
    const leftEye = { x: cx - 24 * scale, y: eyeY };
    const rightEye = { x: cx + 24 * scale, y: eyeY };
    const nose = { x: cx, y: cy + 16 * scale };
    const mouth = { x: cx, y: cy + 40 * scale };
    const forehead = { x: cx, y: cy - ry * 0.86 };

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(leftEye.x, leftEye.y, 12 * scale, (mood === 'surprised' ? 12 : 8.5) * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(rightEye.x, rightEye.y, 12 * scale, (mood === 'surprised' ? 12 : 8.5) * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(leftEye.x, leftEye.y, 6 * scale, 0, Math.PI * 2);
    ctx.arc(rightEye.x, rightEye.y, 6 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = hairColor;
    ctx.lineWidth = 4 * scale;
    ctx.lineCap = 'round';
    const browLift = mood === 'surprised' ? 24 * scale : 17 * scale;
    ctx.beginPath();
    ctx.moveTo(leftEye.x - 13 * scale, eyeY - browLift);
    ctx.quadraticCurveTo(leftEye.x, eyeY - browLift - 6 * scale, leftEye.x + 12 * scale, eyeY - browLift);
    ctx.moveTo(rightEye.x - 12 * scale, eyeY - browLift);
    ctx.quadraticCurveTo(rightEye.x, eyeY - browLift - 6 * scale, rightEye.x + 13 * scale, eyeY - browLift);
    ctx.stroke();

    ctx.strokeStyle = '#BC7A57';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(nose.x, nose.y - 10 * scale);
    ctx.lineTo(nose.x - 5 * scale, nose.y + 3 * scale);
    ctx.lineTo(nose.x + 5 * scale, nose.y + 3 * scale);
    ctx.stroke();

    if (mood === 'surprised') {
      ctx.fillStyle = '#9F1239';
      ctx.beginPath();
      ctx.ellipse(mouth.x, mouth.y, 12 * scale, 15 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (mood === 'focus') {
      ctx.strokeStyle = '#9F1239';
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.moveTo(mouth.x - 16 * scale, mouth.y);
      ctx.quadraticCurveTo(mouth.x, mouth.y + 4 * scale, mouth.x + 16 * scale, mouth.y - 1 * scale);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#BE123C';
      ctx.lineWidth = 4.2 * scale;
      ctx.beginPath();
      ctx.arc(mouth.x, mouth.y - 8 * scale, 19 * scale, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }

    return {
      x: Math.round(cx - rx - 10 * scale),
      y: Math.round(cy - ry - 12 * scale),
      w: Math.round((rx + 10 * scale) * 2),
      h: Math.round((ry + 12 * scale) * 2),
      confidence,
      expression:
        mood === 'smile' ? 'Senang' : mood === 'surprised' ? 'Terkejut' : 'Fokus',
      leftEye,
      rightEye,
      nose,
      mouth,
      forehead,
      eyeAngle: 0,
      blendshapes:
        mood === 'smile'
          ? { smile: 86, surprise: 8, blink: 4, focus: 12 }
          : mood === 'surprised'
            ? { smile: 10, surprise: 89, blink: 2, focus: 18 }
            : { smile: 14, surprise: 6, blink: 5, focus: 78 },
      engine: 'sample',
    };
  };

  if (sample === 'smile') {
    return [drawSinglePerson(w * 0.5, h * 0.48, 1.05, '#2563EB', '#1E293B', 'smile', 98.6)];
  }
  if (sample === 'surprised') {
    return [drawSinglePerson(w * 0.5, h * 0.48, 1.05, '#7C3AED', '#451A03', 'surprised', 96.4)];
  }
  return [
    drawSinglePerson(w * 0.31, h * 0.5, 0.82, '#0EA5E9', '#1E293B', 'smile', 97.9),
    drawSinglePerson(w * 0.7, h * 0.48, 0.82, '#EC4899', '#3F2718', 'focus', 95.2),
  ];
}

// Shared Face Detection & AR Overlay renderer (supports tilted real ML landmarks & 478-pt Face Mesh!)
function drawFaceOverlays(
  ctx: CanvasRenderingContext2D,
  faces: DetectedFace[],
  opts: {
    showBox: boolean;
    showLandmarks: boolean;
    showMood: boolean;
    arFilter: 'none' | 'glasses' | 'crown';
  }
) {
  faces.forEach((face, idx) => {
    if (opts.showBox) {
      ctx.strokeStyle = '#4ADE80';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(face.x, face.y, face.w, face.h);

      const cl = Math.min(18, Math.max(10, Math.round(face.w * 0.14)));
      ctx.strokeStyle = '#FFE600';
      ctx.lineWidth = 4;
      ctx.beginPath();
      // Top-left
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

    if (opts.showLandmarks) {
      // Draw real MediaPipe Face Mesh contours when available
      if (face.meshContours && face.meshContours.length > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.72)';
        ctx.lineWidth = 1.5;
        face.meshContours.forEach((contour, cIdx) => {
          if (contour.length < 2) return;
          ctx.strokeStyle =
            cIdx === 0
              ? 'rgba(74, 222, 128, 0.78)'
              : cIdx === 1
                ? 'rgba(251, 113, 133, 0.85)'
                : 'rgba(56, 189, 248, 0.85)';
          ctx.beginPath();
          ctx.moveTo(contour[0].x, contour[0].y);
          for (let i = 1; i < contour.length; i++) {
            ctx.lineTo(contour[i].x, contour[i].y);
          }
          ctx.stroke();
        });
        ctx.restore();
      } else {
        // Sample / fallback clean triangulation lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(face.leftEye.x, face.leftEye.y);
        ctx.lineTo(face.rightEye.x, face.rightEye.y);
        ctx.lineTo(face.nose.x, face.nose.y);
        ctx.lineTo(face.leftEye.x, face.leftEye.y);
        ctx.moveTo(face.nose.x, face.nose.y);
        ctx.lineTo(face.mouth.x, face.mouth.y);
        ctx.stroke();
      }

      const pts = [
        { pt: face.leftEye, color: '#38BDF8' },
        { pt: face.rightEye, color: '#38BDF8' },
        { pt: face.nose, color: '#FFE600' },
        { pt: face.mouth, color: '#FB7185' },
      ];
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

    // Tilting AR Filters anchored to real ML landmarks
    const angle = face.eyeAngle ?? 0;
    const eyeDx = face.rightEye.x - face.leftEye.x;
    const eyeDy = face.rightEye.y - face.leftEye.y;
    const eyeDist = Math.hypot(eyeDx, eyeDy);

    if (opts.arFilter === 'glasses' && eyeDist > 8) {
      const midX = (face.leftEye.x + face.rightEye.x) / 2;
      const midY = (face.leftEye.y + face.rightEye.y) / 2;
      const lensW = Math.max(24, eyeDist * 0.72);
      const lensH = Math.max(15, lensW * 0.52);
      const halfSpan = eyeDist / 2;

      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);

      // Cyber frames + subtle cyan neon highlight
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.fillRect(-halfSpan - lensW / 2, -lensH / 2, lensW, lensH);
      ctx.strokeRect(-halfSpan - lensW / 2, -lensH / 2, lensW, lensH);
      ctx.fillRect(halfSpan - lensW / 2, -lensH / 2, lensW, lensH);
      ctx.strokeRect(halfSpan - lensW / 2, -lensH / 2, lensW, lensH);

      // Glint lines
      ctx.strokeStyle = 'rgba(255, 230, 0, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-halfSpan - lensW * 0.3, -lensH * 0.25);
      ctx.lineTo(-halfSpan - lensW * 0.05, -lensH * 0.25);
      ctx.moveTo(halfSpan - lensW * 0.3, -lensH * 0.25);
      ctx.lineTo(halfSpan - lensW * 0.05, -lensH * 0.25);
      ctx.stroke();

      // Bridge & temples
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-halfSpan + lensW / 2, 0);
      ctx.lineTo(halfSpan - lensW / 2, 0);
      ctx.moveTo(-halfSpan - lensW / 2, -2);
      ctx.lineTo(-halfSpan - lensW * 0.75, -4);
      ctx.moveTo(halfSpan + lensW / 2, -2);
      ctx.lineTo(halfSpan + lensW * 0.75, -4);
      ctx.stroke();

      ctx.restore();
    } else if (opts.arFilter === 'crown') {
      const cw = Math.max(54, face.w * 0.62);
      const ch = Math.max(28, cw * 0.36);
      const anchorX = face.forehead ? face.forehead.x : face.x + face.w / 2;
      const anchorY = face.forehead ? face.forehead.y - 6 : Math.max(30, face.y + 8);

      ctx.save();
      ctx.translate(anchorX, anchorY);
      ctx.rotate(angle);

      ctx.fillStyle = '#FFE600';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-cw / 2, 0);
      ctx.lineTo(-cw / 2 + 5, -ch);
      ctx.lineTo(-cw * 0.18, -ch * 0.42);
      ctx.lineTo(0, -ch * 1.18);
      ctx.lineTo(cw * 0.18, -ch * 0.42);
      ctx.lineTo(cw / 2 - 5, -ch);
      ctx.lineTo(cw / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crown jewels
      ctx.fillStyle = '#FB7185';
      ctx.beginPath();
      ctx.arc(0, -ch * 0.32, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(-cw * 0.24, -ch * 0.24, 3.2, 0, Math.PI * 2);
      ctx.arc(cw * 0.24, -ch * 0.24, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    if (opts.showMood) {
      const label = `Wajah #${idx + 1} · ${face.expression} (${face.confidence}%)`;
      ctx.font = 'bold 12px monospace';
      const tw = ctx.measureText(label).width + 14;
      const tx = Math.max(4, Math.min(CANVAS_W - tw - 4, face.x));
      const ty = Math.max(24, face.y - 6);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(tx, ty - 18, tw, 20);
      ctx.strokeStyle = '#4ADE80';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(tx, ty - 18, tw, 20);
      ctx.fillStyle = '#4ADE80';
      ctx.fillText(label, tx + 7, ty - 4);
    }
  });
}

// ===================== 1. CARTOONIZER AI LIVE LAB =====================

const CartoonizerLiveLab: React.FC<{
  ready: boolean;
  onMissionSuccess: () => void;
}> = ({ ready, onMissionSuccess }) => {
  const [sample, setSample] = useState<CartoonSampleId>('student');
  const [style, setStyle] = useState<'komik' | 'anime' | 'sketsa'>('komik');
  const [levels, setLevels] = useState(5);
  const [edgeThreshold, setEdgeThreshold] = useState(58);
  const [smoothNoise, setSmoothNoise] = useState(true);
  const [viewMode, setViewMode] = useState<'cartoon' | 'split' | 'original'>('cartoon');
  const [sourceKind, setSourceKind] = useState<'sample' | 'upload' | 'camera'>('sample');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [mirrorCamera, setMirrorCamera] = useState(true);
  const [cameraFrozen, setCameraFrozen] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraLabel, setCameraLabel] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [inferenceMs, setInferenceMs] = useState(0);
  const [liveFps, setLiveFps] = useState(0);
  const [missionCleared, setMissionCleared] = useState(false);

  const srcCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dstCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const uploadedImgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const processorRef = useRef<FastCartoonizerProcessor>(new FastCartoonizerProcessor());
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);

  // Keep latest filter options in ref so rAF loop runs smoothly at 60 FPS without tearing down
  const optsRef = useRef({ levels, edgeThreshold, style, viewMode, smoothNoise, mirrorCamera, cameraFrozen });
  useEffect(() => {
    optsRef.current = { levels, edgeThreshold, style, viewMode, smoothNoise, mirrorCamera, cameraFrozen };
  }, [levels, edgeThreshold, style, viewMode, smoothNoise, mirrorCamera, cameraFrozen]);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraLabel('');
    setCameraFrozen(false);
    setLiveFps(0);
    lastVideoTimeRef.current = -1;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const renderStaticSource = useCallback(() => {
    if (sourceKind === 'camera') return;
    const srcCanvas = srcCanvasRef.current;
    const dstCanvas = dstCanvasRef.current;
    if (!srcCanvas || !dstCanvas) return;

    srcCanvas.width = CANVAS_W;
    srcCanvas.height = CANVAS_H;
    const sCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
    if (!sCtx) return;

    if (sourceKind === 'upload' && uploadedImgRef.current) {
      sCtx.fillStyle = '#0F172A';
      sCtx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      drawSourceCover(sCtx, uploadedImgRef.current, CANVAS_W, CANVAS_H, false);
    } else {
      drawCartoonSampleScene(sCtx, sample, CANVAS_W, CANVAS_H);
    }

    const ms = processorRef.current.process(srcCanvas, dstCanvas, {
      levels,
      edgeThreshold,
      style,
      viewMode,
      smoothNoise,
    });
    setInferenceMs(ms);
  }, [sample, style, levels, edgeThreshold, viewMode, smoothNoise, sourceKind]);

  useEffect(() => {
    renderStaticSource();
  }, [renderStaticSource]);

  // Smooth requestAnimationFrame live camera loop
  useEffect(() => {
    if (sourceKind !== 'camera') return;
    let active = true;
    let frameCounter = 0;
    let fpsStart = performance.now();
    let lastUiUpdate = 0;
    let lastFrozenSig = '';

    const tick = (now: number) => {
      if (!active) return;
      const video = videoRef.current;
      const srcCanvas = srcCanvasRef.current;
      const dstCanvas = dstCanvasRef.current;
      const currentOpts = optsRef.current;

      if (video && srcCanvas && dstCanvas && video.readyState >= 2 && video.videoWidth > 0) {
        if (srcCanvas.width !== CANVAS_W) srcCanvas.width = CANVAS_W;
        if (srcCanvas.height !== CANVAS_H) srcCanvas.height = CANVAS_H;

        const hasNewFrame = !currentOpts.cameraFrozen && video.currentTime !== lastVideoTimeRef.current;
        const frozenSig = `${currentOpts.levels}|${currentOpts.edgeThreshold}|${currentOpts.style}|${currentOpts.viewMode}|${currentOpts.smoothNoise}`;
        const frozenChanged = currentOpts.cameraFrozen && frozenSig !== lastFrozenSig;

        if (hasNewFrame) {
          lastVideoTimeRef.current = video.currentTime;
          lastFrozenSig = '';
          const sCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
          if (sCtx) {
            drawSourceCover(sCtx, video, CANVAS_W, CANVAS_H, currentOpts.mirrorCamera);
          }
        }

        if (hasNewFrame || frozenChanged) {
          if (frozenChanged) lastFrozenSig = frozenSig;
          const ms = processorRef.current.process(srcCanvas, dstCanvas, {
            levels: currentOpts.levels,
            edgeThreshold: currentOpts.edgeThreshold,
            style: currentOpts.style,
            viewMode: currentOpts.viewMode,
            smoothNoise: currentOpts.smoothNoise,
          });

          if (hasNewFrame) {
            frameCounter++;
          }
          if (frozenChanged || now - lastUiUpdate >= 300) {
            lastUiUpdate = now;
            setInferenceMs(ms);
            const elapsed = (now - fpsStart) / 1000;
            if (elapsed >= 0.4) {
              setLiveFps(currentOpts.cameraFrozen ? 0 : Math.round(frameCounter / elapsed));
              frameCounter = 0;
              fpsStart = now;
            }
          }
        }
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      active = false;
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [sourceKind]);

  const registerTestAction = useCallback(() => {
    if (ready && !missionCleared) {
      setMissionCleared(true);
      soundEngine.playVictory();
      onMissionSuccess();
    } else {
      soundEngine.playGemCollect();
    }
  }, [ready, missionCleared, onMissionSuccess]);

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

  const openCamera = async (nextFacing: 'user' | 'environment') => {
    setCameraError(null);
    setCameraStarting(true);
    stopCamera();
    try {
      if (!videoRef.current) {
        throw new Error('Elemen video belum siap.');
      }
      const res = await startRealCameraStream(videoRef.current, nextFacing);
      streamRef.current = res.stream;
      setFacingMode(nextFacing);
      setMirrorCamera(nextFacing === 'user');
      setCameraLabel(`${res.label} (${res.width}×${res.height})`);
      setCameraFrozen(false);
      setSourceKind('camera');
      registerTestAction();
    } catch (err) {
      setCameraError(
        err instanceof Error
          ? err.message
          : 'Izin kamera tidak tersedia. Gunakan Sampel Potret atau Unggah Foto!'
      );
      soundEngine.playCrash();
    } finally {
      setCameraStarting(false);
    }
  };

  const handleToggleCamera = async () => {
    if (sourceKind === 'camera') {
      stopCamera();
      setSourceKind('sample');
      soundEngine.playButtonClick();
      return;
    }
    await openCamera(facingMode);
  };

  const handleSwitchCamera = async () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    await openCamera(nextFacing);
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
      {/* Keep real video off-screen (NOT display:none) so browsers decode frames at full 30-60 FPS */}
      <video
        ref={videoRef}
        className="fixed -left-[9999px] top-0 w-1 h-1 opacity-0 pointer-events-none"
        playsInline
        autoPlay
        muted
      />
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
            disabled={cameraStarting}
            onClick={() => void handleToggleCamera()}
            className={`neo-btn px-2.5 py-1 text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer ${
              sourceKind === 'camera' ? 'bg-[#FB7185]' : 'bg-[#38BDF8]'
            }`}
          >
            {cameraStarting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Membuka...
              </>
            ) : sourceKind === 'camera' ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                Stop Kamera
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                Kamera Live
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Camera Controls Strip */}
      {sourceKind === 'camera' && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-2 bg-[#E0F2FE] border-2 border-black text-[11px]">
          <div className="flex items-center gap-1.5 font-extrabold truncate max-w-[210px]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0" />
            <span className="truncate">{cameraLabel || 'Kamera Aktif'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMirrorCamera((m) => !m);
                soundEngine.playButtonClick();
              }}
              className={`px-2 py-0.5 border border-black font-extrabold inline-flex items-center gap-1 cursor-pointer ${
                mirrorCamera ? 'bg-[#FFE600]' : 'bg-white'
              }`}
            >
              <FlipHorizontal2 className="w-3 h-3" />
              Mirror
            </button>
            <button
              type="button"
              onClick={() => void handleSwitchCamera()}
              className="px-2 py-0.5 border border-black bg-white font-extrabold inline-flex items-center gap-1 cursor-pointer hover:bg-[#FFE600]"
            >
              <SwitchCamera className="w-3 h-3" />
              Ganti
            </button>
            <button
              type="button"
              onClick={() => {
                setCameraFrozen((f) => !f);
                soundEngine.playButtonClick();
              }}
              className={`px-2 py-0.5 border border-black font-extrabold inline-flex items-center gap-1 cursor-pointer ${
                cameraFrozen ? 'bg-[#4ADE80]' : 'bg-white'
              }`}
            >
              {cameraFrozen ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              {cameraFrozen ? 'Lanjut' : 'Bekukan'}
            </button>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="p-2.5 bg-[#FB7185]/25 border-2 border-black text-[11px] font-bold leading-relaxed">
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
          {sourceKind === 'camera' && (cameraFrozen ? ' · JEDA' : ' · LIVE')}
        </div>
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 text-[#4ADE80] font-mono text-[10px] font-bold border border-white/25">
          {sourceKind === 'camera' && !cameraFrozen ? `${liveFps} FPS · ` : ''}
          {inferenceMs} ms
        </div>
      </div>

      {/* Style Presets */}
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
        <div className="flex flex-wrap gap-1.5">
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
          <button
            type="button"
            onClick={() => {
              setSmoothNoise((v) => !v);
              soundEngine.playButtonClick();
            }}
            className={`px-2.5 py-1.5 border-2 border-black text-[11px] font-extrabold cursor-pointer ${
              smoothNoise ? 'bg-[#BAE6FD]' : 'bg-white'
            }`}
          >
            Haluskan: {smoothNoise ? 'ON' : 'OFF'}
          </button>
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
          Susun semua 4 blok pipeline di kiri lalu uji Kamera Live / salah satu gaya kartun di atas untuk menyelesaikan proyek!
        </div>
      )}
    </div>
  );
};

// ===================== 2. FACE DETECTION AI LIVE LAB (REAL MEDIAPIPE ML) =====================

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
  const [mlStatus, setMlStatus] = useState<MlEngineStatus>(mlFaceEngine.getStatus());
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [mirrorCamera, setMirrorCamera] = useState(true);
  const [cameraFrozen, setCameraFrozen] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraLabel, setCameraLabel] = useState('');
  const [liveFps, setLiveFps] = useState(0);
  const [inferenceMs, setInferenceMs] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [missionCleared, setMissionCleared] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frozenFrameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const uploadedImgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastFacesRef = useRef<DetectedFace[]>([]);

  const overlayOptsRef = useRef({ showBox, showLandmarks, showMood, arFilter, mirrorCamera, cameraFrozen });
  useEffect(() => {
    overlayOptsRef.current = { showBox, showLandmarks, showMood, arFilter, mirrorCamera, cameraFrozen };
  }, [showBox, showLandmarks, showMood, arFilter, mirrorCamera, cameraFrozen]);

  // Preload MediaPipe FaceLandmarker ML model immediately so camera & photo inference starts instantaneously
  const [imageMlReady, setImageMlReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    setMlStatus((prev) => (prev === 'idle' ? 'loading' : prev));
    void mlFaceEngine.ensureLoaded().then((st) => {
      if (mounted) setMlStatus(st);
      void mlFaceEngine.ensureImageReady().then((ok) => {
        if (mounted && ok) setImageMlReady(true);
      });
    });
    return () => {
      mounted = false;
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraLabel('');
    setCameraFrozen(false);
    setLiveFps(0);
    lastVideoTimeRef.current = -1;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // Render static sources (Sample scenes or Uploaded real photos with MediaPipe IMAGE inference)
  const renderStaticFaceDetection = useCallback(() => {
    if (sourceKind === 'camera') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const t0 = performance.now();
    let faces: DetectedFace[] = [];

    if (sourceKind === 'upload' && uploadedImgRef.current) {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      const transform = drawSourceCover(ctx, uploadedImgRef.current, CANVAS_W, CANVAS_H, false);
      const mlFaces = mlFaceEngine.detectStaticImage(
        uploadedImgRef.current,
        CANVAS_W,
        CANVAS_H,
        transform
      );
      faces = mlFaces !== null ? mlFaces : detectFacesFallbackFromPixels(ctx.getImageData(0, 0, CANVAS_W, CANVAS_H));
    } else {
      faces = drawFaceSampleScene(ctx, sample, CANVAS_W, CANVAS_H);
    }

    const ms = Math.round((performance.now() - t0) * 10) / 10;
    setInferenceMs(ms);
    lastFacesRef.current = faces;
    setDetectedFaces(faces);

    drawFaceOverlays(ctx, faces, { showBox, showLandmarks, showMood, arFilter });
  }, [sample, sourceKind, showBox, showLandmarks, showMood, arFilter]);

  useEffect(() => {
    renderStaticFaceDetection();
  }, [renderStaticFaceDetection, mlStatus, imageMlReady]);

  // Smooth real-time requestAnimationFrame MediaPipe ML loop on live camera
  useEffect(() => {
    if (sourceKind !== 'camera') return;
    let active = true;
    let frameCounter = 0;
    let fpsStart = performance.now();
    let lastUiSync = 0;
    let lastFrozenOverlaySig = '';

    const tick = (now: number) => {
      if (!active) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const freezeBuf = frozenFrameCanvasRef.current;
      const opts = overlayOptsRef.current;

      if (video && canvas && video.readyState >= 2 && video.videoWidth > 0) {
        if (canvas.width !== CANVAS_W) canvas.width = CANVAS_W;
        if (canvas.height !== CANVAS_H) canvas.height = CANVAS_H;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          if (opts.cameraFrozen && freezeBuf && freezeBuf.width === CANVAS_W) {
            const overlaySig = `${opts.showBox}|${opts.showLandmarks}|${opts.showMood}|${opts.arFilter}`;
            if (overlaySig !== lastFrozenOverlaySig) {
              lastFrozenOverlaySig = overlaySig;
              ctx.drawImage(freezeBuf, 0, 0, CANVAS_W, CANVAS_H);
              drawFaceOverlays(ctx, lastFacesRef.current, opts);
            }
          } else if (video.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = video.currentTime;
            lastFrozenOverlaySig = '';
            const t0 = performance.now();

            const transform = drawSourceCover(ctx, video, CANVAS_W, CANVAS_H, opts.mirrorCamera);

            // Cache clean frame in case user clicks Freeze
            if (freezeBuf) {
              if (freezeBuf.width !== CANVAS_W) freezeBuf.width = CANVAS_W;
              if (freezeBuf.height !== CANVAS_H) freezeBuf.height = CANVAS_H;
              const fCtx = freezeBuf.getContext('2d');
              fCtx?.drawImage(canvas, 0, 0);
            }

            // Run real MediaPipe FaceLandmarker ML inference
            const mlFaces = mlFaceEngine.detectVideoFrame(
              video,
              CANVAS_W,
              CANVAS_H,
              transform,
              opts.mirrorCamera
            );
            const faces =
              mlFaces !== null
                ? mlFaces
                : detectFacesFallbackFromPixels(ctx.getImageData(0, 0, CANVAS_W, CANVAS_H));

            lastFacesRef.current = faces;
            drawFaceOverlays(ctx, faces, opts);

            const ms = Math.round((performance.now() - t0) * 10) / 10;
            frameCounter++;

            if (now - lastUiSync >= 180) {
              lastUiSync = now;
              setDetectedFaces(faces);
              setInferenceMs(ms);
              const elapsed = (now - fpsStart) / 1000;
              if (elapsed >= 0.4) {
                setLiveFps(Math.round(frameCounter / elapsed));
                frameCounter = 0;
                fpsStart = now;
              }
            }
          }
        }
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      active = false;
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [sourceKind]);

  const markMissionIfReady = useCallback(() => {
    if (ready && !missionCleared) {
      setMissionCleared(true);
      soundEngine.playVictory();
      onMissionSuccess();
    } else {
      soundEngine.playGemCollect();
    }
  }, [ready, missionCleared, onMissionSuccess]);

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

  const openCamera = async (nextFacing: 'user' | 'environment') => {
    setCameraError(null);
    setCameraStarting(true);
    stopCamera();
    try {
      // Ensure ML engine is loading/ready in parallel with camera startup
      const statusPromise = mlFaceEngine.ensureLoaded().then((st) => {
        setMlStatus(st);
        return st;
      });
      if (!videoRef.current) {
        throw new Error('Elemen video belum siap.');
      }
      const [res] = await Promise.all([
        startRealCameraStream(videoRef.current, nextFacing),
        statusPromise.catch(() => 'fallback' as MlEngineStatus),
      ]);
      streamRef.current = res.stream;
      setFacingMode(nextFacing);
      setMirrorCamera(nextFacing === 'user');
      setCameraLabel(`${res.label} (${res.width}×${res.height})`);
      setCameraFrozen(false);
      setSourceKind('camera');
      markMissionIfReady();
    } catch (err) {
      setCameraError(
        err instanceof Error
          ? err.message
          : 'Izin kamera tidak tersedia. Gunakan Sampel Potret atau Unggah Foto!'
      );
      soundEngine.playCrash();
    } finally {
      setCameraStarting(false);
    }
  };

  const handleToggleCamera = async () => {
    if (sourceKind === 'camera') {
      stopCamera();
      setSourceKind('sample');
      soundEngine.playButtonClick();
      return;
    }
    await openCamera(facingMode);
  };

  const handleSwitchCamera = async () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    await openCamera(nextFacing);
  };

  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `codespark-face-ml-${arFilter}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    markMissionIfReady();
  };

  const primaryFace = detectedFaces[0];
  const engineLabel =
    mlStatus === 'ready_gpu'
      ? 'MediaPipe Face ML · GPU'
      : mlStatus === 'ready_cpu'
        ? 'MediaPipe Face ML · WASM'
        : mlStatus === 'loading'
          ? 'Memuat Model ML...'
          : 'Vision Fallback';

  return (
    <div className="space-y-3">
      <canvas ref={frozenFrameCanvasRef} className="hidden" />
      {/* Keep real video off-screen (NOT display:none) so hardware video frames decode at full FPS */}
      <video
        ref={videoRef}
        className="fixed -left-[9999px] top-0 w-1 h-1 opacity-0 pointer-events-none"
        playsInline
        autoPlay
        muted
      />
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
            disabled={cameraStarting}
            onClick={() => void handleToggleCamera()}
            className={`neo-btn px-2.5 py-1 text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer ${
              sourceKind === 'camera' ? 'bg-[#FB7185]' : 'bg-[#38BDF8]'
            }`}
          >
            {cameraStarting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Membuka...
              </>
            ) : sourceKind === 'camera' ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                Stop Kamera
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                Kamera Live
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Camera Controls Strip */}
      {sourceKind === 'camera' && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-2 bg-[#DCFCE7] border-2 border-black text-[11px]">
          <div className="flex items-center gap-1.5 font-extrabold truncate max-w-[210px]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0" />
            <span className="truncate">{cameraLabel || 'Kamera Aktif'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMirrorCamera((m) => !m);
                soundEngine.playButtonClick();
              }}
              className={`px-2 py-0.5 border border-black font-extrabold inline-flex items-center gap-1 cursor-pointer ${
                mirrorCamera ? 'bg-[#FFE600]' : 'bg-white'
              }`}
            >
              <FlipHorizontal2 className="w-3 h-3" />
              Mirror
            </button>
            <button
              type="button"
              onClick={() => void handleSwitchCamera()}
              className="px-2 py-0.5 border border-black bg-white font-extrabold inline-flex items-center gap-1 cursor-pointer hover:bg-[#FFE600]"
            >
              <SwitchCamera className="w-3 h-3" />
              Ganti
            </button>
            <button
              type="button"
              onClick={() => {
                setCameraFrozen((f) => !f);
                soundEngine.playButtonClick();
              }}
              className={`px-2 py-0.5 border border-black font-extrabold inline-flex items-center gap-1 cursor-pointer ${
                cameraFrozen ? 'bg-[#4ADE80]' : 'bg-white'
              }`}
            >
              {cameraFrozen ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              {cameraFrozen ? 'Lanjut' : 'Bekukan'}
            </button>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="p-2.5 bg-[#FB7185]/25 border-2 border-black text-[11px] font-bold leading-relaxed">
          {cameraError}
        </div>
      )}

      {/* Detection Stage */}
      <div className="relative border-[3px] border-black bg-[#0F172A] overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-auto block" />
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/85 text-[#38BDF8] font-mono text-[10px] font-extrabold border border-white/25 inline-flex items-center gap-1">
          {mlStatus === 'loading' ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Zap className="w-3 h-3 text-[#FFE600]" />
          )}
          {engineLabel}
        </div>
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/85 text-[#FFE600] font-mono text-[10px] font-bold border border-white/25">
          {sourceKind === 'camera' && !cameraFrozen ? `${liveFps} FPS · ` : ''}
          {inferenceMs} ms
        </div>
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/85 text-[#4ADE80] font-mono text-[10px] font-extrabold border border-white/25 inline-flex items-center gap-1.5">
          <ScanFace className="w-3.5 h-3.5" />
          TERDETEKSI: {detectedFaces.length} WAJAH
          {primaryFace ? ` · ${primaryFace.expression.toUpperCase()}` : ''}
        </div>
      </div>

      {/* Real-time ML Expression Blendshape Bars */}
      {primaryFace?.blendshapes && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-[#FFFDF7] border-2 border-black text-[11px]">
          {[
            { label: 'Senyum', value: primaryFace.blendshapes.smile, color: '#4ADE80' },
            { label: 'Terkejut', value: primaryFace.blendshapes.surprise, color: '#FFE600' },
            { label: 'Fokus', value: primaryFace.blendshapes.focus, color: '#38BDF8' },
            { label: 'Kedip', value: primaryFace.blendshapes.blink, color: '#C084FC' },
          ].map((metric) => (
            <div key={metric.label} className="space-y-1">
              <div className="flex justify-between font-extrabold tabular-nums">
                <span>{metric.label}</span>
                <span className="font-mono">{metric.value}%</span>
              </div>
              <div className="h-2 bg-neutral-200 border border-black">
                <div
                  className="h-full transition-all duration-100"
                  style={{ width: `${Math.min(100, metric.value)}%`, backgroundColor: metric.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

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
          Mesh / Titik: {showLandmarks ? 'ON' : 'OFF'}
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

      {/* AR Filter + Scan/Export Buttons */}
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

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownloadSnapshot}
            className="neo-btn bg-[#FFE600] px-2.5 py-1.5 text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Simpan Foto
          </button>
          <button
            type="button"
            onClick={() => {
              renderStaticFaceDetection();
              markMissionIfReady();
            }}
            className="neo-btn bg-[#4ADE80] px-3 py-1.5 text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Verifikasi
          </button>
        </div>
      </div>

      {!ready && (
        <div className="p-2.5 bg-[#FFE600]/45 border-2 border-black text-xs font-bold">
          Susun semua 4 blok pipeline Face Detection di kiri lalu uji Kamera Live / Filter AR untuk menyelesaikan proyek!
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
