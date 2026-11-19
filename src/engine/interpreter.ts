import type {
  CodeBlockItem,
  CodeLanguage,
  Direction,
  ExecutionFrame,
  ExecutionResult,
  LevelDefinition,
} from '../types';

/**
 * Generates clean Codementum-style Python or JavaScript code from Visual Blocks.
 */
export function blocksToCode(blocks: CodeBlockItem[], language: CodeLanguage, indentLevel = 0): string {
  const indent = '  '.repeat(indentLevel);
  const lines: string[] = [];

  for (const block of blocks) {
    if (block.type === 'move_forward') {
      const steps = Math.max(1, Math.min(20, block.steps ?? 1));
      lines.push(language === 'python' ? `${indent}forward(${steps})` : `${indent}forward(${steps});`);
    } else if (block.type === 'turn_left') {
      lines.push(language === 'python' ? `${indent}turn("left")` : `${indent}turn("left");`);
    } else if (block.type === 'turn_right') {
      lines.push(language === 'python' ? `${indent}turn("right")` : `${indent}turn("right");`);
    } else if (block.type === 'repeat') {
      const count = Math.max(1, Math.min(30, block.count ?? 3));
      const body =
        block.children && block.children.length > 0
          ? blocksToCode(block.children, language, indentLevel + 1)
          : language === 'python'
            ? `${indent}  pass`
            : `${indent}  // tambahkan perintah`;
      if (language === 'python') {
        lines.push(`${indent}for i in range(${count}):`);
        lines.push(body);
      } else {
        lines.push(`${indent}for (let i = 0; i < ${count}; i++) {`);
        lines.push(body);
        lines.push(`${indent}}`);
      }
    } else if (block.type === 'if_path_clear') {
      const thenBody =
        block.children && block.children.length > 0
          ? blocksToCode(block.children, language, indentLevel + 1)
          : language === 'python'
            ? `${indent}  pass`
            : `${indent}  // jalan aman`;
      const hasElse = block.elseChildren && block.elseChildren.length > 0;
      const elseBody = hasElse ? blocksToCode(block.elseChildren!, language, indentLevel + 1) : '';

      if (language === 'python') {
        lines.push(`${indent}if path_clear():`);
        lines.push(thenBody);
        if (hasElse) {
          lines.push(`${indent}else:`);
          lines.push(elseBody);
        }
      } else {
        lines.push(`${indent}if (pathClear()) {`);
        lines.push(thenBody);
        if (hasElse) {
          lines.push(`${indent}} else {`);
          lines.push(elseBody);
        }
        lines.push(`${indent}}`);
      }
    } else if (block.type === 'if_gem_ahead') {
      const thenBody =
        block.children && block.children.length > 0
          ? blocksToCode(block.children, language, indentLevel + 1)
          : language === 'python'
            ? `${indent}  pass`
            : `${indent}  // permata di depan`;
      if (language === 'python') {
        lines.push(`${indent}if gem_ahead():`);
        lines.push(thenBody);
      } else {
        lines.push(`${indent}if (gemAhead()) {`);
        lines.push(thenBody);
        lines.push(`${indent}}`);
      }
    }
  }

  return lines.join('\n');
}

// ================= SAFE AST PARSER (ZERO eval()) =================

type AstNode =
  | { kind: 'move'; steps: number; line: number }
  | { kind: 'turn'; dir: 'left' | 'right'; line: number }
  | { kind: 'repeat'; count: number; body: AstNode[]; line: number }
  | {
      kind: 'if';
      condition: 'path_clear' | 'gem_ahead';
      thenBody: AstNode[];
      elseBody: AstNode[];
      line: number;
    };

interface ParseResult {
  nodes: AstNode[];
  error?: string;
  errorLine?: number;
  effectiveLines: number;
}

function parseActionStatement(raw: string, line: number): AstNode | null {
  const cleaned = raw.trim().replace(/;$/, '').trim();

  // forward() OR forward(3) OR move_forward() OR moveForward(2)
  const fwdMatch = cleaned.match(/^(?:forward|move_forward|moveForward)\s*\(\s*(\d*)\s*\)$/);
  if (fwdMatch) {
    const steps = fwdMatch[1] ? parseInt(fwdMatch[1], 10) : 1;
    if (Number.isNaN(steps) || steps < 1 || steps > 25) return null;
    return { kind: 'move', steps, line };
  }

  // turn("left") OR turn('right') OR turn(left)
  const turnArgMatch = cleaned.match(/^turn\s*\(\s*["']?(left|right)["']?\s*\)$/i);
  if (turnArgMatch) {
    return {
      kind: 'turn',
      dir: turnArgMatch[1].toLowerCase() === 'right' ? 'right' : 'left',
      line,
    };
  }

  // Legacy turn_left() / turnLeft() / turn_right() / turnRight()
  const compact = cleaned.replace(/\s+/g, '');
  if (compact === 'turn_left()' || compact === 'turnLeft()') {
    return { kind: 'turn', dir: 'left', line };
  }
  if (compact === 'turn_right()' || compact === 'turnRight()') {
    return { kind: 'turn', dir: 'right', line };
  }

  return null;
}

function parseCondition(raw: string): 'path_clear' | 'gem_ahead' | null {
  const c = raw.replace(/\s+/g, '');
  if (
    c === 'if_path_clear()' ||
    c === 'is_path_clear()' ||
    c === 'path_clear()' ||
    c === 'isPathClear()' ||
    c === 'pathClear()'
  ) {
    return 'path_clear';
  }
  if (
    c === 'if_gem_ahead()' ||
    c === 'is_gem_ahead()' ||
    c === 'gem_ahead()' ||
    c === 'isGemAhead()' ||
    c === 'gemAhead()'
  ) {
    return 'gem_ahead';
  }
  return null;
}

function parsePython(code: string): ParseResult {
  const rawLines = code.split(/\r?\n/);
  const tokens: { indent: number; text: string; line: number }[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i].replace(/\t/g, '  ');
    const stripped = raw.replace(/#.*$/, '').trim();
    if (!stripped || stripped === 'pass') continue;
    const indent = raw.search(/\S|$/);
    tokens.push({ indent, text: stripped, line: i + 1 });
  }

  let idx = 0;

  function parseBlock(minIndent: number): { nodes: AstNode[]; error?: string; errorLine?: number } {
    const nodes: AstNode[] = [];
    while (idx < tokens.length) {
      const tok = tokens[idx];
      if (tok.indent < minIndent) break;
      if (tok.indent > minIndent) {
        return {
          nodes,
          error: `Indentasi (spasi di awal baris) tidak sejajar pada baris ${tok.line}.`,
          errorLine: tok.line,
        };
      }

      const act = parseActionStatement(tok.text, tok.line);
      if (act) {
        nodes.push(act);
        idx++;
        continue;
      }

      const repeatMatch =
        tok.text.match(/^repeat\s*\(\s*(\d+)\s*\)\s*:$/) ||
        tok.text.match(/^for\s+[a-zA-Z_]\w*\s+in\s+range\s*\(\s*(\d+)\s*\)\s*:$/);
      if (repeatMatch) {
        const count = parseInt(repeatMatch[1], 10);
        if (Number.isNaN(count) || count < 1 || count > 50) {
          return {
            nodes,
            error: `Jumlah pengulangan pada baris ${tok.line} harus angka antara 1 hingga 50.`,
            errorLine: tok.line,
          };
        }
        const headerLine = tok.line;
        idx++;
        if (idx >= tokens.length || tokens[idx].indent <= tok.indent) {
          nodes.push({ kind: 'repeat', count, body: [], line: headerLine });
          continue;
        }
        const childIndent = tokens[idx].indent;
        const bodyRes = parseBlock(childIndent);
        if (bodyRes.error) return bodyRes;
        nodes.push({ kind: 'repeat', count, body: bodyRes.nodes, line: headerLine });
        continue;
      }

      const ifMatch = tok.text.match(/^(?:if\s+)?([a-zA-Z_]\w*\s*\(\s*\))\s*:$/);
      if (ifMatch) {
        const cond = parseCondition(ifMatch[1]);
        if (!cond) {
          return {
            nodes,
            error: `Kondisi "${ifMatch[1]}" pada baris ${tok.line} tidak dikenali. Gunakan path_clear() atau gem_ahead().`,
            errorLine: tok.line,
          };
        }
        const headerLine = tok.line;
        const headerIndent = tok.indent;
        idx++;
        let thenBody: AstNode[] = [];
        if (idx < tokens.length && tokens[idx].indent > headerIndent) {
          const thenRes = parseBlock(tokens[idx].indent);
          if (thenRes.error) return thenRes;
          thenBody = thenRes.nodes;
        }
        let elseBody: AstNode[] = [];
        if (idx < tokens.length && tokens[idx].indent === headerIndent && /^else\s*:$/.test(tokens[idx].text)) {
          idx++;
          if (idx < tokens.length && tokens[idx].indent > headerIndent) {
            const elseRes = parseBlock(tokens[idx].indent);
            if (elseRes.error) return elseRes;
            elseBody = elseRes.nodes;
          }
        }
        nodes.push({ kind: 'if', condition: cond, thenBody, elseBody, line: headerLine });
        continue;
      }

      if (/^else\s*:$/.test(tok.text)) {
        return {
          nodes,
          error: `Kata kunci "else:" pada baris ${tok.line} harus diletakkan tepat setelah blok "if".`,
          errorLine: tok.line,
        };
      }

      return {
        nodes,
        error: `Perintah tidak dikenali pada baris ${tok.line}: "${tok.text}". Gunakan forward(n), turn("left"), turn("right"), for i in range(n):, atau if path_clear():.`,
        errorLine: tok.line,
      };
    }

    return { nodes };
  }

  const rootIndent = tokens.length > 0 ? tokens[0].indent : 0;
  const res = parseBlock(rootIndent);
  return {
    nodes: res.nodes,
    error: res.error,
    errorLine: res.errorLine,
    effectiveLines: tokens.length,
  };
}

function parseJavaScript(code: string): ParseResult {
  const rawLines = code.split(/\r?\n/);
  const lines: { text: string; line: number }[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const cleaned = rawLines[i].replace(/\/\/.*$/, '').trim();
    if (!cleaned) continue;
    lines.push({ text: cleaned, line: i + 1 });
  }

  let idx = 0;

  function parseBlock(expectClosingBrace: boolean): { nodes: AstNode[]; error?: string; errorLine?: number } {
    const nodes: AstNode[] = [];

    while (idx < lines.length) {
      const cur = lines[idx];

      if (cur.text === '}') {
        if (expectClosingBrace) {
          idx++;
          return { nodes };
        }
        return {
          nodes,
          error: `Tanda kurung kurawal tutup "}" berlebih pada baris ${cur.line}.`,
          errorLine: cur.line,
        };
      }

      if (cur.text.startsWith('} else')) {
        if (expectClosingBrace) {
          return { nodes };
        }
        return {
          nodes,
          error: `Blok "else" pada baris ${cur.line} tidak memiliki pasangan "if".`,
          errorLine: cur.line,
        };
      }

      const act = parseActionStatement(cur.text, cur.line);
      if (act) {
        nodes.push(act);
        idx++;
        continue;
      }

      const forMatch =
        cur.text.match(
          /^for\s*\(\s*(?:let|var|const)?\s*[a-zA-Z_]\w*\s*=\s*0\s*;\s*[a-zA-Z_]\w*\s*<\s*(\d+)\s*;\s*[a-zA-Z_]\w*\+\+\s*\)\s*\{$/
        ) || cur.text.match(/^repeat\s*\(\s*(\d+)\s*\)\s*\{$/);
      if (forMatch) {
        const count = parseInt(forMatch[1], 10);
        if (Number.isNaN(count) || count < 1 || count > 50) {
          return {
            nodes,
            error: `Jumlah pengulangan pada baris ${cur.line} harus antara 1 hingga 50.`,
            errorLine: cur.line,
          };
        }
        const headerLine = cur.line;
        idx++;
        const bodyRes = parseBlock(true);
        if (bodyRes.error) return bodyRes;
        nodes.push({ kind: 'repeat', count, body: bodyRes.nodes, line: headerLine });
        continue;
      }

      const ifMatch = cur.text.match(/^if\s*\(\s*([a-zA-Z_]\w*\s*\(\s*\))\s*\)\s*\{$/);
      if (ifMatch) {
        const cond = parseCondition(ifMatch[1]);
        if (!cond) {
          return {
            nodes,
            error: `Kondisi "${ifMatch[1]}" pada baris ${cur.line} tidak dikenali. Gunakan pathClear() atau gemAhead().`,
            errorLine: cur.line,
          };
        }
        const headerLine = cur.line;
        idx++;
        const thenRes = parseBlock(true);
        if (thenRes.error) return thenRes;

        let elseBody: AstNode[] = [];
        if (idx < lines.length && /^\}\s*else\s*\{$/.test(lines[idx].text)) {
          idx++;
          const elseRes = parseBlock(true);
          if (elseRes.error) return elseRes;
          elseBody = elseRes.nodes;
        } else if (idx < lines.length && /^else\s*\{$/.test(lines[idx].text)) {
          idx++;
          const elseRes = parseBlock(true);
          if (elseRes.error) return elseRes;
          elseBody = elseRes.nodes;
        }

        nodes.push({ kind: 'if', condition: cond, thenBody: thenRes.nodes, elseBody, line: headerLine });
        continue;
      }

      return {
        nodes,
        error: `Sintaks JavaScript tidak dikenali pada baris ${cur.line}: "${cur.text}". Gunakan forward(n);, turn("left");, turn("right");, for (let i = 0; i < n; i++) { ... }, atau if (pathClear()) { ... }.`,
        errorLine: cur.line,
      };
    }

    if (expectClosingBrace) {
      return {
        nodes,
        error: 'Ada blok kurung kurawal "{" yang belum ditutup dengan "}".',
        errorLine: lines[lines.length - 1]?.line || 1,
      };
    }

    return { nodes };
  }

  const res = parseBlock(false);
  const meaningfulLines = lines.filter((l) => l.text !== '}' && l.text !== '} else {').length;
  return {
    nodes: res.nodes,
    error: res.error,
    errorLine: res.errorLine,
    effectiveLines: meaningfulLines,
  };
}

// ================= SAFE STEP-BY-STEP SIMULATOR =================

const DIR_DELTA: Record<Direction, { dx: number; dy: number }> = {
  N: { dx: 0, dy: -1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 },
};

const LEFT_TURN: Record<Direction, Direction> = { N: 'W', W: 'S', S: 'E', E: 'N' };
const RIGHT_TURN: Record<Direction, Direction> = { N: 'E', E: 'S', S: 'W', W: 'N' };

function coordKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function executeCode(
  code: string,
  language: CodeLanguage,
  level: LevelDefinition
): ExecutionResult {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      frames: [
        {
          x: level.start.x,
          y: level.start.y,
          dir: level.start.dir,
          collectedGems: [],
          activeLine: 1,
          actionLabel: 'Kode masih kosong',
          status: 'incomplete',
          soundEvent: 'crash',
          errorMessage: 'Tambahkan blok atau tulis kode perintah terlebih dahulu sebelum menekan Jalankan!',
        },
      ],
      success: false,
      stars: 0,
      lineCount: 0,
      errorMessage: 'Kode masih kosong! Susun minimal 1 perintah untuk menggerakkan Panda.',
      errorLine: 1,
    };
  }

  const parsed = language === 'python' ? parsePython(code) : parseJavaScript(code);
  if (parsed.error) {
    return {
      frames: [
        {
          x: level.start.x,
          y: level.start.y,
          dir: level.start.dir,
          collectedGems: [],
          activeLine: parsed.errorLine || 1,
          actionLabel: 'Kesalahan Sintaks',
          status: 'crashed',
          soundEvent: 'crash',
          errorMessage: parsed.error,
        },
      ],
      success: false,
      stars: 0,
      lineCount: parsed.effectiveLines,
      errorMessage: parsed.error,
      errorLine: parsed.errorLine,
    };
  }

  const wallSet = new Set(level.walls.map((w) => coordKey(w.x, w.y)));
  const gemSet = new Set(level.gems.map((g) => coordKey(g.x, g.y)));

  let x = level.start.x;
  let y = level.start.y;
  let dir: Direction = level.start.dir;
  const collected = new Set<string>();
  const frames: ExecutionFrame[] = [];
  let stepsExecuted = 0;
  const MAX_STEPS = 120;
  let crashed = false;
  let reachedVictory = false;
  let finalError: string | undefined;
  let errorLine: number | undefined;

  const isCellBlocked = (nx: number, ny: number): boolean => {
    if (nx < 0 || ny < 0 || nx >= level.gridWidth || ny >= level.gridHeight) return true;
    return wallSet.has(coordKey(nx, ny));
  };

  const checkVictory = (): boolean => {
    return x === level.goal.x && y === level.goal.y && collected.size === level.gems.length;
  };

  const stepForwardOnce = (line: number) => {
    stepsExecuted++;
    if (stepsExecuted > MAX_STEPS) {
      crashed = true;
      finalError = 'Terlalu banyak langkah (>120)! Pastikan perulangan tidak berlebihan.';
      errorLine = line;
      frames.push({
        x,
        y,
        dir,
        collectedGems: Array.from(collected),
        activeLine: line,
        actionLabel: 'Batas langkah terlampaui',
        status: 'crashed',
        soundEvent: 'crash',
        errorMessage: finalError,
      });
      return;
    }

    const nextX = x + DIR_DELTA[dir].dx;
    const nextY = y + DIR_DELTA[dir].dy;
    if (isCellBlocked(nextX, nextY)) {
      crashed = true;
      finalError = `Ups! Panda menabrak rintangan atau batas pulau pada baris ${line}. Coba belok dulu!`;
      errorLine = line;
      frames.push({
        x,
        y,
        dir,
        collectedGems: Array.from(collected),
        activeLine: line,
        actionLabel: 'Menabrak rintangan!',
        status: 'crashed',
        soundEvent: 'crash',
        errorMessage: finalError,
      });
      return;
    }

    x = nextX;
    y = nextY;
    const k = coordKey(x, y);
    let label = 'Maju 1 kotak';
    let gotGem = false;
    if (gemSet.has(k) && !collected.has(k)) {
      collected.add(k);
      gotGem = true;
      label = 'Permata diambil!';
    }
    if (checkVictory()) {
      reachedVictory = true;
      frames.push({
        x,
        y,
        dir,
        collectedGems: Array.from(collected),
        activeLine: line,
        actionLabel: 'Misi Selesai!',
        status: 'success',
        soundEvent: 'success',
      });
      return;
    }
    frames.push({
      x,
      y,
      dir,
      collectedGems: Array.from(collected),
      activeLine: line,
      actionLabel: label,
      status: 'running',
      soundEvent: gotGem ? 'gem' : 'step',
    });
  };

  const runNodes = (nodes: AstNode[]) => {
    for (const node of nodes) {
      if (crashed || reachedVictory) return;

      if (node.kind === 'move') {
        for (let s = 0; s < node.steps; s++) {
          if (crashed || reachedVictory) return;
          stepForwardOnce(node.line);
        }
      } else if (node.kind === 'turn') {
        stepsExecuted++;
        dir = node.dir === 'left' ? LEFT_TURN[dir] : RIGHT_TURN[dir];
        frames.push({
          x,
          y,
          dir,
          collectedGems: Array.from(collected),
          activeLine: node.line,
          actionLabel: node.dir === 'left' ? 'Belok kiri' : 'Belok kanan',
          status: 'running',
          soundEvent: 'turn',
        });
      } else if (node.kind === 'repeat') {
        for (let i = 0; i < node.count; i++) {
          if (crashed || reachedVictory) return;
          runNodes(node.body);
        }
      } else if (node.kind === 'if') {
        const aheadX = x + DIR_DELTA[dir].dx;
        const aheadY = y + DIR_DELTA[dir].dy;
        let condTrue = false;
        if (node.condition === 'path_clear') {
          condTrue = !isCellBlocked(aheadX, aheadY);
        } else if (node.condition === 'gem_ahead') {
          const aheadKey = coordKey(aheadX, aheadY);
          condTrue = gemSet.has(aheadKey) && !collected.has(aheadKey);
        }
        runNodes(condTrue ? node.thenBody : node.elseBody);
      }
    }
  };

  runNodes(parsed.nodes);

  if (reachedVictory) {
    const linesUsed = Math.max(1, parsed.effectiveLines);
    const stars: 1 | 2 | 3 =
      linesUsed <= level.optimalLines ? 3 : linesUsed <= level.twoStarLines ? 2 : 1;
    return {
      frames,
      success: true,
      stars,
      lineCount: linesUsed,
    };
  }

  if (!crashed) {
    const missingGems = level.gems.length - collected.size;
    if (x === level.goal.x && y === level.goal.y && missingGems > 0) {
      finalError = `Panda sudah sampai di titik tujuan, tapi masih ada ${missingGems} permata yang belum diambil!`;
    } else {
      finalError = `Program selesai, namun Panda belum sampai ke titik tujuan (permata terkumpul: ${collected.size}/${level.gems.length}).`;
    }
    frames.push({
      x,
      y,
      dir,
      collectedGems: Array.from(collected),
      activeLine: parsed.effectiveLines || 1,
      actionLabel: 'Belum sampai tujuan',
      status: 'incomplete',
      soundEvent: 'incomplete',
      errorMessage: finalError,
    });
  }

  return {
    frames,
    success: false,
    stars: 0,
    lineCount: parsed.effectiveLines,
    errorMessage: finalError,
    errorLine,
  };
}
