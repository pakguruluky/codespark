import React from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import {
  MICROBIT_ICON_LIST,
  getMicrobitCategoryColor,
  getMicrobitEventColor,
  getMicrobitStmtCategory,
  type MicrobitEventContainer,
  type MicrobitMelodyName,
  type MicrobitProgram,
  type MicrobitStmtBlock,
} from '../engine/microbitEngine';

interface Props {
  program: MicrobitProgram;
  activeContainerId: string;
  activeExecutingBlockId: string | null;
  zoom: number;
  onSelectContainer: (id: string) => void;
  onUpdateContainerParam: (id: string, key: string, val: string | number | boolean) => void;
  onRemoveContainer: (id: string) => void;
  onUpdateBlockParam: (
    containerId: string,
    blockId: string,
    key: string,
    val: string | number | boolean
  ) => void;
  onMoveBlock: (containerId: string, blockId: string, dir: -1 | 1) => void;
  onRemoveBlock: (containerId: string, blockId: string) => void;
  onDropTemplate: (containerId: string, templateId: string) => void;
}

const MELODY_OPTIONS: Array<{ value: MicrobitMelodyName; label: string }> = [
  { value: 'ba_ding', label: 'ba ding' },
  { value: 'power_up', label: 'power up' },
  { value: 'jump_up', label: 'jump up' },
  { value: 'birthday', label: 'birthday' },
  { value: 'entertainer', label: 'entertainer' },
  { value: 'ode', label: 'ode to joy' },
  { value: 'wawawawaa', label: 'wawawawaa' },
];

const NOTE_OPTIONS: Array<{ freq: number; label: string }> = [
  { freq: 262, label: 'Middle C (262)' },
  { freq: 294, label: 'Middle D (294)' },
  { freq: 330, label: 'Middle E (330)' },
  { freq: 349, label: 'Middle F (349)' },
  { freq: 392, label: 'Middle G (392)' },
  { freq: 440, label: 'Middle A (440)' },
  { freq: 494, label: 'Middle B (494)' },
  { freq: 523, label: 'High C (523)' },
];

const pillSelect =
  'bg-white text-slate-900 rounded-full px-2 py-0.5 text-[11px] font-extrabold border border-black/15 focus:outline-none cursor-pointer';
const pillInput =
  'bg-white text-slate-900 rounded-full px-2 py-0.5 text-[11px] font-extrabold border border-black/15 focus:outline-none w-14 text-center';

export const MicrobitBlocksCanvas: React.FC<Props> = ({
  program,
  activeContainerId,
  activeExecutingBlockId,
  zoom,
  onSelectContainer,
  onUpdateContainerParam,
  onRemoveContainer,
  onUpdateBlockParam,
  onMoveBlock,
  onRemoveBlock,
  onDropTemplate,
}) => {
  const renderLedEditor = (containerId: string, blk: MicrobitStmtBlock) => {
    const rawRows = String(blk.params.grid || '01010|11111|11111|01110|00100').split('|');
    const rows = Array.from({ length: 5 }, (_, y) =>
      (rawRows[y] || '00000').padEnd(5, '0').slice(0, 5)
    );

    const toggleCell = (x: number, y: number) => {
      const next = [...rows];
      const ch = next[y][x] === '1' ? '0' : '1';
      next[y] = next[y].slice(0, x) + ch + next[y].slice(x + 1);
      onUpdateBlockParam(containerId, blk.id, 'grid', next.join('|'));
    };

    return (
      <div className="flex flex-col gap-1.5">
        <span>show leds</span>
        <div
          className="grid grid-cols-5 gap-1 p-1.5 rounded bg-[#14559c] border border-black/20 w-fit"
          onClick={(e) => e.stopPropagation()}
        >
          {rows.map((r, y) =>
            r.split('').map((ch, x) => (
              <button
                key={`${x}-${y}`}
                type="button"
                onClick={() => toggleCell(x, y)}
                className={`w-4 h-4 rounded-[2px] border cursor-pointer transition-colors ${
                  ch === '1'
                    ? 'bg-[#ff3030] border-white shadow-sm'
                    : 'bg-[#0e3969] border-white/25 hover:bg-[#1a5291]'
                }`}
                aria-label={`LED ${x},${y}`}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  const renderStmt = (containerId: string, blk: MicrobitStmtBlock) => {
    const p = blk.params;
    const upd = (key: string, val: string | number | boolean) =>
      onUpdateBlockParam(containerId, blk.id, key, val);

    switch (blk.type) {
      case 'show_number':
        return (
          <>
            <span>show number</span>
            <input
              type="number"
              value={Number(p.value ?? 0)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('value', Number(e.target.value) || 0)}
              className={pillInput}
            />
          </>
        );
      case 'show_leds':
        return renderLedEditor(containerId, blk);
      case 'show_icon':
        return (
          <>
            <span>show icon</span>
            <select
              value={String(p.icon || 'Heart')}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('icon', e.target.value)}
              className={pillSelect}
            >
              {MICROBIT_ICON_LIST.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
          </>
        );
      case 'show_string':
        return (
          <>
            <span>show string</span>
            <input
              type="text"
              value={String(p.text || '')}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('text', e.target.value)}
              className="bg-white text-slate-900 rounded-full px-2.5 py-0.5 text-[11px] font-bold border border-black/15 w-28"
            />
          </>
        );
      case 'clear_screen':
        return <span>clear screen</span>;
      case 'pause':
        return (
          <>
            <span>pause (ms)</span>
            <input
              type="number"
              min={100}
              step={100}
              value={Number(p.ms ?? 500)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('ms', Math.max(100, Number(e.target.value) || 200))}
              className={pillInput}
            />
          </>
        );
      case 'show_temperature':
        return <span>show number [temperature (°C)]</span>;
      case 'show_light_level':
        return <span>show number [light level]</span>;
      case 'play_melody':
        return (
          <>
            <span>start melody</span>
            <select
              value={String(p.melody || 'ba_ding')}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('melody', e.target.value)}
              className={pillSelect}
            >
              {MELODY_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </>
        );
      case 'play_tone':
        return (
          <>
            <span>play tone</span>
            <select
              value={Number(p.freq ?? 262)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('freq', Number(e.target.value))}
              className={pillSelect}
            >
              {NOTE_OPTIONS.map((n) => (
                <option key={n.freq} value={n.freq}>
                  {n.label}
                </option>
              ))}
            </select>
            <span>ms</span>
            <input
              type="number"
              min={80}
              step={50}
              value={Number(p.ms ?? 300)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('ms', Math.max(80, Number(e.target.value) || 200))}
              className={pillInput}
            />
          </>
        );
      case 'plot_xy':
      case 'unplot_xy':
      case 'toggle_xy':
        return (
          <>
            <span>{blk.type.replace('_xy', '')} x</span>
            <input
              type="number"
              min={0}
              max={4}
              value={Number(p.x ?? 2)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('x', Math.max(0, Math.min(4, Number(e.target.value) || 0)))}
              className="bg-white text-slate-900 rounded-full px-1.5 py-0.5 text-[11px] font-extrabold w-10 text-center"
            />
            <span>y</span>
            <input
              type="number"
              min={0}
              max={4}
              value={Number(p.y ?? 2)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('y', Math.max(0, Math.min(4, Number(e.target.value) || 0)))}
              className="bg-white text-slate-900 rounded-full px-1.5 py-0.5 text-[11px] font-extrabold w-10 text-center"
            />
          </>
        );
      case 'plot_bar_graph':
        return (
          <>
            <span>plot bar graph of</span>
            <select
              value={String(p.source || 'lightLevel')}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('source', e.target.value)}
              className={pillSelect}
            >
              <option value="lightLevel">light level</option>
              <option value="temperature">temperature</option>
              <option value="counter">counter</option>
            </select>
            <span>up to</span>
            <input
              type="number"
              value={Number(p.max ?? 255)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('max', Math.max(1, Number(e.target.value) || 50))}
              className={pillInput}
            />
          </>
        );
      case 'set_brightness':
        return (
          <>
            <span>set brightness</span>
            <input
              type="number"
              min={40}
              max={255}
              value={Number(p.value ?? 255)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('value', Math.max(40, Math.min(255, Number(e.target.value) || 255)))}
              className={pillInput}
            />
          </>
        );
      case 'radio_set_group':
        return (
          <>
            <span>radio set group</span>
            <input
              type="number"
              min={1}
              max={99}
              value={Number(p.group ?? 7)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('group', Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
              className={pillInput}
            />
          </>
        );
      case 'radio_send_string':
        return (
          <>
            <span>radio send string</span>
            <input
              type="text"
              value={String(p.text || 'CERAH')}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('text', e.target.value)}
              className="bg-white text-slate-900 rounded-full px-2.5 py-0.5 text-[11px] font-bold w-24"
            />
          </>
        );
      case 'radio_send_number':
        return (
          <>
            <span>radio send number</span>
            <select
              value={String(p.source || 'temperature')}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('source', e.target.value)}
              className={pillSelect}
            >
              <option value="temperature">temperature</option>
              <option value="lightLevel">light level</option>
              <option value="counter">counter</option>
            </select>
          </>
        );
      case 'set_var':
        return (
          <>
            <span>set</span>
            <select
              value={String(p.name || 'counter')}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('name', e.target.value)}
              className={pillSelect}
            >
              <option value="counter">counter</option>
              <option value="dice">dice</option>
            </select>
            <span>to</span>
            <input
              type="number"
              value={Number(p.value ?? 0)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('value', Number(e.target.value) || 0)}
              className={pillInput}
            />
          </>
        );
      case 'change_var':
        return (
          <>
            <span>change</span>
            <select
              value={String(p.name || 'counter')}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('name', e.target.value)}
              className={pillSelect}
            >
              <option value="counter">counter</option>
              <option value="dice">dice</option>
            </select>
            <span>by</span>
            <input
              type="number"
              value={Number(p.delta ?? 1)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('delta', Number(e.target.value) || 1)}
              className={pillInput}
            />
          </>
        );
      case 'show_var':
        return (
          <>
            <span>show number</span>
            <select
              value={String(p.name || 'counter')}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('name', e.target.value)}
              className={pillSelect}
            >
              <option value="counter">counter</option>
              <option value="dice">dice</option>
            </select>
          </>
        );
      case 'set_var_random':
        return (
          <>
            <span>set</span>
            <select
              value={String(p.name || 'dice')}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('name', e.target.value)}
              className={pillSelect}
            >
              <option value="dice">dice</option>
              <option value="counter">counter</option>
            </select>
            <span>pick random</span>
            <input
              type="number"
              value={Number(p.min ?? 1)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('min', Number(e.target.value) || 1)}
              className="bg-white text-slate-900 rounded-full px-1.5 py-0.5 text-[11px] font-extrabold w-10 text-center"
            />
            <span>to</span>
            <input
              type="number"
              value={Number(p.max ?? 6)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('max', Number(e.target.value) || 6)}
              className="bg-white text-slate-900 rounded-full px-1.5 py-0.5 text-[11px] font-extrabold w-10 text-center"
            />
          </>
        );
      case 'if_sensor_action':
        return (
          <>
            <span>if</span>
            <select
              value={String(p.source || 'temperature')}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('source', e.target.value)}
              className={pillSelect}
            >
              <option value="temperature">temperature</option>
              <option value="lightLevel">light level</option>
              <option value="counter">counter</option>
            </select>
            <select
              value={String(p.op || '>')}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('op', e.target.value)}
              className={pillSelect}
            >
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value="==">=</option>
            </select>
            <input
              type="number"
              value={Number(p.threshold ?? 30)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('threshold', Number(e.target.value) || 0)}
              className="bg-white text-slate-900 rounded-full px-1.5 py-0.5 text-[11px] font-extrabold w-12 text-center"
            />
            <span>→</span>
            <select
              value={String(p.icon || 'Skull')}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('icon', e.target.value)}
              className={pillSelect}
            >
              {MICROBIT_ICON_LIST.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
          </>
        );
      case 'repeat_beep':
        return (
          <>
            <span>repeat</span>
            <input
              type="number"
              min={1}
              max={6}
              value={Number(p.count ?? 3)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('count', Math.max(1, Math.min(6, Number(e.target.value) || 2)))}
              className="bg-white text-slate-900 rounded-full px-1.5 py-0.5 text-[11px] font-extrabold w-10 text-center"
            />
            <span>× blink</span>
            <select
              value={String(p.icon || 'Heart')}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => upd('icon', e.target.value)}
              className={pillSelect}
            >
              {MICROBIT_ICON_LIST.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
          </>
        );
    }
  };

  const renderContainerHeader = (c: MicrobitEventContainer) => {
    const upd = (k: string, v: string | number | boolean) => onUpdateContainerParam(c.id, k, v);
    if (c.eventType === 'on_start') return <span className="font-extrabold text-[13px]">on start</span>;
    if (c.eventType === 'forever') return <span className="font-extrabold text-[13px]">forever</span>;
    if (c.eventType === 'on_shake') return <span className="font-extrabold text-[12.5px]">on shake</span>;
    if (c.eventType === 'on_logo') return <span className="font-extrabold text-[12.5px]">on logo pressed</span>;
    if (c.eventType === 'on_radio_received')
      return <span className="font-extrabold text-[12.5px]">on radio received</span>;
    if (c.eventType === 'on_button') {
      return (
        <div className="flex items-center gap-1.5 text-[12px] font-extrabold">
          <span>on button</span>
          <select
            value={String(c.params.button || 'A')}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => upd('button', e.target.value)}
            className={pillSelect}
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">A+B</option>
          </select>
          <span>pressed</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-[12px] font-extrabold">
        <span>on pin</span>
        <select
          value={String(c.params.pin || 'P0')}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => upd('pin', e.target.value)}
          className={pillSelect}
        >
          <option value="P0">P0</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
        </select>
        <span>pressed</span>
      </div>
    );
  };

  return (
    <div
      className="flex-1 overflow-auto p-5"
      style={{
        backgroundColor: '#f3f5f8',
        backgroundImage:
          'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
        backgroundSize: '22px 22px',
      }}
    >
      <div
        className="flex flex-wrap items-start gap-5 origin-top-left transition-transform duration-150 pb-10"
        style={{ transform: `scale(${zoom})` }}
      >
        {program.containers.map((container) => {
          const evColor = getMicrobitEventColor(container.eventType);
          const isActive = container.id === activeContainerId;

          return (
            <div
              key={container.id}
              onClick={() => onSelectContainer(container.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const tplId = e.dataTransfer.getData('text/mb-template');
                if (tplId) onDropTemplate(container.id, tplId);
              }}
              className={`min-w-[260px] max-w-[440px] rounded-xl transition-all cursor-pointer ${
                isActive ? 'ring-3 ring-[#2B56D6]/60 shadow-lg' : 'shadow-md hover:shadow-lg'
              }`}
            >
              {/* Top C-Block Hat */}
              <div
                className="px-3.5 py-2.5 text-white rounded-t-xl flex items-center justify-between gap-2 border-b border-black/15"
                style={{ backgroundColor: evColor }}
              >
                {renderContainerHeader(container)}
                <div className="flex items-center gap-1 shrink-0">
                  {isActive && (
                    <span className="text-[9px] font-black uppercase bg-black/25 px-1.5 py-0.5 rounded">
                      Target
                    </span>
                  )}
                  {container.eventType !== 'on_start' && container.eventType !== 'forever' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveContainer(container.id);
                      }}
                      className="p-1 rounded hover:bg-black/20 text-white cursor-pointer"
                      title="Hapus event ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Inner Block Spine */}
              <div
                className="pl-4 pr-2.5 py-2.5 space-y-1.5 border-l-[12px]"
                style={{
                  borderLeftColor: evColor,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.85)',
                }}
              >
                {container.blocks.length === 0 ? (
                  <div className="py-2.5 px-3 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 text-[11px] font-bold flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Klik atau seret blok ke sini
                  </div>
                ) : (
                  container.blocks.map((blk, idx) => {
                    const catColor = getMicrobitCategoryColor(getMicrobitStmtCategory(blk.type));
                    const isExec = activeExecutingBlockId === blk.id;
                    return (
                      <div
                        key={blk.id}
                        className={`group rounded-lg px-2.5 py-1.5 text-white text-[11.5px] font-bold flex items-start justify-between gap-2 shadow-sm border-b-2 border-black/20 transition-all ${
                          isExec ? 'ring-3 ring-[#FFE600] scale-[1.02]' : ''
                        }`}
                        style={{ backgroundColor: catColor }}
                      >
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          {renderStmt(container.id, blk)}
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0 opacity-75 group-hover:opacity-100">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveBlock(container.id, blk.id, -1);
                            }}
                            className="p-0.5 rounded hover:bg-black/20 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === container.blocks.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveBlock(container.id, blk.id, 1);
                            }}
                            className="p-0.5 rounded hover:bg-black/20 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveBlock(container.id, blk.id);
                            }}
                            className="p-0.5 rounded hover:bg-black/25 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom C-Block Cap */}
              <div
                className="h-3.5 rounded-b-xl border-t border-black/10"
                style={{ backgroundColor: evColor }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
