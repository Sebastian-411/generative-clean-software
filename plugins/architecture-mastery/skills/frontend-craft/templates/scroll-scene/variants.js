// Variantes de material glTF (KHR_materials_variants): el configurador cambia materiales reales
// del modelo (pintura, correa, colorway), no un tinte encima.
// Uso: const v = createVariants(gltf); v.names → ["…"]; await v.select("Midnight Gold");
export function createVariants(gltf) {
  const ext = gltf.userData?.gltfExtensions?.KHR_materials_variants;
  const names = ext ? ext.variants.map((v) => v.name) : [];
  const parser = gltf.parser;

  async function select(name) {
    const index = names.indexOf(name);
    const jobs = [];
    gltf.scene.traverse((o) => {
      const data = o.userData?.gltfExtensions?.KHR_materials_variants;
      if (!o.material || !data) return;
      o.userData.originalMaterial ??= o.material;
      const mapping = data.mappings.find((m) => m.variants.includes(index));
      if (!mapping) { o.material = o.userData.originalMaterial; return; }
      jobs.push(parser.getDependency("material", mapping.material).then((mat) => {
        o.material = mat;
        parser.assignFinalMaterial(o);
      }));
    });
    await Promise.all(jobs);
  }

  return { names, select };
}
