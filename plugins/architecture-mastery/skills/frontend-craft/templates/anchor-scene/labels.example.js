// Ejemplo de etiquetas de marca pintadas en canvas (marca ficticia CHISPA). Cópialo como labels.js y cambia sabores, colores y arte (2048 × 1024, envuelven los 360° de la lata).
// El centro horizontal es el frente; el borde izquierdo/derecho es la espalda (tabla nutricional).
export const FLAVORS = {
  maracuya: { name: "Maracuyá", label: "#FFC21A", ink: "#3B1F00", accent: "#FF5A1F", bg: "#FFE07A", fruit: "maracuya", note: "Ácida, brillante, despierta." },
  lulo:     { name: "Lulo",     label: "#7BC043", ink: "#123300", accent: "#FF8A1F", bg: "#CDEFA5", fruit: "lulo",     note: "Verde, cítrica, imposible de explicar." },
  mora:     { name: "Mora",     label: "#5B1E52", ink: "#FFE9F6", accent: "#FF4F8B", bg: "#B66AA6", fruit: "mora",     note: "Oscura, dulce, un poco de bosque." },
  mango:    { name: "Mango biche", label: "#FF7A1A", ink: "#2A1200", accent: "#7BC043", bg: "#FFB27A", fruit: "mango", note: "Mango verde con sal y limón." },
  guanabana:{ name: "Guanábana", label: "#EEF3DD", ink: "#1E3A1A", accent: "#3E8E3B", bg: "#E4F0C8", fruit: "guanabana", note: "Cremosa, suave, tropical de verdad." },
};

const W = 2048, H = 1024;

function fruit(g, kind, cx, cy, s, f) {
  g.save(); g.translate(cx, cy);
  const circle = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
  if (kind === "maracuya") {
    circle(0, 0, s, "#8E3B8A"); circle(0, 0, s * 0.82, "#FFD84D");
    for (let i = 0; i < 26; i++) { const a = i * 2.4, r = Math.sqrt(i / 26) * s * 0.62; circle(Math.cos(a) * r, Math.sin(a) * r, s * 0.07, "#2A1200"); }
  } else if (kind === "lulo") {
    circle(0, 0, s, "#FF9A1F"); circle(0, 0, s * 0.84, "#C6E86A");
    g.strokeStyle = "#7BAA2A"; g.lineWidth = s * 0.05;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(0, 0, s * 0.6, s * 0.18, (i * Math.PI) / 4, 0, Math.PI * 2); g.stroke(); }
    circle(0, 0, s * 0.14, "#FFF6C9");
  } else if (kind === "mora") {
    for (let i = 0; i < 19; i++) { const a = i * 2.4, r = Math.sqrt(i / 19) * s * 0.75; circle(Math.cos(a) * r, Math.sin(a) * r + s * 0.08, s * 0.24, i % 3 ? "#2A0626" : "#4A0F43"); }
    g.fillStyle = "#3E8E3B"; g.beginPath(); g.ellipse(-s * 0.2, -s * 0.85, s * 0.34, s * 0.12, -0.5, 0, Math.PI * 2); g.ellipse(s * 0.2, -s * 0.85, s * 0.34, s * 0.12, 0.5, 0, Math.PI * 2); g.fill();
  } else if (kind === "mango") {
    g.rotate(-0.4); g.fillStyle = "#9BCB3C"; g.beginPath(); g.ellipse(0, 0, s * 0.72, s, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#FFD23F"; g.beginPath(); g.ellipse(s * 0.12, -s * 0.1, s * 0.5, s * 0.78, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#FFFFFF"; [[0.2, -0.3], [0.0, 0.2], [0.35, 0.4]].forEach(([x, y]) => { g.save(); g.translate(x * s, y * s); g.rotate(0.6); g.fillRect(-s * 0.05, -s * 0.05, s * 0.1, s * 0.1); g.restore(); });
  } else {
    circle(0, 0, s, "#3E8E3B");
    g.fillStyle = "#2C6E2A";
    for (let i = 0; i < 40; i++) { const a = i * 2.4, r = Math.sqrt(i / 40) * s * 0.92; g.beginPath(); g.moveTo(Math.cos(a) * r, Math.sin(a) * r - s * 0.06); g.lineTo(Math.cos(a) * r + s * 0.05, Math.sin(a) * r + s * 0.05); g.lineTo(Math.cos(a) * r - s * 0.05, Math.sin(a) * r + s * 0.05); g.fill(); }
    circle(s * 0.35, -s * 0.25, s * 0.42, "#F7F5E8");
    for (let i = 0; i < 5; i++) circle(s * 0.35 + Math.cos(i * 1.3) * s * 0.18, -s * 0.25 + Math.sin(i * 1.3) * s * 0.18, s * 0.05, "#1A1A1A");
  }
  g.restore();
}

export async function paintLabel(key) {
  const f = FLAVORS[key];
  await document.fonts.load('800 200px "Bricolage Grotesque"');
  await document.fonts.load('600 40px "Bricolage Grotesque"');
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");

  // Fondo + ola de acento que abraza la lata.
  g.fillStyle = f.label; g.fillRect(0, 0, W, H);
  g.fillStyle = f.accent;
  g.beginPath(); g.moveTo(0, H * 0.82);
  for (let x = 0; x <= W; x += 16) g.lineTo(x, H * 0.82 + Math.sin((x / W) * Math.PI * 6) * 26);
  g.lineTo(W, H); g.lineTo(0, H); g.fill();

  // Frente: marca vertical enorme, fruta y sabor.
  const fx = W / 2;
  g.save(); g.translate(fx - 150, H * 0.44); g.rotate(-Math.PI / 2);
  g.fillStyle = f.ink; g.font = '800 300px "Bricolage Grotesque"'; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("chispa", 0, 0); g.restore();
  fruit(g, f.fruit, fx + 150, H * 0.34, 120, f);
  g.fillStyle = f.ink; g.textAlign = "left"; g.textBaseline = "alphabetic";
  g.font = '800 62px "Bricolage Grotesque"';
  g.fillText(f.name.toUpperCase(), fx + 20, H * 0.6);
  g.font = '600 30px "Bricolage Grotesque"';
  g.fillText("SODA DE FRUTA REAL", fx + 22, H * 0.65);

  // Sello circular.
  const sx = fx + 280, sy = H * 0.72;
  g.fillStyle = f.ink; g.beginPath(); g.arc(sx, sy, 78, 0, Math.PI * 2); g.fill();
  g.fillStyle = f.label; g.textAlign = "center"; g.font = '800 46px "Bricolage Grotesque"'; g.fillText("4 g", sx, sy + 4);
  g.font = '600 20px "Bricolage Grotesque"'; g.fillText("AZÚCAR", sx, sy + 34);

  // Espalda: tabla nutricional e ingredientes (se ve al girar).
  const back = (x0) => {
    g.textAlign = "left"; g.fillStyle = f.ink;
    g.font = '800 40px "Bricolage Grotesque"'; g.fillText("INFORMACIÓN", x0, H * 0.24);
    g.font = '800 40px "Bricolage Grotesque"'; g.fillText("NUTRICIONAL", x0, H * 0.29);
    g.fillRect(x0, H * 0.31, 340, 6);
    const rows = [["Calorías", "28"], ["Azúcares", "4 g"], ["Fibra", "3 g"], ["Sodio", "10 mg"], ["Edulcorantes", "0"]];
    g.font = '600 28px "Bricolage Grotesque"';
    rows.forEach(([k, v], i) => { const y = H * 0.36 + i * 42; g.fillText(k, x0, y); g.textAlign = "right"; g.fillText(v, x0 + 340, y); g.textAlign = "left"; g.fillRect(x0, y + 12, 340, 2); });
    g.font = '600 22px "Bricolage Grotesque"';
    g.fillText("Agua carbonatada, pulpa de " + f.name.toLowerCase() + ",", x0, H * 0.66);
    g.fillText("jugo de limón, sal marina.", x0, H * 0.69);
    g.fillText("355 ml · Hecho en Colombia", x0, H * 0.73);
  };
  back(70); back(W - 430);
  return c;
}
