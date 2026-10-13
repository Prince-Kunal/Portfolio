/* RECRUITER MODE — the same content as a plain, fast one-page portfolio. */
(function () {
  const PK = (window.PK = window.PK || {});
  const e = (s) => PK.esc(s);

  const chips = (items) =>
    items && items.length ? `<ul class="chips">${items.map((i) => `<li class="chip">${e(i)}</li>`).join("")}</ul>` : "";

  function linkRow(links) {
    const labels = { demo: "Live demo", repo: "Source code", site: "Visit site" };
    const out = Object.entries(links || {})
      .filter(([, url]) => url)
      .map(([k, url]) => `<a class="text-link" href="${e(url)}" target="_blank" rel="noopener">${labels[k] || k} ↗</a>`);
    return out.length ? `<p class="r-links">${out.join("")}</p>` : "";
  }
  PK.linkRow = linkRow;
  PK.chips = chips;

  PK.renderRecruiter = function (root) {
    const C = PK.content, P = C.profile;
    root.innerHTML = `
<nav class="r-nav" aria-label="Main">
  <a class="r-brand" href="#recruiter"><canvas class="avatar-mini" aria-hidden="true"></canvas><span>PRINCE KUNAL</span></a>
  <div class="r-navlinks">
    <a class="hide-sm" href="#r-experience" data-scroll>Experience</a>
    <a class="hide-sm" href="#r-projects" data-scroll>Projects</a>
    <a class="hide-sm" href="#r-skills" data-scroll>Skills</a>
    <a class="btn btn-primary btn-sm" href="#play">▶ GAME MODE</a>
  </div>
</nav>

<div class="r-wrap">
  <header class="r-hero">
    <div class="r-avatar"><canvas class="avatar-big" role="img" aria-label="Pixel art avatar of ${e(P.name)}"></canvas></div>
    <div>
      <p class="r-status"><span class="dot" aria-hidden="true"></span>${e(P.status.toUpperCase())}</p>
      <h1>${e(P.name)}</h1>
      <p class="r-role">${e(P.role)} · ${e(P.location)}</p>
      <p class="r-tag">${e(P.about)}</p>
      <div class="r-actions">
        <a class="btn btn-primary btn-sm" href="${e(P.resume)}" target="_blank" rel="noopener">RESUME (PDF)</a>
        <a class="btn btn-secondary btn-sm" href="mailto:${e(P.email)}">EMAIL ME</a>
        <a class="btn btn-secondary btn-sm" href="${e(P.github)}" target="_blank" rel="noopener">GITHUB</a>
        <a class="btn btn-secondary btn-sm" href="${e(P.linkedin)}" target="_blank" rel="noopener">LINKEDIN</a>
      </div>
    </div>
  </header>

  <section class="r-sec" id="r-experience" aria-labelledby="h-exp">
    <h2 id="h-exp"><span>1-1</span> EXPERIENCE</h2>
    <div class="r-stack">
      ${C.experience
        .map(
          (x) => `
      <article class="r-card">
        <div class="r-card-head">
          <h3>${e(x.role)} · ${e(x.org)}</h3>
          <p class="r-date">${e(x.dates)}</p>
        </div>
        <p class="r-summary">${e(x.summary)}</p>
        ${x.bullets.length ? `<ul class="r-list">${x.bullets.map((b) => `<li>${e(b)}</li>`).join("")}</ul>` : ""}
        ${chips(x.stack)}
        ${linkRow(x.links)}
      </article>`
        )
        .join("")}
    </div>
  </section>

  <section class="r-sec" id="r-projects" aria-labelledby="h-proj">
    <h2 id="h-proj"><span>1-2</span> PROJECTS</h2>
    <div class="r-grid">
      ${C.projects
        .map(
          (p) => `
      <article class="r-card r-proj">
        <h3>${e(p.name)}</h3>
        <p class="r-summary">${e(p.tagline)}</p>
        ${p.bullets.length ? `<ul class="r-list">${p.bullets.map((b) => `<li>${e(b)}</li>`).join("")}</ul>` : ""}
        ${chips(p.stack)}
        ${linkRow(p.links)}
      </article>`
        )
        .join("")}
    </div>
  </section>

  <section class="r-sec" id="r-skills" aria-labelledby="h-skills">
    <h2 id="h-skills"><span>1-3</span> SKILLS</h2>
    <div class="r-skills">
      ${C.skills.map((g) => `<div><h3 class="r-skill-h">${e(g.group)}</h3>${chips(g.items)}</div>`).join("")}
    </div>
  </section>

  <section class="r-sec r-two" aria-label="Education and achievements">
    <div>
      <h2><span>1-4</span> EDUCATION</h2>
      <ul class="r-edu">
        ${C.education.map((x) => `<li><strong>${e(x.title)}</strong><span>${e(x.place)} · ${e(x.detail)}</span></li>`).join("")}
      </ul>
    </div>
    <div>
      <h2><span>★</span> ACHIEVEMENTS</h2>
      <ul class="r-list">${C.achievements.map((a) => `<li>${e(a)}</li>`).join("")}</ul>
    </div>
  </section>
</div>

<footer class="r-foot" id="r-contact">
  <div class="r-wrap">
    <h2>LET'S TALK</h2>
    <p>I'm looking for internships in AI/ML and full-stack development.</p>
    <div class="r-actions">
      <a class="btn btn-primary btn-sm" href="mailto:${e(P.email)}">${e(P.email)}</a>
      <a class="btn btn-secondary btn-sm" href="${e(P.resume)}" target="_blank" rel="noopener">RESUME (PDF)</a>
    </div>
    <p class="r-fine">Prefer the fun version? <a href="#play">Play the portfolio</a> as a pixel platformer.</p>
  </div>
</footer>`;

    root.querySelectorAll("canvas.avatar-mini, canvas.avatar-big").forEach((c) => PK.sprites.drawAvatar(c));
    root.querySelectorAll("[data-scroll]").forEach((a) =>
      a.addEventListener("click", (ev) => {
        ev.preventDefault();
        const t = document.querySelector(a.getAttribute("href"));
        if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
      })
    );
  };
})();
