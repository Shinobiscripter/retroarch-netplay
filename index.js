/* ============================================
   launcher.js — WebRetro PS5-Style Launcher
   Handles: navigation, core tiles, hero,
            launch modal, iframe loading
   ============================================ */

'use strict';

// ============================================
// CORE DATABASE
// All cores available in webretro v6.5
// ============================================
const CORES = [
  // Nintendo DS
  { id: 'melonDS',         name: 'melonDS',          system: 'Nintendo DS',    emoji: '🎮', art: 'art-nds',     category: 'nintendo', featured: true,
    tags: ['Dual Screen','Touchscreen','Wi-Fi Sim'],
    desc: 'Nintendo DS emulation with full dual-screen support, touchscreen, and Wi-Fi simulation' },

  // Game Boy
  { id: 'mgba',            name: 'mGBA',             system: 'GBA / GBC / GB', emoji: '🎯', art: 'art-gba',     category: 'nintendo',
    desc: 'Highly accurate Game Boy Advance, Color, and original Game Boy emulation' },
  { id: 'mgba_gb',         name: 'mGBA (GB)',         system: 'Game Boy',       emoji: '🟢', art: 'art-gb',      category: 'nintendo',
    desc: 'Original Game Boy and Game Boy Color emulation via mGBA' },

  // NES / SNES / N64
  { id: 'nestopia',        name: 'Nestopia UE',       system: 'NES',            emoji: '🕹️', art: 'art-nes',     category: 'nintendo',
    desc: 'Cycle-accurate NES emulator for near-perfect compatibility' },
  { id: 'snes9x',          name: 'Snes9x',            system: 'SNES',           emoji: '🎲', art: 'art-snes',    category: 'nintendo',
    desc: 'Fast and accurate Super Nintendo emulation' },
  { id: 'mupen64plus_next',name: 'Mupen64Plus-Next',  system: 'Nintendo 64',    emoji: '🌟', art: 'art-n64',     category: 'nintendo',
    desc: 'N64 with better graphics rendering (recommended N64 core)' },
  { id: 'parallel_n64',    name: 'ParaLLEl N64',      system: 'Nintendo 64',    emoji: '🔷', art: 'art-n64',     category: 'nintendo',
    desc: 'Alternative N64 core — use if Mupen64Plus-Next crashes' },

  // Sega
  { id: 'genesis_plus_gx', name: 'Genesis Plus GX',  system: 'Sega Genesis/MD',emoji: '🔵', art: 'art-genesis', category: 'sega',
    desc: 'Sega Genesis, Mega Drive, Master System, and Game Gear emulation' },
  { id: 'yabause',         name: 'Yabause',           system: 'Sega Saturn',    emoji: '💿', art: 'art-genesis', category: 'sega',
    desc: 'Sega Saturn emulation' },
  { id: 'neocd',           name: 'NeoCD',             system: 'Neo-Geo CD',     emoji: '📀', art: 'art-other',   category: 'other',
    desc: 'Neo-Geo CD emulation' },

  // PlayStation
  { id: 'mednafen_psx_hw', name: 'Beetle PSX HW',     system: 'PlayStation',    emoji: '🔲', art: 'art-ps1',     category: 'other',
    desc: 'PlayStation 1 emulation with hardware renderer support' },

  // Atari
  { id: 'a5200',           name: 'a5200',             system: 'Atari 5200',     emoji: '🕹️', art: 'art-atari',   category: 'atari',
    desc: 'Atari 5200 emulation' },
  { id: 'prosystem',       name: 'ProSystem',         system: 'Atari 7800',     emoji: '🎮', art: 'art-atari',   category: 'atari',
    desc: 'Atari 7800 emulation' },
  { id: 'stella',          name: 'Stella 2014',       system: 'Atari 2600',     emoji: '📺', art: 'art-atari',   category: 'atari',
    desc: 'Classic Atari 2600 emulation' },
  { id: 'handy',           name: 'Handy',             system: 'Atari Lynx',     emoji: '📱', art: 'art-atari',   category: 'atari',
    desc: 'Atari Lynx handheld emulation' },

  // Other
  { id: 'opera',           name: 'Opera',             system: '3DO',            emoji: '💿', art: 'art-other',   category: 'other',
    desc: 'Panasonic 3DO emulation' },
  { id: 'beetle_vb',       name: 'Beetle VB',         system: 'Virtual Boy',    emoji: '🔴', art: 'art-other',   category: 'other',
    desc: 'Nintendo Virtual Boy emulation' },
  { id: 'beetle_wswan',    name: 'Beetle WonderSwan', system: 'WonderSwan',     emoji: '🟡', art: 'art-other',   category: 'other',
    desc: 'Bandai WonderSwan emulation' },
  { id: 'beetle_ngp',      name: 'Beetle NeoPop',     system: 'Neo-Geo Pocket', emoji: '🟠', art: 'art-other',   category: 'other',
    desc: 'SNK Neo-Geo Pocket emulation' },
  { id: 'freeintv',        name: 'FreeIntv',          system: 'Intellivision',  emoji: '🎯', art: 'art-other',   category: 'other',
    desc: 'Mattel Intellivision emulation' },
  { id: 'freechaf',        name: 'FreeChaF',          system: 'Fairchild Ch. F',emoji: '📼', art: 'art-other',   category: 'other',
    desc: 'Fairchild Channel F emulation — oldest cartridge system' },
  { id: 'gearcoleco',      name: 'Gearcoleco',        system: 'ColecoVision',   emoji: '🎮', art: 'art-other',   category: 'other',
    desc: 'ColecoVision emulation' },
  { id: 'o2em',            name: 'O2EM',              system: 'Odyssey 2',      emoji: '🕹️', art: 'art-other',   category: 'other',
    desc: 'Magnavox Odyssey 2 emulation' },
  { id: 'vecx',            name: 'Vecx',              system: 'Vectrex',        emoji: '📐', art: 'art-other',   category: 'other',
    desc: 'GCE Vectrex emulation' },
  { id: 'virtualjaguar',   name: 'Virtual Jaguar',    system: 'Atari Jaguar',   emoji: '🐆', art: 'art-atari',   category: 'atari',
    desc: 'Atari Jaguar emulation' },
];

// ============================================
// STATE
// ============================================
let currentSection = 'home';
let selectedCore   = null;   // core object being launched
let recentCores    = [];     // array of core IDs
let currentFilter  = 'all';

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadRecents();
  checkIdentity();
  buildHero();
  buildRecentTrack();
  buildAllSystemsTrack();
  buildLibraryGrid();
  populateCoreSelect();
  wireNavigation();
  wireFilterBar();
  wireLibrarySearch();
  wirePartyButtons();
  wireFriendButtons();
  wireFrameControls();
  wireLaunchModal();
  wireRowLinks();
});

// ============================================
// IDENTITY CHECK
// ============================================
function checkIdentity() {
  const identity = window.WRIdentity ? window.WRIdentity.get() : null;
  if (!identity || !identity.username) {
    document.getElementById('identityModal').classList.remove('hidden');
    setupIdentityModal();
  } else {
    applyIdentity(identity);
  }
}

function setupIdentityModal() {
  const input   = document.getElementById('usernameInput');
  const codeEl  = document.getElementById('generatedCode');
  const saveBtn = document.getElementById('saveIdentityBtn');

  // Generate a preview code
  const previewCode = window.WRIdentity ? window.WRIdentity.generateCode() : 'WR-' + Math.random().toString(36).substr(2,4).toUpperCase();
  codeEl.textContent = previewCode;

  saveBtn.addEventListener('click', () => {
    const name = input.value.trim();
    if (!name || name.length < 2) {
      input.style.borderColor = 'var(--red)';
      input.placeholder = 'Min 2 characters';
      return;
    }
    const identity = window.WRIdentity
      ? window.WRIdentity.save(name)
      : { username: name, friendCode: previewCode };
    applyIdentity(identity);
    document.getElementById('identityModal').classList.add('hidden');
    showToast(`Welcome, ${identity.username}! 👋`, 'success');
  });

  input.addEventListener('keydown', e => { if (e.key === 'Enter') saveBtn.click(); });
}

function applyIdentity(identity) {
  document.getElementById('playerNameDisplay').textContent = identity.username;
  document.getElementById('playerCodeDisplay').textContent = '#' + identity.friendCode;
  document.getElementById('playerAvatar').textContent = identity.username.charAt(0).toUpperCase();
  // Friends section code display
  const myCode = document.getElementById('myFriendCode');
  if (myCode) myCode.textContent = identity.friendCode;
}

// ============================================
// HERO BUILD
// ============================================
function buildHero() {
  const featured = CORES.find(c => c.featured) || CORES[0];
  setHero(featured);
  document.getElementById('heroLaunchBtn').addEventListener('click', () => openLaunchModal(featured));
}

function setHero(core) {
  document.getElementById('heroTitle').textContent = core.name;
  document.getElementById('heroDesc').textContent  = core.desc;
  document.getElementById('heroLaunchBtn').onclick = () => openLaunchModal(core);

  const meta = document.getElementById('heroMeta');
  meta.innerHTML = (core.tags || [core.system]).map(t => `<span class="hero-tag">${t}</span>`).join('');

  const heroCard = document.getElementById('heroCard');
  // Update ambient colour per system
  const colourMap = { nintendo: '#e60012', sega: '#1a62b7', atari: '#e8a000', other: '#7b2fff' };
  const col = colourMap[core.category] || '#00a8ff';
  heroCard.querySelector('.hero-bg').style.background =
    `radial-gradient(ellipse at 80% 50%, ${col}22 0%, transparent 60%),
     radial-gradient(ellipse at 20% 80%, rgba(123,47,255,0.1) 0%, transparent 50%)`;
}

// ============================================
// RECENT TRACK
// ============================================
function loadRecents() {
  try { recentCores = JSON.parse(localStorage.getItem('wr_recent_cores') || '[]'); }
  catch { recentCores = []; }
}
function saveRecents() {
  localStorage.setItem('wr_recent_cores', JSON.stringify(recentCores.slice(0, 8)));
}
function addRecent(coreId) {
  recentCores = [coreId, ...recentCores.filter(id => id !== coreId)];
  saveRecents();
}

function buildRecentTrack() {
  const track = document.getElementById('recentTrack');
  const ids   = recentCores.length > 0 ? recentCores : ['melonDS', 'mgba', 'snes9x', 'nestopia'];
  const cores = ids.map(id => CORES.find(c => c.id === id)).filter(Boolean);
  track.innerHTML = '';
  cores.forEach(core => track.appendChild(createCoreCard(core, true)));
}

// ============================================
// ALL SYSTEMS TRACK
// ============================================
function buildAllSystemsTrack() {
  const track = document.getElementById('allSystemsTrack');
  track.innerHTML = '';
  CORES.forEach(core => track.appendChild(createCoreCard(core)));
}

// ============================================
// LIBRARY GRID
// ============================================
function buildLibraryGrid(filter = 'all', search = '') {
  const grid = document.getElementById('libraryGrid');
  grid.innerHTML = '';
  let filtered = CORES;
  if (filter !== 'all')  filtered = filtered.filter(c => c.category === filter);
  if (search.trim())     filtered = filtered.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.system.toLowerCase().includes(search.toLowerCase())
  );
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="padding:32px">No cores found</div>';
    return;
  }
  filtered.forEach(core => grid.appendChild(createCoreCard(core)));
}

// ============================================
// CARD BUILDER
// ============================================
function createCoreCard(core, showRecentBadge = false) {
  const card = document.createElement('div');
  card.className = 'core-card';
  card.dataset.coreId = core.id;

  const isRecent = recentCores.includes(core.id);
  const badgeHTML = isRecent && showRecentBadge
    ? '<span class="card-badge recent">Recent</span>'
    : core.featured ? '<span class="card-badge new">★</span>' : '';

  card.innerHTML = `
    <div class="card-art">
      <div class="card-art-bg ${core.art}"></div>
      <div class="system-icon-wrap">${core.emoji}</div>
      ${badgeHTML}
    </div>
    <div class="card-info">
      <div class="card-core-name">${core.name}</div>
      <div class="card-system-name">${core.system}</div>
    </div>
  `;

  card.addEventListener('click', () => {
    setHero(core);
    openLaunchModal(core);
  });

  return card;
}

// ============================================
// LAUNCH MODAL
// ============================================
function openLaunchModal(core) {
  selectedCore = core;
  document.getElementById('lmTitle').textContent    = core.name;
  document.getElementById('lmSubtitle').textContent = core.system;
  document.getElementById('lmSystemIcon').textContent = core.emoji;
  document.getElementById('launchModal').classList.remove('hidden');
}

function closeLaunchModal() {
  document.getElementById('launchModal').classList.add('hidden');
  selectedCore = null;
}

function wireLaunchModal() {
  document.getElementById('lmCancel').addEventListener('click', closeLaunchModal);
  document.getElementById('launchModal').addEventListener('click', e => {
    if (e.target === document.getElementById('launchModal')) closeLaunchModal();
  });

  document.getElementById('lmSolo').addEventListener('click', () => {
    if (!selectedCore) return;
    closeLaunchModal();
    launchCore(selectedCore);
  });

  document.getElementById('lmNetplay').addEventListener('click', () => {
    if (!selectedCore) return;
    closeLaunchModal();
    launchCore(selectedCore, { netplay: true });
  });

  document.getElementById('lmParty').addEventListener('click', () => {
    if (!selectedCore) return;
    closeLaunchModal();
    switchSection('party');
    // Pre-select core in party dropdown
    const sel = document.getElementById('partyCore');
    if (sel) sel.value = selectedCore.id;
  });
}

// ============================================
// CORE LAUNCH — inline webretro integration
// webretro reads window.WR_LAUNCH_CONFIG and
// mounts into #retroMount on the same page
// ============================================
let _webretroLoaded = false;

function launchCore(core, opts = {}) {
  addRecent(core.id);
  buildRecentTrack();

  // Config object that webretro's assets/base.js will read
  window.WR_LAUNCH_CONFIG = {
    core:       core.id,
    mountEl:    'retroMount',
    netplay:    opts.netplay  || false,
    roomCode:   opts.roomCode || null,
    // Pass the core filename as webretro expects it
    corePath:   'cores/' + core.id + '_libretro.js'
  };

  // Update the player shell header
  document.getElementById('frameCoreLabel').textContent = core.name;
  const meta = document.getElementById('frameMeta');
  if (meta) meta.textContent = core.system;

  // Show player, hide launcher content
  document.getElementById('retroFrameWrap').classList.remove('hidden');
  document.querySelector('.main-content').style.display = 'none';

  // Inject webretro scripts once
  if (!_webretroLoaded) {
    _webretroLoaded = true;
    const script = document.createElement('script');
    script.src = 'assets/base.js';
    script.onerror = () => {
      showToast('Could not load emulator. Check assets/base.js path.', 'error');
      _webretroLoaded = false;
      _showLauncher();
    };
    document.body.appendChild(script);
  } else if (typeof window.WR_Boot === 'function') {
    // webretro already loaded — hot-restart with new core
    window.WR_Boot(window.WR_LAUNCH_CONFIG);
  }

  // Update friend presence
  window.WRFriends?.setMyPresence('Playing ' + core.system);
}

function _showLauncher() {
  document.getElementById('retroFrameWrap').classList.add('hidden');
  document.querySelector('.main-content').style.display = '';
  window.WRFriends?.setMyPresence('In launcher');
}

function wireFrameControls() {
  document.getElementById('frameBackBtn').addEventListener('click', _showLauncher);

  document.getElementById('frameNetplayBtn').addEventListener('click', () => {
    // Netplay overlay will be wired in by netplay/ui.js
    if (window.WRNetplayUI) {
      window.WRNetplayUI.toggle();
    } else {
      showToast('Netplay overlay loading…', 'info');
    }
  });

  document.getElementById('framePartyBtn').addEventListener('click', () => {
    _showLauncher();
    switchSection('party');
  });

  document.getElementById('frameFullscreenBtn')?.addEventListener('click', () => {
    const mount = document.getElementById('retroMount');
    const canvas = mount?.querySelector('canvas');
    const target = canvas || mount;
    if (target?.requestFullscreen) target.requestFullscreen();
    else if (target?.webkitRequestFullscreen) target.webkitRequestFullscreen();
  });
}

// ============================================
// NAVIGATION
// ============================================
function switchSection(name) {
  if (currentSection === name) return;

  // Update tabs
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.section === name);
  });

  // Update sections
  document.querySelectorAll('.section').forEach(s => {
    s.classList.toggle('active', s.id === `section-${name}`);
  });

  currentSection = name;

  // Section-specific refresh
  if (name === 'friends') refreshFriendsList();
  if (name === 'party')   refreshPartyInviteList();
}

function wireNavigation() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => switchSection(tab.dataset.section));
  });
}

function wireRowLinks() {
  document.querySelectorAll('[data-section]').forEach(el => {
    if (!el.classList.contains('nav-tab')) {
      el.addEventListener('click', () => switchSection(el.dataset.section));
    }
  });
  document.getElementById('viewAllBtn')?.addEventListener('click', () => switchSection('library'));
}

// ============================================
// FILTER BAR (library)
// ============================================
function wireFilterBar() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      buildLibraryGrid(currentFilter, document.getElementById('librarySearch').value);
    });
  });
}

function wireLibrarySearch() {
  const inp = document.getElementById('librarySearch');
  let timer;
  inp.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => buildLibraryGrid(currentFilter, inp.value), 200);
  });
}

// ============================================
// POPULATE CORE SELECT (party)
// ============================================
function populateCoreSelect() {
  const sel = document.getElementById('partyCore');
  CORES.forEach(core => {
    const opt = document.createElement('option');
    opt.value = core.id;
    opt.textContent = `${core.name} — ${core.system}`;
    sel.appendChild(opt);
  });
  // Default to melonDS
  sel.value = 'melonDS';
}

// ============================================
// FRIENDS LIST REFRESH
// ============================================
function refreshFriendsList() {
  const friends = window.WRFriends ? window.WRFriends.getAll() : [];
  const online  = friends.filter(f => f.online);
  const pending = friends.filter(f => f.pending);

  // Online friends
  const onlineList = document.getElementById('onlineFriendsList');
  if (online.length === 0) {
    onlineList.innerHTML = '<div class="empty-state">No friends online right now</div>';
  } else {
    onlineList.innerHTML = online.map(f => friendRowHTML(f)).join('');
  }

  // All friends
  const allList = document.getElementById('allFriendsList');
  const nonPending = friends.filter(f => !f.pending);
  if (nonPending.length === 0) {
    allList.innerHTML = '<div class="empty-state">You haven\'t added any friends yet</div>';
  } else {
    allList.innerHTML = nonPending.map(f => friendRowHTML(f)).join('');
  }

  // Pending
  const pendingSection = document.getElementById('pendingSection');
  const pendingList    = document.getElementById('pendingList');
  if (pending.length > 0) {
    pendingSection.style.display = '';
    pendingList.innerHTML = pending.map(f => friendRowHTML(f, true)).join('');
  } else {
    pendingSection.style.display = 'none';
  }

  // Online strip on home
  buildOnlineStrip(online);
}

function friendRowHTML(f, isPending = false) {
  const initial = (f.username || '?').charAt(0).toUpperCase();
  const statusText = f.online ? 'Online' : 'Offline';
  const statusCls  = f.online ? 'online' : '';

  const actions = isPending
    ? `<button class="fr-btn accept" data-accept="${f.friendCode}">Accept</button>
       <button class="fr-btn danger"  data-decline="${f.friendCode}">Decline</button>`
    : `${f.online ? `<button class="fr-btn" data-invite="${f.friendCode}">Invite</button>` : ''}
       <button class="fr-btn danger" data-remove="${f.friendCode}">Remove</button>`;

  return `
    <div class="friend-row" data-code="${f.friendCode}">
      <div class="fr-avatar" style="background:${avatarGradient(f.friendCode)}">${initial}</div>
      <div class="fr-info">
        <div class="fr-name">${f.username}</div>
        <div class="fr-status ${statusCls}">${isPending ? 'Pending request' : statusText}
          ${f.activity ? ` — ${f.activity}` : ''}
        </div>
      </div>
      <div class="fr-actions">${actions}</div>
    </div>
  `;
}

function buildOnlineStrip(onlineFriends) {
  const strip = document.getElementById('onlineStrip');
  if (onlineFriends.length === 0) {
    strip.innerHTML = '<div class="online-empty"><span>No friends online — <button class="inline-link" data-section="friends">add some!</button></span></div>';
    wireRowLinks();
    return;
  }
  strip.innerHTML = onlineFriends.map(f => {
    const init = (f.username || '?').charAt(0).toUpperCase();
    return `
      <div class="friend-online-pill">
        <div class="fop-avatar" style="background:${avatarGradient(f.friendCode)}">
          ${init}
          <div class="fop-status-dot"></div>
        </div>
        <div class="fop-info">
          <div class="fop-name">${f.username}</div>
          <div class="fop-activity">${f.activity || 'Online'}</div>
        </div>
        <button class="fop-invite" data-invite="${f.friendCode}">Invite</button>
      </div>
    `;
  }).join('');
}

// ============================================
// FRIEND BUTTONS WIRING (delegated)
// ============================================
function wireFriendButtons() {
  // Add friend toggle
  document.getElementById('addFriendBtn').addEventListener('click', () => {
    const panel = document.getElementById('addFriendPanel');
    panel.classList.toggle('hidden');
    const identity = window.WRIdentity ? window.WRIdentity.get() : null;
    if (identity) document.getElementById('myFriendCode').textContent = identity.friendCode;
  });

  // Send friend request
  document.getElementById('sendFriendReqBtn').addEventListener('click', () => {
    const code = document.getElementById('friendCodeInput').value.trim().toUpperCase();
    if (!code || code.length < 4) {
      showToast('Enter a valid friend code', 'error');
      return;
    }
    if (window.WRFriends) {
      const result = window.WRFriends.sendRequest(code);
      if (result.success) {
        showToast(`Request sent to ${code}!`, 'success');
        document.getElementById('friendCodeInput').value = '';
        document.getElementById('addFriendPanel').classList.add('hidden');
        refreshFriendsList();
      } else {
        showToast(result.error || 'Could not send request', 'error');
      }
    } else {
      showToast(`Request sent to ${code} (demo mode)`, 'info');
    }
  });

  // Delegated events on friends lists
  ['onlineFriendsList','allFriendsList','pendingList','onlineStrip','friendsInviteList'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', e => {
      const btn = e.target.closest('button[data-accept], button[data-decline], button[data-remove], button[data-invite]');
      if (!btn) return;
      const code = btn.dataset.accept || btn.dataset.decline || btn.dataset.remove || btn.dataset.invite;
      if (btn.dataset.accept  && window.WRFriends) { window.WRFriends.acceptRequest(code); showToast('Friend added!', 'success'); refreshFriendsList(); }
      if (btn.dataset.decline && window.WRFriends) { window.WRFriends.declineRequest(code); refreshFriendsList(); }
      if (btn.dataset.remove  && window.WRFriends) { window.WRFriends.remove(code); showToast('Friend removed', 'info'); refreshFriendsList(); }
      if (btn.dataset.invite) { handleInviteFriend(code); }
    });
  });
}

function handleInviteFriend(friendCode) {
  if (window.WRParty && window.WRParty.isInParty()) {
    const result = window.WRParty.inviteFriend(friendCode);
    if (result.success) showToast('Invite sent!', 'success');
  } else {
    showToast('Create a party first, then invite friends', 'info');
    switchSection('party');
  }
}

// ============================================
// PARTY BUTTONS
// ============================================
function wirePartyButtons() {
  document.getElementById('createPartyBtn').addEventListener('click', () => {
    const coreId = document.getElementById('partyCore').value;
    if (!coreId) { showToast('Select a core first', 'error'); return; }
    const core = CORES.find(c => c.id === coreId);
    if (window.WRParty) {
      const result = window.WRParty.create(coreId);
      if (result.success) showActiveParty(result.roomCode, core);
    } else {
      // Demo mode
      const code = generateRoomCode();
      showActiveParty(code, core);
    }
  });

  document.getElementById('joinPartyBtn').addEventListener('click', () => {
    const code = document.getElementById('joinCodeInput').value.trim().toUpperCase();
    if (code.length < 5) { showToast('Enter a 5-character room code', 'error'); return; }
    if (window.WRParty) {
      window.WRParty.join(code);
    } else {
      showToast(`Joining room ${code}… (demo mode)`, 'info');
    }
  });

  document.getElementById('copyRoomCode').addEventListener('click', () => {
    const code = document.getElementById('activeRoomCode').textContent;
    navigator.clipboard.writeText(code).then(() => showToast('Room code copied!', 'success'));
  });

  document.getElementById('inviteFriendsBtn').addEventListener('click', () => {
    refreshPartyInviteList();
    showToast('Invite your online friends below', 'info');
  });

  document.getElementById('leavePartyBtn').addEventListener('click', () => {
    if (window.WRParty) window.WRParty.leave();
    document.getElementById('activePartyCard').classList.add('hidden');
    document.getElementById('createPartyBtn').closest('.create-party').style.opacity = '';
    document.getElementById('joinPartyBtn').closest('.join-party').style.opacity = '';
    showToast('Left party', 'info');
  });

  document.getElementById('launchPartyBtn').addEventListener('click', () => {
    const coreId = document.getElementById('partyCore').value;
    const core   = CORES.find(c => c.id === coreId) || CORES[0];
    const code   = document.getElementById('activeRoomCode').textContent;
    launchCore(core, { roomCode: code });
  });
}

function showActiveParty(roomCode, core) {
  document.getElementById('activeRoomCode').textContent = roomCode;
  document.getElementById('activePartyCard').classList.remove('hidden');
  // Fade out the create/join cards
  document.querySelector('.create-party').style.opacity = '0.4';
  document.querySelector('.join-party').style.opacity   = '0.4';
  buildPartySlots([{ username: window.WRIdentity?.get()?.username || 'You', isHost: true, ready: true }]);
  showToast(`Party created! Code: ${roomCode}`, 'success');

  // Notify notif bell
  document.getElementById('notifDot').classList.remove('hidden');
}

function buildPartySlots(members = []) {
  const slots = document.getElementById('partySlots');
  slots.innerHTML = '';
  const MAX = 8;
  for (let i = 0; i < MAX; i++) {
    const m = members[i];
    const div = document.createElement('div');
    div.className = `party-slot ${m ? (m.isHost ? 'host' : 'filled') : ''}`;
    if (m) {
      const init = m.username.charAt(0).toUpperCase();
      div.innerHTML = `
        <div class="ps-avatar">${init}</div>
        <div class="ps-name">${m.username}</div>
        <div class="${m.ready ? 'ps-ready' : 'ps-waiting'}">${m.isHost ? 'HOST' : m.ready ? 'Ready' : 'Waiting…'}</div>
      `;
    } else {
      div.innerHTML = `<div class="ps-avatar empty">+</div><div class="ps-label">Open Slot</div>`;
    }
    slots.appendChild(div);
  }
  // Enable launch if host
  const identity = window.WRIdentity?.get();
  if (identity) document.getElementById('launchPartyBtn').disabled = false;
}

function refreshPartyInviteList() {
  const friends = window.WRFriends ? window.WRFriends.getAll().filter(f => f.online) : [];
  const list = document.getElementById('friendsInviteList');
  if (friends.length === 0) {
    list.innerHTML = '<div class="empty-state">No friends online to invite</div>';
    return;
  }
  list.innerHTML = friends.map(f => {
    const init = (f.username || '?').charAt(0).toUpperCase();
    return `
      <div class="friend-online-pill">
        <div class="fop-avatar" style="background:${avatarGradient(f.friendCode)}">
          ${init}
          <div class="fop-status-dot"></div>
        </div>
        <div class="fop-info">
          <div class="fop-name">${f.username}</div>
          <div class="fop-activity">${f.activity || 'Online'}</div>
        </div>
        <button class="fop-invite" data-invite="${f.friendCode}">Invite</button>
      </div>
    `;
  }).join('');
}

// ============================================
// UTILITIES
// ============================================
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function avatarGradient(seed = '') {
  const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue  = hash % 360;
  return `linear-gradient(135deg, hsl(${hue},70%,50%), hsl(${(hue+40)%360},70%,35%))`;
}

// ============================================
// TOAST SYSTEM
// ============================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 280);
  }, 3500);
}

// Expose showToast globally for other modules
window.WRLauncher = { showToast, switchSection, launchCore, buildPartySlots, CORES, generateRoomCode };
