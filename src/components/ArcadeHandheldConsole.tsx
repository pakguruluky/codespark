import React, { useEffect, useRef, useState } from 'react';
import {
  Bug,
  Camera,
  Keyboard,
  Maximize2,
  Minimize2,
  Play,
  RefreshCw,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  ARCADE_HEIGHT,
  ARCADE_WIDTH,
  ArcadeRuntime,
  type ArcadeBlockProgram,
  type ArcadeHudSnapshot,
  type ArcadeInputState,
} from '../engine/arcadeEngine';
import type { PixelSpriteGrid } from '../engine/arcadeSprites';

interface Props {
  program: ArcadeBlockProgram;
  customSprites: Record<string, PixelSpriteGrid>;
  controlsHint: string;
  onHudUpdate?: (snap: ArcadeHudSnapshot) => void;
}

export const ArcadeHandheldConsole: React.FC<Props> = ({
  program,
  customSprites,
  controlsHint,
  onHudUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<ArcadeRuntime | null>(null);

  const inputRef = useRef<ArcadeInputState>({
    up: false,
    down: false,
    left: false,
    right: false,
    a: false,
    b: false,
  });

  const [isRunning, setIsRunning] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showKeyGuide, setShowKeyGuide] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeButtons, setActiveButtons] = useState<ArcadeInputState>({
    up: false,
    down: false,
    left: false,
    right: false,
    a: false,
    b: false,
  });

  // Keep runtime synced with program changes
  useEffect(() => {
    if (!runtimeRef.current) {
      runtimeRef.current = new ArcadeRuntime(program, customSprites);
    } else {
      runtimeRef.current.loadProgram(program, customSprites);
    }
    runtimeRef.current.muted = muted;
    runtimeRef.current.showDebug = debugMode;
    setIsRunning(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program]);

  // Live sprite painting updates without resetting score/game!
  useEffect(() => {
    if (runtimeRef.current) {
      runtimeRef.current.updateCustomSprites(customSprites);
    }
  }, [customSprites]);

  useEffect(() => {
    if (runtimeRef.current) {
      runtimeRef.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    if (runtimeRef.current) {
      runtimeRef.current.showDebug = debugMode;
    }
  }, [debugMode]);

  // Keyboard controls (ignored when typing inside inputs/textareas/selects)
  useEffect(() => {
    const mapKey = (e: KeyboardEvent): keyof ArcadeInputState | null => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          return 'up';
        case 'ArrowDown':
        case 'KeyS':
          return 'down';
        case 'ArrowLeft':
        case 'KeyA':
          return 'left';
        case 'ArrowRight':
        case 'KeyD':
          return 'right';
        case 'Space':
        case 'KeyZ':
          return 'a';
        case 'KeyX':
        case 'Enter':
          return 'b';
        default:
          return null;
      }
    };

    const isEditingField = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingField(e.target)) return;
      const btn = mapKey(e);
      if (!btn) return;
      e.preventDefault();
      inputRef.current[btn] = true;
      setActiveButtons({ ...inputRef.current });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const btn = mapKey(e);
      if (!btn) return;
      inputRef.current[btn] = false;
      setActiveButtons({ ...inputRef.current });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60 FPS Animation Loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let hudTick = 0;

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const rt = runtimeRef.current;
      if (rt) {
        if (isRunning) {
          rt.step(dt, inputRef.current);
        }

        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          rt.render(ctx);
        }

        const fullCtx = fullCanvasRef.current?.getContext('2d');
        if (fullCtx) {
          rt.render(fullCtx);
        }

        hudTick += dt;
        if (hudTick >= 0.18 && onHudUpdate) {
          hudTick = 0;
          onHudUpdate(rt.getSnapshot());
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [isRunning, onHudUpdate]);

  const setBtn = (btn: keyof ArcadeInputState, pressed: boolean) => {
    inputRef.current[btn] = pressed;
    setActiveButtons({ ...inputRef.current });
  };

  const handleRestart = () => {
    runtimeRef.current?.reset();
    setIsRunning(true);
  };

  const handleScreenshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'codespark-arcade-snapshot.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const renderHandheldBody = (large = false) => (
    <div
      className={`bg-[#499DA3] rounded-[20px] p-3 shadow-lg border-2 border-[#367d82] select-none ${
        large ? 'w-full max-w-[540px]' : 'w-full'
      }`}
    >
      {/* Matte Black Arcade Screen Bezel */}
      <div className="bg-[#111827] rounded-xl p-2 shadow-inner border-2 border-[#1f2937]">
        <canvas
          ref={large ? fullCanvasRef : canvasRef}
          width={ARCADE_WIDTH}
          height={ARCADE_HEIGHT}
          onClick={() => runtimeRef.current?.dismissSplash()}
          className="w-full aspect-[4/3] block rounded bg-black cursor-pointer"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Menu & Reset Oval Buttons */}
      <div className="flex items-center justify-center gap-3 mt-2.5">
        <button
          type="button"
          onClick={() => setIsRunning((r) => !r)}
          className="px-3.5 py-0.5 rounded-full bg-[#388288] hover:bg-[#2d6d72] text-[#b4e4e7] text-[10px] font-extrabold tracking-wide shadow-inner cursor-pointer"
          title="Jeda / Lanjut"
        >
          {isRunning ? 'Menu' : 'Paused'}
        </button>
        <button
          type="button"
          onClick={handleRestart}
          className="w-7 h-5 rounded-full bg-[#388288] hover:bg-[#2d6d72] text-[#b4e4e7] flex items-center justify-center shadow-inner cursor-pointer"
          title="Restart Game"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* Interactive D-Pad + A/B Buttons */}
      <div className="mt-2 px-1 flex items-center justify-between gap-2">
        {/* Circular D-Pad */}
        <div className="relative w-24 h-24 rounded-full bg-[#3e8c92] shadow-inner flex items-center justify-center shrink-0">
          {/* Up */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setBtn('up', true);
            }}
            onPointerUp={() => setBtn('up', false)}
            onPointerLeave={() => setBtn('up', false)}
            className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-t-md flex items-center justify-center font-black text-xs cursor-pointer transition-colors touch-none ${
              activeButtons.up ? 'bg-[#ffe600] text-slate-900' : 'bg-[#64b1b7] text-[#22585c] hover:bg-[#77c2c8]'
            }`}
            aria-label="Atas"
          >
            ▲
          </button>
          {/* Down */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setBtn('down', true);
            }}
            onPointerUp={() => setBtn('down', false)}
            onPointerLeave={() => setBtn('down', false)}
            className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-b-md flex items-center justify-center font-black text-xs cursor-pointer transition-colors touch-none ${
              activeButtons.down ? 'bg-[#ffe600] text-slate-900' : 'bg-[#64b1b7] text-[#22585c] hover:bg-[#77c2c8]'
            }`}
            aria-label="Bawah"
          >
            ▼
          </button>
          {/* Left */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setBtn('left', true);
            }}
            onPointerUp={() => setBtn('left', false)}
            onPointerLeave={() => setBtn('left', false)}
            className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-l-md flex items-center justify-center font-black text-xs cursor-pointer transition-colors touch-none ${
              activeButtons.left ? 'bg-[#ffe600] text-slate-900' : 'bg-[#64b1b7] text-[#22585c] hover:bg-[#77c2c8]'
            }`}
            aria-label="Kiri"
          >
            ◀
          </button>
          {/* Right */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setBtn('right', true);
            }}
            onPointerUp={() => setBtn('right', false)}
            onPointerLeave={() => setBtn('right', false)}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-r-md flex items-center justify-center font-black text-xs cursor-pointer transition-colors touch-none ${
              activeButtons.right ? 'bg-[#ffe600] text-slate-900' : 'bg-[#64b1b7] text-[#22585c] hover:bg-[#77c2c8]'
            }`}
            aria-label="Kanan"
          >
            ▶
          </button>
          {/* Center pivot */}
          <div className="w-6 h-6 rounded-full bg-[#367c82] shadow-inner pointer-events-none" />
        </div>

        {/* Right Side: B and A Buttons (classic MakeCode diagonal layout) */}
        <div className="relative w-24 h-24 shrink-0">
          {/* A button (upper right) */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setBtn('a', true);
            }}
            onPointerUp={() => setBtn('a', false)}
            onPointerLeave={() => setBtn('a', false)}
            className={`absolute top-1 right-0 w-11 h-11 rounded-full border-4 border-[#3a8389] font-black text-base shadow-md cursor-pointer transition-transform active:scale-95 touch-none ${
              activeButtons.a
                ? 'bg-[#ffe600] text-slate-900 scale-95'
                : 'bg-[#36777c] text-[#9de0e4] hover:bg-[#2d666b]'
            }`}
            title="Tombol A (Spasi / Z)"
          >
            A
          </button>

          {/* B button (lower left) */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setBtn('b', true);
            }}
            onPointerUp={() => setBtn('b', false)}
            onPointerLeave={() => setBtn('b', false)}
            className={`absolute bottom-1 left-0 w-11 h-11 rounded-full border-4 border-[#3a8389] font-black text-base shadow-md cursor-pointer transition-transform active:scale-95 touch-none ${
              activeButtons.b
                ? 'bg-[#ff93c4] text-slate-900 scale-95'
                : 'bg-[#36777c] text-[#9de0e4] hover:bg-[#2d666b]'
            }`}
            title="Tombol B (X / Enter)"
          >
            B
          </button>
        </div>
      </div>

      {/* Handheld Brand Footer */}
      <div className="mt-1.5 text-center text-[10px] font-extrabold tracking-wider text-white/90 flex items-center justify-center gap-1.5">
        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-white/90" />
        CodeSpark Arcade
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2.5">
      {renderHandheldBody(false)}

      {/* Authentic MakeCode Purple 7-Button Simulator Control Strip */}
      <div className="grid grid-cols-7 gap-1">
        <button
          type="button"
          onClick={() => setIsRunning((r) => !r)}
          className={`h-8 rounded flex items-center justify-center text-white transition-colors cursor-pointer shadow-sm ${
            isRunning ? 'bg-[#5B4DB7] hover:bg-[#4c3fa3]' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
          title={isRunning ? 'Stop Simulator' : 'Jalankan Simulator'}
        >
          {isRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>
        <button
          type="button"
          onClick={handleRestart}
          className="h-8 rounded bg-[#5B4DB7] hover:bg-[#4c3fa3] flex items-center justify-center text-white transition-colors cursor-pointer shadow-sm"
          title="Restart Simulator"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setDebugMode((d) => !d)}
          className={`h-8 rounded flex items-center justify-center text-white transition-colors cursor-pointer shadow-sm ${
            debugMode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#5B4DB7] hover:bg-[#4c3fa3]'
          }`}
          title="Mode Debug (Hitbox & FPS)"
        >
          <Bug className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className={`h-8 rounded flex items-center justify-center text-white transition-colors cursor-pointer shadow-sm ${
            muted ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#5B4DB7] hover:bg-[#4c3fa3]'
          }`}
          title={muted ? 'Aktifkan Suara' : 'Matikan Suara'}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => setShowKeyGuide((k) => !k)}
          className={`h-8 rounded flex items-center justify-center text-white transition-colors cursor-pointer shadow-sm ${
            showKeyGuide ? 'bg-[#276C73]' : 'bg-[#5B4DB7] hover:bg-[#4c3fa3]'
          }`}
          title="Panduan Tombol Keyboard"
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleScreenshot}
          className="h-8 rounded bg-[#5B4DB7] hover:bg-[#4c3fa3] flex items-center justify-center text-white transition-colors cursor-pointer shadow-sm"
          title="Ambil Screenshot Game (PNG)"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="h-8 rounded bg-[#5B4DB7] hover:bg-[#4c3fa3] flex items-center justify-center text-white transition-colors cursor-pointer shadow-sm"
          title="Layar Penuh Simulator"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Controls Hint */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-slate-600 leading-snug">
        {controlsHint}
      </div>

      {showKeyGuide && (
        <div className="bg-slate-900 text-slate-100 rounded-lg p-2.5 text-[11px] space-y-1 shadow-md">
          <div className="font-extrabold text-[#87f2ff]">Kontrol Keyboard & Handheld:</div>
          <div>• Gerak: <b>Panah</b> / <b>W A S D</b> / D-Pad</div>
          <div>• Tombol <b>A</b>: <b>Spasi</b> atau <b>Z</b></div>
          <div>• Tombol <b>B</b>: <b>X</b> atau <b>Enter</b></div>
        </div>
      )}

      {/* Fullscreen Arcade Simulator Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[580px] flex flex-col items-center gap-3">
            <div className="w-full flex items-center justify-between text-white">
              <span className="font-extrabold text-sm">Mode Layar Penuh — CodeSpark Arcade</span>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4c3fa3] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
                Tutup
              </button>
            </div>
            {renderHandheldBody(true)}
          </div>
        </div>
      )}
    </div>
  );
};
