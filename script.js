/* ---------- SETTINGS ----------
   SITE_REPO: your GitHub repo for this site, like "TinyBrother4-1/games" (adds an "Open GitHub issue" button
   to the request form). Leave "" to only use Discord. */
const SITE_REPO = "";
const DISCORD = "https://discord.gg/JuyfSvKeHW";

const $ = s => document.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let games = [], lastSeen = 0, fresh = [];
try { lastSeen = +localStorage.getItem("tb4-seen") || 0 } catch (e) {}

function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove("on"), 3000) }
function hue(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h }
function cover(g) { return g.cover ? `style="background-image:url('${esc(g.cover)}')"` : `style="background-image:linear-gradient(135deg,hsl(${hue(g.title)} 55% 38%),hsl(${(hue(g.title) + 50) % 360} 60% 20%))"` }
const initial = g => g.cover ? "" : esc((g.title || "?")[0].toUpperCase());
const card = g => `<article class="card" data-id="${esc(g.id)}"><div class="cov" ${cover(g)}>${initial(g)}</div><div class="info"><b>${esc(g.title)}</b>${g.play ? '<span class="tag">▶ Play</span>' : ""}${g.download ? '<span class="tag">⬇ Download</span>' : ""}<small>${esc(g.genre || "Other")}</small></div></article>`;
const shelf = (t, l) => l.length ? `<section class="shelf"><h2>${esc(t)}</h2><div class="rw"><button class="arr l" aria-label="Scroll left">‹</button><div class="row">${l.map(card).join("")}</div><button class="arr r" aria-label="Scroll right">›</button></div></section>` : "";

function render() {
  const q = $("#q").value.trim().toLowerCase();
  const all = [...games].sort((a, b) => Date.parse(b.added || 0) - Date.parse(a.added || 0));
  const list = q ? all.filter(g => `${g.title} ${g.genre} ${g.desc}`.toLowerCase().includes(q)) : all, f = all[0];
  $("#hero").innerHTML = f
    ? `<div class="hero" data-id="${esc(f.id)}" ${cover(f)}><div><h1>${esc(f.title)}</h1><p>${esc(f.desc || "Latest release")}</p><span class="btn ${f.play ? "b-green" : "b-blue"}">${f.play ? "▶ Play now" : "⬇ View & download"}</span></div></div>`
    : `<div class="hero welcome"><div><span class="ribbon">COMMUNITY GAMES HUB</span><h1>Welcome to TinyBrother4 Games</h1><p>Games will show up here soon. Want yours added? Use “Request a game”.</p></div></div>`;
  let h = shelf("New releases", list.slice(0, 20)) + shelf("Play in your browser", list.filter(g => g.play)) + shelf("Downloads", list.filter(g => g.download));
  for (const gn of [...new Set(list.map(g => g.genre || "Other"))]) h += shelf(gn, list.filter(g => (g.genre || "Other") === gn));
  $("#shelves").innerHTML = h || `<div class="empty">${q ? "No games match your search." : "No games yet."}</div>`;
}

document.addEventListener("click", e => {
  const a = e.target.closest(".arr");
  if (a) { const r = a.parentElement.querySelector(".row"); r.scrollBy({ left: (a.classList.contains("l") ? -1 : 1) * r.clientWidth * .85, behavior: "smooth" }); return }
  const it = e.target.closest("[data-n]"); if (it) { $("#np").hidden = true; return openGame(it.dataset.n) }
  if (!e.target.closest(".bellwrap")) $("#np").hidden = true;
  const c = e.target.closest("[data-id]"); if (c && !e.target.closest(".box")) return openGame(c.dataset.id);
  if (e.target.matches("[data-close]") || e.target.classList.contains("modal")) e.target.closest(".modal").classList.remove("on");
});

function openGame(id) {
  const g = games.find(x => x.id === id); if (!g) return;
  $("#dbox").innerHTML = `<div class="cov" ${cover(g)}>${initial(g)}</div><div class="pad"><h3>${esc(g.title)}</h3><span class="tag">${esc(g.genre || "Other")}</span>${g.author ? `<span class="tag">by ${esc(g.author)}</span>` : ""}<p>${esc(g.desc || "No description.")}</p><div class="safety" style="font-size:13px">⚠ Only download or play games from developers you know and trust. Don’t run anything that looks suspicious.</div><div class="acts">${g.play ? '<button class="btn b-green" id="gp">▶ Play</button>' : ""}${g.download ? `<a class="btn b-blue" href="${esc(g.download)}" download>⬇ Download</a>` : ""}<button class="btn b-grey" data-close>Close</button></div></div>`;
  $("#detail").classList.add("on");
  if ($("#gp")) $("#gp").onclick = () => {
    const f = $("#pf");
    f.setAttribute("sandbox", "allow-scripts allow-pointer-lock allow-forms allow-modals" + (g.sameOrigin ? " allow-same-origin" : ""));
    f.src = g.play; $("#ptitle").textContent = g.title; $("#play").classList.add("on"); $("#detail").classList.remove("on");
  };
}
$("#pclose").onclick = () => { $("#play").classList.remove("on"); $("#pf").src = "about:blank" };
$("#pfs").onclick = () => { const f = $("#pf"); (f.requestFullscreen || f.webkitRequestFullscreen || (() => toast("Fullscreen is not available here"))).call(f) };

/* ---- request a game (no uploads: you review every request) ---- */
$("#req").onclick = () => { $("#rf").reset(); $("#rm").classList.add("on") };
function reqText() { return `Game request\nName: ${$("#r-n").value}\nLink: ${$("#r-l").value}\nFrom: ${$("#r-w").value}\nI confirm I made this game (or have permission to share it) and it is not malware: yes` }
if (SITE_REPO) {
  const b = $("#r-gh"); b.hidden = false;
  b.onclick = () => { if (!$("#rf").reportValidity()) return; open(`https://github.com/${SITE_REPO}/issues/new?title=${encodeURIComponent("Game request: " + $("#r-n").value)}&body=${encodeURIComponent(reqText())}`, "_blank", "noopener") };
}
$("#rf").onsubmit = async e => {
  e.preventDefault();
  try { await navigator.clipboard.writeText(reqText()); toast("Request copied! Paste it in the Discord server.") } catch (x) { prompt("Copy this and send it on Discord:", reqText()) }
  open(DISCORD, "_blank", "noopener"); $("#rm").classList.remove("on");
};

/* ---- notifications: games added since this browser last visited ---- */
const saveSeen = () => { lastSeen = Date.now(); try { localStorage.setItem("tb4-seen", String(lastSeen)) } catch (e) {} };
function setupNotifs() {
  if (lastSeen) fresh = games.filter(g => Date.parse(g.added || 0) > lastSeen);
  else saveSeen();
  const b = $("#badge"); b.hidden = !fresh.length; b.textContent = fresh.length; if (fresh.length) { b.classList.add("pulse"); toast("🎮 " + fresh.length + " new game" + (fresh.length > 1 ? "s" : "") + " since your last visit!") }
  $("#nlist").innerHTML = fresh.length ? fresh.map(g => `<div class="nitem" data-n="${esc(g.id)}"><b>🎮 ${esc(g.title)}</b><small>New game · added ${esc(g.added)}</small></div>`).join("") : '<div class="nnone">No new games since your last visit.</div>';
}
$("#bell").onclick = () => { const p = $("#np"); p.hidden = !p.hidden; if (!p.hidden) { saveSeen(); $("#badge").hidden = true } };
$("#desk").onclick = () => toast("The desktop version is coming soon!");
$("#q").addEventListener("input", render);

fetch("games.json?" + Date.now()).then(r => r.json()).then(d => { games = Array.isArray(d) ? d : [] }).catch(() => toast("Could not load games.json"))
  .finally(() => { render(); setupNotifs() });
