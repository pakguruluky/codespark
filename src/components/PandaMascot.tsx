import React from 'react';
import type { Direction } from '../types';

export type CharacterId = 'panda' | 'bear' | 'koala';

export interface CharacterMeta {
  id: CharacterId;
  name: string;
  title: string;
  badgeBg: string;
  accent: string;
}

export const CHARACTER_ORDER: CharacterId[] = ['panda', 'bear', 'koala'];

export const CHARACTER_META: Record<CharacterId, CharacterMeta> = {
  panda: {
    id: 'panda',
    name: 'Panda',
    title: 'Panda Penjelajah',
    badgeBg: '#4ADE80',
    accent: '#5CB834',
  },
  bear: {
    id: 'bear',
    name: 'Beruang',
    title: 'Beruang Rimba',
    badgeBg: '#FDBA74',
    accent: '#D97706',
  },
  koala: {
    id: 'koala',
    name: 'Koala',
    title: 'Koala Petualang',
    badgeBg: '#93C5FD',
    accent: '#3B82F6',
  },
};

/**
 * Rotates explorer character automatically on every stage change:
 * Stage 1, 4, 7 -> Panda | Stage 2, 5, 8 -> Beruang | Stage 3, 6, 9 -> Koala
 */
export function getCharacterForLevel(order: number): CharacterId {
  const safeIdx = Math.max(0, Math.floor(order) - 1) % CHARACTER_ORDER.length;
  return CHARACTER_ORDER[safeIdx];
}

interface PortraitProps {
  character?: CharacterId;
  className?: string;
  mood?: 'happy' | 'excited' | 'oops';
}

const PandaPortraitSvg: React.FC<{ mood: 'happy' | 'excited' | 'oops' }> = ({ mood }) => (
  <>
    {/* Explorer Backpack */}
    <rect x="19" y="72" width="24" height="32" rx="8" fill="#5FA5B8" stroke="#1E293B" strokeWidth="3" />
    <rect x="23" y="78" width="14" height="10" rx="3" fill="#8CD0E0" stroke="#1E293B" strokeWidth="2" />

    {/* Torso */}
    <ellipse cx="60" cy="96" rx="24" ry="20" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
    {/* Soft belly shade */}
    <path d="M40 100 Q60 112 80 100" fill="none" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />

    {/* Black arms/shoulders */}
    <ellipse cx="39" cy="93" rx="9.5" ry="12.5" fill="#23272F" stroke="#1E293B" strokeWidth="2.5" transform="rotate(18 39 93)" />
    <ellipse cx="81" cy="93" rx="9.5" ry="12.5" fill="#23272F" stroke="#1E293B" strokeWidth="2.5" transform="rotate(-18 81 93)" />

    {/* Red neckerchief */}
    <path d="M42 79 Q60 88 78 79 L74 89 Q60 95 46 89 Z" fill="#E63946" stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Explorer belt & buckle */}
    <rect x="42" y="96" width="36" height="7" rx="3" fill="#7C4A22" stroke="#1E293B" strokeWidth="2" />
    <circle cx="60" cy="99.5" r="4" fill="#F7C948" stroke="#1E293B" strokeWidth="2" />

    {/* Symmetric Ears */}
    <circle cx="35" cy="36" r="11" fill="#23272F" stroke="#1E293B" strokeWidth="3" />
    <circle cx="85" cy="36" r="11" fill="#23272F" stroke="#1E293B" strokeWidth="3" />
    <circle cx="35" cy="36" r="5" fill="#3D4350" />
    <circle cx="85" cy="36" r="5" fill="#3D4350" />

    {/* Head */}
    <ellipse cx="60" cy="56" rx="31" ry="27" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />

    {/* Green Leaf Explorer Hat */}
    <path
      d="M26 49 Q34 13 73 16 Q88 18 93 36 Q69 30 49 42 Q37 48 26 49 Z"
      fill="#69B943"
      stroke="#1E293B"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M39 38 Q55 25 76 26" fill="none" stroke="#3F7D20" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M26 49 Q19 55 23 62 Q30 57 33 49" fill="#539E31" stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" />

    {/* Symmetric Panda Eye Patches */}
    <ellipse cx="47" cy="56" rx="9" ry="10.5" fill="#23272F" transform="rotate(14 47 56)" />
    <ellipse cx="73" cy="56" rx="9" ry="10.5" fill="#23272F" transform="rotate(-14 73 56)" />

    {/* Eyes */}
    {mood === 'oops' ? (
      <g stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round">
        <line x1="44" y1="53" x2="50" y2="59" />
        <line x1="50" y1="53" x2="44" y2="59" />
        <line x1="70" y1="53" x2="76" y2="59" />
        <line x1="76" y1="53" x2="70" y2="59" />
      </g>
    ) : (
      <g>
        <circle cx="48" cy="55" r="4.6" fill="#FFFFFF" />
        <circle cx="49" cy="55" r="2.7" fill="#1B4332" />
        <circle cx="50" cy="53.5" r="1.2" fill="#FFFFFF" />

        <circle cx="72" cy="55" r="4.6" fill="#FFFFFF" />
        <circle cx="71" cy="55" r="2.7" fill="#1B4332" />
        <circle cx="72" cy="53.5" r="1.2" fill="#FFFFFF" />
      </g>
    )}

    {/* Rosy Cheeks */}
    <ellipse cx="36" cy="64" rx="4.5" ry="2.5" fill="#FB7185" opacity="0.55" />
    <ellipse cx="84" cy="64" rx="4.5" ry="2.5" fill="#FB7185" opacity="0.55" />

    {/* Nose & Smile */}
    <ellipse cx="60" cy="63" rx="4.5" ry="3" fill="#23272F" />
    {mood === 'oops' ? (
      <circle cx="60" cy="71" r="3.6" fill="#23272F" />
    ) : mood === 'excited' ? (
      <path d="M52 68 Q60 77 68 68 Z" fill="#E63946" stroke="#23272F" strokeWidth="2" strokeLinejoin="round" />
    ) : (
      <path d="M53 68 Q60 74 67 68" fill="none" stroke="#23272F" strokeWidth="2.5" strokeLinecap="round" />
    )}
  </>
);

const BearPortraitSvg: React.FC<{ mood: 'happy' | 'excited' | 'oops' }> = ({ mood }) => (
  <>
    {/* Forest Explorer Backpack */}
    <rect x="19" y="72" width="24" height="32" rx="8" fill="#4D7C4F" stroke="#1E293B" strokeWidth="3" />
    <rect x="23" y="78" width="14" height="10" rx="3" fill="#86BC7A" stroke="#1E293B" strokeWidth="2" />

    {/* Warm Honey-Brown Torso */}
    <ellipse cx="60" cy="96" rx="25" ry="20" fill="#A15B2A" stroke="#1E293B" strokeWidth="3" />
    {/* Cream Belly Patch */}
    <ellipse cx="60" cy="98" rx="14" ry="13" fill="#F7DCAC" />

    {/* Bear Arms */}
    <ellipse cx="38" cy="93" rx="9.5" ry="12.5" fill="#87481E" stroke="#1E293B" strokeWidth="2.5" transform="rotate(18 38 93)" />
    <ellipse cx="82" cy="93" rx="9.5" ry="12.5" fill="#87481E" stroke="#1E293B" strokeWidth="2.5" transform="rotate(-18 82 93)" />

    {/* Emerald Explorer Scarf */}
    <path d="M41 79 Q60 88 79 79 L75 89 Q60 95 45 89 Z" fill="#16A34A" stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M68 86 L77 95 L71 99 L63 89 Z" fill="#22C55E" stroke="#1E293B" strokeWidth="2" strokeLinejoin="round" />

    {/* Belt & Golden Compass Buckle */}
    <rect x="42" y="96" width="36" height="7" rx="3" fill="#4E2A12" stroke="#1E293B" strokeWidth="2" />
    <circle cx="60" cy="99.5" r="4.2" fill="#FACC15" stroke="#1E293B" strokeWidth="2" />

    {/* Round Bear Ears */}
    <circle cx="34" cy="36" r="12" fill="#A15B2A" stroke="#1E293B" strokeWidth="3" />
    <circle cx="86" cy="36" r="12" fill="#A15B2A" stroke="#1E293B" strokeWidth="3" />
    <circle cx="34" cy="37" r="6" fill="#F7DCAC" />
    <circle cx="86" cy="37" r="6" fill="#F7DCAC" />

    {/* Bear Head */}
    <ellipse cx="60" cy="57" rx="32" ry="27" fill="#A15B2A" stroke="#1E293B" strokeWidth="3" />
    {/* Soft fur highlight on crown */}
    <ellipse cx="60" cy="40" rx="18" ry="8" fill="#BA6F38" opacity="0.55" />

    {/* Ranger Explorer Hat */}
    <path
      d="M27 37 Q60 29 93 37 Q96 41 90 43 Q60 36 30 43 Q24 41 27 37 Z"
      fill="#C88A38"
      stroke="#1E293B"
      strokeWidth="2.6"
      strokeLinejoin="round"
    />
    <path
      d="M39 36 L44 17 Q60 12 76 17 L81 36 Z"
      fill="#DCA04A"
      stroke="#1E293B"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <path d="M40 31 Q60 27 80 31 L81 36 Q60 32 39 36 Z" fill="#16A34A" stroke="#1E293B" strokeWidth="2" />
    {/* Gold star pin on ranger hat */}
    <circle cx="60" cy="24" r="4.2" fill="#FFE600" stroke="#1E293B" strokeWidth="1.8" />

    {/* Friendly Eyebrows */}
    <path d="M41 47 Q47 44 52 47" fill="none" stroke="#4E2A12" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M68 47 Q73 44 79 47" fill="none" stroke="#4E2A12" strokeWidth="2.5" strokeLinecap="round" />

    {/* Eyes */}
    {mood === 'oops' ? (
      <g stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round">
        <line x1="43" y1="51" x2="50" y2="58" />
        <line x1="50" y1="51" x2="43" y2="58" />
        <line x1="70" y1="51" x2="77" y2="58" />
        <line x1="77" y1="51" x2="70" y2="58" />
      </g>
    ) : (
      <g>
        <circle cx="47" cy="54" r="4.8" fill="#1E293B" />
        <circle cx="48.5" cy="52.5" r="1.7" fill="#FFFFFF" />
        <circle cx="45.5" cy="55.5" r="0.8" fill="#FFFFFF" />

        <circle cx="73" cy="54" r="4.8" fill="#1E293B" />
        <circle cx="74.5" cy="52.5" r="1.7" fill="#FFFFFF" />
        <circle cx="71.5" cy="55.5" r="0.8" fill="#FFFFFF" />
      </g>
    )}

    {/* Rosy Cheeks */}
    <ellipse cx="36" cy="63" rx="4.5" ry="2.6" fill="#FB7185" opacity="0.5" />
    <ellipse cx="84" cy="63" rx="4.5" ry="2.6" fill="#FB7185" opacity="0.5" />

    {/* Cream Bear Muzzle */}
    <ellipse cx="60" cy="67" rx="14.5" ry="11.5" fill="#FCE7C3" stroke="#7C431C" strokeWidth="2" />
    {/* Dark Bear Nose */}
    <path d="M54 62 Q60 59 66 62 Q64 67 60 67.5 Q56 67 54 62 Z" fill="#2E1A0E" />
    <ellipse cx="58.5" cy="62" rx="2" ry="1" fill="#6B4423" opacity="0.7" />
    <line x1="60" y1="67" x2="60" y2="70.5" stroke="#2E1A0E" strokeWidth="2" strokeLinecap="round" />

    {/* Mouth */}
    {mood === 'oops' ? (
      <circle cx="60" cy="73.5" r="3.3" fill="#2E1A0E" />
    ) : mood === 'excited' ? (
      <path d="M53 70 Q60 78 67 70 Z" fill="#E63946" stroke="#2E1A0E" strokeWidth="2" strokeLinejoin="round" />
    ) : (
      <path d="M54 70.5 Q60 75 66 70.5" fill="none" stroke="#2E1A0E" strokeWidth="2.3" strokeLinecap="round" />
    )}
  </>
);

const KoalaPortraitSvg: React.FC<{ mood: 'happy' | 'excited' | 'oops' }> = ({ mood }) => (
  <>
    {/* Slate-Blue Explorer Backpack + Eucalyptus Sprig */}
    <rect x="18" y="72" width="24" height="32" rx="8" fill="#3B82F6" stroke="#1E293B" strokeWidth="3" />
    <rect x="22" y="78" width="14" height="10" rx="3" fill="#93C5FD" stroke="#1E293B" strokeWidth="2" />
    {/* Eucalyptus leaf peeking out */}
    <path d="M22 72 Q12 60 22 54 Q29 62 24 72 Z" fill="#4ADE80" stroke="#1E293B" strokeWidth="2" />

    {/* Silver-Gray Torso */}
    <ellipse cx="60" cy="96" rx="24" ry="20" fill="#94A3B8" stroke="#1E293B" strokeWidth="3" />
    {/* Soft White Belly */}
    <ellipse cx="60" cy="98" rx="13" ry="12" fill="#F8FAFC" />

    {/* Koala Arms */}
    <ellipse cx="39" cy="93" rx="9" ry="12" fill="#7B8BA1" stroke="#1E293B" strokeWidth="2.5" transform="rotate(18 39 93)" />
    <ellipse cx="81" cy="93" rx="9" ry="12" fill="#7B8BA1" stroke="#1E293B" strokeWidth="2.5" transform="rotate(-18 81 93)" />

    {/* Coral Adventurer Scarf */}
    <path d="M42 79 Q60 88 78 79 L74 89 Q60 95 46 89 Z" fill="#FB7185" stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Belt & Silver Buckle */}
    <rect x="43" y="96" width="34" height="6.5" rx="3" fill="#334155" stroke="#1E293B" strokeWidth="2" />
    <rect x="56" y="95.5" width="8" height="7.5" rx="2" fill="#FFE600" stroke="#1E293B" strokeWidth="1.8" />

    {/* Iconic Big Fluffy Koala Ears */}
    <circle cx="25" cy="48" r="16.5" fill="#8A99AD" stroke="#1E293B" strokeWidth="3" />
    <circle cx="95" cy="48" r="16.5" fill="#8A99AD" stroke="#1E293B" strokeWidth="3" />
    {/* Fluffy White Inner Ear Tufts */}
    <path
      d="M17 44 Q21 38 28 41 Q31 48 27 56 Q19 57 17 50 Z"
      fill="#F8FAFC"
      stroke="#64748B"
      strokeWidth="1.5"
    />
    <path
      d="M103 44 Q99 38 92 41 Q89 48 93 56 Q101 57 103 50 Z"
      fill="#F8FAFC"
      stroke="#64748B"
      strokeWidth="1.5"
    />

    {/* Koala Head */}
    <ellipse cx="60" cy="56" rx="29.5" ry="26" fill="#A3B1C2" stroke="#1E293B" strokeWidth="3" />
    {/* Soft White Chin / Cheek Glow */}
    <ellipse cx="60" cy="69" rx="18" ry="11" fill="#F1F5F9" />

    {/* Adventurer Goggles on Forehead */}
    <path d="M31 41 Q60 36 89 41" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
    <circle cx="47" cy="39" r="9" fill="#F59E0B" stroke="#1E293B" strokeWidth="2.4" />
    <circle cx="73" cy="39" r="9" fill="#F59E0B" stroke="#1E293B" strokeWidth="2.4" />
    <circle cx="47" cy="39" r="6" fill="#BAE6FD" stroke="#1E293B" strokeWidth="1.6" />
    <circle cx="73" cy="39" r="6" fill="#BAE6FD" stroke="#1E293B" strokeWidth="1.6" />
    <path d="M44 36 L48 35" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <path d="M70 36 L74 35" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

    {/* Eyes */}
    {mood === 'oops' ? (
      <g stroke="#1E293B" strokeWidth="2.6" strokeLinecap="round">
        <line x1="41" y1="53" x2="47" y2="59" />
        <line x1="47" y1="53" x2="41" y2="59" />
        <line x1="73" y1="53" x2="79" y2="59" />
        <line x1="79" y1="53" x2="73" y2="59" />
      </g>
    ) : (
      <g>
        <circle cx="44" cy="56" r="4.4" fill="#1E293B" />
        <circle cx="45.4" cy="54.6" r="1.5" fill="#FFFFFF" />

        <circle cx="76" cy="56" r="4.4" fill="#1E293B" />
        <circle cx="77.4" cy="54.6" r="1.5" fill="#FFFFFF" />
      </g>
    )}

    {/* Rosy Cheeks */}
    <ellipse cx="36" cy="64" rx="4.2" ry="2.4" fill="#FB7185" opacity="0.55" />
    <ellipse cx="84" cy="64" rx="4.2" ry="2.4" fill="#FB7185" opacity="0.55" />

    {/* Signature Large Glossy Oval Koala Nose */}
    <ellipse cx="60" cy="60.5" rx="6.8" ry="9.2" fill="#1E293B" />
    <ellipse cx="58" cy="57" rx="2" ry="3.2" fill="#475569" opacity="0.75" />

    {/* Cute Mouth */}
    {mood === 'oops' ? (
      <circle cx="60" cy="74" r="3.2" fill="#1E293B" />
    ) : mood === 'excited' ? (
      <path d="M53 71.5 Q60 79 67 71.5 Z" fill="#FB7185" stroke="#1E293B" strokeWidth="2" strokeLinejoin="round" />
    ) : (
      <path d="M54 72 Q60 76.5 66 72" fill="none" stroke="#1E293B" strokeWidth="2.3" strokeLinecap="round" />
    )}
  </>
);

/**
 * Illustrated Explorer Mascot Portrait supporting Panda, Beruang (Bear), and Koala.
 */
export const MascotPortrait: React.FC<PortraitProps> = ({
  character = 'panda',
  className = 'w-24 h-24',
  mood = 'happy',
}) => {
  const meta = CHARACTER_META[character];
  return (
    <svg viewBox="0 0 120 120" className={className} aria-label={`Maskot ${meta.title} CodeSpark`}>
      {character === 'bear' ? (
        <BearPortraitSvg mood={mood} />
      ) : character === 'koala' ? (
        <KoalaPortraitSvg mood={mood} />
      ) : (
        <PandaPortraitSvg mood={mood} />
      )}
    </svg>
  );
};

/** Backwards-compatible alias for PandaPortrait */
export const PandaPortrait: React.FC<PortraitProps> = (props) => (
  <MascotPortrait character={props.character ?? 'panda'} {...props} />
);

interface SpriteProps {
  character?: CharacterId;
  dir: Direction;
  status: 'idle' | 'running' | 'success' | 'crashed' | 'incomplete';
}

const IsometricPandaBody: React.FC<{ status: SpriteProps['status'] }> = ({ status }) => (
  <>
    {/* Feet */}
    <ellipse cx="-5.5" cy="2" rx="5.2" ry="3.2" fill="#23272F" stroke="#111" strokeWidth="1.4" />
    <ellipse cx="5.5" cy="2.8" rx="5.2" ry="3.2" fill="#23272F" stroke="#111" strokeWidth="1.4" />

    {/* Explorer Backpack */}
    <rect x="-15" y="-22" width="9.5" height="14.5" rx="4" fill="#5FA5B8" stroke="#1E293B" strokeWidth="1.8" />

    {/* Body */}
    <ellipse cx="0" cy="-12" rx="11.5" ry="12" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
    {/* Black arms */}
    <ellipse cx="-9.2" cy="-12" rx="4.2" ry="6.2" fill="#23272F" transform="rotate(15 -9.2 -12)" />
    <ellipse cx="9.2" cy="-12" rx="4.2" ry="6.2" fill="#23272F" transform="rotate(-15 9.2 -12)" />
    {/* Red scarf */}
    <path d="M-8 -20 Q0 -15 8 -20 L6 -16 Q0 -13 -6 -16 Z" fill="#E63946" stroke="#1E293B" strokeWidth="1" />
    {/* Belt */}
    <rect x="-9" y="-9" width="18" height="3.4" rx="1.5" fill="#7C4A22" />
    <circle cx="0" cy="-7.3" r="2" fill="#FFE600" />

    {/* Symmetric Ears */}
    <circle cx="-11" cy="-40" r="5" fill="#23272F" stroke="#1E293B" strokeWidth="1.6" />
    <circle cx="11" cy="-40" r="5" fill="#23272F" stroke="#1E293B" strokeWidth="1.6" />

    {/* Head */}
    <ellipse cx="0" cy="-31" rx="14.5" ry="12.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />

    {/* Green Leaf Hat */}
    <path
      d="M-15 -34 Q-11 -51 6 -49 Q14 -48 16 -39 Q5 -42 -5 -36 Z"
      fill="#69B943"
      stroke="#1E293B"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M-9 -41 Q0 -45 9 -43" fill="none" stroke="#3F7D20" strokeWidth="1.4" strokeLinecap="round" />

    {/* Symmetric Eye Patches & Eyes */}
    <ellipse cx="-5.5" cy="-31" rx="4.1" ry="4.7" fill="#23272F" transform="rotate(12 -5.5 -31)" />
    <ellipse cx="5.5" cy="-31" rx="4.1" ry="4.7" fill="#23272F" transform="rotate(-12 5.5 -31)" />
    {status === 'crashed' ? (
      <g stroke="#FFF" strokeWidth="1.6" strokeLinecap="round">
        <line x1="-7" y1="-32.5" x2="-4" y2="-29.5" />
        <line x1="-4" y1="-32.5" x2="-7" y2="-29.5" />
        <line x1="4" y1="-32.5" x2="7" y2="-29.5" />
        <line x1="7" y1="-32.5" x2="4" y2="-29.5" />
      </g>
    ) : (
      <g>
        <circle cx="-5.1" cy="-31.4" r="2" fill="#FFFFFF" />
        <circle cx="-4.6" cy="-31.4" r="1.1" fill="#111" />
        <circle cx="5.1" cy="-31.4" r="2" fill="#FFFFFF" />
        <circle cx="5.6" cy="-31.4" r="1.1" fill="#111" />
      </g>
    )}

    {/* Centered Nose & Mouth */}
    <ellipse cx="0" cy="-27.2" rx="2.2" ry="1.4" fill="#23272F" />
    <path d="M-3 -24.8 Q0 -22.3 3 -24.8" fill="none" stroke="#23272F" strokeWidth="1.4" strokeLinecap="round" />
  </>
);

const IsometricBearBody: React.FC<{ status: SpriteProps['status'] }> = ({ status }) => (
  <>
    {/* Paws */}
    <ellipse cx="-5.5" cy="2" rx="5.5" ry="3.3" fill="#6F3916" stroke="#1E293B" strokeWidth="1.4" />
    <ellipse cx="5.5" cy="2.8" rx="5.5" ry="3.3" fill="#6F3916" stroke="#1E293B" strokeWidth="1.4" />

    {/* Forest Backpack */}
    <rect x="-15" y="-22" width="9.5" height="14.5" rx="4" fill="#4D7C4F" stroke="#1E293B" strokeWidth="1.8" />

    {/* Warm Brown Body */}
    <ellipse cx="0" cy="-12" rx="12" ry="12.2" fill="#A15B2A" stroke="#1E293B" strokeWidth="2" />
    <ellipse cx="0" cy="-11" rx="6.8" ry="7.2" fill="#F7DCAC" />
    {/* Arms */}
    <ellipse cx="-9.5" cy="-12" rx="4.3" ry="6.2" fill="#87481E" stroke="#1E293B" strokeWidth="1.4" transform="rotate(15 -9.5 -12)" />
    <ellipse cx="9.5" cy="-12" rx="4.3" ry="6.2" fill="#87481E" stroke="#1E293B" strokeWidth="1.4" transform="rotate(-15 9.5 -12)" />
    {/* Emerald Scarf */}
    <path d="M-8.5 -20 Q0 -15 8.5 -20 L6.5 -16 Q0 -13 -6.5 -16 Z" fill="#16A34A" stroke="#1E293B" strokeWidth="1" />
    {/* Belt */}
    <rect x="-9" y="-9" width="18" height="3.4" rx="1.5" fill="#4E2A12" />
    <circle cx="0" cy="-7.3" r="2.1" fill="#FACC15" />

    {/* Round Bear Ears */}
    <circle cx="-11.5" cy="-40" r="5.4" fill="#A15B2A" stroke="#1E293B" strokeWidth="1.6" />
    <circle cx="11.5" cy="-40" r="5.4" fill="#A15B2A" stroke="#1E293B" strokeWidth="1.6" />
    <circle cx="-11.5" cy="-40" r="2.6" fill="#F7DCAC" />
    <circle cx="11.5" cy="-40" r="2.6" fill="#F7DCAC" />

    {/* Head */}
    <ellipse cx="0" cy="-31" rx="14.8" ry="12.6" fill="#A15B2A" stroke="#1E293B" strokeWidth="2" />

    {/* Ranger Hat */}
    <path
      d="M-15 -39 Q0 -43 15 -39 Q16 -37 13 -36 Q0 -39 -13 -36 Q-16 -37 -15 -39 Z"
      fill="#C88A38"
      stroke="#1E293B"
      strokeWidth="1.6"
    />
    <path
      d="M-9.5 -39 L-7 -49 Q0 -51.5 7 -49 L9.5 -39 Z"
      fill="#DCA04A"
      stroke="#1E293B"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M-8.8 -42 Q0 -44 8.8 -42 L9.5 -39 Q0 -41 -9.5 -39 Z" fill="#16A34A" />
    <circle cx="0" cy="-45.2" r="2" fill="#FFE600" stroke="#1E293B" strokeWidth="1" />

    {/* Eyes */}
    {status === 'crashed' ? (
      <g stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round">
        <line x1="-7" y1="-33.5" x2="-4" y2="-30.5" />
        <line x1="-4" y1="-33.5" x2="-7" y2="-30.5" />
        <line x1="4" y1="-33.5" x2="7" y2="-30.5" />
        <line x1="7" y1="-33.5" x2="4" y2="-30.5" />
      </g>
    ) : (
      <g>
        <circle cx="-5.6" cy="-32.2" r="2.2" fill="#1E293B" />
        <circle cx="-5" cy="-32.9" r="0.8" fill="#FFFFFF" />
        <circle cx="5.6" cy="-32.2" r="2.2" fill="#1E293B" />
        <circle cx="6.2" cy="-32.9" r="0.8" fill="#FFFFFF" />
      </g>
    )}

    {/* Cream Snout & Nose */}
    <ellipse cx="0" cy="-26.2" rx="6.8" ry="5.2" fill="#FCE7C3" stroke="#7C431C" strokeWidth="1.2" />
    <ellipse cx="0" cy="-28" rx="2.6" ry="1.7" fill="#2E1A0E" />
    <path d="M-2.6 -24.8 Q0 -22.8 2.6 -24.8" fill="none" stroke="#2E1A0E" strokeWidth="1.3" strokeLinecap="round" />
  </>
);

const IsometricKoalaBody: React.FC<{ status: SpriteProps['status'] }> = ({ status }) => (
  <>
    {/* Paws */}
    <ellipse cx="-5.5" cy="2" rx="5" ry="3.1" fill="#64748B" stroke="#1E293B" strokeWidth="1.4" />
    <ellipse cx="5.5" cy="2.8" rx="5" ry="3.1" fill="#64748B" stroke="#1E293B" strokeWidth="1.4" />

    {/* Blue Backpack + Leaf */}
    <rect x="-15" y="-22" width="9.5" height="14.5" rx="4" fill="#3B82F6" stroke="#1E293B" strokeWidth="1.8" />
    <path d="M-13 -22 Q-18 -29 -12 -32 Q-8 -27 -11 -22 Z" fill="#4ADE80" stroke="#1E293B" strokeWidth="1.3" />

    {/* Silver-Gray Body */}
    <ellipse cx="0" cy="-12" rx="11.2" ry="11.8" fill="#94A3B8" stroke="#1E293B" strokeWidth="2" />
    <ellipse cx="0" cy="-11" rx="6.2" ry="6.8" fill="#F8FAFC" />
    {/* Arms */}
    <ellipse cx="-9" cy="-12" rx="4" ry="6" fill="#7B8BA1" stroke="#1E293B" strokeWidth="1.4" transform="rotate(15 -9 -12)" />
    <ellipse cx="9" cy="-12" rx="4" ry="6" fill="#7B8BA1" stroke="#1E293B" strokeWidth="1.4" transform="rotate(-15 9 -12)" />
    {/* Coral Scarf */}
    <path d="M-8 -20 Q0 -15 8 -20 L6 -16 Q0 -13 -6 -16 Z" fill="#FB7185" stroke="#1E293B" strokeWidth="1" />
    {/* Belt */}
    <rect x="-8.5" y="-9" width="17" height="3.2" rx="1.4" fill="#334155" />
    <rect x="-2.2" y="-9.2" width="4.4" height="3.6" rx="1" fill="#FFE600" />

    {/* Iconic Huge Fluffy Koala Ears */}
    <circle cx="-15.5" cy="-34" r="7.5" fill="#8A99AD" stroke="#1E293B" strokeWidth="1.8" />
    <circle cx="15.5" cy="-34" r="7.5" fill="#8A99AD" stroke="#1E293B" strokeWidth="1.8" />
    <circle cx="-15.5" cy="-34" r="4.1" fill="#F8FAFC" />
    <circle cx="15.5" cy="-34" r="4.1" fill="#F8FAFC" />

    {/* Head */}
    <ellipse cx="0" cy="-31" rx="13.8" ry="12" fill="#A3B1C2" stroke="#1E293B" strokeWidth="2" />
    <ellipse cx="0" cy="-25.5" rx="8.2" ry="4.8" fill="#F1F5F9" />

    {/* Forehead Adventurer Goggles */}
    <line x1="-13" y1="-38.5" x2="13" y2="-38.5" stroke="#334155" strokeWidth="2.6" strokeLinecap="round" />
    <circle cx="-5.5" cy="-39" r="4.2" fill="#F59E0B" stroke="#1E293B" strokeWidth="1.4" />
    <circle cx="5.5" cy="-39" r="4.2" fill="#F59E0B" stroke="#1E293B" strokeWidth="1.4" />
    <circle cx="-5.5" cy="-39" r="2.6" fill="#BAE6FD" stroke="#1E293B" strokeWidth="1" />
    <circle cx="5.5" cy="-39" r="2.6" fill="#BAE6FD" stroke="#1E293B" strokeWidth="1" />

    {/* Eyes */}
    {status === 'crashed' ? (
      <g stroke="#1E293B" strokeWidth="1.7" strokeLinecap="round">
        <line x1="-8" y1="-32" x2="-5.2" y2="-29.2" />
        <line x1="-5.2" y1="-32" x2="-8" y2="-29.2" />
        <line x1="5.2" y1="-32" x2="8" y2="-29.2" />
        <line x1="8" y1="-32" x2="5.2" y2="-29.2" />
      </g>
    ) : (
      <g>
        <circle cx="-6.6" cy="-30.8" r="2" fill="#1E293B" />
        <circle cx="-6" cy="-31.4" r="0.75" fill="#FFFFFF" />
        <circle cx="6.6" cy="-30.8" r="2" fill="#1E293B" />
        <circle cx="7.2" cy="-31.4" r="0.75" fill="#FFFFFF" />
      </g>
    )}

    {/* Big Signature Oval Koala Nose */}
    <ellipse cx="0" cy="-29" rx="3.2" ry="4.5" fill="#1E293B" />
    <ellipse cx="-0.9" cy="-30.4" rx="0.9" ry="1.5" fill="#64748B" />
    <path d="M-2.6 -23.4 Q0 -21.6 2.6 -23.4" fill="none" stroke="#1E293B" strokeWidth="1.3" strokeLinecap="round" />
  </>
);

/**
 * Isometric Explorer Sprite rendered directly inside the 2D SVG Forest Island.
 * Positioned around (0, 0) where (0, 0) is the center of the isometric tile.
 */
export const IsometricMascotSprite: React.FC<SpriteProps> = ({
  character = 'panda',
  dir,
  status,
}) => {
  // In isometric projection:
  // E (+x) points down-right, S (+y) points down-left, W (-x) points up-left, N (-y) points up-right
  const faceLeft = dir === 'S' || dir === 'W';

  // Crisp isometric directional chevrons aligned neatly along each tile's 2:1 diamond edge
  const arrowPoints: Record<Direction, string> = {
    E: '18,6 32,14 21,16',
    S: '-18,6 -32,14 -21,16',
    W: '-18,-6 -32,-14 -21,-16',
    N: '18,-6 32,-14 21,-16',
  };

  const hopY = status === 'success' ? -10 : status === 'running' ? -4 : 0;

  return (
    <g>
      {/* Glowing directional chevron on the stone tile */}
      <polygon
        points={arrowPoints[dir]}
        fill={status === 'crashed' ? '#FB7185' : '#FFE600'}
        stroke="#1E293B"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Soft ground shadow */}
      <ellipse
        cx="0"
        cy="4"
        rx={status === 'success' ? 12 : 15}
        ry={status === 'success' ? 5.5 : 7}
        fill="rgba(0,0,0,0.28)"
      />

      {/* Character group with symmetric horizontal flip based on facing */}
      <g transform={`translate(0, ${hopY}) scale(${faceLeft ? -1 : 1}, 1)`}>
        {character === 'bear' ? (
          <IsometricBearBody status={status} />
        ) : character === 'koala' ? (
          <IsometricKoalaBody status={status} />
        ) : (
          <IsometricPandaBody status={status} />
        )}

        {/* Victory sparkle star above head */}
        {status === 'success' && (
          <polygon
            points="0,-65 2.5,-59 9,-59 3.8,-55 5.5,-49 0,-53 -5.5,-49 -3.8,-55 -9,-59 -2.5,-59"
            fill="#FFE600"
            stroke="#1E293B"
            strokeWidth="1.5"
          />
        )}

        {/* Dizzy bump indicator when crashed */}
        {status === 'crashed' && (
          <g transform="translate(0, -54)">
            <circle cx="-8" cy="2" r="2.2" fill="#FB7185" stroke="#1E293B" strokeWidth="1" />
            <circle cx="0" cy="-2" r="2.6" fill="#FFE600" stroke="#1E293B" strokeWidth="1" />
            <circle cx="8" cy="2" r="2.2" fill="#FB7185" stroke="#1E293B" strokeWidth="1" />
          </g>
        )}
      </g>
    </g>
  );
};

/** Backwards-compatible alias for IsometricPandaSprite */
export const IsometricPandaSprite: React.FC<SpriteProps> = (props) => (
  <IsometricMascotSprite character={props.character ?? 'panda'} {...props} />
);
