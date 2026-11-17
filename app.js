// OtakuLink — base de l’application (design validé, sans fausses données).
// Les comptes (Supabase) sont branchés à l’étape suivante.

const TORII = `<svg class="torii" viewBox="0 0 64 52" fill="none" stroke="#22d3ee" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10c14 4 42 4 56 0"/><path d="M10 20h44"/><path d="M16 10v38M48 10v38"/><path d="M32 12v8"/></svg>`;
const LOGO = `<div class="logo">${TORII}<b>Otaku<span>Link</span></b></div>`;
const PAYS = ["France","Congo","Gabon","Cameroun","Côte d’Ivoire","Sénégal","Belgique","Canada","Autre"];

const SB_URL = "https://jnepjuszrppaasdopnlo.supabase.co";
const SB_KEY = "sb_publishable_aST32y-TGzIttH9RAnm64w_dv3d_Wdc";
const sb = window.supabase ? window.supabase.createClient(SB_URL, SB_KEY) : null;
let me = null, session = null;
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function erreur(e, ins) {
  const m = (e.message || "").toLowerCase();
  if (m.includes("database error")) return "Ce pseudo est déjà pris. Essaie-en un autre.";
  if (m.includes("already registered")) return "Cet email a déjà un compte.";
  if (m.includes("invalid login")) return "Email ou mot de passe incorrect.";
  if (m.includes("not confirmed")) return "Confirme d’abord ton email (regarde ta boîte mail).";
  if (m.includes("rate limit")) return "Trop d’essais. Réessaie dans quelques minutes.";
  return ins ? "Inscription impossible pour le moment." : "Connexion impossible pour le moment.";
}

const empty = (i, t, p) => `<section class="card empty"><div class="big">${i}</div><h2>${t}</h2><p>${p}</p></section>`;
const chips = (l) => `<div class="chips">${l.map((c, i) => `<button${i ? "" : ' class="on"'}>${c}</button>`).join("")}</div>`;
const field = (icon, type, ph, name, extra = "") =>
  `<label class="field"><span>${icon}</span><input type="${type}" name="${name}" placeholder="${ph}" required ${extra}>${type === "password" ? '<button type="button" class="eye" aria-label="Afficher le mot de passe">👁</button>' : ""}</label>`;
const socials = `<div class="socials"><button type="button" data-soc>G</button><button type="button" data-soc>Discord</button><button type="button" data-soc>Apple</button></div>`;

const ROUTES = {
  bienvenue: { auth: true, render: () => `
    <div class="auth-wrap">${LOGO}
      <p class="tag">Find your people.<br>Share your <span>universe.</span></p>
      <a class="btn" href="#inscription" style="line-height:50px">Commencer</a>
      <a class="btn dark" href="#connexion" style="line-height:50px">Se connecter</a>
      <p class="foot">Passion Anime · Amitié · Communauté</p>
    </div>` },

  inscription: { auth: true, render: () => `
    <form class="auth-wrap" id="form-auth">${LOGO}
      <p class="sub">Rejoins la communauté des Otakus !</p>
      ${field("👤", "text", "Pseudo", "pseudo", 'autocomplete="username" minlength="3"')}
      ${field("✉", "email", "Email", "email", 'autocomplete="email"')}
      ${field("🔒", "password", "Mot de passe", "mdp", 'autocomplete="new-password" minlength="8"')}
      <label class="field"><span>🌐</span><select name="pays" required><option value="">Pays</option>${PAYS.map((p) => `<option>${p}</option>`).join("")}</select></label>
      <label class="check"><input type="checkbox" required><span>J’accepte les Conditions d’utilisation et la Politique de confidentialité</span></label>
      <button class="btn" type="submit">Créer mon compte</button>
      <p class="note" role="status"></p>
      <div class="sep">ou</div>${socials}
      <p class="foot">Déjà un compte ? <a href="#connexion">Se connecter</a></p>
    </form>` },

  connexion: { auth: true, render: () => `
    <form class="auth-wrap" id="form-auth">${LOGO}
      <p><b>Bon retour !</b> 👋<br><span class="sub">Connecte-toi à ton univers</span></p>
      ${field("✉", "email", "Email", "email", 'autocomplete="email"')}
      ${field("🔒", "password", "Mot de passe", "mdp", 'autocomplete="current-password"')}
      <div class="row" style="justify-content:flex-end"><a href="#connexion" data-forgot>Mot de passe oublié ?</a></div>
      <button class="btn" type="submit">Se connecter</button>
      <p class="note" role="status"></p>
      <div class="sep">ou</div>${socials}
      <p class="foot">Pas encore de compte ? <a href="#inscription">Inscription</a></p>
    </form>` },

  accueil: { title: "Accueil", render: () => `
    <div class="card composer"><div class="avatar">👤</div><span class="fake">Quoi de neuf, Otaku ?</span><button class="btn" disabled>Publier</button></div>
    ${empty("⛩", "Le fil est vide", "Les publications des otakus que tu suis apparaîtront ici.")}` },
  decouvrir: { title: "Découvrir", tab: "decouvrir", render: () => empty("🧭", "Personne à découvrir pour l’instant", "Les profils de fans d’anime s’afficheront ici, avec leurs centres d’intérêt.") },
  communaute: { title: "Communauté", tab: "communaute", render: () => chips(["Tous", "Animes", "Mangas", "Débats", "Clubs"]) + empty("👥", "Aucune publication", "Les discussions de la communauté arriveront ici.") },
  messages: { title: "Messages", tab: "messages", render: () => chips(["Toutes", "Privées", "Groupes"]) + empty("💬", "Aucune conversation", "Tes messages privés et tes groupes apparaîtront ici.") },
  connexions: { title: "Connexions", tab: "connexions", render: () => chips(["Amis", "Invitations", "Suggestions"]) + empty("🤝", "Aucune connexion", "Tes amis, tes invitations et les suggestions seront listés ici.") },
  profil: { title: "Profil", tab: "profil", action: "parametres", render: () => `
    <section class="card profile"><div class="avatar">${me?.avatar_url ? `<img src="${esc(me.avatar_url)}" alt="">` : "👤"}</div><h2>${esc(me?.pseudo || "…")}</h2><p class="sub">${esc(me?.bio || "Rêveur · Passionné · Otaku")}${me?.pays ? " · " + esc(me.pays) : ""}</p>
      <div class="stats"><div><b>0</b><span>Amis</span></div><div><b>0</b><span>Abonnés</span></div><div><b>0</b><span>Abonnements</span></div></div></section>
    <div class="h2"><span>Mes animes préférés</span></div>${me?.animes?.length ? `<div class="chips tags">${me.animes.map((a) => `<span>${esc(a)}</span>`).join("")}</div>` : empty("⭐", "Aucun anime pour l’instant", "Ajoute tes animes préférés dans Paramètres, puis Modifier mon profil.")}` },
  editprofil: { title: "Mon profil", tab: "profil", back: "parametres", render: () => `
    <form id="form-profil" class="auth-wrap" style="justify-content:flex-start;text-align:left">
      <label class="field"><span>📷</span><input type="file" name="photo" accept="image/*" style="padding-top:12px"></label>
      <label class="field"><span>✍</span><input type="text" name="bio" maxlength="160" placeholder="Ta bio" value="${esc(me?.bio)}"></label>
      <label class="field"><span>🌐</span><select name="pays">${PAYS.map((p) => `<option${p === me?.pays ? " selected" : ""}>${p}</option>`).join("")}</select></label>
      <label class="field"><span>⭐</span><input type="text" name="animes" placeholder="Animes préférés (séparés par des virgules)" value="${esc((me?.animes || []).join(", "))}"></label>
      <button class="btn" type="submit">Enregistrer</button><p class="note" role="status"></p>
    </form>` },
  parametres: { title: "Paramètres", tab: "profil", back: "profil", render: () => `
    <p class="group">Mon compte</p><div class="menu">
      <a href="#editprofil"><i>👤</i>Modifier mon profil</a><a href="#parametres"><i>🔒</i>Confidentialité et sécurité</a>
      <a href="#parametres"><i>🔔</i>Notifications</a><a href="#parametres"><i>🎨</i>Apparence</a></div>
    <p class="group">Préférences Otaku</p><div class="menu">
      <a href="#parametres"><i>⭐</i>Mes favoris</a><a href="#parametres"><i>🌐</i>Langues</a><a href="#parametres"><i>ℹ</i>À propos d’OtakuLink</a></div>
    <button class="btn" data-logout>Se déconnecter</button>` }
};

const $ = (id) => document.getElementById(id);
const screen = $("screen");

function show() {
  let key = location.hash.slice(1);
  if (!ROUTES[key]) key = session ? "accueil" : "bienvenue";
  if (!session && !ROUTES[key].auth) key = "bienvenue";
  if (session && ROUTES[key].auth) key = "accueil";
  if (location.hash.slice(1) !== key) { location.replace("#" + key); return; }
  const r = ROUTES[key];
  document.body.classList.toggle("auth", !!r.auth);
  screen.innerHTML = r.render();
  screen.scrollTop = 0;
  $("title").textContent = r.title || "";
  $("back").hidden = !r.back;
  $("logo-mini").hidden = !!r.back;
  $("act").hidden = !r.action;
  $("back").onclick = () => (location.hash = r.back);
  $("act").onclick = () => (location.hash = r.action);
  document.querySelectorAll("#tabs a").forEach((a) => {
    const on = a.dataset.tab === (r.tab || (key === "accueil" ? "accueil" : ""));
    a.classList.toggle("on", on);
    on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
  });
}

screen.addEventListener("click", (e) => {
  const chip = e.target.closest(".chips button");
  if (chip) { chip.parentNode.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b === chip)); return; }
  const eye = e.target.closest(".eye");
  if (eye) { const i = eye.previousElementSibling; i.type = i.type === "password" ? "text" : "password"; return; }
  if (e.target.closest("[data-logout]")) { sb.auth.signOut(); return; }
  const forgot = e.target.closest("[data-forgot]");
  if (forgot) {
    e.preventDefault();
    const n = screen.querySelector(".note"), mail = screen.querySelector("[name=email]").value.trim();
    if (!mail) { n.textContent = "Écris ton email ci-dessus, puis touche « Mot de passe oublié ? »."; return; }
    sb.auth.resetPasswordForEmail(mail).then(({ error }) => { n.textContent = error ? "Impossible d’envoyer l’email pour le moment." : "Email envoyé : vérifie ta boîte de réception."; });
    return;
  }
  if (e.target.closest("[data-soc]")) { const n = screen.querySelector(".note"); if (n) n.textContent = "Cette connexion sera activée à l’étape suivante."; }
});
screen.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target, n = f.querySelector(".note"), btn = f.querySelector("button[type=submit]");
  if (f.id === "form-profil") return saveProfil(f, n, btn);
  if (!sb) { n.textContent = "Connexion au serveur impossible (pas d’internet ?)."; return; }
  const v = Object.fromEntries(new FormData(f));
  const ins = location.hash === "#inscription";
  btn.disabled = true; n.textContent = "Un instant…";
  const { data, error } = ins
    ? await sb.auth.signUp({ email: v.email, password: v.mdp, options: { data: { pseudo: v.pseudo.trim(), pays: v.pays } } })
    : await sb.auth.signInWithPassword({ email: v.email, password: v.mdp });
  btn.disabled = false;
  if (error) { n.textContent = erreur(error, ins); return; }
  if (ins && !data.session) n.textContent = "Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.";
});

async function saveProfil(f, n, btn) {
  const maj = {
    bio: f.bio.value.trim().slice(0, 160),
    pays: f.pays.value,
    animes: f.animes.value.split(",").map((a) => a.trim()).filter(Boolean).slice(0, 8)
  };
  const file = f.photo.files[0];
  btn.disabled = true; n.textContent = "Enregistrement…";
  if (file) {
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) { n.textContent = "Photo : une image de 2 Mo maximum."; btn.disabled = false; return; }
    const ext = (file.type.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "");
    const path = `${session.user.id}/avatar-${Date.now()}.${ext}`;
    const up = await sb.storage.from("avatars").upload(path, file, { contentType: file.type });
    if (up.error) { n.textContent = "Envoi de la photo impossible."; btn.disabled = false; return; }
    maj.avatar_url = sb.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  }
  const { error } = await sb.from("profiles").update(maj).eq("id", session.user.id);
  btn.disabled = false;
  if (error) { n.textContent = "Enregistrement impossible pour le moment."; return; }
  await loadMe();
  location.hash = "#profil";
}

async function loadMe() {
  me = null;
  if (!session) return;
  const { data } = await sb.from("profiles").select("pseudo,pays,bio,avatar_url,animes").eq("id", session.user.id).maybeSingle();
  me = data;
}

window.addEventListener("hashchange", show);
if (sb) {
  sb.auth.onAuthStateChange(async (evt, s) => {
    const had = !!session;
    session = s;
    await loadMe();
    if (evt === "SIGNED_IN" && !had) location.hash = "#accueil";
    else if (evt === "SIGNED_OUT") location.hash = "#bienvenue";
    show();
  });
} else show();
