/**
 * Cryptographic and formatting utilities synchronized with firebase-blueprint.json constraints.
 */

export async function hashPassword(password: string): Promise<string> {
  const salted = `codespark_v1::${password}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(salted);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Deterministic fallback hash (hex, >= 32 chars)
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < salted.length; i++) {
    const ch = salted.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${part1}${part2}${part1}${part2}`;
}

export function sanitizeId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  const stamp = Date.now().toString(36);
  return `${prefix}_${stamp}_${random}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function generateAccessCode(prefix = 'CODE'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'CODE'}-${suffix}`;
}

export function generateCertificateNo(tierId: string): string {
  const tierCode =
    tierId === 'app_maker'
      ? 'APP'
      : tierId === 'game_maker'
        ? 'GMK'
        : tierId === 'pemula'
          ? 'PML'
          : tierId === 'menengah'
            ? 'MNG'
            : 'LNJ';
  const rand = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `CS-${year}-${tierCode}-${rand}`;
}

export function formatIndonesianDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatShortDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function clampString(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}

/**
 * Formats an Indonesian or international phone number into a clean WhatsApp link.
 */
export function formatWhatsAppUrl(phone: string, message: string): string | null {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length < 8) return null;
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

