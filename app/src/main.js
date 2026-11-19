// Neon Vice editor: wires the controls to the cover renderer in ./cover.js.
// Photos are read locally with object URLs and never leave the machine. A `?shot=`
// query builds a fixed demo scene instead, for the maker's screenshots.

import { drawCoverArt, panelLayout, freshTransform } from './cover.js';

const EXPORT_SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

const canvas = document.getElementById('coverCanvas');
const statusEl = document.getElementById('status');
const titleInput = document.getElementById('titleInput');
const taglineInput = document.getElementById('taglineInput');
const zoomRange = document.getElementById('zoomRange');
const dxRange = document.getElementById('dxRange');
const dyRange = document.getElementById('dyRange');

const state = {
  panels: panelLayout().map((p) => ({ ...p, photoId: null, scene: p.fill.startsWith('scene:') ? p.fill.slice(6) : null, fill: p.fill === 'photo' ? 'photo' : 'scene', transform: freshTransform() })),
  photos: new Map(),
  photoSeq: 0,
  selectedPhotoId: null,
  selectedId: 'hero',
  title: titleInput.value,
  tagline: taglineInput.value,
  grade: 'sunset',
  size: '1920x1080',
};

function selectedPanel() {
  return state.panels.find((p) => p.id === state.selectedId);
}

function redraw() {
  drawCoverArt(canvas, { ...state, selectedId: state.selectedId });
}

function syncTransformControls() {
  const t = selectedPanel().transform;
  zoomRange.value = String(t.zoom);
  dxRange.value = String(t.dx);
  dyRange.value = String(t.dy);
}

/** Loads an image from a URL, resolving once it can be drawn. */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Registers a loaded image as a photo, selects it and returns its id. */
function addPhoto(img, name) {
  const id = `photo-${++state.photoSeq}`;
  state.photos.set(id, img);
  state.selectedPhotoId = id;
  renderThumbs();
  return id;
}

/** Thumbnail strip: click a photo, then click a panel (or a panel button) to place it. */
function renderThumbs() {
  const row = document.getElementById('thumbRow');
  row.innerHTML = '';
  for (const [id, img] of state.photos) {
    const thumb = document.createElement('img');
    thumb.src = img.src;
    thumb.alt = 'Loaded photo';
    thumb.className = 'thumb' + (id === state.selectedPhotoId ? ' isOn' : '');
    thumb.addEventListener('click', () => {
      state.selectedPhotoId = id;
      placePhotoInSelected(id);
      renderThumbs();
    });
    row.appendChild(thumb);
  }
}

/** Puts a photo into the selected panel (or the hero when a scene panel is selected). */
function placePhotoInSelected(photoId) {
  let panel = selectedPanel();
  if (panel.fill !== 'photo') panel = state.panels.find((p) => p.id === 'hero');
  panel.photoId = photoId;
  state.selectedId = panel.id;
  renderPanelButtons();
  redraw();
}

/** One button per panel: selects it; a scene button also cycles to the next drawn scene. */
function renderPanelButtons() {
  const grid = document.getElementById('panelGrid');
  grid.innerHTML = '';
  const sceneNames = ['skyline', 'car', 'palms', 'helicopter'];
  for (const panel of state.panels) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = panel.fill === 'scene' ? `${panel.name} · art` : panel.name;
    btn.className = panel.id === state.selectedId ? 'isOn' : '';
    btn.addEventListener('click', () => {
      if (state.selectedId === panel.id && panel.fill === 'scene') {
        panel.scene = sceneNames[(sceneNames.indexOf(panel.scene) + 1) % sceneNames.length];
      }
      state.selectedId = panel.id;
      syncTransformControls();
      renderPanelButtons();
      redraw();
    });
    grid.appendChild(btn);
  }
}

document.getElementById('photoInput').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  for (const file of files) {
    const img = await loadImage(URL.createObjectURL(file));
    addPhoto(img, file.name);
  }
  if (files.length) {
    placePhotoInSelected(state.selectedPhotoId);
    statusEl.textContent = `${files.length} photo(s) loaded — click any panel to place the selected photo.`;
  }
});

document.getElementById('fillAllBtn').addEventListener('click', () => {
  if (!state.selectedPhotoId) return;
  for (const panel of state.panels) if (panel.fill === 'photo') panel.photoId = state.selectedPhotoId;
  redraw();
});

document.getElementById('cycleBtn').addEventListener('click', () => {
  const ids = [...state.photos.keys()];
  if (!ids.length) return;
  let n = 0;
  for (const panel of state.panels) {
    if (panel.fill === 'photo') {
      panel.photoId = ids[n % ids.length];
      n++;
    }
  }
  redraw();
});

for (const btn of document.querySelectorAll('.gradeBtn')) {
  btn.addEventListener('click', () => {
    state.grade = btn.dataset.grade;
    document.querySelectorAll('.gradeBtn').forEach((b) => b.classList.toggle('isOn', b === btn));
    redraw();
  });
}
for (const btn of document.querySelectorAll('.sizeBtn')) {
  btn.addEventListener('click', () => {
    state.size = btn.dataset.size;
    document.querySelectorAll('.sizeBtn').forEach((b) => b.classList.toggle('isOn', b === btn));
    const [w, h] = EXPORT_SIZES[state.size];
    canvas.width = w;
    canvas.height = h;
    redraw();
  });
}

titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
taglineInput.addEventListener('input', () => { state.tagline = taglineInput.value; redraw(); });
zoomRange.addEventListener('input', () => { selectedPanel().transform.zoom = Number(zoomRange.value); redraw(); });
dxRange.addEventListener('input', () => { selectedPanel().transform.dx = Number(dxRange.value); redraw(); });
dyRange.addEventListener('input', () => { selectedPanel().transform.dy = Number(dyRange.value); redraw(); });

/* Dragging on the canvas selects the panel under the pointer and moves its photo. */
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const r = canvas.getBoundingClientRect();
  const fx = (e.clientX - r.left) / r.width;
  const fy = (e.clientY - r.top) / r.height;
  const panel = state.panels.find((p) => fx >= p.x && fx <= p.x + p.w && fy >= p.y && fy <= p.y + p.h);
  if (!panel) return;
  state.selectedId = panel.id;
  syncTransformControls();
  renderPanelButtons();
  drag = { panel, startX: e.clientX, startY: e.clientY, dx: panel.transform.dx, dy: panel.transform.dy, rect: r };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  drag.panel.transform.dx = drag.dx + (e.clientX - drag.startX) / drag.rect.width / drag.panel.w;
  drag.panel.transform.dy = drag.dy + (e.clientY - drag.startY) / drag.rect.height / drag.panel.h;
  syncTransformControls();
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });

/** Renders the cover at the chosen export size on a scratch canvas and downloads the PNG. */
function exportPng() {
  const [w, h] = EXPORT_SIZES[state.size];
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  drawCoverArt(out, { ...state, selectedId: null });
  out.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `neon-vice-cover-${state.size}.png`;
    a.click();
    statusEl.textContent = `Saved neon-vice-cover-${state.size}.png — post it anywhere.`;
  }, 'image/png');
}
document.getElementById('exportBtn').addEventListener('click', exportPng);

/** The demo arrangement: the two free sample photos across the photo panels. */
async function loadDemo() {
  const pier = await loadImage('samples/pier.jpg');
  const pierId = addPhoto(pier, 'Pier sample');
  const boulevard = await loadImage('samples/boulevard.jpg');
  const blvdId = addPhoto(boulevard, 'Boulevard sample');
  const byId = (id) => state.panels.find((p) => p.id === id);
  byId('hero').photoId = pierId;
  byId('leftPhoto').photoId = blvdId;
  byId('rightPhoto').photoId = pierId;
  byId('underHero').photoId = blvdId;
  byId('hero').transform = { dx: 0, dy: 0.09, zoom: 1.06 };
  state.selectedPhotoId = pierId;
  renderThumbs();
}

/** Fixed scenes for screenshots: ?shot=cover paints only the cover; ?shot=editor the full app. */
async function runShotMode(query) {
  const shot = query.get('shot');
  if (query.get('title')) { state.title = query.get('title'); titleInput.value = state.title; }
  if (query.get('tagline')) { state.tagline = query.get('tagline'); taglineInput.value = state.tagline; }
  if (query.get('grade') && ['sunset', 'neon', 'noir'].includes(query.get('grade'))) state.grade = query.get('grade');
  const size = query.get('size');
  if (size && EXPORT_SIZES[size]) {
    state.size = size;
    const [w, h] = EXPORT_SIZES[size];
    canvas.width = w;
    canvas.height = h;
  }
  await loadDemo();
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    state.selectedId = null; // an exported cover carries no editor selection outline
  }
  syncTransformControls();
  renderPanelButtons();
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

const query = new URLSearchParams(location.search);
renderPanelButtons();
if (query.get('shot')) {
  runShotMode(query);
} else {
  loadDemo().then(() => { syncTransformControls(); redraw(); });
}
