// Sonido ambiente opcional generado con Web Audio, sin archivos (patrón del brief NOCTURNAL): zumbido grave de
// fluorescente + "respiración" de ruido filtrado, y un golpe para momentos de quiebre.
// Siempre opt-in (un botón con aria-pressed), nunca autoplay.
export function createAmbient({ hum = 60, volume = 0.9 } = {}) {
  let ac = null, master = null;
  function build() {
    ac = new AudioContext();
    master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
    const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = hum;
    const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 180;
    const g = ac.createGain(); g.gain.value = 0.05;
    o.connect(f).connect(g).connect(master); o.start();
    const buf = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
    const n = ac.createBufferSource(); n.buffer = buf; n.loop = true;
    const nf = ac.createBiquadFilter(); nf.type = "bandpass"; nf.frequency.value = 400; nf.Q.value = 0.6;
    const ng = ac.createGain(); ng.gain.value = 0.04;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.12;
    const lg = ac.createGain(); lg.gain.value = 0.035;
    lfo.connect(lg).connect(ng.gain); lfo.start();
    n.connect(nf).connect(ng).connect(master); n.start();
  }
  return {
    on() { if (!ac) build(); else ac.resume(); master.gain.linearRampToValueAtTime(volume, ac.currentTime + 2); },
    off() { if (!ac) return; master.gain.linearRampToValueAtTime(0, ac.currentTime + 0.6); setTimeout(() => ac.suspend(), 700); },
    hit() {
      if (!ac || ac.state !== "running") return;
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(70, ac.currentTime); o.frequency.exponentialRampToValueAtTime(30, ac.currentTime + 1.2);
      g.gain.setValueAtTime(0.6, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.4);
      o.connect(g).connect(master); o.start(); o.stop(ac.currentTime + 1.5);
    },
  };
}
