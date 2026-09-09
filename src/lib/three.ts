/* eslint-disable @typescript-eslint/no-explicit-any -- three@0.122 (aliased as spherethree) ships no types */

/** Dispose every mesh geometry and material in a scene. */
export function cleanScene(scene: any): void {
  scene?.traverse?.((object: any) => {
    if (!object.isMesh) return;
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) cleanMaterial(material);
  });
}

/** Dispose a material and any texture-like values hanging off it. */
export function cleanMaterial(material: any): void {
  material?.dispose?.();
  for (const key of Object.keys(material ?? {})) {
    const value = material[key];
    if (value && typeof value === "object" && "minFilter" in value) value.dispose?.();
  }
}

/**
 * Release a renderer's GL resources.
 *
 * Deliberately no `forceContextLoss()`: that permanently kills the context of
 * the canvas element, and `getContext()` keeps handing the dead one back. With
 * `reactStrictMode` remounting effects in development, the next mount would
 * then build a renderer on a lost context — which is how three@0.122 ends up
 * reading `gl.getShaderPrecisionFormat(...).precision` off null.
 */
export function cleanRenderer(renderer: any): void {
  renderer?.dispose?.();
}

export function removeLights(lights: any[]): void {
  for (const light of lights) light.parent?.remove(light);
}

/** "10 15 20" → [0.039, 0.058, 0.078] for three's Color constructor */
export function rgbToThreeColor(rgb: string): number[] {
  return rgb.split(" ").map((v) => Number(v) / 255);
}
