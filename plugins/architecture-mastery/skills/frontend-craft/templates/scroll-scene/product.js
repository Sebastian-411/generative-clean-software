// Adaptador del producto: lo único que cambia por proyecto (además de tokens, planos y copy).
// Devuelve { object, select?(variante), degrade?() }.
// Modelo: "Car Concept", glTF Sample Assets (Khronos Group), CC BY 4.0. Sin marcas de terceros.
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { fitObject } from "./scene.js";
import { createVariants } from "./variants.js";

export async function loadProduct({ manager }) {
  const draco = new DRACOLoader(manager).setDecoderPath("draco/");
  const gltf = await new GLTFLoader(manager).setDRACOLoader(draco).loadAsync("models/car.glb");
  const car = gltf.scene;
  car.traverse((o) => {
    if (o.name === "License_Plate") o.visible = false; // placa con marca del repositorio de muestra
    if (o.isMesh) o.material.envMapIntensity = 1.2;
    // El flanco del neumático trae rotulado de marca: goma lisa.
    if (o.isMesh && /tire/i.test(o.material.name)) { o.material.map = null; o.material.color.set(0x111111); o.material.needsUpdate = true; }
  });
  // La caja del modelo trae geometría suelta: se mide solo la carrocería.
  fitObject(car, { size: 4.6, measure: (m) => m.name.startsWith("Body") });
  const variants = createVariants(gltf);
  const transmissive = [];
  car.traverse((o) => o.isMesh && o.material.transmission > 0 && transmissive.push(o.material));
  return {
    object: car,
    variants: variants.names,
    select: variants.select,
    degrade() { transmissive.forEach((m) => { m.transmission = 0; m.opacity = 0.6; m.transparent = true; m.needsUpdate = true; }); },
  };
}
