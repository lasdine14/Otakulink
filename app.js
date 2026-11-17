// OtakuLink — base de l’application (design validé, sans fausses données).
// Les comptes (Supabase) sont branchés à l’étape suivante.

const TORII = `<svg class="torii" viewBox="0 0 64 52" fill="none" stroke="#22d3ee" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10c14 4 42 4 56 0"/><path d="M10 20h44"/><path d="M16 10v38M48 10v38"/><path d="M32 12v8"/></svg>`;
const LOGO = `<div class="logo">${TORII}<b>Otaku<span>Link</span></b></div>`;
const PAYS = ["France","Congo","Gabon","Cameroun","Côte d’Ivoire","Sénégal","Belgique","Canada","Autre"];

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
      <a class="foot" href="#accueil">Explorer sans compte</a>
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
      ${field("✉", "text", "Email ou pseudo", "id", 'autocomplete="username"')}
      ${field("🔒", "password", "Mot de passe", "mdp", 'autocomplete="current-password"')}
      <div class="row"><label class="check"><input type="checkbox">Se souvenir de moi</label><a href="#connexion">Mot de passe oublié ?</a></div>
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
    <section class="card profile"><div class="avatar">👤</div><h2>Ton pseudo</h2><p class="sub">Réveur · Passionné · Otaku</p>
      <div class="stats"><div><b>0</b><span>Amis</span></div><div><b>0</b><span>Abonnés</span></div><div><b>0</b><span>Abonnements</span></div></div></section>
    <div class="h2"><span>Mes animes préférés</span></div>${empty("⭐", "Aucun anime pour l’instant", "Tes animes préférés s’afficheront ici.")}` },
  parametres: { title: "Paramètres", tab: "profil", back: "profil", render: () => `
    <p class="group">Mon compte</p><div class="menu">
      <a href="#parametres"><i>👤</i>Modifier mon profil</a><a href="#parametres"><i>🔒</i>Confidentialité et sécurité</a>
      <a href="#parametres"><i>🔔</i>Notifications</a><a href="#parametres"><i>🎨</i>Apparence</a></div>
    <p class="group">Préférences Otaku</p><div class="menu">
      <a href="#parametres"><i>⭐</i>Mes favoris</a><a href="#parametres"><i>🌐</i>Langues</a><a href="#parametres"><i>ℹ</i>À propos d’OtakuLink</a></div>
    <a class="btn" href="#bienvenue" style="line-height:50px;text-align:center">Se déconnecter</a>` }
};

const $ = (id) => document.getElementById(id);
const screen = $("screen");

function show() {
  const key = location.hash.slice(1);
  const r = ROUTES[ROUTES[key] ? key : "bienvenue"];
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
  if (e.target.closest("[data-soc]")) { const n = screen.querySelector(".note"); if (n) n.textContent = "Cette connexion sera activée à l’étape suivante."; }
});
screen.addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.querySelector(".note").textContent = "Les comptes ne sont pas encore actifs : ils seront branchés à l’étape suivante (Supabase).";
});

window.addEventListener("hashchange", show);
show();
