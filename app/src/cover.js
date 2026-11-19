// The Neon Vice cover renderer: a multi-panel poster grid around a central hero panel,
// a huge original title treatment, a tagline bar and a Vice City colour grade.
// Pure canvas drawing — the same function paints the live preview and every export size.

import { SCENE_PAINTERS } from './scenes.js';

/** Colour grades: a canvas filter for photos plus a translucent wash over the whole cover. */
export const GRADE_PRESETS = {
  sunset: { filter: 'saturate(1.35) contrast(1.08) brightness(1.02)', washTop: 'rgba(255,110,60,0.10)', washLow: 'rgba(255,46,136,0.20)' },
  neon: { filter: 'saturate(1.65) contrast(1.14) hue-rotate(-8deg)', washTop: 'rgba(25,227,210,0.10)', washLow: 'rgba(150,40,255,0.24)' },
  noir: { filter: 'grayscale(0.75) contrast(1.28) brightness(0.94)', washTop: 'rgba(10,16,60,0.16)', washLow: 'rgba(0,0,10,0.34)' },
};

/**
 * The poster grid, in fractions of the cover. Eight panels: a tall hero in the middle,
 * three stacked panels on each side and one wide panel under the hero.
 */
export function panelLayout() {
  return [
    { id: 'skyline', name: 'Skyline', x: 0.014, y: 0.016, w: 0.228, h: 0.292, fill: 'scene:skyline' },
    { id: 'leftPhoto', name: 'Left photo', x: 0.014, y: 0.322, w: 0.228, h: 0.292, fill: 'photo' },
    { id: 'car', name: 'Car', x: 0.014, y: 0.628, w: 0.228, h: 0.284, fill: 'scene:car' },
    { id: 'hero', name: 'Hero', x: 0.256, y: 0.016, w: 0.488, h: 0.690, fill: 'photo' },
    { id: 'underHero', name: 'Under hero', x: 0.256, y: 0.720, w: 0.488, h: 0.192, fill: 'photo' },
    { id: 'rightPhoto', name: 'Right photo', x: 0.758, y: 0.016, w: 0.228, h: 0.292, fill: 'photo' },
    { id: 'palms', name: 'Palms', x: 0.758, y: 0.322, w: 0.228, h: 0.292, fill: 'scene:palms' },
    { id: 'night', name: 'Night bay', x: 0.758, y: 0.628, w: 0.228, h: 0.284, fill: 'scene:helicopter' },
  ];
}

/** A fresh per-panel photo transform (centre crop, no zoom). */
export function freshTransform() {
  return { dx: 0, dy: 0, zoom: 1 };
}

/** Draws one photo into a panel rect, cover-fitted, honouring its transform and the grade filter. */
function paintPhotoPanel(ctx, rect, img, transform, filter) {
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * transform.zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = rect.x + (rect.w - dw) / 2 + transform.dx * rect.w;
  const dy = rect.y + (rect.h - dh) / 2 + transform.dy * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.filter = filter;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.filter = 'none';
  const shade = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  shade.addColorStop(0, 'rgba(20,0,40,0.10)');
  shade.addColorStop(1, 'rgba(30,0,50,0.22)');
  ctx.fillStyle = shade;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

/** Placeholder art for a photo panel that has no photo yet: a striped sunset with a hint. */
function paintEmptyPanel(ctx, rect, label) {
  const g = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  g.addColorStop(0, '#4a2070');
  g.addColorStop(1, '#c62b7e');
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `700 ${Math.max(13, rect.h * 0.09)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
}

/** The big title: gradient-filled, black-outlined, slightly tilted, with a hard pink offset shadow. */
function paintTitle(ctx, w, h, title) {
  const text = (title || '').trim().toUpperCase() || 'NEON VICE';
  ctx.save();
  ctx.translate(w / 2, h * 0.115);
  ctx.rotate(-0.022);
  let size = h * 0.148;
  const family = `'Arial Black', Impact, 'Segoe UI', sans-serif`;
  ctx.font = `italic 900 ${size}px ${family}`;
  while (ctx.measureText(text).width > w * 0.86 && size > 18) {
    size *= 0.94;
    ctx.font = `italic 900 ${size}px ${family}`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#12041f';
  ctx.lineWidth = size * 0.16;
  ctx.strokeText(text, size * 0.045, size * 0.055);
  const fill = ctx.createLinearGradient(0, -size * 0.55, 0, size * 0.6);
  fill.addColorStop(0, '#ffffff');
  fill.addColorStop(0.52, '#ffe9f4');
  fill.addColorStop(0.53, '#ffb347');
  fill.addColorStop(1, '#ff2e88');
  ctx.fillStyle = fill;
  ctx.fillText(text, 0, 0);
  ctx.strokeStyle = 'rgba(25,227,210,0.9)';
  ctx.lineWidth = Math.max(2, size * 0.022);
  ctx.beginPath();
  const tw = ctx.measureText(text).width;
  ctx.moveTo(-tw / 2, size * 0.52);
  ctx.lineTo(tw / 2, size * 0.52);
  ctx.stroke();
  ctx.restore();
}

/** The foot of the cover: a black tagline bar, a small original rating box and a studio line. */
function paintTaglineBar(ctx, w, h, tagline) {
  const barH = h * 0.088;
  const y = h - barH;
  ctx.fillStyle = '#0a0414';
  ctx.fillRect(0, y, w, barH);
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(0, y, w, Math.max(3, h * 0.006));
  const box = barH * 0.78;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(2, h * 0.004);
  ctx.strokeRect(w * 0.016, y + (barH - box) / 2, box, box);
  ctx.fillStyle = '#fff';
  ctx.font = `900 ${box * 0.44}px 'Arial Black', Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('18+', w * 0.016 + box / 2, y + barH / 2 + 1);
  const text = (tagline || '').trim().toUpperCase();
  if (text) {
    let size = barH * 0.42;
    ctx.font = `800 ${size}px 'Segoe UI', system-ui, sans-serif`;
    while (ctx.measureText(text).width > w * 0.62 && size > 10) {
      size *= 0.94;
      ctx.font = `800 ${size}px 'Segoe UI', system-ui, sans-serif`;
    }
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(text.split('').join('  '), w * 0.52, y + barH / 2 + 1);
  }
  ctx.fillStyle = '#19e3d2';
  ctx.font = `700 ${barH * 0.26}px system-ui, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText('VICE SHORES STUDIOS', w * 0.984, y + barH / 2 + 1);
}

/**
 * Paints the whole cover described by `state` onto `canvas` at the canvas's own size.
 * state: { panels: [{fill, photoId, scene, transform}], photos: Map(id -> img),
 *          title, tagline, grade, selectedId (editor only; pass null for exports) }
 */
export function drawCoverArt(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADE_PRESETS[state.grade] ?? GRADE_PRESETS.sunset;
  ctx.fillStyle = '#05030a';
  ctx.fillRect(0, 0, w, h);
  for (const panel of state.panels) {
    const rect = { x: panel.x * w, y: panel.y * h, w: panel.w * w, h: panel.h * h };
    if (panel.fill === 'photo' && panel.photoId && state.photos.get(panel.photoId)) {
      paintPhotoPanel(ctx, rect, state.photos.get(panel.photoId), panel.transform, grade.filter);
    } else if (panel.fill === 'photo') {
      paintEmptyPanel(ctx, rect, panel.id === 'hero' ? 'YOUR PHOTO HERE' : 'ADD A PHOTO');
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();
      (SCENE_PAINTERS[panel.scene] ?? SCENE_PAINTERS.skyline)(ctx, rect.x, rect.y, rect.w, rect.h);
      ctx.restore();
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(3, w * 0.0035);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    if (state.selectedId === panel.id) {
      ctx.strokeStyle = '#19e3d2';
      ctx.lineWidth = Math.max(4, w * 0.005);
      ctx.strokeRect(rect.x - ctx.lineWidth, rect.y - ctx.lineWidth, rect.w + ctx.lineWidth * 2, rect.h + ctx.lineWidth * 2);
    }
  }
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, grade.washTop);
  wash.addColorStop(1, grade.washLow);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h * 0.912);
  paintTitle(ctx, w, h, state.title);
  paintTaglineBar(ctx, w, h, state.tagline);
}
