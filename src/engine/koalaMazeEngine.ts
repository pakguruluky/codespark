import type {
  KoalaBlockNode,
  KoalaDir,
  KoalaPathSensor,
  KoalaSubLevel,
} from '../data/koalaMazeLevels';

export interface KoalaFrame {
  x: number;
  y: number;
  dir: KoalaDir;
  activeBlockId: string | null;
  status: 'running' | 'won' | 'crashed' | 'incomplete' | 'infinite';
  message: string;
}

export interface KoalaRunResult {
  frames: KoalaFrame[];
  won: boolean;
  blockCount: number;
  optimal: boolean;
  finalMessage: string;
}

const DIR_ORDER: KoalaDir[] = ['N', 'E', 'S', 'W'];

const DIR_DELTA: Record<KoalaDir, { dx: number; dy: number }> = {
  N: { dx: 0, dy: -1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 },
};

function turnDirection(dir: KoalaDir, turnDir: 'left' | 'right'): KoalaDir {
  const idx = DIR_ORDER.indexOf(dir);
  return DIR_ORDER[(idx + (turnDir === 'right' ? 1 : 3)) % 4];
}

function isWalkable(grid: string[], x: number, y: number): boolean {
  if (y < 0 || y >= grid.length) return false;
  const row = grid[y];
  if (!row || x < 0 || x >= row.length) return false;
  const ch = row[x];
  return ch === '.' || ch === '^';
}

function checkSensor(
  grid: string[],
  x: number,
  y: number,
  dir: KoalaDir,
  sensor: KoalaPathSensor
): boolean {
  const checkDir =
    sensor === 'left'
      ? turnDirection(dir, 'left')
      : sensor === 'right'
        ? turnDirection(dir, 'right')
        : dir;
  const { dx, dy } = DIR_DELTA[checkDir];
  return isWalkable(grid, x + dx, y + dy);
}

export function countKoalaBlocks(blocks: KoalaBlockNode[]): number {
  let total = 1; // Include "ketika dijalankan" hat block just like Code.org!
  const walk = (list: KoalaBlockNode[]) => {
    for (const blk of list) {
      total += 1;
      if (blk.children) walk(blk.children);
      if (blk.elseChildren) walk(blk.elseChildren);
    }
  };
  walk(blocks);
  return total;
}

export function cloneKoalaBlocks(blocks: KoalaBlockNode[]): KoalaBlockNode[] {
  return blocks.map((b) => ({
    ...b,
    children: b.children ? cloneKoalaBlocks(b.children) : undefined,
    elseChildren: b.elseChildren ? cloneKoalaBlocks(b.elseChildren) : undefined,
  }));
}

export function executeKoalaMaze(
  subLevel: KoalaSubLevel,
  blocks: KoalaBlockNode[]
): KoalaRunResult {
  const frames: KoalaFrame[] = [];
  let x = subLevel.start.x;
  let y = subLevel.start.y;
  let dir: KoalaDir = subLevel.start.dir;
  let steps = 0;
  const MAX_STEPS = 85;
  let halted: 'won' | 'crashed' | 'infinite' | null = null;

  const isGoal = () => x === subLevel.goal.x && y === subLevel.goal.y;

  const pushFrame = (
    activeBlockId: string | null,
    status: KoalaFrame['status'],
    message: string
  ) => {
    frames.push({ x, y, dir, activeBlockId, status, message });
  };

  pushFrame(null, 'running', 'Koala bersiap memulai perjalanan...');

  const runList = (list: KoalaBlockNode[]) => {
    for (const blk of list) {
      if (halted) return;
      steps += 1;
      if (steps > MAX_STEPS) {
        halted = 'infinite';
        pushFrame(
          blk.id,
          'infinite',
          'Perulangan terlalu panjang! Cek kembali arah belok Koala.'
        );
        return;
      }

      if (blk.type === 'move_forward') {
        const { dx, dy } = DIR_DELTA[dir];
        const nx = x + dx;
        const ny = y + dy;
        if (!isWalkable(subLevel.grid, nx, ny)) {
          halted = 'crashed';
          pushFrame(
            blk.id,
            'crashed',
            'Aduh! Koala menabrak dinding. Coba cek arah hadap atau belokannya.'
          );
          return;
        }
        x = nx;
        y = ny;
        if (isGoal()) {
          halted = 'won';
          pushFrame(
            blk.id,
            'won',
            'Hebat! Koala berhasil menangkap daun eukaliptus segar!'
          );
          return;
        }
        pushFrame(blk.id, 'running', 'Koala bergerak maju 1 langkah.');
      } else if (blk.type === 'turn') {
        const tDir = blk.turnDir === 'right' ? 'right' : 'left';
        dir = turnDirection(dir, tDir);
        pushFrame(
          blk.id,
          'running',
          tDir === 'right' ? 'Koala belok kanan 90°.' : 'Koala belok kiri 90°.'
        );
      } else if (blk.type === 'repeat_times') {
        const times = Math.max(1, Math.min(12, Number(blk.count ?? 3)));
        for (let i = 0; i < times; i++) {
          if (halted) return;
          runList(blk.children || []);
        }
      } else if (blk.type === 'repeat_until_goal') {
        let guard = 0;
        while (!isGoal() && !halted) {
          guard += 1;
          if (guard > 40 || (blk.children || []).length === 0) {
            halted = 'infinite';
            pushFrame(
              blk.id,
              'infinite',
              (blk.children || []).length === 0
                ? 'Blok "ulangi sampai Daun" masih kosong! Isi blok di dalamnya.'
                : 'Koala berputar terlalu lama tanpa mencapai daun.'
            );
            return;
          }
          runList(blk.children || []);
        }
      } else if (blk.type === 'if_path') {
        const sensor = blk.sensor || 'forward';
        const open = checkSensor(subLevel.grid, x, y, dir, sensor);
        if (open) {
          runList(blk.children || []);
        }
      } else if (blk.type === 'if_else_path') {
        const sensor = blk.sensor || 'forward';
        const open = checkSensor(subLevel.grid, x, y, dir, sensor);
        if (open) {
          runList(blk.children || []);
        } else {
          runList(blk.elseChildren || []);
        }
      }
    }
  };

  runList(blocks);

  const blockCount = countKoalaBlocks(blocks);
  if (halted === 'won') {
    const optimal = blockCount <= subLevel.maxBlocks;
    return {
      frames,
      won: true,
      blockCount,
      optimal,
      finalMessage: optimal
        ? `Luar biasa! Kamu menyelesaikan "${subLevel.title}" dengan hanya ${blockCount} blok!`
        : `Berhasil! Koala sampai tujuan, tapi kamu memakai ${blockCount}/${subLevel.maxBlocks} blok. Coba lebih hemat lagi!`,
    };
  }

  if (!halted) {
    const msg =
      blocks.length === 0
        ? 'Area kerja masih kosong! Tarik atau klik blok ke bawah "ketika dijalankan".'
        : 'Koala belum sampai ke daun eukaliptus. Tambahkan langkah atau ulangi lagi!';
    pushFrame(null, 'incomplete', msg);
    return {
      frames,
      won: false,
      blockCount,
      optimal: false,
      finalMessage: msg,
    };
  }

  const last = frames[frames.length - 1];
  return {
    frames,
    won: false,
    blockCount,
    optimal: false,
    finalMessage: last?.message || 'Coba susun kembali bloknya!',
  };
}

// ==================== BLOCKS -> JAVASCRIPT & PYTHON GENERATOR ====================

export function koalaBlocksToJavaScript(blocks: KoalaBlockNode[]): string {
  const lines: string[] = [];
  const walk = (list: KoalaBlockNode[], indent: string) => {
    for (const blk of list) {
      switch (blk.type) {
        case 'move_forward':
          lines.push(`${indent}moveForward();`);
          break;
        case 'turn':
          lines.push(`${indent}${blk.turnDir === 'right' ? 'turnRight();' : 'turnLeft();'}`);
          break;
        case 'repeat_times':
          lines.push(
            `${indent}for (var count = 0; count < ${Number(blk.count ?? 3)}; count++) {`
          );
          walk(blk.children || [], indent + '  ');
          lines.push(`${indent}}`);
          break;
        case 'repeat_until_goal':
          lines.push(`${indent}while (notFinished()) {`);
          walk(blk.children || [], indent + '  ');
          lines.push(`${indent}}`);
          break;
        case 'if_path': {
          const fn =
            blk.sensor === 'left'
              ? 'isPathLeft()'
              : blk.sensor === 'right'
                ? 'isPathRight()'
                : 'isPathForward()';
          lines.push(`${indent}if (${fn}) {`);
          walk(blk.children || [], indent + '  ');
          lines.push(`${indent}}`);
          break;
        }
        case 'if_else_path': {
          const fn =
            blk.sensor === 'left'
              ? 'isPathLeft()'
              : blk.sensor === 'right'
                ? 'isPathRight()'
                : 'isPathForward()';
          lines.push(`${indent}if (${fn}) {`);
          walk(blk.children || [], indent + '  ');
          lines.push(`${indent}} else {`);
          walk(blk.elseChildren || [], indent + '  ');
          lines.push(`${indent}}`);
          break;
        }
      }
    }
  };
  walk(blocks, '');
  return lines.length > 0 ? lines.join('\n') : '// Belum ada blok yang dipasang';
}

export function koalaBlocksToPython(blocks: KoalaBlockNode[]): string {
  const lines: string[] = [];
  const walk = (list: KoalaBlockNode[], indent: string) => {
    if (list.length === 0 && indent) {
      lines.push(`${indent}pass`);
      return;
    }
    for (const blk of list) {
      switch (blk.type) {
        case 'move_forward':
          lines.push(`${indent}koala.gerak_maju()`);
          break;
        case 'turn':
          lines.push(
            `${indent}${blk.turnDir === 'right' ? 'koala.belok_kanan()' : 'koala.belok_kiri()'}`
          );
          break;
        case 'repeat_times':
          lines.push(`${indent}for i in range(${Number(blk.count ?? 3)}):`);
          walk(blk.children || [], indent + '    ');
          break;
        case 'repeat_until_goal':
          lines.push(`${indent}while not koala.sampai_daun():`);
          walk(blk.children || [], indent + '    ');
          break;
        case 'if_path': {
          const fn =
            blk.sensor === 'left'
              ? 'koala.jalan_kiri()'
              : blk.sensor === 'right'
                ? 'koala.jalan_kanan()'
                : 'koala.jalan_depan()';
          lines.push(`${indent}if ${fn}:`);
          walk(blk.children || [], indent + '    ');
          break;
        }
        case 'if_else_path': {
          const fn =
            blk.sensor === 'left'
              ? 'koala.jalan_kiri()'
              : blk.sensor === 'right'
                ? 'koala.jalan_kanan()'
                : 'koala.jalan_depan()';
          lines.push(`${indent}if ${fn}:`);
          walk(blk.children || [], indent + '    ');
          lines.push(`${indent}else:`);
          walk(blk.elseChildren || [], indent + '    ');
          break;
        }
      }
    }
  };
  walk(blocks, '');
  return lines.length > 0 ? lines.join('\n') : '# Belum ada blok yang dipasang';
}
