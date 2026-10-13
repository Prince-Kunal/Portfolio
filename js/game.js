/* =========================================================
   GAME MODE — a small pixel platformer. World 1-1 is built
   from PK.content (skills, projects, experience, hackathons).
   ========================================================= */
(function () {
  const PK = (window.PK = window.PK || {});

  const T = 16, ROWS = 14, COLS = 186, GROUND = 12;
  const E = 0, DIRT = 1, GRASS = 2, STONE = 3, BLOCK = 4, USED = 5, KBLOCK = 6;
  const SOLID = new Set([DIRT, GRASS, STONE, BLOCK, USED, KBLOCK]);
  const PITS = [44, 45, 100, 101];
  const FLAG_COL = 170, HQ_COL = 174;
  const PIXEL_FONT = '"Press Start 2P", "Courier New", monospace';

  let canvas, ctx, S, cb = {};
  let scale = 3, viewW = 320, viewH = 224, oy = 0;
  let tiles, level, player, camX = 0, checkpoint = 3;
  let stats, floaters, particles, bumps, pendingOpen, tutorial;
  let running = false, paused = false, finished = false, finishTimer = 0, flagY = 0;
  let rafId = 0, last = 0, acc = 0, frame = 0;
  let nearTerminal = null, lastHint = undefined, lastStats = "";
  const input = { left: false, right: false, jump: false, down: false };
  let jumpHeld = false, downHeld = false, jumpBuffer = 0, coyote = 0;
  const terminalImgs = {};
  let clouds = [], hills = [];

  /* ---------------- level ---------------- */
  const idx = (c, r) => r * COLS + c;
  function tileAt(c, r) {
    if (c < 0 || c >= COLS) return STONE; // invisible side walls
    if (r < 0 || r >= ROWS) return E;
    return tiles[idx(c, r)];
  }
  const solid = (c, r) => SOLID.has(tileAt(c, r));

  function buildLevel() {
    const C = PK.content;
    tiles = new Uint8Array(COLS * ROWS);
    const set = (c, r, t) => (tiles[idx(c, r)] = t);
    for (let c = 0; c < COLS; c++) {
      if (PITS.includes(c)) continue;
      set(c, GROUND, GRASS);
      set(c, GROUND + 1, DIRT);
    }
    level = { blocks: {}, coins: [], bugs: [], terminals: [], signs: [], trophies: [] };
    const coin = (c, r) => level.coins.push({ x: c * T + 4, y: r * T + 3, w: 8, h: 10, taken: false });

    // 1-1 skills: 14 code blocks
    [14, 15, 16, 20, 21, 24, 25, 26, 30, 31, 35, 36, 37, 38].forEach((c, i) => {
      set(c, 8, BLOCK);
      level.blocks[c + ",8"] = { skill: C.gameSkills[i % C.gameSkills.length] };
    });
    [22, 23, 32, 33].forEach((c) => coin(c, 9)); // in the gaps between blocks, a jump up
    [43, 44, 45, 46].forEach((c) => coin(c, 9)); // arc over the first pit

    // 1-2 projects: terminals with stone platforms between them
    [52, 64, 76, 88].forEach((c, i) => {
      const p = C.projects[i];
      if (!p) return;
      level.terminals.push({ x: c * T, y: (GROUND - 2) * T, w: 32, h: 32, kind: "project", id: p.id, name: p.name, look: p.game });
    });
    // row 9 is one full jump up; coins sit on top, collected by walking across
    [[57, 59], [69, 71], [81, 83]].forEach(([a, b]) => {
      for (let c = a; c <= b; c++) {
        set(c, 9, STONE);
        coin(c, 8);
      }
    });
    [99, 100, 101, 102].forEach((c) => coin(c, 9)); // arc over the second pit

    // 1-3 Kollide power-up
    set(111, 8, STONE);
    set(112, 8, KBLOCK);
    set(113, 8, STONE);
    level.blocks["112,8"] = { kollide: true };
    [118, 119, 120, 121].forEach((c) => coin(c, 9));

    // 1-4 research lab
    level.terminals.push({ x: 134 * T, y: (GROUND - 2) * T, w: 32, h: 32, kind: "experience", id: "research", name: "RESEARCH LAB", look: { screen: "#0E3B2E", glow: "#7CE38B" } });

    // hackathon trophies + staircase
    const stairs = { 158: 1, 159: 2, 160: 3, 161: 4, 162: 5, 163: 5, 164: 5 };
    Object.entries(stairs).forEach(([c, h]) => {
      for (let k = 1; k <= h; k++) set(+c, GROUND - k, STONE);
    });
    [[150, 10], [153, 10], [156, 10], [160, 8], [163, 6]].forEach(([c, r], i) => {
      level.trophies.push({ x: c * T + 2, y: r * T + 2, w: 12, h: 13, label: C.hackathons[i] || "HACKATHON", taken: false });
    });

    // enemies: bugs patrol between two columns
    [[18, 17, 23], [33, 28, 41], [62, 54, 68], [86, 80, 96], [118, 114, 127]].forEach(([c, a, b], i) => {
      level.bugs.push({ x: c * T, y: GROUND * T - 12, w: 16, h: 12, vx: i % 2 ? 0.45 : -0.45, min: a * T, max: (b + 1) * T, alive: true, squash: 0 });
    });

    level.signs = [
      { c: 2, text: "START >>" },
      { c: 11, text: "1-1 SKILLS" },
      { c: 48, text: "1-2 PROJECTS" },
      { c: 107, text: "1-3 KOLLIDE" },
      { c: 129, text: "1-4 RESEARCH" },
      { c: 146, text: "HACKATHONS" },
    ];

    // parallax scenery (fixed pseudo-random so it never changes)
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    clouds = [];
    for (let x = 0; x < COLS * T * 0.4 + 800; x += 110 + rnd() * 120) clouds.push({ x, y: 18 + rnd() * 60, w: 24 + Math.round(rnd() * 3) * 8 });
    hills = [];
    for (let x = -40; x < COLS * T * 0.6 + 900; x += 140 + rnd() * 160) hills.push({ x, w: 40 + rnd() * 50, h: 24 + rnd() * 40 });
  }

  function resetPlayer(col, keepGlow) {
    const glow = keepGlow && player ? player.glow : false;
    player = { x: col * T, y: GROUND * T - 19, w: 10, h: 19, vx: 0, vy: 0, onGround: true, face: 1, anim: 0, inv: 0, glow };
  }

  function reset() {
    buildLevel();
    checkpoint = 3;
    resetPlayer(checkpoint);
    stats = { score: 0, skills: 0, totalSkills: Object.values(level.blocks).filter((b) => b.skill).length, bugs: 0, trophies: 0, totalTrophies: level.trophies.length, coins: 0 };
    floaters = [];
    particles = [];
    bumps = new Map();
    pendingOpen = null;
    finished = false;
    finishTimer = 0;
    flagY = 3 * T + 4;
    camX = 0;
    tutorial = true;
    nearTerminal = null;
    lastHint = undefined;
    lastStats = "";
    Object.keys(input).forEach((k) => (input[k] = false));
  }

  /* ---------------- physics ---------------- */
  function moveX(p) {
    p.x += p.vx;
    const top = Math.floor(p.y / T), bot = Math.floor((p.y + p.h - 0.01) / T);
    if (p.vx > 0) {
      const c = Math.floor((p.x + p.w - 0.01) / T);
      for (let r = top; r <= bot; r++) if (solid(c, r)) { p.x = c * T - p.w; p.vx = 0; break; }
    } else if (p.vx < 0) {
      const c = Math.floor(p.x / T);
      for (let r = top; r <= bot; r++) if (solid(c, r)) { p.x = (c + 1) * T; p.vx = 0; break; }
    }
  }

  function moveY(p) {
    p.y += p.vy;
    p.onGround = false;
    const left = Math.floor(p.x / T), right = Math.floor((p.x + p.w - 0.01) / T);
    if (p.vy > 0) {
      const r = Math.floor((p.y + p.h) / T);
      for (let c = left; c <= right; c++) if (solid(c, r)) { p.y = r * T - p.h; p.vy = 0; p.onGround = true; break; }
    } else if (p.vy < 0) {
      const r = Math.floor(p.y / T);
      let hit = -1, best = 1e9;
      for (let c = left; c <= right; c++) {
        if (!solid(c, r)) continue;
        const d = Math.abs(c * T + 8 - (p.x + p.w / 2));
        if (d < best) { best = d; hit = c; }
      }
      if (hit >= 0) {
        p.y = (r + 1) * T;
        p.vy = 0.5;
        if (p === player) hitBlock(hit, r);
      }
    }
  }

  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function hitBlock(c, r) {
    const t = tileAt(c, r), key = c + "," + r;
    bumps.set(key, 10);
    if (t === BLOCK) {
      tiles[idx(c, r)] = USED;
      const b = level.blocks[key];
      stats.skills++;
      stats.score += 100;
      particles.push({ type: "coin", x: c * T + 4, y: r * T - 12, vx: 0, vy: -3.2, life: 26 });
      float(c * T + 8, r * T - 14, b.skill.toUpperCase(), "#FFE08A");
      PK.sfx.play("coin");
      // knock out a bug walking on top of the block
      level.bugs.forEach((bug) => {
        if (bug.alive && Math.abs(bug.x + 8 - (c * T + 8)) < 14 && Math.abs(bug.y + bug.h - r * T) < 3) squashBug(bug);
      });
    } else if (t === KBLOCK) {
      tiles[idx(c, r)] = USED;
      stats.score += 1000;
      player.glow = true;
      burst(c * T + 8, r * T, ["#C9BFFF", "#FFF4D1", "#8C6DFF"], 22);
      float(c * T + 8, r * T - 14, "KOLLIDE POWER-UP!", "#E4DDFF");
      PK.sfx.play("power");
      pendingOpen = { kind: "experience", id: "kollide", t: 45 };
    } else {
      PK.sfx.play("bump");
    }
  }

  function squashBug(b) {
    b.alive = false;
    b.squash = 45;
    stats.bugs++;
    stats.score += 200;
    float(b.x + 8, b.y - 10, "BUG FIXED!", "#9BF0A8");
    PK.sfx.play("stomp");
  }

  function float(x, y, text, color) {
    floaters.push({ x, y, text, color, life: 75 });
  }
  function burst(x, y, colors, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 0.8 + Math.random() * 2.2;
      particles.push({ type: "px", x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 30 + Math.random() * 20, color: colors[i % colors.length] });
    }
  }

  function step() {
    frame++;
    const p = player;

    if (finished) {
      finishStep();
    } else {
      const accel = p.onGround ? 0.22 : 0.15, max = p.glow ? 2.2 : 1.8;
      if (input.left && !input.right) { p.vx = Math.max(p.vx - accel, -max); p.face = -1; }
      else if (input.right && !input.left) { p.vx = Math.min(p.vx + accel, max); p.face = 1; }
      else { p.vx *= p.onGround ? 0.75 : 0.96; if (Math.abs(p.vx) < 0.05) p.vx = 0; }

      if (input.jump && !jumpHeld) jumpBuffer = 7;
      jumpHeld = input.jump;
      if (jumpBuffer > 0) jumpBuffer--;
      if (p.onGround) coyote = 6; else if (coyote > 0) coyote--;
      if (jumpBuffer > 0 && coyote > 0) {
        p.vy = -6.2; // ~57px: clears the row-9 platforms, still can't land on row-8 blocks
        jumpBuffer = 0;
        coyote = 0;
        PK.sfx.play("jump");
      }
      if (!input.jump && p.vy < -2.2) p.vy = -2.2; // short hop when released early
      p.vy = Math.min(p.vy + 0.32, 6);

      moveX(p);
      moveY(p);
      if (p.inv > 0) p.inv--;
      p.anim += Math.abs(p.vx) * 0.11;
      if (tutorial && p.x > 7 * T) tutorial = false;

      if (p.y > ROWS * T + 30) {
        resetPlayer(checkpoint, true);
        p.inv = 0;
        float(player.x + 5, player.y - 12, "RESPAWN", "#FFFDF6");
      }
      for (const s of level.signs) if (player.x >= s.c * T && s.c > checkpoint) checkpoint = s.c;

      collect();
      bugsStep();
      checkTerminals();

      if (input.down && !downHeld && nearTerminal) openTerminal(nearTerminal);
      downHeld = input.down;

      if (player.x + player.w >= FLAG_COL * T + 6) startFinish();
    }

    if (player.glow && frame % 5 === 0)
      particles.push({ type: "spark", x: player.x + Math.random() * 12 - 1, y: player.y + Math.random() * 18, vx: 0, vy: -0.3, life: 20 });

    updateEffects();
    updateCamera();
    report();
  }

  function collect() {
    for (const c of level.coins) {
      if (!c.taken && overlap(player, c)) {
        c.taken = true;
        stats.coins++;
        stats.score += 50;
        PK.sfx.play("coin");
      }
    }
    for (const t of level.trophies) {
      if (!t.taken && overlap(player, t)) {
        t.taken = true;
        stats.trophies++;
        stats.score += 500;
        float(t.x + 6, t.y - 12, t.label, "#FFE08A");
        burst(t.x + 6, t.y + 4, ["#F2C14E", "#FFF4D1"], 12);
        PK.sfx.play("trophy");
      }
    }
  }

  function bugsStep() {
    for (const b of level.bugs) {
      if (!b.alive) { if (b.squash > 0) b.squash--; continue; }
      b.x += b.vx;
      if (b.x < b.min || b.x + b.w > b.max) { b.vx *= -1; b.x += b.vx * 2; }
      const hb = { x: b.x + 2, y: b.y + 2, w: 12, h: 10 };
      if (!overlap(player, hb)) continue;
      if (player.vy > 0 && player.y + player.h - player.vy <= b.y + 6) {
        squashBug(b);
        player.vy = input.jump ? -5.2 : -3.6;
      } else if (player.inv === 0) {
        player.inv = 60;
        player.vx = player.x + player.w / 2 < b.x + 8 ? -2.8 : 2.8;
        player.vy = -3;
        float(player.x + 5, player.y - 10, "OUCH", "#FF9A85");
        PK.sfx.play("hurt");
      }
    }
  }

  function checkTerminals() {
    const cx = player.x + player.w / 2;
    nearTerminal = level.terminals.find((t) => cx > t.x - 4 && cx < t.x + t.w + 4 && player.onGround) || null;
  }

  function openTerminal(t) {
    PK.sfx.play("open");
    if (cb.onOpen) cb.onOpen({ kind: t.kind, id: t.id });
  }

  function startFinish() {
    if (finished) return;
    finished = true;
    finishTimer = 0;
    player.vx = 0;
    player.vy = 0;
    player.x = FLAG_COL * T - player.w + 6;
    stats.score += 2000;
    PK.sfx.play("clear");
    float(FLAG_COL * T + 8, 3 * T - 12, "+2000", "#FFE08A");
  }

  function finishStep() {
    const p = player;
    finishTimer++;
    flagY = Math.min(flagY + 3, GROUND * T - 18);
    if (finishTimer < 40) {
      p.vx = 0;
      p.vy = 1.6;
      moveY(p);
    } else {
      p.face = 1;
      p.vx = 1.3;
      moveX(p);
      p.vy = Math.min(p.vy + 0.32, 6);
      moveY(p);
      p.anim += 0.15;
    }
    if (finishTimer === 130 && cb.onFinish) cb.onFinish(Object.assign({}, stats));
  }

  function updateEffects() {
    bumps.forEach((v, k) => (v <= 1 ? bumps.delete(k) : bumps.set(k, v - 1)));
    for (const f of floaters) { f.y -= 0.35; f.life--; }
    floaters = floaters.filter((f) => f.life > 0);
    for (const q of particles) {
      q.x += q.vx;
      q.y += q.vy;
      q.vy += q.type === "spark" ? 0 : 0.18;
      q.life--;
    }
    particles = particles.filter((q) => q.life > 0);
    if (pendingOpen && --pendingOpen.t <= 0) {
      const o = pendingOpen;
      pendingOpen = null;
      if (cb.onOpen) cb.onOpen({ kind: o.kind, id: o.id });
    }
  }

  function updateCamera() {
    const target = player.x + player.w / 2 - viewW * 0.42;
    camX += (target - camX) * 0.18;
    camX = Math.max(0, Math.min(camX, COLS * T - viewW));
    if (COLS * T < viewW) camX = 0;
  }

  function report() {
    let hint = null;
    if (finished) hint = null;
    else if (nearTerminal) hint = (PK.isTouch ? "Tap B to open " : "Press ↓ or E to open ") + nearTerminal.name;
    else if (tutorial) hint = PK.isTouch ? "◀ ▶ to move · A to jump" : "← → to move · SPACE to jump";
    if (hint !== lastHint) {
      lastHint = hint;
      if (cb.onHint) cb.onHint(hint);
    }
    const s = JSON.stringify(stats);
    if (s !== lastStats) {
      lastStats = s;
      if (cb.onStats) cb.onStats(Object.assign({}, stats));
    }
  }

  /* ---------------- rendering ---------------- */
  function text(str, x, y, color, size, align) {
    ctx.font = (size || 6) + "px " + PIXEL_FONT;
    ctx.textAlign = align || "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(22,26,51,0.9)";
    ctx.fillText(str, x + 1, y + 1);
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }

  function drawCloud(x, y, w) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x, y + 4, w, 8);
    ctx.fillRect(x + 6, y, w - 14, 4);
    ctx.fillRect(x + 10, y - 4, Math.max(6, w - 26), 4);
    ctx.fillStyle = "#D7E6F7";
    ctx.fillRect(x, y + 10, w, 2);
  }

  function drawHill(x, w, h, base) {
    for (let dx = -w; dx <= w; dx += 2) {
      const hh = Math.round((h * Math.sqrt(1 - (dx / w) ** 2)) / 2) * 2;
      ctx.fillStyle = "#3E8C50";
      ctx.fillRect(x + dx, base - hh, 2, hh);
      ctx.fillStyle = "#57A866";
      ctx.fillRect(x + dx, base - hh, 2, 2);
    }
  }

  function render() {
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#4F86D9");
    g.addColorStop(1, "#A9CCF2");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const oyPx = Math.round(oy * scale);
    // far: clouds
    ctx.setTransform(scale, 0, 0, scale, -Math.round(camX * 0.25 * scale), oyPx);
    for (const c of clouds) drawCloud(c.x, c.y, c.w);
    // mid: hills
    ctx.setTransform(scale, 0, 0, scale, -Math.round(camX * 0.5 * scale), oyPx);
    for (const h of hills) drawHill(h.x, h.w, h.h, GROUND * T);

    // world
    ctx.setTransform(scale, 0, 0, scale, -Math.round(camX * scale), oyPx);
    const c0 = Math.max(0, Math.floor(camX / T) - 1), c1 = Math.min(COLS - 1, Math.ceil((camX + viewW) / T) + 1);
    const extraRows = Math.ceil((viewH - oy - ROWS * T) / T) + 1;

    drawHQ();
    drawFlag();
    for (const s of level.signs) if (s.c >= c0 - 6 && s.c <= c1 + 6) drawSign(s);
    for (const t of level.terminals) if (t.x / T >= c0 - 3 && t.x / T <= c1 + 1) drawTerminal(t);

    for (let c = c0; c <= c1; c++) {
      for (let r = 0; r < ROWS; r++) {
        const t = tiles[idx(c, r)];
        if (t === E) continue;
        const b = bumps.get(c + "," + r);
        const off = b ? -Math.round(Math.sin((b / 10) * Math.PI) * 4) : 0;
        const img = t === GRASS ? S.grass : t === DIRT ? S.dirt : t === STONE ? S.stone : t === BLOCK ? S.block : t === KBLOCK ? S.kblock : S.used;
        ctx.drawImage(img, c * T, r * T + off);
      }
      // fill below the level down to the bottom of the screen
      if (!PITS.includes(c)) for (let r = ROWS; r < ROWS + extraRows; r++) ctx.drawImage(S.dirt, c * T, r * T);
    }

    for (let i = 0; i < level.coins.length; i++) {
      const c = level.coins[i];
      if (c.taken || c.x < camX - 16 || c.x > camX + viewW + 16) continue;
      ctx.drawImage(S.coin, c.x, Math.round(c.y + Math.sin(frame * 0.08 + i) * 1.5));
    }
    for (const t of level.trophies) {
      if (t.taken) continue;
      ctx.drawImage(S.trophy, t.x, Math.round(t.y + Math.sin(frame * 0.06 + t.x) * 1.5));
    }
    for (const b of level.bugs) {
      if (!b.alive) {
        if (b.squash > 0) ctx.drawImage(S.bugFlat, Math.round(b.x), b.y + 8);
        continue;
      }
      const img = Math.floor(frame / 10) % 2 ? S.bug1 : S.bug2;
      ctx.save();
      if (b.vx > 0) {
        ctx.translate(Math.round(b.x) + 16, b.y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0);
      } else ctx.drawImage(img, Math.round(b.x), b.y);
      ctx.restore();
    }

    drawPlayer();

    for (const q of particles) {
      const a = Math.min(1, q.life / 15);
      ctx.globalAlpha = a;
      if (q.type === "coin") ctx.drawImage(S.coin, Math.round(q.x), Math.round(q.y));
      else if (q.type === "spark") {
        ctx.fillStyle = q.life % 4 < 2 ? "#FFF4D1" : "#C9BFFF";
        ctx.fillRect(Math.round(q.x), Math.round(q.y), 2, 2);
      } else {
        ctx.fillStyle = q.color;
        ctx.fillRect(Math.round(q.x), Math.round(q.y), 2, 2);
      }
      ctx.globalAlpha = 1;
    }

    if (nearTerminal && !finished) {
      const t = nearTerminal, bob = Math.floor(frame / 15) % 2 ? 0 : 2;
      const ax = t.x + 16, ay = t.y - 26 + bob;
      ctx.fillStyle = "#161A33";
      ctx.fillRect(ax - 6, ay - 1, 12, 6);
      ctx.fillRect(ax - 4, ay + 5, 8, 2);
      ctx.fillRect(ax - 2, ay + 7, 4, 2);
      ctx.fillStyle = "#F2C14E";
      ctx.fillRect(ax - 5, ay, 10, 4);
      ctx.fillRect(ax - 3, ay + 4, 6, 2);
      ctx.fillRect(ax - 1, ay + 6, 2, 2);
    }

    for (const f of floaters) {
      ctx.globalAlpha = Math.min(1, f.life / 20);
      text(f.text, Math.round(f.x), Math.round(f.y), f.color, 6);
      ctx.globalAlpha = 1;
    }
  }

  function drawPlayer() {
    const p = player;
    if (finished && finishTimer > 112) return; // walked into HQ
    if (p.inv > 0 && Math.floor(p.inv / 4) % 2) return;
    let img = S.player.idle;
    if (!p.onGround && !finished) img = S.player.jump;
    else if (Math.abs(p.vx) > 0.2) img = Math.floor(p.anim) % 2 ? S.player.run1 : S.player.run2;
    const x = Math.round(p.x) - 3, y = Math.round(p.y) - 1;
    ctx.save();
    if (p.face < 0) {
      ctx.translate(x + 16, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, 16, 20);
    } else ctx.drawImage(img, x, y, 16, 20);
    ctx.restore();
  }

  function drawSign(s) {
    const x = s.c * T + 8, base = GROUND * T;
    ctx.fillStyle = "#6B4423";
    ctx.fillRect(x - 1, base - 24, 3, 24);
    ctx.font = "6px " + PIXEL_FONT;
    const w = Math.ceil(ctx.measureText(s.text).width) + 10;
    const bx = Math.round(x - w / 2), by = base - 38;
    ctx.fillStyle = "#4A2E16";
    ctx.fillRect(bx - 1, by - 1, w + 2, 16);
    ctx.fillStyle = "#D29A5A";
    ctx.fillRect(bx, by, w, 14);
    ctx.fillStyle = "#E8B97E";
    ctx.fillRect(bx, by, w, 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#2B1A0E";
    ctx.fillText(s.text, x + 1, by + 5);
  }

  function drawTerminal(t) {
    const key = t.look.screen + t.look.glow;
    if (!terminalImgs[key]) terminalImgs[key] = S.terminal(t.look.screen, t.look.glow);
    ctx.drawImage(terminalImgs[key], t.x, t.y);
    if (Math.floor(frame / 30) % 2) {
      ctx.fillStyle = t.look.glow;
      ctx.fillRect(t.x + 16, t.y + 15, 3, 1);
    }
    text(t.name, t.x + 16, t.y - 11, "#FFFDF6", 6);
  }

  function drawFlag() {
    const x = FLAG_COL * T + 7;
    ctx.fillStyle = "#E8E4D6";
    ctx.fillRect(x, 3 * T, 2, GROUND * T - 3 * T);
    ctx.fillStyle = "#F2C14E";
    ctx.fillRect(x - 2, 3 * T - 6, 6, 6);
    // pennant
    for (let i = 0; i < 14; i++) {
      const h = Math.max(1, Math.round(10 - i * 0.7));
      ctx.fillStyle = "#3FA34D";
      ctx.fillRect(x + 2 + i, flagY + (10 - h) / 2, 1, h);
    }
    ctx.fillStyle = "#FFFDF6";
    ctx.fillRect(x + 5, flagY + 4, 2, 2);
  }

  function drawHQ() {
    const x = HQ_COL * T, w = 7 * T, h = 5 * T, base = GROUND * T, y = base - h;
    ctx.fillStyle = "#1E2550";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#2B3A67";
    for (let r = 0; r < h; r += 8) for (let c = (r / 8) % 2 ? 0 : 8; c < w; c += 16) ctx.fillRect(x + c + 1, y + r + 1, 14, 6);
    ctx.fillStyle = "#14183A";
    ctx.fillRect(x - 4, y - 6, w + 8, 6);
    // battlements
    for (let c = 0; c < w + 8; c += 12) ctx.fillRect(x - 4 + c, y - 12, 6, 6);
    ctx.fillStyle = "#F2C14E";
    [[14, 22], [w - 26, 22]].forEach(([wx, wy]) => ctx.fillRect(x + wx, y + wy, 12, 12));
    ctx.fillStyle = "#14172A";
    ctx.fillRect(x + w / 2 - 9, base - 30, 18, 30);
    ctx.fillRect(x + w / 2 - 7, base - 33, 14, 3);
    text("CONTACT", x + w / 2, y + 6, "#FFE08A", 6);
  }

  /* ---------------- setup ---------------- */
  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const W = Math.max(1, Math.floor(canvas.clientWidth * dpr)), H = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    canvas.width = W;
    canvas.height = H;
    // portrait phones: zoom in so the world is ~12 tiles wide instead of tiny
    let s = Math.min(H / (ROWS * T), W / (W < H ? 200 : 300));
    s = s >= 2 ? Math.floor(s) : Math.max(1, s);
    scale = s;
    viewW = W / s;
    viewH = H / s;
    const reserve = PK.isTouch ? (150 * dpr) / s : 0;
    oy = Math.round(Math.max(0, viewH - ROWS * T - reserve));
    if (viewH - ROWS * T - reserve < 0) oy = Math.round(viewH - ROWS * T);
    if (ctx) ctx.imageSmoothingEnabled = false;
  }

  const KEYMAP = {
    ArrowLeft: "left", KeyA: "left",
    ArrowRight: "right", KeyD: "right",
    ArrowUp: "jump", KeyW: "jump", Space: "jump", KeyZ: "jump",
    ArrowDown: "down", KeyS: "down", KeyE: "down", Enter: "down",
  };
  function onKey(e, down) {
    if (!running || paused) return;
    const k = KEYMAP[e.code];
    if (!k) return;
    e.preventDefault();
    input[k] = down;
  }

  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    if (!last) last = ts;
    const dt = Math.min(0.1, (ts - last) / 1000);
    last = ts;
    if (!paused) {
      acc += dt;
      let n = 0;
      while (acc >= 1 / 60 && n < 6) { step(); acc -= 1 / 60; n++; }
      if (n === 6) acc = 0;
    }
    render();
  }

  PK.game = {
    init(canvasEl, callbacks) {
      canvas = canvasEl;
      ctx = canvas.getContext("2d");
      cb = callbacks || {};
      S = PK.sprites.get();
      reset();
      resize();
      window.addEventListener("resize", resize);
      window.addEventListener("keydown", (e) => onKey(e, true));
      window.addEventListener("keyup", (e) => onKey(e, false));
      window.addEventListener("blur", () => Object.keys(input).forEach((k) => (input[k] = false)));
      if (document.fonts && document.fonts.load) document.fonts.load("8px " + PIXEL_FONT).catch(() => {});
    },
    /** Hold or release a virtual button: left | right | jump | down */
    press(key, down) {
      if (key in input) input[key] = down;
    },
    start() {
      resize();
      if (running) return;
      running = true;
      paused = false;
      last = 0;
      acc = 0;
      rafId = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      cancelAnimationFrame(rafId);
      Object.keys(input).forEach((k) => (input[k] = false));
    },
    pause(on) {
      paused = !!on;
      Object.keys(input).forEach((k) => (input[k] = false));
      jumpHeld = true; // ignore a jump key still held from the modal
      downHeld = true;
      last = 0;
    },
    reset() {
      reset();
      resize();
    },
    get running() {
      return running;
    },
    // used by automated tests
    _debug() {
      return { player, stats, camX, finished, nearTerminal: nearTerminal && nearTerminal.id, scale, viewW, viewH, oy };
    },
    _teleport(col) {
      resetPlayer(col, true);
      camX = Math.max(0, col * T - viewW * 0.42);
    },
  };
})();
