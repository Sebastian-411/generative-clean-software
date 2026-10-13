// CameraRig — un plano por acto { pos, look, color? }.
// La cámara ORBITA entre planos (interpolación esférica alrededor del punto de mira),
// así nunca atraviesa el modelo. Cada acto "sostiene" su plano y luego hay un movimiento
// de cámara con ease (cine), en vez de un deslizamiento continuo.
import * as THREE from "three";

export function createCameraRig(camera, shots, { reduce = false, hold = 0.35, parallax = [0.25, 0.12] } = {}) {
  const v = (a) => new THREE.Vector3(...a);
  const keys = shots.map((s) => {
    const look = v(s.look);
    const sph = new THREE.Spherical().setFromVector3(v(s.pos).sub(look));
    return { look, sph, color: s.color ? new THREE.Color(s.color) : null };
  });
  // Ángulo azimutal sin saltos: siempre el camino corto.
  for (let i = 1; i < keys.length; i++) {
    let d = keys[i].sph.theta - keys[i - 1].sph.theta;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    keys[i].sph.theta = keys[i - 1].sph.theta + d;
  }
  // stops[i] = progreso de scroll donde el acto i está centrado (por defecto, repartido parejo).
  let stops = keys.map((_, i) => i / (keys.length - 1));

  // progress = lo que pide el scroll; eased = lo que la cámara muestra.
  // Se amortigua el PROGRESO (no la posición): la cámara siempre está sobre la órbita,
  // nunca corta en línea recta a través del modelo cuando el scroll salta.
  const state = { progress: 0, eased: 0, pointerX: 0, pointerY: 0 };
  const pointer = new THREE.Vector2();
  const sph = new THREE.Spherical();
  const look = new THREE.Vector3();
  const pos = new THREE.Vector3();
  const color = new THREE.Color();
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function segment(p) {
    p = THREE.MathUtils.clamp(p, 0, 1);
    let i = 0;
    while (i < stops.length - 2 && p > stops[i + 1]) i++;
    const span = stops[i + 1] - stops[i] || 1;
    let t = (p - stops[i]) / span;
    // Sostén: el plano se queda quieto al inicio y al final de cada tramo.
    t = THREE.MathUtils.clamp((t - hold / 2) / (1 - hold), 0, 1);
    return [i, ease(t)];
  }

  return {
    state,
    setStops(s) { if (s.length === keys.length) stops = s; },
    update(dt) {
      state.eased = reduce ? state.progress
        : THREE.MathUtils.lerp(state.eased, state.progress, 1 - Math.pow(0.004, dt));
      const [i, t] = segment(state.eased);
      const a = keys[i], b = keys[i + 1];
      // En vertical el campo horizontal es estrecho: la cámara se aleja para que el objeto quepa.
      const fit = camera.aspect < 1 ? Math.min(1.8, 0.7 / camera.aspect) : 1;
      sph.radius = THREE.MathUtils.lerp(a.sph.radius, b.sph.radius, t) * fit;
      sph.phi = THREE.MathUtils.lerp(a.sph.phi, b.sph.phi, t);
      sph.theta = THREE.MathUtils.lerp(a.sph.theta, b.sph.theta, t);
      look.lerpVectors(a.look, b.look, t);
      pos.setFromSpherical(sph).add(look);
      pointer.lerp({ x: state.pointerX, y: state.pointerY }, 1 - Math.pow(0.05, dt));
      pos.x += pointer.x * parallax[0];
      pos.y += pointer.y * parallax[1];
      camera.position.copy(pos);
      camera.lookAt(look);
    },
    // Color interpolado entre actos (pintura, luces…), con el mismo ritmo que la cámara.
    colorAt(p = state.eased) {
      const [i, t] = segment(p);
      return color.copy(keys[i].color).lerp(keys[i + 1].color, t);
    },
  };
}
