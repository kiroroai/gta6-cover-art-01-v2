// Drawn scene panels for Neon Vice: original canvas artwork (sunset skyline, sports car,
// palms over the ocean, helicopter searchlight) that fills the panels a photo does not.
// Every scene is drawn inside a panel rectangle passed in by the cover renderer.

/** A vertical sky gradient in the Vice palette, shared by every scene. */
function skyGradient(ctx, x, y, w, h, top, mid, low) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, top);
  g.addColorStop(0.55, mid);
  g.addColorStop(1, low);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  return g;
}

/** One palm tree silhouette: a curved trunk and a fan of fronds. */
function drawPalm(ctx, baseX, baseY, height, lean, colour) {
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = Math.max(3, height * 0.035);
  ctx.lineCap = 'round';
  const topX = baseX + lean * height;
  const topY = baseY - height;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.quadraticCurveTo(baseX + lean * height * 0.3, baseY - height * 0.6, topX, topY);
  ctx.stroke();
  const fronds = 7;
  for (let i = 0; i < fronds; i++) {
    const a = Math.PI * (0.08 + (0.84 * i) / (fronds - 1));
    const len = height * (0.34 + 0.1 * Math.sin(i * 2.1));
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * len * 0.6, topY - Math.sin(a) * len * 0.55,
      topX + Math.cos(a) * len, topY - Math.sin(a) * len * 0.25 + len * 0.22,
    );
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(topX, topY + height * 0.03, height * 0.035, 0, Math.PI * 2);
  ctx.fill();
}

/** A low sun disc with a soft halo, sitting on the horizon line. */
function drawSun(ctx, cx, cy, r, core, halo) {
  const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.4);
  g.addColorStop(0, halo);
  g.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(cx - r * 2.4, cy - r * 2.4, r * 4.8, r * 4.8);
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

/** Sunset skyline: towers against a huge sun, palms in front, neon window dots. */
export function drawSkylineScene(ctx, x, y, w, h) {
  skyGradient(ctx, x, y, w, h, '#2a1a5e', '#c62b7e', '#ff8a3c');
  drawSun(ctx, x + w * 0.62, y + h * 0.52, h * 0.21, '#ffd76a', 'rgba(255,170,60,0.55)');
  const base = y + h * 0.94;
  const towers = [0.02, 0.14, 0.27, 0.40, 0.55, 0.68, 0.80, 0.90];
  const heights = [0.42, 0.62, 0.36, 0.55, 0.30, 0.66, 0.44, 0.58];
  ctx.fillStyle = '#180b2e';
  towers.forEach((tx, i) => {
    const tw = w * 0.115;
    const th = h * heights[i];
    ctx.fillRect(x + w * tx, base - th, tw, th);
    if (i % 3 === 0) ctx.fillRect(x + w * tx + tw * 0.3, base - th - h * 0.05, tw * 0.4, h * 0.05);
  });
  ctx.fillStyle = 'rgba(255,214,106,0.9)';
  towers.forEach((tx, i) => {
    const tw = w * 0.115;
    const th = h * heights[i];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 2; c++) {
        if ((i * 7 + r * 3 + c) % 3 === 0) {
          ctx.fillRect(x + w * tx + tw * (0.2 + c * 0.4), base - th + th * (0.15 + r * 0.16), tw * 0.18, h * 0.03);
        }
      }
    }
  });
  ctx.fillStyle = '#0d0518';
  ctx.fillRect(x, base, w, h - (base - y));
  drawPalm(ctx, x + w * 0.10, y + h * 1.0, h * 0.52, 0.16, '#0d0518');
  drawPalm(ctx, x + w * 0.94, y + h * 1.0, h * 0.42, -0.2, '#0d0518');
}

/** A low sports car at dusk: sleek magenta body, cyan underglow, lit road. */
export function drawSportsCarScene(ctx, x, y, w, h) {
  skyGradient(ctx, x, y, w, h, '#0e2a5e', '#7a2ea6', '#ff4f7e');
  drawSun(ctx, x + w * 0.24, y + h * 0.4, h * 0.15, '#ffe08a', 'rgba(255,150,80,0.5)');
  const roadY = y + h * 0.60;
  ctx.fillStyle = '#12081f';
  ctx.fillRect(x, roadY, w, h - (roadY - y));
  ctx.strokeStyle = 'rgba(25,227,210,0.85)';
  ctx.lineWidth = Math.max(2, h * 0.012);
  ctx.setLineDash([w * 0.09, w * 0.07]);
  ctx.beginPath();
  ctx.moveTo(x, roadY + h * 0.32);
  ctx.lineTo(x + w, roadY + h * 0.32);
  ctx.stroke();
  ctx.setLineDash([]);
  const carY = roadY + h * 0.07;
  const carW = w * 0.82;
  const carX = x + w * 0.09;
  const carH = h * 0.24;
  const glow = ctx.createRadialGradient(x + w / 2, carY + carH, 10, x + w / 2, carY + carH, carW * 0.55);
  glow.addColorStop(0, 'rgba(25,227,210,0.55)');
  glow.addColorStop(1, 'rgba(25,227,210,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(carX - carW * 0.1, carY, carW * 1.2, carH * 1.9);
  ctx.fillStyle = '#ff2e88';
  ctx.beginPath();
  ctx.moveTo(carX, carY + carH * 0.78);
  ctx.lineTo(carX + carW * 0.10, carY + carH * 0.42);
  ctx.lineTo(carX + carW * 0.34, carY + carH * 0.30);
  ctx.lineTo(carX + carW * 0.46, carY - carH * 0.28);
  ctx.lineTo(carX + carW * 0.66, carY - carH * 0.30);
  ctx.lineTo(carX + carW * 0.78, carY + carH * 0.28);
  ctx.lineTo(carX + carW * 0.94, carY + carH * 0.44);
  ctx.lineTo(carX + carW, carY + carH * 0.80);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#160a2a';
  ctx.beginPath();
  ctx.moveTo(carX + carW * 0.40, carY + carH * 0.22);
  ctx.lineTo(carX + carW * 0.49, carY - carH * 0.18);
  ctx.lineTo(carX + carW * 0.64, carY - carH * 0.19);
  ctx.lineTo(carX + carW * 0.73, carY + carH * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(carX + carW * 0.015, carY + carH * 0.52, carW * 0.05, carH * 0.14);
  ctx.fillStyle = '#ff3355';
  ctx.fillRect(carX + carW * 0.945, carY + carH * 0.5, carW * 0.045, carH * 0.16);
  for (const wx of [0.22, 0.78]) {
    ctx.fillStyle = '#0a0512';
    ctx.beginPath();
    ctx.arc(carX + carW * wx, carY + carH * 0.82, carH * 0.30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e8e4f5';
    ctx.lineWidth = Math.max(2, carH * 0.07);
    ctx.beginPath();
    ctx.arc(carX + carW * wx, carY + carH * 0.82, carH * 0.17, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/** Palms over the ocean: teal water, a striped sunset and a wooden pier. */
export function drawPalmsOceanScene(ctx, x, y, w, h) {
  skyGradient(ctx, x, y, w, h * 0.55, '#3a1c71', '#e84393', '#ffb347');
  drawSun(ctx, x + w * 0.5, y + h * 0.52, h * 0.13, '#fff3b0', 'rgba(255,190,80,0.6)');
  const seaY = y + h * 0.55;
  const sea = ctx.createLinearGradient(0, seaY, 0, y + h);
  sea.addColorStop(0, '#ff9a5c');
  sea.addColorStop(0.25, '#19b8c9');
  sea.addColorStop(1, '#0b3d91');
  ctx.fillStyle = sea;
  ctx.fillRect(x, seaY, w, h - (seaY - y));
  ctx.strokeStyle = 'rgba(255,240,190,0.75)';
  ctx.lineWidth = Math.max(1.5, h * 0.008);
  for (let i = 0; i < 5; i++) {
    const ly = seaY + h * (0.06 + i * 0.075);
    const lw = w * (0.16 - i * 0.018);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5 - lw / 2, ly);
    ctx.lineTo(x + w * 0.5 + lw / 2, ly);
    ctx.stroke();
  }
  ctx.fillStyle = '#241031';
  for (let i = 0; i < 4; i++) {
    const px = x + w * (0.12 + i * 0.24);
    ctx.fillRect(px, seaY + h * 0.16, w * 0.022, h * 0.3);
  }
  ctx.fillRect(x, seaY + h * 0.14, w, h * 0.035);
  drawPalm(ctx, x + w * 0.06, y + h * 1.02, h * 0.66, 0.22, '#170826');
  drawPalm(ctx, x + w * 0.97, y + h * 1.02, h * 0.55, -0.26, '#170826');
}

/** A helicopter with a searchlight over a night bay, city lights below. */
export function drawHelicopterScene(ctx, x, y, w, h) {
  skyGradient(ctx, x, y, w, h, '#070b2e', '#232a6e', '#7a2ea6');
  ctx.fillStyle = '#f4f1de';
  ctx.beginPath();
  ctx.arc(x + w * 0.84, y + h * 0.16, h * 0.055, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(244,241,222,0.9)';
  for (let i = 0; i < 26; i++) {
    const sx = x + w * ((i * 37) % 97) / 100;
    const sy = y + h * ((i * 53) % 38) / 100;
    ctx.fillRect(sx, sy, 2.2, 2.2);
  }
  const hx = x + w * 0.40;
  const hy = y + h * 0.34;
  const hs = h * 0.16;
  ctx.fillStyle = 'rgba(255,240,170,0.30)';
  ctx.beginPath();
  ctx.moveTo(hx + hs * 0.4, hy + hs * 0.5);
  ctx.lineTo(hx - hs * 0.7, y + h * 0.98);
  ctx.lineTo(hx + hs * 1.1, y + h * 0.98);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#0a0618';
  ctx.beginPath();
  ctx.ellipse(hx, hy, hs * 1.05, hs * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(hx + hs * 0.9, hy - hs * 0.12, hs * 1.25, hs * 0.2);
  ctx.fillRect(hx - hs * 0.06, hy - hs * 0.78, hs * 0.12, hs * 0.3);
  ctx.strokeStyle = '#0a0618';
  ctx.lineWidth = Math.max(2.5, hs * 0.14);
  ctx.beginPath();
  ctx.moveTo(hx - hs * 1.25, hy - hs * 0.82);
  ctx.lineTo(hx + hs * 1.25, hy - hs * 0.82);
  ctx.stroke();
  ctx.fillStyle = '#0a0618';
  ctx.fillRect(x, y + h * 0.9, w, h * 0.1);
  ctx.fillStyle = 'rgba(25,227,210,0.95)';
  for (let i = 0; i < 12; i++) ctx.fillRect(x + w * ((i * 83) % 95) / 100, y + h * 0.935, w * 0.016, h * 0.02);
}

/** Scene painters by name, in the order the Mix button cycles them. */
export const SCENE_PAINTERS = {
  skyline: drawSkylineScene,
  car: drawSportsCarScene,
  palms: drawPalmsOceanScene,
  helicopter: drawHelicopterScene,
};
