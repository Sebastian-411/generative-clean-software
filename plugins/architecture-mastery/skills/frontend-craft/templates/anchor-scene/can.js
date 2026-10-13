// Lata procedural (355 ml): aluminio + etiqueta pintada en un <canvas>. Sin modelos de terceros:
// la marca controla el arte de la etiqueta (ver labels.js de cada demo).
// Normalizada a 1 unidad de alto; la etiqueta se ve centrada de frente con rotación y = 0.
//
//   const can = createCan(labelCanvas);   can.setLabel(otroCanvas);
import * as THREE from "three";

const R = 0.27, BODY = 0.84, TOP = BODY / 2, BOT = -BODY / 2;

export function createCan(labelCanvas) {
  const group = new THREE.Group();
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xd9dbe0, metalness: 1, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.2 });

  const tex = new THREE.CanvasTexture(labelCanvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const label = new THREE.MeshPhysicalMaterial({ map: tex, metalness: 0.45, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 });
  // thetaStart = π: el centro de la textura (u = 0.5) mira a la cámara.
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, BODY, 96, 1, true, Math.PI, Math.PI * 2), label);
  group.add(body);

  // Hombro, cuello y borde superior; base con domo.
  const top = [[R, TOP], [R - 0.004, TOP + 0.02], [R - 0.03, TOP + 0.06], [R - 0.04, TOP + 0.075], [R - 0.038, TOP + 0.085], [R - 0.045, TOP + 0.088], [R - 0.05, TOP + 0.072], [0, TOP + 0.07]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  group.add(new THREE.Mesh(new THREE.LatheGeometry(top, 96), metal));
  const bot = [[0, BOT - 0.02], [R - 0.06, BOT - 0.035], [R - 0.045, BOT - 0.075], [R - 0.03, BOT - 0.07], [R - 0.008, BOT - 0.03], [R, BOT]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  group.add(new THREE.Mesh(new THREE.LatheGeometry(bot, 96), metal));

  // Anilla.
  const tab = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 12, 40), metal);
  tab.rotation.x = -Math.PI / 2; tab.scale.set(1, 1.5, 1); tab.position.set(0, TOP + 0.078, 0.03);
  group.add(tab);

  // Centrado en altura total ≈ 1 unidad.
  group.children.forEach((m) => (m.position.y -= 0.0));
  const outer = new THREE.Group();
  outer.add(group);
  group.scale.setScalar(1 / (BODY + 0.16));

  outer.setLabel = (c) => { tex.image = c; tex.needsUpdate = true; };
  outer.dispose = () => { tex.dispose(); label.dispose(); metal.dispose(); };
  return outer;
}
