import React from 'react';
import type { Direction } from '../types';

interface PortraitProps {
  className?: string;
  mood?: 'happy' | 'excited' | 'oops';
}

/**
 * Adorable Panda Explorer Mascot with green leaf hat & blue backpack (Codementum-style).
 */
export const PandaPortrait: React.FC<PortraitProps> = ({ className = 'w-24 h-24', mood = 'happy' }) => {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-label="Maskot Panda CodeSpark">
      {/* Explorer Backpack behind */}
      <rect x="20" y="72" width="24" height="32" rx="8" fill="#5FA5B8" stroke="#1E293B" strokeWidth="3" />
      <rect x="23" y="78" width="14" height="10" rx="3" fill="#89C9D9" stroke="#1E293B" strokeWidth="2" />

      {/* Torso */}
      <ellipse cx="62" cy="96" rx="24" ry="20" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
      {/* Black arms/shoulders */}
      <ellipse cx="42" cy="94" rx="10" ry="13" fill="#23272F" stroke="#1E293B" strokeWidth="2.5" transform="rotate(18 42 94)" />
      <ellipse cx="82" cy="92" rx="10" ry="13" fill="#23272F" stroke="#1E293B" strokeWidth="2.5" transform="rotate(-22 82 92)" />
      {/* Red neckerchief */}
      <path d="M44 79 Q62 88 80 79 L76 89 Q62 95 48 89 Z" fill="#E63946" stroke="#1E293B" strokeWidth="2.5" />
      {/* Explorer belt & scroll */}
      <rect x="44" y="96" width="36" height="7" rx="3" fill="#7C4A22" stroke="#1E293B" strokeWidth="2" />
      <circle cx="62" cy="99.5" r="4" fill="#F7C948" stroke="#1E293B" strokeWidth="2" />

      {/* Ears */}
      <circle cx="38" cy="36" r="11" fill="#23272F" stroke="#1E293B" strokeWidth="3" />
      <circle cx="86" cy="36" r="11" fill="#23272F" stroke="#1E293B" strokeWidth="3" />

      {/* Head */}
      <ellipse cx="62" cy="56" rx="31" ry="27" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />

      {/* Green Leaf Explorer Hat */}
      <path
        d="M28 50 Q34 14 74 16 Q88 18 93 36 Q70 30 50 42 Q38 48 28 50 Z"
        fill="#69B943"
        stroke="#1E293B"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M40 38 Q56 26 76 26" fill="none" stroke="#3F7D20" strokeWidth="2.5" strokeLinecap="round" />
      {/* Leaf curl tip */}
      <path d="M28 50 Q20 56 24 63 Q31 58 34 50" fill="#539E31" stroke="#1E293B" strokeWidth="2.5" />

      {/* Panda Eye Patches */}
      <ellipse cx="49" cy="56" rx="9" ry="10.5" fill="#23272F" transform="rotate(14 49 56)" />
      <ellipse cx="75" cy="56" rx="9" ry="10.5" fill="#23272F" transform="rotate(-14 75 56)" />

      {/* Eyes */}
      {mood === 'oops' ? (
        <g stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
          <line x1="46" y1="53" x2="52" y2="59" />
          <line x1="52" y1="53" x2="46" y2="59" />
          <line x1="72" y1="53" x2="78" y2="59" />
          <line x1="78" y1="53" x2="72" y2="59" />
        </g>
      ) : (
        <g>
          <circle cx="50" cy="55" r="4.5" fill="#FFFFFF" />
          <circle cx="51" cy="55" r="2.6" fill="#1B4332" />
          <circle cx="52" cy="53.5" r="1.2" fill="#FFFFFF" />

          <circle cx="74" cy="55" r="4.5" fill="#FFFFFF" />
          <circle cx="73" cy="55" r="2.6" fill="#1B4332" />
          <circle cx="74" cy="53.5" r="1.2" fill="#FFFFFF" />
        </g>
      )}

      {/* Rosy Cheeks */}
      <ellipse cx="39" cy="64" rx="4.5" ry="2.5" fill="#FB7185" opacity="0.55" />
      <ellipse cx="85" cy="64" rx="4.5" ry="2.5" fill="#FB7185" opacity="0.55" />

      {/* Cute Nose & Smile */}
      <ellipse cx="62" cy="63" rx="4.5" ry="3" fill="#23272F" />
      {mood === 'oops' ? (
        <circle cx="62" cy="71" r="3.5" fill="#23272F" />
      ) : mood === 'excited' ? (
        <path d="M54 68 Q62 77 70 68 Z" fill="#E63946" stroke="#23272F" strokeWidth="2" />
      ) : (
        <path d="M55 68 Q62 74 69 68" fill="none" stroke="#23272F" strokeWidth="2.5" strokeLinecap="round" />
      )}
    </svg>
  );
};

interface SpriteProps {
  dir: Direction;
  status: 'idle' | 'running' | 'success' | 'crashed' | 'incomplete';
}

/**
 * Isometric Panda Sprite rendered directly inside the 2D SVG Forest Island.
 * Positioned around (0, 0) where (0, 0) is the center of the isometric tile.
 */
export const IsometricPandaSprite: React.FC<SpriteProps> = ({ dir, status }) => {
  // In isometric projection:
  // E (+x) points down-right, S (+y) points down-left, W (-x) points up-left, N (-y) points up-right
  const faceLeft = dir === 'S' || dir === 'W';

  // Direction indicator arrow on the tile surface
  const arrowPoints: Record<Direction, string> = {
    E: '22,11 32,16 19,17',
    S: '-22,11 -32,16 -19,17',
    W: '-22,-11 -32,-16 -19,-17',
    N: '22,-11 32,-16 19,-17',
  };

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
      <ellipse cx="0" cy="4" rx="15" ry="7" fill="rgba(0,0,0,0.3)" />

      {/* Character group with horizontal flip based on facing */}
      <g
        transform={`translate(0, ${status === 'success' ? -10 : status === 'running' ? -4 : 0}) scale(${
          faceLeft ? -1 : 1
        }, 1)`}
      >
        {/* Feet */}
        <ellipse cx="-6" cy="2" rx="5.5" ry="3.5" fill="#23272F" stroke="#111" strokeWidth="1.5" />
        <ellipse cx="6" cy="3" rx="5.5" ry="3.5" fill="#23272F" stroke="#111" strokeWidth="1.5" />

        {/* Explorer Backpack */}
        <rect x="-15" y="-22" width="10" height="15" rx="4" fill="#5FA5B8" stroke="#1E293B" strokeWidth="1.8" />

        {/* Body */}
        <ellipse cx="0" cy="-12" rx="11.5" ry="12" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
        {/* Black shoulders/arms */}
        <ellipse cx="-9" cy="-12" rx="4.5" ry="6.5" fill="#23272F" transform="rotate(15 -9 -12)" />
        <ellipse cx="9" cy="-12" rx="4.5" ry="6.5" fill="#23272F" transform="rotate(-18 9 -12)" />
        {/* Red scarf */}
        <path d="M-8 -20 Q0 -15 8 -20 L6 -16 Q0 -13 -6 -16 Z" fill="#E63946" />
        {/* Belt */}
        <rect x="-9" y="-9" width="18" height="3.5" rx="1.5" fill="#7C4A22" />
        <circle cx="0" cy="-7.2" r="2" fill="#FFE600" />

        {/* Ears */}
        <circle cx="-11" cy="-40" r="5" fill="#23272F" stroke="#1E293B" strokeWidth="1.6" />
        <circle cx="11" cy="-40" r="5" fill="#23272F" stroke="#1E293B" strokeWidth="1.6" />

        {/* Head */}
        <ellipse cx="0" cy="-31" rx="14.5" ry="12.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />

        {/* Green Leaf Hat */}
        <path
          d="M-15 -34 Q-12 -51 6 -49 Q14 -48 16 -39 Q5 -42 -5 -36 Z"
          fill="#69B943"
          stroke="#1E293B"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Eyes */}
        <ellipse cx="-4.5" cy="-31" rx="4.2" ry="4.8" fill="#23272F" transform="rotate(10 -4.5 -31)" />
        <ellipse cx="6.5" cy="-31" rx="4.2" ry="4.8" fill="#23272F" transform="rotate(-10 6.5 -31)" />
        {status === 'crashed' ? (
          <g stroke="#FFF" strokeWidth="1.6">
            <line x1="-6" y1="-32.5" x2="-3" y2="-29.5" />
            <line x1="-3" y1="-32.5" x2="-6" y2="-29.5" />
            <line x1="5" y1="-32.5" x2="8" y2="-29.5" />
            <line x1="8" y1="-32.5" x2="5" y2="-29.5" />
          </g>
        ) : (
          <g>
            <circle cx="-3.8" cy="-31.5" r="2" fill="#FFFFFF" />
            <circle cx="-3.3" cy="-31.5" r="1.1" fill="#111" />
            <circle cx="6.2" cy="-31.5" r="2" fill="#FFFFFF" />
            <circle cx="6.7" cy="-31.5" r="1.1" fill="#111" />
          </g>
        )}

        {/* Nose & mouth */}
        <ellipse cx="1.5" cy="-27.5" rx="2.2" ry="1.4" fill="#23272F" />
        <path d="M-1.5 -25 Q1.5 -22.5 4.5 -25" fill="none" stroke="#23272F" strokeWidth="1.4" strokeLinecap="round" />

        {/* Victory sparkle star above hat */}
        {status === 'success' && (
          <polygon
            points="0,-63 2.5,-57 9,-57 3.8,-53 5.5,-47 0,-51 -5.5,-47 -3.8,-53 -9,-57 -2.5,-57"
            fill="#FFE600"
            stroke="#1E293B"
            strokeWidth="1.5"
          />
        )}
      </g>
    </g>
  );
};
