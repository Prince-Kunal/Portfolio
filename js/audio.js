/* Tiny chiptune sound effects made with the Web Audio API. Off by default. */
(function () {
  const PK = (window.PK = window.PK || {});
  let ac = null;
  let on = false;

  function tone(f1, f2, dur, type, when, vol) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(f1, when);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, when + dur);
    g.gain.setValueAtTime(vol || 0.05, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g).connect(ac.destination);
    o.start(when);
    o.stop(when + dur + 0.02);
  }
  const seq = (notes, gap, dur, t) => notes.forEach((f, i) => tone(f, null, dur, "square", t + i * gap));

  PK.sfx = {
    get enabled() {
      return on;
    },
    toggle() {
      on = !on;
      if (on && !ac) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) ac = new Ctx();
      }
      if (ac && ac.state === "suspended") ac.resume();
      return on;
    },
    play(name) {
      if (!on || !ac) return;
      const t = ac.currentTime;
      switch (name) {
        case "jump": tone(330, 660, 0.12, "square", t, 0.04); break;
        case "coin": tone(988, null, 0.06, "square", t); tone(1319, null, 0.16, "square", t + 0.06); break;
        case "bump": tone(150, 90, 0.08, "square", t, 0.05); break;
        case "stomp": tone(420, 120, 0.12, "triangle", t, 0.09); break;
        case "hurt": tone(240, 110, 0.2, "sawtooth", t, 0.04); break;
        case "power": seq([523, 659, 784, 1047], 0.08, 0.1, t); break;
        case "trophy": seq([784, 988, 1175], 0.07, 0.1, t); break;
        case "open": tone(660, 990, 0.08, "square", t, 0.04); break;
        case "clear": seq([523, 659, 784, 1047, 784, 1047], 0.12, 0.14, t); break;
      }
    },
  };
})();
