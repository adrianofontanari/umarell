// @ts-check
const vscode = require('vscode');

/**
 * Webcam presets. User can override URLs in settings or add new ones
 * via `umarell.customCameras`.
 *
 * Webcam preset. L'utente può rimpiazzare gli URL nelle settings
 * o aggiungerne altri con `umarell.customCameras`.
 */
// Real Italian construction site photos from Wikimedia Commons.
// Using Special:FilePath which redirects to the hotlinkable file URL and
// is the most stable form of Commons hotlink.
//
// Foto reali di cantieri italiani da Wikimedia Commons.
const WM = (file) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=800`;

const PRESET_CAMERAS = [
  {
    id: 'val-trompia',
    name: '🛣️  Cantiere autostrada Val Trompia (Lombardia)',
    url: WM('Cantiere_autostrada_della_Val_Trompia.png')
  },
  {
    id: 'ferrara-ghiara',
    name: '🏛️  Restauro Ghiara — Ferrara',
    url: WM('Cantiere_restauro,_prospettiva_della_Ghiara,_Ferrara.jpg')
  },
  {
    id: 'a22-brennero',
    name: '🚧 Costruzione A22 Brennero',
    url: WM('Costruzione_A22.JPG')
  },
  {
    id: 'gra-cassia',
    name: '🛤️  Lavori GRA / Cassia — Roma',
    url: WM('Gra_lavori_cassia.jpg')
  },
  {
    id: 'bologna-marconi',
    name: '🚆 Marconi Express — Bologna',
    url: WM('Marconi_Express_construction_Bologna.jpg')
  },
  {
    id: 'bolzano-waltherpark',
    name: '🏗️  Waltherpark — Bolzano',
    url: WM('Waltherpark_Baustelle_April_2023_1.jpg')
  }
];

// Default GIF shown in the evening window (configurable via settings).
// GIF di default mostrata nella fascia serale (configurabile).
const DEFAULT_EVENING_GIF =
  'https://media.tenor.com/npA1RjkXlTwAAAAM/bauarbeiter-mvg.gif';

/**
 * Comments paired EN / IT. Same vibe: an Italian retired old man
 * watching a construction site, mildly judgmental, mostly harmless.
 *
 * Commenti accoppiati EN / IT. Stesso tono: vecchietto italiano in pensione
 * che guarda il cantiere, vagamente critico, mai cattivo.
 */
const COMMENTS = [
  { en: "Not enough mortar in there…",          it: "Eh ma la malta è poca…" },
  { en: "Look at that, all crooked.",           it: "Mo guarda lì, l'è tutto storto." },
  { en: "Back in my day, we really worked.",    it: "Ai miei tempi sì che si lavorava." },
  { en: "Three workers and one shovel, classic.",it: "Tre operai per una pala, manco a dirlo." },
  { en: "That pillar won't hold, trust me.",     it: "Quel pilastro non sta in piedi, fidati." },
  { en: "They should add more rebar.",           it: "Bisognerebbe metterci più ferro." },
  { en: "Coffee break already? When do they work?", it: "Pausa caffè già? Ma quando lavorano?" },
  { en: "Where's the site manager?",             it: "Il direttore di cantiere dov'è finito?" },
  { en: "That level isn't true.",                it: "Quella livella non è in bolla." },
  { en: "The crane is swaying too much.",        it: "La gru oscilla troppo, te lo dico io." },
  { en: "How are they pulling it up like that?", it: "Mo come fanno a tirarla su così?" },
  { en: "The sand is wet, it won't hold.",       it: "Eh, la sabbia è bagnata, non tiene." },
  { en: "That mixer sounds odd.",                it: "Quella betoniera fa rumore strano." },
  { en: "Should've called my cousin.",           it: "Bisognava chiamare mio cuggino." },
  { en: "Twenty years ago, half the crew did it.",it: "Vent'anni fa con metà degli operai." },
  { en: "That concrete looks like watercolor.",  it: "Quel cemento sembra acquerellato." },
  { en: "It all needs redoing, trust me.",       it: "L'è tutto da rifare, fidati." },
  { en: "What a mess those pipes are.",          it: "Mo guarda che casino quei tubi." },
  { en: "That scaffolding is wobbling.",         it: "Eh, l'impalcatura traballa." },
  { en: "That curve doesn't convince me.",       it: "Quella curva non mi convince." },
  { en: "Three days and nothing has changed.",   it: "Tre giorni e non è cambiato niente." },
  { en: "The foreman is asleep standing up.",    it: "Il caposquadra dorme in piedi." },
  { en: "Wasn't that wall straight yesterday?",  it: "Ma quel muro non era diritto ieri?" },
  { en: "Clearly their first day on the job.",   it: "Si vede che è il loro primo giorno." }
];

const STRINGS = {
  en: {
    pickHint: "Pick which site to watch",
    pickedToast: (n) => `👴 Umarell: now watching ${n}`,
    welcomeMsg: "👴 The Umarell has arrived. Want to pick a construction site?",
    welcomePick: "Pick site",
    welcomeLater: "Later",
    addNamePrompt: "Construction site name (e.g. \"The site near my house\")",
    addNamePlaceholder: "Construction site…",
    addUrlPrompt: "Webcam snapshot URL (direct JPEG/PNG). Use {ts} for cache-busting.",
    addUrlPlaceholder: "https://example.com/cam/snapshot.jpg?t={ts}",
    addUrlError: "Must start with http(s)://",
    addedToast: (n) => `Umarell: added "${n}" and selected it.`,
    cantiereDown: "Site is quiet. The old man went for a coffee.",
    footer: "watching the site while you code",
    btnChange: "📷 change",
    changeTitle: "Change site"
  },
  it: {
    pickHint: "Scegli quale cantiere guardare",
    pickedToast: (n) => `👴 Umarell: ora guardo ${n}`,
    welcomeMsg: "👴 L'umarell è arrivato. Vuoi scegliere un cantiere?",
    welcomePick: "Scegli cantiere",
    welcomeLater: "Più tardi",
    addNamePrompt: "Nome del cantiere (es: \"Cantiere sotto casa\")",
    addNamePlaceholder: "Cantiere di…",
    addUrlPrompt: "URL snapshot della webcam (JPEG/PNG diretto). Usa {ts} per cache-busting.",
    addUrlPlaceholder: "https://esempio.it/cam/snapshot.jpg?t={ts}",
    addUrlError: "Deve iniziare con http(s)://",
    addedToast: (n) => `Umarell: aggiunto "${n}" e selezionato.`,
    cantiereDown: "Cantiere fermo. L'umarell è andato a prendere il caffè.",
    footer: "guarda il cantiere mentre programmi",
    btnChange: "📷 cambia",
    changeTitle: "Cambia cantiere"
  }
};

function detectLocale() {
  const lang = (vscode.env.language || 'en').toLowerCase();
  return lang.startsWith('it') ? 'it' : 'en';
}

function getStrings() {
  return STRINGS[detectLocale()];
}

class UmarellViewProvider {
  /** @param {vscode.ExtensionContext} context */
  constructor(context) {
    this.context = context;
    /** @type {vscode.WebviewView | undefined} */
    this.view = undefined;
  }

  /** @param {vscode.WebviewView} webviewView */
  resolveWebviewView(webviewView) {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };

    webviewView.webview.html = this._getHtml();
    this._postState();

    webviewView.webview.onDidReceiveMessage((msg) => {
      switch (msg.type) {
        case 'pickCamera':
          vscode.commands.executeCommand('umarell.pickCamera');
          break;
        case 'refresh':
          this._postState();
          break;
      }
    });

    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('umarell')) this._postState();
    });
  }

  _resolveCommentLang() {
    const cfg = vscode.workspace.getConfiguration('umarell');
    const setting = cfg.get('commentLanguage', 'auto');
    if (setting === 'auto') return detectLocale();
    return setting; // 'en' | 'it' | 'both'
  }

  _buildCommentsForView() {
    const lang = this._resolveCommentLang();
    return COMMENTS.map(c => {
      if (lang === 'both') return `${c.en} / ${c.it}`;
      return c[lang] || c.en;
    });
  }

  _postState() {
    if (!this.view) return;
    const cfg = vscode.workspace.getConfiguration('umarell');
    const cameras = getAllCameras();
    const selectedId = cfg.get('selectedCamera', 'val-trompia');
    const camera = cameras.find(c => c.id === selectedId) || cameras[0];
    const s = getStrings();
    this.view.webview.postMessage({
      type: 'state',
      camera,
      refreshIntervalMs: cfg.get('refreshIntervalSeconds', 30) * 1000,
      commentIntervalMs: cfg.get('commentIntervalSeconds', 25) * 1000,
      showComments: cfg.get('showComments', true),
      comments: this._buildCommentsForView(),
      strings: s,
      eveningStart: cfg.get('eveningHourStart', 19),
      eveningEnd: cfg.get('eveningHourEnd', 6),
      eveningGifUrl: cfg.get('eveningGifUrl', DEFAULT_EVENING_GIF),
      eveningEnabled: cfg.get('eveningModeEnabled', true)
    });
  }

  refresh() {
    if (this.view) this.view.webview.postMessage({ type: 'forceRefresh' });
  }

  _getHtml() {
    const nonce = getNonce();
    const csp = `default-src 'none'; img-src https: http: data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';`;
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="${csp}" />
<style>
  :root {
    --bg: var(--vscode-sideBar-background);
    --fg: var(--vscode-foreground);
    --accent: #ffb347;
    --frame: #3a2f1a;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 10px 8px;
    font-family: var(--vscode-font-family);
    color: var(--fg);
    background: var(--bg);
    overflow-x: hidden;
  }
  .header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 8px; font-size: 11px; opacity: 0.85;
  }
  .header .name { font-weight: 600; }
  .header button {
    background: transparent; border: 1px solid var(--vscode-button-border, transparent);
    color: var(--fg); cursor: pointer; padding: 2px 6px; border-radius: 3px;
    font-size: 11px;
  }
  .header button:hover { background: var(--vscode-toolbar-hoverBackground); }
  .frame {
    position: relative;
    border: 4px solid var(--frame);
    border-radius: 6px;
    background: #111;
    aspect-ratio: 16/9;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }
  .frame img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transition: opacity 0.3s;
  }
  .frame img.loading { opacity: 0.5; }
  .frame .badge {
    position: absolute; top: 6px; left: 6px;
    background: rgba(0,0,0,0.65); color: #fff;
    font-size: 9px; padding: 2px 6px; border-radius: 3px;
    display: flex; gap: 4px; align-items: center;
    font-family: ui-monospace, monospace;
  }
  .frame .badge .dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #ff3b30; animation: pulse 1.6s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
  .scene {
    position: relative;
    margin-top: 14px;
    height: 110px;
    display: flex; align-items: flex-end; justify-content: center;
  }
  .ground {
    position: absolute; bottom: 0; left: -10%; right: -10%;
    height: 4px; background: repeating-linear-gradient(
      90deg, #555 0 8px, transparent 8px 14px
    );
  }
  .umarell {
    position: relative;
    width: 60px; height: 80px;
    animation: sway 4s ease-in-out infinite;
    transform-origin: bottom center;
  }
  @keyframes sway {
    0%, 100% { transform: rotate(-1.5deg); }
    50% { transform: rotate(1.5deg); }
  }
  .bubble {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translate(-50%, -8px);
    background: #fff8e1;
    color: #2a1a05;
    border: 2px solid var(--frame);
    border-radius: 10px;
    padding: 6px 9px;
    font-size: 11px;
    line-height: 1.3;
    max-width: 260px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease, transform 0.25s ease;
    font-family: Georgia, serif;
    font-style: italic;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    text-align: center;
    white-space: normal;
  }
  .bubble.show {
    opacity: 1;
    transform: translate(-50%, -14px);
  }
  .bubble::after {
    content: '';
    position: absolute;
    bottom: -8px; left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: #fff8e1;
  }
  .footer {
    margin-top: 10px;
    font-size: 10px;
    opacity: 0.55;
    text-align: center;
    font-style: italic;
  }
  .error {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    color: #ffb347; font-size: 11px; padding: 10px; text-align: center;
    background: rgba(0,0,0,0.55);
  }
  .hidden { display: none; }
</style>
</head>
<body>
  <div class="header">
    <span class="name" id="camName">—</span>
    <button id="pickBtn" title="">📷</button>
  </div>

  <div class="frame">
    <div class="badge"><span class="dot"></span><span>LIVE</span></div>
    <img id="cam" alt="construction site webcam" />
    <div class="error hidden" id="err"></div>
  </div>

  <div class="scene">
    <div class="ground"></div>
    <div class="umarell">
      <div class="bubble" id="bubble"></div>
      <svg viewBox="0 0 60 80" width="60" height="80" xmlns="http://www.w3.org/2000/svg">
        <rect x="22" y="55" width="7" height="22" fill="#3a4a6a"/>
        <rect x="31" y="55" width="7" height="22" fill="#3a4a6a"/>
        <rect x="20" y="75" width="10" height="4" fill="#2a1a05"/>
        <rect x="30" y="75" width="10" height="4" fill="#2a1a05"/>
        <rect x="20" y="38" width="20" height="20" rx="2" fill="#7a6a4a"/>
        <rect x="17" y="48" width="4" height="6" rx="1" fill="#e0b48a"/>
        <rect x="39" y="48" width="4" height="6" rx="1" fill="#e0b48a"/>
        <rect x="27" y="34" width="6" height="5" fill="#e0b48a"/>
        <circle cx="30" cy="28" r="9" fill="#e0b48a"/>
        <circle cx="21" cy="28" r="2" fill="#e0b48a"/>
        <circle cx="39" cy="28" r="2" fill="#e0b48a"/>
        <path d="M22 28 Q22 20 30 19 Q38 20 38 28" fill="#dcdcdc"/>
        <ellipse cx="30" cy="18" rx="11" ry="3.5" fill="#6b4a2a"/>
        <path d="M21 18 Q30 10 39 18 Z" fill="#7a5530"/>
        <rect x="20" y="17" width="22" height="2" fill="#4a3018"/>
        <circle cx="27" cy="28" r="1" fill="#222"/>
        <circle cx="33" cy="28" r="1" fill="#222"/>
        <path d="M25 31 Q30 33 35 31" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M27 33 Q30 34 33 33" stroke="#2a1a05" stroke-width="0.8" fill="none"/>
      </svg>
    </div>
  </div>

  <div class="footer" id="footer">—</div>

<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();
  const camEl = document.getElementById('cam');
  const errEl = document.getElementById('err');
  const nameEl = document.getElementById('camName');
  const bubble = document.getElementById('bubble');
  const footerEl = document.getElementById('footer');
  const pickBtn = document.getElementById('pickBtn');
  pickBtn.addEventListener('click', () => vscode.postMessage({ type: 'pickCamera' }));

  let state = null;
  let refreshTimer = null;
  let commentTimer = null;

  function buildUrl(template) {
    return template.replace('{ts}', Date.now().toString());
  }

  function isEveningNow() {
    if (!state || !state.eveningEnabled) return false;
    const h = new Date().getHours();
    const a = state.eveningStart, b = state.eveningEnd;
    return a <= b ? (h >= a && h < b) : (h >= a || h < b);
  }

  function pickUrl() {
    if (isEveningNow() && state.eveningGifUrl) return state.eveningGifUrl;
    return buildUrl(state.camera.url);
  }

  function setBadgeMode(evening) {
    const dot = document.querySelector('.frame .badge .dot');
    const label = document.querySelector('.frame .badge span:last-child');
    if (!dot || !label) return;
    if (evening) {
      dot.style.background = '#8a7cff';
      label.textContent = '🌙 NIGHT';
    } else {
      dot.style.background = '#ff3b30';
      label.textContent = 'LIVE';
    }
  }

  function loadImage() {
    if (!state) return;
    camEl.classList.add('loading');
    errEl.classList.add('hidden');
    const evening = isEveningNow();
    setBadgeMode(evening);
    const url = pickUrl();
    const probe = new Image();
    probe.onload = () => {
      camEl.src = url;
      camEl.classList.remove('loading');
    };
    probe.onerror = () => {
      camEl.classList.remove('loading');
      errEl.textContent = state.strings.cantiereDown;
      errEl.classList.remove('hidden');
    };
    probe.src = url;
  }

  function sayRandom() {
    if (!state || !state.showComments) return;
    const arr = state.comments;
    const msg = arr[Math.floor(Math.random() * arr.length)];
    bubble.textContent = msg;
    bubble.classList.add('show');
    clearTimeout(bubble._hideTimer);
    bubble._hideTimer = setTimeout(() => bubble.classList.remove('show'), 5500);
  }

  function applyState(newState) {
    state = newState;
    nameEl.textContent = state.camera.name;
    footerEl.textContent = state.strings.footer;
    pickBtn.textContent = state.strings.btnChange;
    pickBtn.title = state.strings.changeTitle;
    loadImage();
    if (refreshTimer) clearInterval(refreshTimer);
    if (commentTimer) clearInterval(commentTimer);
    refreshTimer = setInterval(loadImage, state.refreshIntervalMs);
    if (state.showComments) {
      commentTimer = setInterval(sayRandom, state.commentIntervalMs);
      setTimeout(sayRandom, 1500);
    }
  }

  window.addEventListener('message', (e) => {
    const msg = e.data;
    if (msg.type === 'state') applyState(msg);
    else if (msg.type === 'forceRefresh') loadImage();
  });
</script>
</body>
</html>`;
  }
}

function getAllCameras() {
  const cfg = vscode.workspace.getConfiguration('umarell');
  const custom = cfg.get('customCameras', []) || [];
  return [...PRESET_CAMERAS, ...custom];
}

function getNonce() {
  let text = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) text += chars.charAt(Math.floor(Math.random() * chars.length));
  return text;
}

/** @param {vscode.ExtensionContext} context */
function activate(context) {
  const provider = new UmarellViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('umarell.view', provider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('umarell.pickCamera', async () => {
      const s = getStrings();
      const cameras = getAllCameras();
      const picked = await vscode.window.showQuickPick(
        cameras.map(c => ({ label: c.name, description: c.id, detail: c.url, _id: c.id })),
        { placeHolder: s.pickHint, matchOnDetail: true }
      );
      if (!picked) return;
      await vscode.workspace.getConfiguration('umarell').update(
        'selectedCamera', picked._id, vscode.ConfigurationTarget.Global
      );
      vscode.window.setStatusBarMessage(s.pickedToast(picked.label), 3000);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('umarell.refresh', () => provider.refresh())
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('umarell.addCustomCamera', async () => {
      const s = getStrings();
      const name = await vscode.window.showInputBox({
        prompt: s.addNamePrompt,
        placeHolder: s.addNamePlaceholder
      });
      if (!name) return;
      const url = await vscode.window.showInputBox({
        prompt: s.addUrlPrompt,
        placeHolder: s.addUrlPlaceholder,
        validateInput: (v) => v && /^https?:\/\//i.test(v) ? null : s.addUrlError
      });
      if (!url) return;
      const cfg = vscode.workspace.getConfiguration('umarell');
      const existing = cfg.get('customCameras', []) || [];
      const id = 'custom-' + Date.now().toString(36);
      const updated = [...existing, { id, name: '🛠️  ' + name, url }];
      await cfg.update('customCameras', updated, vscode.ConfigurationTarget.Global);
      await cfg.update('selectedCamera', id, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(s.addedToast(name));
    })
  );

  const hasChosen = context.globalState.get('umarell.hasChosen', false);
  if (!hasChosen) {
    setTimeout(() => {
      const s = getStrings();
      vscode.window.showInformationMessage(
        s.welcomeMsg, s.welcomePick, s.welcomeLater
      ).then(choice => {
        if (choice === s.welcomePick) {
          vscode.commands.executeCommand('umarell.pickCamera');
        }
      });
      context.globalState.update('umarell.hasChosen', true);
    }, 1500);
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
