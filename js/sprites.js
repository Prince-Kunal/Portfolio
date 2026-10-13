/* =========================================================
   PIXEL ART — every sprite is drawn from text, one character
   per pixel. "." is transparent. Edit the letters to redraw.
   To change how the avatar looks, edit AVATAR_PALETTE and the
   AVATAR_TOP / AVATAR_LEGS rows below.
   ========================================================= */
(function () {
  const PK = (window.PK = window.PK || {});

  function make(rows, pal) {
    const h = rows.length, w = rows[0].length;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const x = c.getContext("2d");
    rows.forEach((row, y) => {
      if (row.length !== w) console.warn("[sprites] row width mismatch at", y, row);
      for (let i = 0; i < row.length; i++) {
        const col = pal[row[i]];
        if (col) {
          x.fillStyle = col;
          x.fillRect(i, y, 1, 1);
        }
      }
    });
    return c;
  }

  /* ---------- the avatar (32 x 40) ----------
     One drawing everywhere: the title screen, recruiter mode and the
     game. In the game it is drawn into the player's 16 x 20 slot, so it
     shows at twice the detail of the tiles around it. AVATAR_TOP is the
     head and shirt; AVATAR_LEGS holds one set of leg rows per pose. */
  const AVATAR_PALETTE = {
    H: "#1C1517", // hair
    h: "#3A2C2A", // hair highlight
    S: "#DCA67D", // skin
    s: "#C28D66", // skin shade
    t: "#A9764F", // skin, deep shade
    G: "#23202A", // glasses, dark upper half
    g: "#7D838F", // glasses, clear lower half
    W: "#F7F3EE", // eye whites
    E: "#3A2620", // eyes
    m: "#6E4C3B", // mustache
    b: "#9E7052", // chin beard
    T: "#FFF8EE", // teeth
    R: "#E8895C", // salmon shirt
    r: "#C96E47", // shirt shade / seams
    C: "#F6B48C", // collar and cuffs
    D: "#FBE0CB", // buttons
    w: "#D5DAE2", // watch
    v: "#8E95A1", // watch shade
    P: "#34416E", // trousers
    p: "#27325A", // trouser shade
    K: "#2A2630", // shoes
    k: "#4A4554", // soles
  };

  const AVATAR_TOP = [
    "............HHHHHHHHHH..........",
    ".........HHHHHhhhhHHHHHHH.......",
    ".......HHHHhhhHHHHhhhHHHHH......",
    "......HHHhhhHHHHhhhHHHHHHHH.....",
    ".....HHhhhHHHHhhHHHHHHHHHHH.....",
    ".....HHHHHHHHHHHHHHHHHHHHHH.....",
    ".....HHHHHHHHHHHHHHHHHHHHHH.....",
    "......HHSSSSSSSSSSSSSSHHHH......",
    "......HHSHHHHHSSSSHHHHSSHH......",
    "......HHSSSSSSSSSSSSSSSSHH......",
    "......HGGGGGGGGSSGGGGGGGGH......",
    "......sSGSWEESGGGGSWEESGSs......",
    "......sSGSWEESGSSGSWEESGSs......",
    "......sSgSSSSSgSSgSSSSSgSs......",
    "......tSgggggggSSgggggggSt......",
    ".......SSSSSSSSSsSSSSSSSS.......",
    ".......SSSSSmmmmmmmmSSSSS.......",
    ".......sSSSSsTTTTTTsSSSSs.......",
    "........sSSSSSSbbSSSSSSs........",
    ".........sbbbbbbbbbbbbs.........",
    "...........tbbbbbbbbt...........",
    "......rRRRRCCCtSStCCCRRRRr......",
    ".....rRRrRRRRRCttCRRRRRrRRr.....",
    ".....rRRrRRRRRRDRRRRRRRrRRr.....",
    ".....rCCrRRRRRRrRRRRRRRrCCr.....",
    ".....sSSrRRRRRRrRRRRRRRrSSs.....",
    ".....sSSrRRRRRRDRRRRRRRrwwv.....",
    ".....sSSrRRRRRRrRRRRRRRrSSs.....",
    ".....sSSrRRRRRRrRRRRRRRrSSs.....",
    "......ssrRRRRRRDRRRRRRRrss......",
    "........rrrrrrrrrrrrrrrr........",
  ];
  const AVATAR_LEGS = {
    idle: [
      ".........PPPPPPPPPPPPPP.........",
      ".........PPPPPPpPPPPPPP.........",
      ".........PPPPPPpPPPPPPP.........",
      ".........PPPPPP..PPPPPP.........",
      ".........PPPPPp..pPPPPP.........",
      ".........PPPPPp..pPPPPP.........",
      ".........PPPPPp..pPPPPP.........",
      "........KKKKKKK..KKKKKKK........",
      "........kkkkkkk..kkkkkkk........",
    ],
    run1: [
      ".........PPPPPPPPPPPPPP.........",
      ".........PPPPPPpPPPPPPP.........",
      "........PPPPPPP..PPPPPPP........",
      "........PPPPPP....PPPPPP........",
      ".......PPPPPP......PPPPPP.......",
      "......PPPPPP........PPPPPP......",
      "......PPPPPP........PPPPPP......",
      "....KKKKKKKK........KKKKKKKK....",
      "....kkkkkkkk........kkkkkkkk....",
    ],
    run2: [
      ".........PPPPPPPPPPPPPP.........",
      "..........PPPPPPPPPPPP..........",
      "..........PPPPPPPPPPPP..........",
      "...........PPPPPPPPPP...........",
      "...........PPPPPPPPPP...........",
      "...........PPPPppPPPP...........",
      "...........PPPPPPPPPP...........",
      ".........KKKKKKKKKKKKKK.........",
      ".........kkkkkkkkkkkkkk.........",
    ],
    jump: [
      ".........PPPPPPPPPPPPPP.........",
      ".........PPPPPPpPPPPPPP.........",
      "........PPPPPPP..PPPPPPP........",
      "........PPPPPP...PPPPPP.........",
      ".......KKKKKKK...PPPPPP.........",
      ".......kkkkkkk....PPPPPP........",
      "..................PPPPPP........",
      ".................KKKKKKKK.......",
      ".................kkkkkkkk.......",
    ],
  };

  /* ---------- tiles (16 x 16) ---------- */
  const BRICK_ROWS = [
    "cccccccbcccccccb",
    "aaaaaaabaaaaaaab",
    "aaaaaaabaaaaaaab",
    "bbbbbbbbbbbbbbbb",
    "cccbcccccccbcccc",
    "aaabaaaaaaabaaaa",
    "aaabaaaaaaabaaaa",
    "bbbbbbbbbbbbbbbb",
  ];
  const DIRT = BRICK_ROWS.concat(BRICK_ROWS);
  const GRASS = ["gggggggggggggggg", "ghgggghggghggggh", "hhhhhhhhhhhhhhhh"].concat(DIRT.slice(3));
  const GROUND_PAL = { a: "#C2532F", b: "#6B2414", c: "#E07A50", g: "#3FA34D", h: "#2E7D3A" };
  const STONE_PAL = { a: "#8A8FA8", b: "#4A4E66", c: "#B4B8CC" };

  function block(glyph, pal) {
    const rows = ["o".repeat(16), "o" + "w".repeat(14) + "o"];
    for (let i = 0; i < 3; i++) rows.push("ow" + "y".repeat(13) + "o");
    glyph.forEach((g) => rows.push("ow" + g.replace(/\./g, "y") + "y" + "o"));
    for (let i = 0; i < 5; i++) rows.push("ow" + "y".repeat(13) + "o");
    rows.push("o".repeat(16));
    return make(rows, pal);
  }
  const GLYPH_CODE = ["...k...k.k..", "..k....k..k.", ".k....k....k", "..k..k....k.", "...k.k...k.."];
  const GLYPH_K = ["....k..k....", "....k.k.....", "....kk......", "....k.k.....", "....k..k...."];
  const GLYPH_NONE = Array(5).fill("............");

  const COIN = ["..oooo..", ".oyyyyo.", "oywyyyyo", "oywyoyyo", "oywyoyyo", "oywyoyyo", "oywyoyyo", "oyyyyyyo", ".oyyyyo.", "..oooo.."];
  const TROPHY = [
    "..oooooooo..",
    "ooyywyyyyyoo",
    "o.yywyyyyy.o",
    "o.yywyyyyy.o",
    ".oyywyyyyyo.",
    "..oyyyyyyo..",
    "...oyyyyo...",
    "....oyyo....",
    ".....yy.....",
    ".....yy.....",
    "...oooooo...",
    "...oyyyyo...",
    "..oooooooo..",
  ];
  const GOLD = { o: "#8A5F17", y: "#F2C14E", w: "#FFF4D1", k: "#161A33" };

  /* ---------- the bug enemy (16 x 12) ---------- */
  const BUG_TOP = [
    "....kk....kk....",
    ".....k....k.....",
    "....nnnnnnnn....",
    "...nmmmmmmmmn...",
    "..nmmWkmmWkmmn..",
    "..nmmWWmmWWmmn..",
    ".nmmmmmnnmmmmmn.",
    ".nmmmmmnnmmmmmn.",
    "..nmmmmnnmmmmn..",
    "...nnnnnnnnnn...",
  ];
  const BUG_PAL = { k: "#161A33", n: "#7A1E10", m: "#D8452B", W: "#FFFDF6" };
  const BUG1 = BUG_TOP.concat(["..k..k....k..k..", ".k..k......k..k."]);
  const BUG2 = BUG_TOP.concat(["...k..k..k..k...", "...k..k..k..k..."]);
  const BUG_FLAT = ["..nnnnnnnnnnnn..", ".nmmWkmmmmWkmmn.", ".nmmmmmmmmmmmmn.", "kk.k........k.kk"];

  function terminal(screen, glow) {
    const c = document.createElement("canvas");
    c.width = 32;
    c.height = 32;
    const x = c.getContext("2d");
    x.fillStyle = "#2B2F4A";
    x.fillRect(13, 24, 6, 5);
    x.fillRect(8, 29, 16, 3);
    x.fillStyle = "#14172A";
    x.fillRect(1, 1, 30, 23);
    x.fillStyle = "#3A3F66";
    x.fillRect(2, 2, 28, 21);
    x.fillStyle = screen;
    x.fillRect(4, 4, 24, 16);
    x.fillStyle = glow;
    [[6, 6, 9], [6, 9, 15], [8, 12, 11], [8, 15, 6]].forEach(([a, b, w]) => x.fillRect(a, b, w, 1));
    x.fillStyle = "rgba(0,0,0,0.22)";
    for (let y = 5; y < 20; y += 2) x.fillRect(4, y, 24, 1);
    x.fillStyle = "#7CE38B";
    x.fillRect(26, 21, 2, 1);
    return c;
  }

  let cache = null;
  function build() {
    if (cache) return cache;
    const frame = (legs) => make(AVATAR_TOP.concat(legs), AVATAR_PALETTE);
    cache = {
      player: {
        idle: frame(AVATAR_LEGS.idle),
        run1: frame(AVATAR_LEGS.run1),
        run2: frame(AVATAR_LEGS.run2),
        jump: frame(AVATAR_LEGS.jump),
      },
      grass: make(GRASS, GROUND_PAL),
      dirt: make(DIRT, GROUND_PAL),
      stone: make(DIRT, STONE_PAL),
      block: block(GLYPH_CODE, { o: "#8A5F17", w: "#FFF4D1", y: "#F2C14E", k: "#161A33" }),
      kblock: block(GLYPH_K, { o: "#3B2799", w: "#E4DDFF", y: "#8C6DFF", k: "#FFFDF6" }),
      used: block(GLYPH_NONE, { o: "#4A3216", w: "#9C7A4A", y: "#7D5C33" }),
      coin: make(COIN, GOLD),
      trophy: make(TROPHY, GOLD),
      bug1: make(BUG1, BUG_PAL),
      bug2: make(BUG2, BUG_PAL),
      bugFlat: make(BUG_FLAT, BUG_PAL),
      terminal: terminal,
    };
    return cache;
  }

  PK.sprites = {
    get: build,
    /** Draw the idle avatar into a 32x40 canvas element (CSS scales it). */
    drawAvatar(canvas) {
      const img = build().player.idle;
      canvas.width = img.width;
      canvas.height = img.height;
      const x = canvas.getContext("2d");
      x.imageSmoothingEnabled = false;
      x.clearRect(0, 0, img.width, img.height);
      x.drawImage(img, 0, 0);
    },
  };
})();
