/* Screens (title / game / recruiter), the pop-up modal and the HUD. */
(function () {
  const PK = (window.PK = window.PK || {});
  const $ = (s) => document.querySelector(s);
  const e = (s) => PK.esc(s);

  PK.isTouch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
  if (PK.isTouch) document.body.classList.add("is-touch");

  const screens = { title: $("#title"), game: $("#game"), recruiter: $("#recruiter") };
  const modal = $("#modal"), modalBody = $("#modal-body"), modalKicker = $("#modal-kicker");
  let recruiterRendered = false, gameReady = false, lastFocus = null, onModalClose = null;

  /* ---------- modal ---------- */
  function openModal(kicker, html, after) {
    lastFocus = document.activeElement;
    modalKicker.textContent = kicker;
    modalBody.innerHTML = html;
    modal.hidden = false;
    onModalClose = after || null;
    if (PK.game.running) PK.game.pause(true);
    setTimeout(() => (modalBody.querySelector("[data-autofocus]") || $("#modal-close")).focus(), 0);
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    const after = onModalClose;
    onModalClose = null;
    if (after) after();
    else if (PK.game.running) PK.game.pause(false);
    if (lastFocus && lastFocus.focus && !screens.game.hidden) lastFocus.blur();
  }
  $("#modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (ev) => {
    if (ev.target === modal) closeModal();
    const act = ev.target.closest("[data-action]");
    if (!act) return;
    const a = act.getAttribute("data-action");
    if (a === "continue") closeModal();
    if (a === "replay") {
      onModalClose = () => {
        PK.game.reset();
        PK.game.pause(false);
      };
      closeModal();
    }
  });
  document.addEventListener("keydown", (ev) => {
    if (modal.hidden) return;
    if (ev.key === "Escape") { ev.preventDefault(); closeModal(); }
  });

  const continueBtn = () =>
    `<div class="m-actions"><button class="btn btn-primary btn-sm" data-action="continue" data-autofocus>CONTINUE ▶</button></div>
     <p class="m-hint">${PK.isTouch ? "Tap outside to close" : "ESC to close"}</p>`;

  function projectHTML(p) {
    return `<h2 id="modal-title">${e(p.name)}</h2>
      <p class="m-lede">${e(p.tagline)}</p>
      ${p.bullets.length ? `<ul class="m-list">${p.bullets.map((b) => `<li>${e(b)}</li>`).join("")}</ul>` : ""}
      ${PK.chips(p.stack)}${PK.linkRow(p.links)}${continueBtn()}`;
  }
  function experienceHTML(x) {
    return `<h2 id="modal-title">${e(x.org)}</h2>
      <p class="m-meta">${e(x.role)} · ${e(x.dates)}</p>
      <p class="m-lede">${e(x.summary)}</p>
      <ul class="m-list">${x.bullets.map((b) => `<li>${e(b)}</li>`).join("")}</ul>
      ${PK.chips(x.stack)}${PK.linkRow(x.links)}${continueBtn()}`;
  }
  function finishHTML(s) {
    const P = PK.content.profile;
    return `<h2 id="modal-title">LEVEL CLEAR!</h2>
      <p class="m-lede">Thanks for playing. Here's how to reach me.</p>
      <dl class="m-stats">
        <div><dt>SCORE</dt><dd>${String(s.score).padStart(6, "0")}</dd></div>
        <div><dt>SKILLS</dt><dd>${s.skills}/${s.totalSkills}</dd></div>
        <div><dt>BUGS FIXED</dt><dd>${s.bugs}</dd></div>
        <div><dt>TROPHIES</dt><dd>${s.trophies}/${s.totalTrophies}</dd></div>
      </dl>
      <div class="m-actions">
        <a class="btn btn-primary btn-sm" href="mailto:${e(P.email)}" data-autofocus>EMAIL ME</a>
        <a class="btn btn-secondary btn-sm" href="${e(P.resume)}" target="_blank" rel="noopener">RESUME (PDF)</a>
        <a class="btn btn-secondary btn-sm" href="${e(P.github)}" target="_blank" rel="noopener">GITHUB</a>
        <a class="btn btn-secondary btn-sm" href="${e(P.linkedin)}" target="_blank" rel="noopener">LINKEDIN</a>
      </div>
      <div class="m-actions m-actions-2">
        <button class="btn btn-secondary btn-sm" data-action="replay">PLAY AGAIN</button>
        <a class="btn btn-secondary btn-sm" href="#recruiter">RECRUITER MODE</a>
      </div>`;
  }

  /* ---------- game ---------- */
  const hud = { score: $("#hud-score"), skills: $("#hud-skills"), bugs: $("#hud-bugs"), hint: $("#hud-hint") };
  function setupGame() {
    if (gameReady) return;
    gameReady = true;
    PK.game.init($("#game-canvas"), {
      onStats(s) {
        hud.score.textContent = String(s.score).padStart(6, "0");
        hud.skills.textContent = `${s.skills}/${s.totalSkills}`;
        hud.bugs.textContent = s.bugs;
      },
      onHint(text) {
        hud.hint.hidden = !text;
        if (text) hud.hint.textContent = text;
      },
      onOpen({ kind, id }) {
        const C = PK.content;
        if (kind === "project") {
          const p = C.projects.find((x) => x.id === id);
          if (p) openModal("PROJECT", projectHTML(p));
        } else {
          const x = C.experience.find((y) => y.id === id);
          if (x) openModal(id === "kollide" ? "POWER-UP · EXPERIENCE" : "EXPERIENCE", experienceHTML(x));
        }
      },
      onFinish(s) {
        openModal("WORLD 1-1 COMPLETE", finishHTML(s));
      },
    });

    document.querySelectorAll("#touch [data-key]").forEach((b) => {
      const k = b.getAttribute("data-key");
      const down = (ev) => { ev.preventDefault(); PK.game.press(k, true); b.classList.add("on"); };
      const up = (ev) => { ev.preventDefault(); PK.game.press(k, false); b.classList.remove("on"); };
      b.addEventListener("pointerdown", down);
      ["pointerup", "pointercancel", "pointerleave"].forEach((t) => b.addEventListener(t, up));
      b.addEventListener("contextmenu", (ev) => ev.preventDefault());
    });

    const sound = $("#btn-sound");
    sound.addEventListener("click", () => {
      const on = PK.sfx.toggle();
      sound.textContent = on ? "SOUND: ON" : "SOUND: OFF";
      sound.setAttribute("aria-pressed", String(on));
      sound.blur();
    });
  }

  /* ---------- routing ---------- */
  function show(name) {
    Object.entries(screens).forEach(([k, el]) => (el.hidden = k !== name));
    document.body.dataset.screen = name;
    if (name !== "game" && gameReady) PK.game.stop();
    if (!modal.hidden && name !== "game") { modal.hidden = true; onModalClose = null; }
    if (name === "game") {
      setupGame();
      PK.game.start();
      $("#game-canvas").focus({ preventScroll: true });
    }
    if (name === "recruiter") {
      if (!recruiterRendered) { PK.renderRecruiter(screens.recruiter); recruiterRendered = true; }
      window.scrollTo(0, 0);
      document.title = "Prince Kunal · Portfolio (recruiter mode)";
    } else {
      document.title = "Prince Kunal · AI/ML & Full-Stack Developer";
    }
  }
  function route() {
    const h = location.hash.replace("#", "");
    if (h === "recruiter" || h === "resume") show("recruiter");
    else if (h === "play") show("game");
    else show("title");
  }
  window.addEventListener("hashchange", route);

  /* ---------- title ---------- */
  PK.sprites.drawAvatar($("#title-avatar"));
  $("#btn-start").addEventListener("click", () => (location.hash = "play"));
  document.addEventListener("keydown", (ev) => {
    if (document.body.dataset.screen === "title" && ev.key === "Enter" && document.activeElement === document.body) location.hash = "play";
  });
  $("#title-controls").textContent = PK.isTouch
    ? "On-screen buttons: ◀ ▶ move · A jump · B open"
    : "← → move · SPACE jump · ↓ open";

  route();
})();
