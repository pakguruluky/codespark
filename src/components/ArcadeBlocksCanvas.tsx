import React from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import {
  getCategoryColor,
  getEventColor,
  getStatementCategory,
  type ArcadeBlockProgram,
  type ArcadeEventContainer,
  type ArcadeSoundName,
  type ArcadeStatementBlock,
  type BgEffectType,
  type ParticleEffectType,
  type SpawnPattern,
  type SpriteKind,
} from '../engine/arcadeEngine';
import {
  ARCADE_SPRITE_LIST,
  BG_COLOR_OPTIONS,
  getSpritePixels,
  spriteToDataUrl,
  type PixelSpriteGrid,
} from '../engine/arcadeSprites';

interface Props {
  program: ArcadeBlockProgram;
  customSprites: Record<string, PixelSpriteGrid>;
  activeContainerId: string;
  zoom: number;
  onSelectContainer: (containerId: string) => void;
  onUpdateContainerParam: (containerId: string, key: string, value: string | number | boolean) => void;
  onRemoveContainer: (containerId: string) => void;
  onUpdateBlockParam: (
    containerId: string,
    blockId: string,
    key: string,
    value: string | number | boolean
  ) => void;
  onMoveBlock: (containerId: string, blockId: string, dir: -1 | 1) => void;
  onRemoveBlock: (containerId: string, blockId: string) => void;
  onDropTemplateIntoContainer: (containerId: string, templateId: string) => void;
}

const SOUND_OPTIONS: Array<{ value: ArcadeSoundName; label: string }> = [
  { value: 'ba_ding', label: 'ba ding' },
  { value: 'pew_pew', label: 'pew pew' },
  { value: 'jump_up', label: 'jump up' },
  { value: 'power_up', label: 'power up' },
  { value: 'magic_wand', label: 'magic wand' },
  { value: 'zapped', label: 'zapped' },
  { value: 'wawawawaa', label: 'wawawawaa' },
];

const EFFECT_OPTIONS: Array<{ value: ParticleEffectType; label: string }> = [
  { value: 'confetti', label: 'confetti' },
  { value: 'fire', label: 'fire' },
  { value: 'hearts', label: 'hearts' },
  { value: 'rings', label: 'rings' },
  { value: 'halo', label: 'halo' },
  { value: 'none', label: 'none' },
];

const BG_EFFECT_OPTIONS: Array<{ value: BgEffectType; label: string }> = [
  { value: 'starfield', label: 'starfield' },
  { value: 'snow', label: 'snow' },
  { value: 'grid', label: 'grid' },
  { value: 'bubbles', label: 'bubbles' },
  { value: 'none', label: 'none' },
];

const PATTERN_OPTIONS: Array<{ value: SpawnPattern; label: string }> = [
  { value: 'top_random', label: 'jatuh atas' },
  { value: 'side_random', label: 'lintas samping' },
  { value: 'wander', label: 'melayang acak' },
];

const KIND_OPTIONS: SpriteKind[] = ['Player', 'Food', 'Enemy', 'Projectile'];

const pillSelectClass =
  'bg-white text-slate-900 rounded-full px-2 py-0.5 text-[11px] font-extrabold border border-black/15 shadow-inner focus:outline-none cursor-pointer';
const pillInputClass =
  'bg-white text-slate-900 rounded-full px-2 py-0.5 text-[11px] font-extrabold border border-black/15 shadow-inner focus:outline-none w-14 text-center';

export const ArcadeBlocksCanvas: React.FC<Props> = ({
  program,
  customSprites,
  activeContainerId,
  zoom,
  onSelectContainer,
  onUpdateContainerParam,
  onRemoveContainer,
  onUpdateBlockParam,
  onMoveBlock,
  onRemoveBlock,
  onDropTemplateIntoContainer,
}) => {
  const renderSpriteThumb = (spriteId: string) => {
    const url = spriteToDataUrl(getSpritePixels(spriteId, customSprites), 2);
    if (!url) return null;
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-900 border border-white/60 shrink-0">
        <img
          src={url}
          alt={spriteId}
          className="w-5 h-5"
          style={{ imageRendering: 'pixelated' }}
        />
      </span>
    );
  };

  const renderStatementContent = (containerId: string, blk: ArcadeStatementBlock) => {
    const p = blk.params;
    const upd = (key: string, val: string | number | boolean) =>
      onUpdateBlockParam(containerId, blk.id, key, val);

    switch (blk.type) {
      case 'set_bg_color':
        return (
          <>
            <span>set background color to</span>
            <select
              value={String(p.color || 'space')}
              onChange={(e) => upd('color', e.target.value)}
              className={pillSelectClass}
            >
              {BG_COLOR_OPTIONS.map((bg) => (
                <option key={bg.id} value={bg.id}>
                  {bg.label}
                </option>
              ))}
            </select>
          </>
        );
      case 'set_bg_effect':
        return (
          <>
            <span>start screen effect</span>
            <select
              value={String(p.effect || 'starfield')}
              onChange={(e) => upd('effect', e.target.value)}
              className={pillSelectClass}
            >
              {BG_EFFECT_OPTIONS.map((ef) => (
                <option key={ef.value} value={ef.value}>
                  {ef.label}
                </option>
              ))}
            </select>
          </>
        );
      case 'create_player':
        return (
          <>
            <span>set mySprite to</span>
            {renderSpriteThumb(String(p.spriteId || 'rocket'))}
            <select
              value={String(p.spriteId || 'rocket')}
              onChange={(e) => upd('spriteId', e.target.value)}
              className={pillSelectClass}
            >
              {ARCADE_SPRITE_LIST.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
            <span className="opacity-90">of kind Player</span>
          </>
        );
      case 'move_with_buttons':
        return (
          <>
            <span>move mySprite with buttons vx</span>
            <input
              type="number"
              value={Number(p.vx ?? 105)}
              onChange={(e) => upd('vx', Number(e.target.value) || 0)}
              className={pillInputClass}
            />
            <span>vy</span>
            <input
              type="number"
              value={Number(p.vy ?? 105)}
              onChange={(e) => upd('vy', Number(e.target.value) || 0)}
              className={pillInputClass}
            />
          </>
        );
      case 'stay_in_screen':
        return (
          <>
            <span>set mySprite stay in screen</span>
            <select
              value={p.enabled === false ? 'false' : 'true'}
              onChange={(e) => upd('enabled', e.target.value === 'true')}
              className={pillSelectClass}
            >
              <option value="true">ON</option>
              <option value="false">OFF</option>
            </select>
          </>
        );
      case 'fire_projectile':
        return (
          <>
            <span>projectile</span>
            {renderSpriteThumb(String(p.spriteId || 'laser'))}
            <select
              value={String(p.spriteId || 'laser')}
              onChange={(e) => upd('spriteId', e.target.value)}
              className={pillSelectClass}
            >
              {ARCADE_SPRITE_LIST.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
            <span>vx</span>
            <input
              type="number"
              value={Number(p.vx ?? 0)}
              onChange={(e) => upd('vx', Number(e.target.value) || 0)}
              className={pillInputClass}
            />
            <span>vy</span>
            <input
              type="number"
              value={Number(p.vy ?? -125)}
              onChange={(e) => upd('vy', Number(e.target.value) || 0)}
              className={pillInputClass}
            />
          </>
        );
      case 'spawn_sprite':
        return (
          <>
            <span>spawn</span>
            <select
              value={String(p.kind || 'Enemy')}
              onChange={(e) => upd('kind', e.target.value)}
              className={pillSelectClass}
            >
              <option value="Food">Food</option>
              <option value="Enemy">Enemy</option>
            </select>
            {renderSpriteThumb(String(p.spriteId || 'meteor'))}
            <select
              value={String(p.spriteId || 'meteor')}
              onChange={(e) => upd('spriteId', e.target.value)}
              className={pillSelectClass}
            >
              {ARCADE_SPRITE_LIST.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
            <select
              value={String(p.pattern || 'top_random')}
              onChange={(e) => upd('pattern', e.target.value)}
              className={pillSelectClass}
            >
              {PATTERN_OPTIONS.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
            <span>spd</span>
            <input
              type="number"
              value={Number(p.speed ?? 45)}
              onChange={(e) => upd('speed', Number(e.target.value) || 20)}
              className={pillInputClass}
            />
          </>
        );
      case 'destroy_other':
        return (
          <>
            <span>destroy otherSprite with</span>
            <select
              value={String(p.effect || 'fire')}
              onChange={(e) => upd('effect', e.target.value)}
              className={pillSelectClass}
            >
              {EFFECT_OPTIONS.map((ef) => (
                <option key={ef.value} value={ef.value}>
                  {ef.label}
                </option>
              ))}
            </select>
            <span>effect</span>
          </>
        );
      case 'destroy_self':
        return (
          <>
            <span>destroy projectile with</span>
            <select
              value={String(p.effect || 'rings')}
              onChange={(e) => upd('effect', e.target.value)}
              className={pillSelectClass}
            >
              {EFFECT_OPTIONS.map((ef) => (
                <option key={ef.value} value={ef.value}>
                  {ef.label}
                </option>
              ))}
            </select>
          </>
        );
      case 'start_effect':
        return (
          <>
            <span>start</span>
            <select
              value={String(p.effect || 'confetti')}
              onChange={(e) => upd('effect', e.target.value)}
              className={pillSelectClass}
            >
              {EFFECT_OPTIONS.map((ef) => (
                <option key={ef.value} value={ef.value}>
                  {ef.label}
                </option>
              ))}
            </select>
            <span>effect on</span>
            <select
              value={String(p.target || 'player')}
              onChange={(e) => upd('target', e.target.value)}
              className={pillSelectClass}
            >
              <option value="player">mySprite</option>
              <option value="other">otherSprite</option>
            </select>
          </>
        );
      case 'say_text':
        return (
          <>
            <span>mySprite say</span>
            <input
              type="text"
              value={String(p.text || '')}
              onChange={(e) => upd('text', e.target.value)}
              className="bg-white text-slate-900 rounded-full px-2.5 py-0.5 text-[11px] font-bold border border-black/15 w-28"
            />
            <span>for</span>
            <input
              type="number"
              value={Number(p.ms ?? 900)}
              onChange={(e) => upd('ms', Number(e.target.value) || 500)}
              className={pillInputClass}
            />
            <span>ms</span>
          </>
        );
      case 'dash_player':
        return (
          <>
            <span>dash mySprite boost</span>
            <input
              type="number"
              value={Number(p.boost ?? 75)}
              onChange={(e) => upd('boost', Number(e.target.value) || 40)}
              className={pillInputClass}
            />
          </>
        );
      case 'cycle_player_color':
        return <span>cycle mySprite chroma color (Merah/Kuning/Hijau/Cyan)</span>;
      case 'set_score':
        return (
          <>
            <span>set score to</span>
            <input
              type="number"
              value={Number(p.value ?? 0)}
              onChange={(e) => upd('value', Number(e.target.value) || 0)}
              className={pillInputClass}
            />
          </>
        );
      case 'change_score':
        return (
          <>
            <span>change score by</span>
            <input
              type="number"
              value={Number(p.delta ?? 15)}
              onChange={(e) => upd('delta', Number(e.target.value) || 0)}
              className={pillInputClass}
            />
          </>
        );
      case 'set_life':
        return (
          <>
            <span>set life to</span>
            <input
              type="number"
              min={1}
              max={5}
              value={Number(p.value ?? 3)}
              onChange={(e) => upd('value', Math.max(1, Math.min(5, Number(e.target.value) || 3)))}
              className={pillInputClass}
            />
          </>
        );
      case 'change_life':
        return (
          <>
            <span>change life by</span>
            <input
              type="number"
              value={Number(p.delta ?? -1)}
              onChange={(e) => upd('delta', Number(e.target.value) || -1)}
              className={pillInputClass}
            />
          </>
        );
      case 'start_countdown':
        return (
          <>
            <span>start countdown</span>
            <input
              type="number"
              min={5}
              value={Number(p.seconds ?? 45)}
              onChange={(e) => upd('seconds', Math.max(5, Number(e.target.value) || 30))}
              className={pillInputClass}
            />
            <span>s</span>
          </>
        );
      case 'set_win_score':
        return (
          <>
            <span>set win target score</span>
            <input
              type="number"
              min={10}
              value={Number(p.target ?? 100)}
              onChange={(e) => upd('target', Math.max(10, Number(e.target.value) || 60))}
              className={pillInputClass}
            />
          </>
        );
      case 'play_sound':
        return (
          <>
            <span>play sound</span>
            <select
              value={String(p.sound || 'ba_ding')}
              onChange={(e) => upd('sound', e.target.value)}
              className={pillSelectClass}
            >
              {SOUND_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </>
        );
      case 'splash':
        return (
          <>
            <span>splash</span>
            <input
              type="text"
              value={String(p.text || 'MULAI!')}
              onChange={(e) => upd('text', e.target.value)}
              className="bg-white text-slate-900 rounded-full px-2.5 py-0.5 text-[11px] font-bold border border-black/15 w-32"
            />
          </>
        );
      case 'game_over':
        return (
          <>
            <span>game over</span>
            <select
              value={p.win === false ? 'false' : 'true'}
              onChange={(e) => upd('win', e.target.value === 'true')}
              className={pillSelectClass}
            >
              <option value="true">WIN</option>
              <option value="false">LOSE</option>
            </select>
          </>
        );
      case 'if_score_gte_win':
        return (
          <>
            <span>if score &gt;=</span>
            <input
              type="number"
              value={Number(p.target ?? 100)}
              onChange={(e) => upd('target', Number(e.target.value) || 60)}
              className={pillInputClass}
            />
            <span>then game over WIN</span>
          </>
        );
      case 'if_color_match_score':
        return (
          <>
            <span>if color matches: +</span>
            <input
              type="number"
              value={Number(p.points ?? 20)}
              onChange={(e) => upd('points', Number(e.target.value) || 20)}
              className={pillInputClass}
            />
            <span>score else</span>
            <input
              type="number"
              value={Number(p.penalty ?? -1)}
              onChange={(e) => upd('penalty', Number(e.target.value) || -1)}
              className={pillInputClass}
            />
            <span>life</span>
          </>
        );
      case 'set_speed_var':
        return (
          <>
            <span>set speed to</span>
            <input
              type="number"
              value={Number(p.speed ?? 50)}
              onChange={(e) => upd('speed', Number(e.target.value) || 40)}
              className={pillInputClass}
            />
          </>
        );
      case 'change_speed_var':
        return (
          <>
            <span>change speed by</span>
            <input
              type="number"
              value={Number(p.delta ?? 5)}
              onChange={(e) => upd('delta', Number(e.target.value) || 5)}
              className={pillInputClass}
            />
          </>
        );
      case 'repeat_spawn':
        return (
          <>
            <span>repeat</span>
            <input
              type="number"
              min={1}
              max={8}
              value={Number(p.count ?? 3)}
              onChange={(e) => upd('count', Math.max(1, Math.min(8, Number(e.target.value) || 2)))}
              className={pillInputClass}
            />
            <span>× spawn</span>
            {renderSpriteThumb(String(p.spriteId || 'star'))}
            <select
              value={String(p.spriteId || 'star')}
              onChange={(e) => upd('spriteId', e.target.value)}
              className={pillSelectClass}
            >
              {ARCADE_SPRITE_LIST.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
          </>
        );
    }
  };

  const renderContainerHeader = (container: ArcadeEventContainer) => {
    const upd = (key: string, val: string | number | boolean) =>
      onUpdateContainerParam(container.id, key, val);

    if (container.eventType === 'on_start') {
      return <span className="font-extrabold tracking-wide text-[13px]">on start</span>;
    }
    if (container.eventType === 'on_button') {
      return (
        <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-extrabold">
          <span>on</span>
          <select
            value={String(container.params.button || 'A')}
            onChange={(e) => upd('button', e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className={pillSelectClass}
          >
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
          <span>button pressed</span>
        </div>
      );
    }
    if (container.eventType === 'on_update_interval') {
      return (
        <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-extrabold">
          <span>on game update every</span>
          <input
            type="number"
            min={250}
            step={100}
            value={Number(container.params.ms ?? 1000)}
            onChange={(e) => upd('ms', Math.max(250, Number(e.target.value) || 500))}
            onClick={(e) => e.stopPropagation()}
            className={pillInputClass}
          />
          <span>ms</span>
        </div>
      );
    }
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-extrabold">
        <span>on sprite of kind</span>
        <select
          value={String(container.params.kindA || 'Player')}
          onChange={(e) => upd('kindA', e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className={pillSelectClass}
        >
          {KIND_OPTIONS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <span>overlaps</span>
        <select
          value={String(container.params.kindB || 'Food')}
          onChange={(e) => upd('kindB', e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className={pillSelectClass}
        >
          {KIND_OPTIONS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div
      className="flex-1 overflow-auto p-5"
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(#cbd5e1 1.25px, transparent 1.25px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div
        className="flex flex-wrap items-start gap-5 origin-top-left transition-transform duration-150 pb-10"
        style={{ transform: `scale(${zoom})` }}
      >
        {program.containers.map((container) => {
          const evColor = getEventColor(container.eventType);
          const isActive = container.id === activeContainerId;

          return (
            <div
              key={container.id}
              onClick={() => onSelectContainer(container.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const tplId = e.dataTransfer.getData('text/arcade-template');
                if (tplId) {
                  onDropTemplateIntoContainer(container.id, tplId);
                }
              }}
              className={`min-w-[290px] max-w-[470px] rounded-xl transition-all cursor-pointer ${
                isActive ? 'ring-3 ring-[#276C73]/60 shadow-lg' : 'shadow-md hover:shadow-lg'
              }`}
            >
              {/* MakeCode C-Block Top Hat */}
              <div
                className="px-3.5 py-2.5 text-white rounded-t-xl flex items-center justify-between gap-2 border-b border-black/15"
                style={{ backgroundColor: evColor }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {renderContainerHeader(container)}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isActive && (
                    <span className="text-[9px] font-black uppercase bg-black/25 px-1.5 py-0.5 rounded">
                      Target
                    </span>
                  )}
                  {container.eventType !== 'on_start' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveContainer(container.id);
                      }}
                      className="p-1 rounded hover:bg-black/20 text-white/90 cursor-pointer"
                      title="Hapus event block ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* MakeCode C-Block Spine & Inner Statements */}
              <div
                className="pl-4 pr-2.5 py-2.5 space-y-1.5 border-l-[12px]"
                style={{
                  borderLeftColor: evColor,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.82)',
                }}
              >
                {container.blocks.length === 0 ? (
                  <div className="py-3 px-3 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 text-[11px] font-bold flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Klik atau seret blok dari kategori di kiri ke sini
                  </div>
                ) : (
                  container.blocks.map((blk, idx) => {
                    const catColor = getCategoryColor(getStatementCategory(blk.type));
                    return (
                      <div
                        key={blk.id}
                        className="group relative rounded-lg px-2.5 py-1.5 text-white text-[11.5px] font-bold flex items-center justify-between gap-2 shadow-sm border-b-2 border-black/20"
                        style={{ backgroundColor: catColor }}
                      >
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          {renderStatementContent(container.id, blk)}
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
                            title="Naik"
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
                            title="Turun"
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
                            title="Hapus blok"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* MakeCode C-Block Bottom Cap */}
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
