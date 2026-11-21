import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bug,
  Camera,
  Maximize2,
  Minimize2,
  Play,
  Radio,
  RefreshCw,
  Square,
  Sun,
  Thermometer,
  Vibrate,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  MICROBIT_ICONS,
  buildBarGraphMatrix,
  createEmptyLedMatrix,
  patternToLedMatrix,
  playMicrobitMelody,
  playMicrobitTone,
  stringToScrollColumns,
  type MicrobitIconName,
  type MicrobitProgram,
  type MicrobitStmtBlock,
} from '../engine/microbitEngine';

interface Props {
  program: MicrobitProgram;
  onActiveBlockChange?: (blockId: string | null) => void;
  onUserInteraction?: () => void;
}

export const MicrobitBoardSimulator: React.FC<Props> = ({
  program,
  onActiveBlockChange,
  onUserInteraction,
}) => {
  const [leds, setLeds] = useState<number[][]>(() => createEmptyLedMatrix());
  const [isRunning, setIsRunning] = useState(true);
  const [muted, setMuted] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Interactive Hardware Sensors
  const [temperature, setTemperature] = useState(26);
  const [lightLevel, setLightLevel] = useState(145);
  const [shaking, setShaking] = useState(false);
  const [pressedBtn, setPressedBtn] = useState<'A' | 'B' | 'AB' | 'LOGO' | 'P0' | 'P1' | 'P2' | null>(null);
  const [radioGroup, setRadioGroup] = useState(1);
  const [radioLog, setRadioLog] = useState<string | null>(null);
  const [debugVars, setDebugVars] = useState<Record<string, number>>({});

  // Live mutable refs for async runner
  const runIdRef = useRef(0);
  const runningRef = useRef(true);
  const mutedRef = useRef(false);
  const debugRef = useRef(false);
  const tempRef = useRef(temperature);
  const lightRef = useRef(lightLevel);
  const brightnessRef = useRef(255);
  const varsRef = useRef<Record<string, number>>({ counter: 0, dice: 1 });
  const ledsRef = useRef<number[][]>(createEmptyLedMatrix());
  const programRef = useRef<MicrobitProgram>(program);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    debugRef.current = debugMode;
    if (!debugMode && onActiveBlockChange) onActiveBlockChange(null);
  }, [debugMode, onActiveBlockChange]);

  useEffect(() => {
    tempRef.current = temperature;
  }, [temperature]);

  useEffect(() => {
    lightRef.current = lightLevel;
  }, [lightLevel]);

  useEffect(() => {
    programRef.current = program;
  }, [program]);

  const setLedMatrix = useCallback((next: number[][]) => {
    ledsRef.current = next.map((r) => [...r]);
    setLeds(ledsRef.current);
  }, []);

  const sleep = useCallback((ms: number, runId: number) => {
    return new Promise<boolean>((resolve) => {
      const scaled = debugRef.current ? Math.max(ms, 260) : ms;
      window.setTimeout(() => {
        resolve(runIdRef.current === runId && runningRef.current);
      }, Math.max(15, scaled));
    });
  }, []);

  const scrollText = useCallback(
    async (text: string, runId: number) => {
      const cols = stringToScrollColumns(text);
      const bright = brightnessRef.current;
      for (let offset = 0; offset <= cols.length - 5; offset++) {
        if (runIdRef.current !== runId || !runningRef.current) return false;
        const frame = createEmptyLedMatrix();
        for (let x = 0; x < 5; x++) {
          const col = cols[offset + x] || [0, 0, 0, 0, 0];
          for (let y = 0; y < 5; y++) {
            frame[y][x] = col[y] ? bright : 0;
          }
        }
        setLedMatrix(frame);
        const ok = await sleep(90, runId);
        if (!ok) return false;
      }
      return true;
    },
    [setLedMatrix, sleep]
  );

  const runStatementsRef = useRef<
    (blocks: MicrobitStmtBlock[], runId: number) => Promise<boolean>
  >(async () => true);

  const runStatements = useCallback(
    async (blocks: MicrobitStmtBlock[], runId: number): Promise<boolean> => {
      for (const blk of blocks) {
        if (runIdRef.current !== runId || !runningRef.current) return false;
        if (debugRef.current && onActiveBlockChange) {
          onActiveBlockChange(blk.id);
        }

        const p = blk.params;
        const bright = brightnessRef.current;

        switch (blk.type) {
          case 'show_number': {
            const txt = String(Number(p.value ?? 0));
            if (txt.length === 1) {
              const cols = stringToScrollColumns(txt);
              // Display single digit centered crisp
              const frame = createEmptyLedMatrix();
              for (let x = 0; x < 5; x++) {
                const col = cols[2 + x] || [0, 0, 0, 0, 0];
                for (let y = 0; y < 5; y++) frame[y][x] = col[y] ? bright : 0;
              }
              setLedMatrix(frame);
            } else {
              const ok = await scrollText(txt, runId);
              if (!ok) return false;
            }
            break;
          }
          case 'show_leds': {
            const rows = String(p.grid || '01010|11111|11111|01110|00100').split('|');
            setLedMatrix(patternToLedMatrix(rows, bright));
            break;
          }
          case 'show_icon': {
            const icon = (p.icon as MicrobitIconName) || 'Heart';
            const pat = MICROBIT_ICONS[icon] || MICROBIT_ICONS.Heart;
            setLedMatrix(patternToLedMatrix(pat, bright));
            break;
          }
          case 'show_string': {
            const ok = await scrollText(String(p.text || 'HALO!'), runId);
            if (!ok) return false;
            break;
          }
          case 'clear_screen':
            setLedMatrix(createEmptyLedMatrix());
            break;
          case 'pause': {
            const ok = await sleep(Number(p.ms ?? 400), runId);
            if (!ok) return false;
            break;
          }
          case 'show_temperature': {
            const ok = await scrollText(`${tempRef.current}C`, runId);
            if (!ok) return false;
            break;
          }
          case 'show_light_level': {
            const ok = await scrollText(String(lightRef.current), runId);
            if (!ok) return false;
            break;
          }
          case 'play_melody':
            playMicrobitMelody(String(p.melody || 'ba_ding'), mutedRef.current);
            break;
          case 'play_tone':
            playMicrobitTone(Number(p.freq ?? 262), Number(p.ms ?? 300), mutedRef.current);
            break;
          case 'plot_xy': {
            const x = Math.max(0, Math.min(4, Number(p.x ?? 2)));
            const y = Math.max(0, Math.min(4, Number(p.y ?? 2)));
            const next = ledsRef.current.map((r) => [...r]);
            next[y][x] = bright;
            setLedMatrix(next);
            break;
          }
          case 'unplot_xy': {
            const x = Math.max(0, Math.min(4, Number(p.x ?? 2)));
            const y = Math.max(0, Math.min(4, Number(p.y ?? 2)));
            const next = ledsRef.current.map((r) => [...r]);
            next[y][x] = 0;
            setLedMatrix(next);
            break;
          }
          case 'toggle_xy': {
            const x = Math.max(0, Math.min(4, Number(p.x ?? 2)));
            const y = Math.max(0, Math.min(4, Number(p.y ?? 2)));
            const next = ledsRef.current.map((r) => [...r]);
            next[y][x] = next[y][x] > 0 ? 0 : bright;
            setLedMatrix(next);
            break;
          }
          case 'plot_bar_graph': {
            const src = String(p.source || 'lightLevel');
            const val =
              src === 'temperature'
                ? tempRef.current
                : src === 'lightLevel'
                  ? lightRef.current
                  : varsRef.current[src] ?? 0;
            setLedMatrix(buildBarGraphMatrix(val, Number(p.max ?? 255), bright));
            break;
          }
          case 'set_brightness':
            brightnessRef.current = Math.max(40, Math.min(255, Number(p.value ?? 255)));
            break;
          case 'radio_set_group':
            setRadioGroup(Number(p.group ?? 1));
            break;
          case 'radio_send_string': {
            const msg = String(p.text || 'HALO');
            setRadioLog(`TX [Grup ${radioGroup}]: "${msg}"`);
            // Loopback to on_radio_received so single-board students see Radio working live!
            const rxContainers = programRef.current.containers.filter(
              (c) => c.eventType === 'on_radio_received'
            );
            if (rxContainers.length > 0) {
              window.setTimeout(() => {
                if (runIdRef.current === runId && runningRef.current) {
                  rxContainers.forEach((rc) => runStatementsRef.current(rc.blocks, runId));
                }
              }, 260);
            }
            break;
          }
          case 'radio_send_number': {
            const src = String(p.source || 'temperature');
            const val =
              src === 'temperature'
                ? tempRef.current
                : src === 'lightLevel'
                  ? lightRef.current
                  : varsRef.current[src] ?? 0;
            setRadioLog(`TX [Grup ${radioGroup}]: ${val}`);
            const rxContainers = programRef.current.containers.filter(
              (c) => c.eventType === 'on_radio_received'
            );
            if (rxContainers.length > 0) {
              window.setTimeout(() => {
                if (runIdRef.current === runId && runningRef.current) {
                  rxContainers.forEach((rc) => runStatementsRef.current(rc.blocks, runId));
                }
              }, 260);
            }
            break;
          }
          case 'set_var': {
            const name = String(p.name || 'counter');
            varsRef.current = { ...varsRef.current, [name]: Number(p.value ?? 0) };
            setDebugVars({ ...varsRef.current });
            break;
          }
          case 'change_var': {
            const name = String(p.name || 'counter');
            const curr = varsRef.current[name] ?? 0;
            varsRef.current = { ...varsRef.current, [name]: curr + Number(p.delta ?? 1) };
            setDebugVars({ ...varsRef.current });
            break;
          }
          case 'show_var': {
            const name = String(p.name || 'counter');
            const val = String(varsRef.current[name] ?? 0);
            if (val.length === 1) {
              const cols = stringToScrollColumns(val);
              const frame = createEmptyLedMatrix();
              for (let x = 0; x < 5; x++) {
                const col = cols[2 + x] || [0, 0, 0, 0, 0];
                for (let y = 0; y < 5; y++) frame[y][x] = col[y] ? bright : 0;
              }
              setLedMatrix(frame);
            } else {
              const ok = await scrollText(val, runId);
              if (!ok) return false;
            }
            break;
          }
          case 'set_var_random': {
            const name = String(p.name || 'dice');
            const min = Number(p.min ?? 1);
            const max = Math.max(min, Number(p.max ?? 6));
            const rand = Math.floor(Math.random() * (max - min + 1)) + min;
            varsRef.current = { ...varsRef.current, [name]: rand };
            setDebugVars({ ...varsRef.current });
            break;
          }
          case 'if_sensor_action': {
            const src = String(p.source || 'temperature');
            const val =
              src === 'temperature'
                ? tempRef.current
                : src === 'lightLevel'
                  ? lightRef.current
                  : varsRef.current[src] ?? 0;
            const threshold = Number(p.threshold ?? 30);
            const op = String(p.op || '>');
            const matched =
              op === '>' ? val > threshold : op === '<' ? val < threshold : val === threshold;
            if (matched) {
              const icon = (p.icon as MicrobitIconName) || 'Skull';
              setLedMatrix(patternToLedMatrix(MICROBIT_ICONS[icon] || MICROBIT_ICONS.Skull, bright));
              playMicrobitMelody(String(p.melody || 'wawawawaa'), mutedRef.current);
              const ok = await sleep(550, runId);
              if (!ok) return false;
            }
            break;
          }
          case 'repeat_beep': {
            const count = Math.max(1, Math.min(6, Number(p.count ?? 3)));
            const icon = (p.icon as MicrobitIconName) || 'Heart';
            const pat = MICROBIT_ICONS[icon] || MICROBIT_ICONS.Heart;
            for (let k = 0; k < count; k++) {
              setLedMatrix(patternToLedMatrix(pat, bright));
              playMicrobitTone(523 + k * 70, 120, mutedRef.current);
              const ok1 = await sleep(220, runId);
              if (!ok1) return false;
              setLedMatrix(createEmptyLedMatrix());
              const ok2 = await sleep(160, runId);
              if (!ok2) return false;
            }
            break;
          }
        }

        if (debugRef.current) {
          const ok = await sleep(160, runId);
          if (!ok) return false;
        }
      }
      if (debugRef.current && onActiveBlockChange) onActiveBlockChange(null);
      return true;
    },
    [onActiveBlockChange, radioGroup, scrollText, setLedMatrix, sleep]
  );

  useEffect(() => {
    runStatementsRef.current = runStatements;
  }, [runStatements]);

  // Boot & Restart micro:bit runtime cleanly whenever program changes or Restart clicked
  const bootSimulator = useCallback(() => {
    runIdRef.current += 1;
    const myRunId = runIdRef.current;
    runningRef.current = true;
    setIsRunning(true);
    brightnessRef.current = 255;
    varsRef.current = { counter: 0, dice: 1 };
    setDebugVars({ counter: 0, dice: 1 });
    setRadioLog(null);
    setLedMatrix(createEmptyLedMatrix());

    const startAsync = async () => {
      const onStart = programRef.current.containers.find((c) => c.eventType === 'on_start');
      if (onStart && onStart.blocks.length > 0) {
        const ok = await runStatements(onStart.blocks, myRunId);
        if (!ok) return;
      }

      const forevers = programRef.current.containers.filter(
        (c) => c.eventType === 'forever' && c.blocks.length > 0
      );
      if (forevers.length > 0) {
        while (runIdRef.current === myRunId && runningRef.current) {
          for (const fc of forevers) {
            const ok = await runStatements(fc.blocks, myRunId);
            if (!ok) return;
          }
          const ok = await sleep(120, myRunId);
          if (!ok) return;
        }
      }
    };

    startAsync();
  }, [runStatements, setLedMatrix, sleep]);

  useEffect(() => {
    bootSimulator();
    return () => {
      runIdRef.current += 1;
    };
  }, [program, bootSimulator]);

  const handleToggleRun = () => {
    if (isRunning) {
      runningRef.current = false;
      runIdRef.current += 1;
      setIsRunning(false);
      setLedMatrix(createEmptyLedMatrix());
    } else {
      bootSimulator();
    }
  };

  const triggerHardwareEvent = (
    eventType: 'on_button' | 'on_shake' | 'on_logo' | 'on_pin',
    paramValue?: string
  ) => {
    if (!runningRef.current) {
      bootSimulator();
    }
    onUserInteraction?.();
    const currentRun = runIdRef.current;
    const matched = programRef.current.containers.filter((c) => {
      if (c.eventType !== eventType) return false;
      if (eventType === 'on_button') return String(c.params.button) === paramValue;
      if (eventType === 'on_pin') return String(c.params.pin) === paramValue;
      return true;
    });
    if (matched.length > 0) {
      matched.forEach((c) => {
        runStatements(c.blocks, currentRun);
      });
    } else {
      // Subtle tactile click sound even if no handler attached
      playMicrobitTone(740, 45, mutedRef.current);
    }
  };

  const handlePressButton = (btn: 'A' | 'B' | 'AB') => {
    setPressedBtn(btn);
    window.setTimeout(() => setPressedBtn(null), 170);
    triggerHardwareEvent('on_button', btn);
  };

  const handlePressLogo = () => {
    setPressedBtn('LOGO');
    window.setTimeout(() => setPressedBtn(null), 200);
    triggerHardwareEvent('on_logo');
  };

  const handlePressPin = (pin: 'P0' | 'P1' | 'P2') => {
    setPressedBtn(pin);
    window.setTimeout(() => setPressedBtn(null), 200);
    triggerHardwareEvent('on_pin', pin);
  };

  const handleShake = () => {
    setShaking(true);
    window.setTimeout(() => setShaking(false), 380);
    triggerHardwareEvent('on_shake');
  };

  const handleScreenshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 250;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#141517';
    ctx.fillRect(0, 0, 250, 250);
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const b = leds[y][x];
        ctx.fillStyle = b > 0 ? `rgba(255, 36, 36, ${Math.max(0.35, b / 255)})` : '#2d2f34';
        ctx.fillRect(28 + x * 40, 28 + y * 40, 18, 28);
      }
    }
    const a = document.createElement('a');
    a.download = 'codespark-microbit-led.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  // Detect which sensors are relevant so we keep the sensor tray crisp and focused
  const usesRadio = program.containers.some(
    (c) =>
      c.eventType === 'on_radio_received' ||
      c.blocks.some((b) => b.type.startsWith('radio_'))
  );
  const usesTempOrLight = program.containers.some((c) =>
    c.blocks.some(
      (b) =>
        b.type === 'show_temperature' ||
        b.type === 'show_light_level' ||
        b.type === 'plot_bar_graph' ||
        b.type === 'if_sensor_action' ||
        b.type === 'radio_send_number'
    )
  );

  const renderBoard = (large = false) => (
    <div
      className={`relative mx-auto rounded-[18px] bg-[#141517] shadow-lg overflow-hidden select-none border-2 border-[#0a0b0d] transition-transform ${
        shaking ? 'animate-bounce' : ''
      } ${large ? 'w-full max-w-[440px]' : 'w-full'}`}
      style={{ aspectRatio: '1.22 / 1' }}
    >
      {/* Top-Left Yellow-Gold Diagonal Stripes (authentic micro:bit v2 silkscreen!) */}
      <svg
        viewBox="0 0 240 196"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <polygon points="0,0 56,0 0,56" fill="#F4C744" />
        <polygon points="62,0 92,0 62,30" fill="#F4C744" />
        <polygon points="96,0 112,0 96,16" fill="#F4C744" />
      </svg>

      {/* Top-Center Golden Touch Logo (clickable!) */}
      <button
        type="button"
        onClick={handlePressLogo}
        title="Sentuh Logo micro:bit v2 (on logo pressed)"
        className={`absolute top-[11%] left-1/2 -translate-x-1/2 w-[19%] h-[14%] rounded-full border-[3.5px] transition-all cursor-pointer flex items-center justify-center gap-2.5 z-10 ${
          pressedBtn === 'LOGO'
            ? 'border-[#ff4444] bg-[#F4C744]/35 scale-95'
            : 'border-[#F4C744] bg-[#141517] hover:bg-[#F4C744]/20'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#F4C744]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#F4C744]" />
      </button>

      {/* Center 5x5 Red LED Matrix */}
      <div className="absolute top-[29%] left-1/2 -translate-x-1/2 w-[45%] h-[42%] grid grid-cols-5 grid-rows-5 gap-1.5 place-items-center z-10">
        {leds.map((row, y) =>
          row.map((val, x) => {
            const on = val > 0;
            const alpha = Math.max(0.35, val / 255);
            return (
              <div
                key={`${x}-${y}`}
                className="w-[46%] h-[78%] rounded-[2px] transition-all duration-100"
                style={{
                  backgroundColor: on ? `rgba(255, 42, 42, ${alpha})` : '#2b2d31',
                  boxShadow: on
                    ? `0 0 ${large ? 14 : 9}px rgba(255, 42, 42, ${alpha}), inset 0 0 3px #ffd1d1`
                    : 'inset 0 1px 1px rgba(0,0,0,0.6)',
                }}
              />
            );
          })
        )}
      </div>

      {/* Left Tactile Button A */}
      <div className="absolute left-[5.5%] top-[41%] flex flex-col items-center gap-1 z-10">
        <button
          type="button"
          onClick={() => handlePressButton('A')}
          title="Tekan Tombol A"
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-[4px] bg-[#9ca3af] border-2 border-[#4b5563] shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${
            pressedBtn === 'A' ? 'scale-90 ring-2 ring-[#FFE600]' : 'hover:brightness-110'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-[#1f2937] border border-slate-500 block" />
        </button>
        <span className="px-1.5 py-0.5 text-[10px] font-black bg-[#F4C744] text-black leading-none rounded-[2px]">
          A
        </span>
      </div>

      {/* Right Tactile Button B */}
      <div className="absolute right-[5.5%] top-[34%] flex flex-col items-center gap-1 z-10">
        <span className="px-1.5 py-0.5 text-[10px] font-black bg-[#F4C744] text-black leading-none rounded-[2px]">
          B
        </span>
        <button
          type="button"
          onClick={() => handlePressButton('B')}
          title="Tekan Tombol B"
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-[4px] bg-[#9ca3af] border-2 border-[#4b5563] shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${
            pressedBtn === 'B' ? 'scale-90 ring-2 ring-[#FFE600]' : 'hover:brightness-110'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-[#1f2937] border border-slate-500 block" />
        </button>
      </div>

      {/* Bottom Gold Edge Connector Pins (0, 1, 2, 3V, GND) */}
      <div className="absolute bottom-0 inset-x-0 h-[21%] flex items-end justify-between px-2 pb-1 z-10">
        {/* Serrated gold teeth background */}
        <div
          className="absolute bottom-0 inset-x-0 h-[62%] opacity-90 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #D9AD3B 0px, #D9AD3B 3px, #141517 3px, #141517 5px)',
          }}
        />
        {[
          { id: 'P0' as const, label: '0', interactive: true },
          { id: 'P1' as const, label: '1', interactive: true },
          { id: 'P2' as const, label: '2', interactive: true },
          { id: '3V' as const, label: '3V', interactive: false },
          { id: 'GND' as const, label: 'GND', interactive: false },
        ].map((pin) => {
          const isPressed = pressedBtn === pin.id;
          return (
            <button
              key={pin.id}
              type="button"
              disabled={!pin.interactive}
              onClick={() => pin.interactive && handlePressPin(pin.id as 'P0' | 'P1' | 'P2')}
              title={pin.interactive ? `Sentuh Pin ${pin.id}` : `Pin Daya ${pin.label}`}
              className={`relative z-10 w-[16%] h-full rounded-t-full border-t-2 border-x-2 border-[#F4C744] bg-[#D9AD3B] flex flex-col items-center justify-between py-0.5 ${
                pin.interactive ? 'cursor-pointer hover:brightness-110' : 'cursor-default'
              } ${isPressed ? 'ring-2 ring-rose-500' : ''}`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 border-[#F4C744] ${
                  isPressed ? 'bg-rose-500' : 'bg-[#141517]'
                }`}
              />
              <span className="text-[9px] font-black text-black leading-none">{pin.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2.5">
      {renderBoard(false)}

      {/* Royal-Blue 6-Button MakeCode micro:bit Control Strip */}
      <div className="flex items-center justify-center gap-1">
        <div className="inline-flex rounded overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={handleToggleRun}
            className={`w-8 h-8 flex items-center justify-center text-white cursor-pointer transition-colors ${
              isRunning ? 'bg-[#2B56D6] hover:bg-[#2145b3]' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
            title={isRunning ? 'Stop Simulator' : 'Jalankan Simulator'}
          >
            {isRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
          <button
            type="button"
            onClick={bootSimulator}
            className="w-8 h-8 bg-[#2B56D6] hover:bg-[#2145b3] text-white border-l border-white/20 flex items-center justify-center cursor-pointer"
            title="Restart micro:bit"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDebugMode((d) => !d)}
            className={`w-8 h-8 text-white border-l border-white/20 flex items-center justify-center cursor-pointer ${
              debugMode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#2B56D6] hover:bg-[#2145b3]'
            }`}
            title="Mode Debug (Snail Trace & Variabel)"
          >
            <Bug className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className={`w-8 h-8 rounded text-white flex items-center justify-center cursor-pointer shadow-sm ${
            muted ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#2B56D6] hover:bg-[#2145b3]'
          }`}
          title={muted ? 'Aktifkan Speaker Piezo' : 'Matikan Speaker'}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        <div className="inline-flex rounded overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={handleScreenshot}
            className="w-8 h-8 bg-[#2B56D6] hover:bg-[#2145b3] text-white flex items-center justify-center cursor-pointer"
            title="Simpan Gambar LED (PNG)"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="w-8 h-8 bg-[#2B56D6] hover:bg-[#2145b3] text-white border-l border-white/20 flex items-center justify-center cursor-pointer"
            title="Perbesar Simulator"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Hardware Triggers: SHAKE + A+B + Sensors */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-2 shadow-sm">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={handleShake}
            className="py-1.5 px-2.5 rounded bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            title="Goyangkan micro:bit (memicu on shake)"
          >
            <Vibrate className="w-3.5 h-3.5" />
            SHAKE
          </button>
          <button
            type="button"
            onClick={() => handlePressButton('AB')}
            className="py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
            title="Tekan Tombol A+B bersamaan"
          >
            Tombol A+B
          </button>
        </div>

        {/* Temperature & Light Sliders (always live, highlighted when sensor blocks used) */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          <label className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              Suhu Sensor
            </span>
            <span className="font-mono font-extrabold text-rose-600 tabular-nums">
              {temperature}°C
            </span>
          </label>
          <input
            type="range"
            min={0}
            max={50}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full accent-rose-500 h-1.5 cursor-pointer"
          />

          <label className="flex items-center justify-between text-[11px] font-bold text-slate-700 pt-0.5">
            <span className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              Sensor Cahaya
            </span>
            <span className="font-mono font-extrabold text-amber-600 tabular-nums">
              {lightLevel} / 255
            </span>
          </label>
          <input
            type="range"
            min={0}
            max={255}
            value={lightLevel}
            onChange={(e) => setLightLevel(Number(e.target.value))}
            className="w-full accent-amber-500 h-1.5 cursor-pointer"
          />
        </div>

        {usesRadio && (
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-bold text-pink-700 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" />
              Radio Grup {radioGroup}
            </span>
            <span className="font-mono text-[10px] font-bold text-slate-600 truncate max-w-[130px]">
              {radioLog || 'Siaga'}
            </span>
          </div>
        )}

        {(debugMode || usesTempOrLight) && (
          <div className="pt-1 border-t border-slate-100 flex flex-wrap gap-2 text-[10px] font-mono text-slate-500">
            <span>counter={debugVars.counter ?? 0}</span>
            <span>·</span>
            <span>dice={debugVars.dice ?? 1}</span>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[480px] space-y-3">
            <div className="flex items-center justify-between text-white">
              <span className="font-extrabold text-sm">Simulator micro:bit v2 — Layar Penuh</span>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1.5 rounded bg-[#2B56D6] hover:bg-[#2145b3] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
                Tutup
              </button>
            </div>
            {renderBoard(true)}
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={handleShake}
                className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer"
              >
                SHAKE
              </button>
              <button
                type="button"
                onClick={() => handlePressButton('AB')}
                className="px-4 py-2 rounded-lg bg-white text-slate-900 font-extrabold text-xs cursor-pointer"
              >
                Tekan A+B
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
