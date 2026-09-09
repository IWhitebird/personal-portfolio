"use client";

/* eslint-disable @typescript-eslint/no-explicit-any -- three@0.122 (spherethree) is untyped */

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { spring, value } from "popmotion";
import {
  AmbientLight,
  DirectionalLight,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  SphereBufferGeometry,
  UniformsLib,
  UniformsUtils,
  WebGLRenderer,
  sRGBEncoding,
} from "spherethree";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWindowSize } from "@/hooks/useWindowSize";
import { cleanRenderer, cleanScene, removeLights } from "@/lib/three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

const BREAKPOINTS = { mobile: 696, tablet: 1024 };

// Where the sphere ends up at the bottom of the page, relative to its resting
// spot. The canvas is fixed to the viewport, so this reads as one slow travel
// across the whole scroll rather than a flick that ends with the hero.
const SCROLL_TRAVEL = { y: -34, z: -10 };
const SCROLL_EASE = 0.06;

// One sweep, never a wobble: the sphere starts at its resting offset on the
// right and ends mirrored on the left at the bottom of the page. Expressed as a
// multiple of the resting offset so it scales with the per-breakpoint start.
const SWEEP_TO = -1;

// Dim once the hero is behind us so section text stays readable over it.
const FADE_START = 0.04;
const FADE_END = 0.22;
const FADE_TO = 0.4;
const ENTRANCE_MS = 1400;

function applyScroll(mesh: any, [x, y]: [number, number], progress: number): void {
  const sweep = x * (1 + (SWEEP_TO - 1) * progress);
  mesh.position.set(sweep, y + SCROLL_TRAVEL.y * progress, SCROLL_TRAVEL.z * progress);
}

/** 1 through the hero, easing to FADE_TO past it. */
function scrollFade(progress: number): number {
  const t = Math.min(1, Math.max(0, (progress - FADE_START) / (FADE_END - FADE_START)));
  return 1 - (1 - FADE_TO) * t;
}

/**
 * Noise-displaced Phong sphere on a transparent canvas fixed to the viewport, so
 * it travels behind the whole page as you scroll instead of vanishing with the
 * hero. Renders a single frame when motion is reduced and pauses when the tab is
 * hidden. Opacity is driven per frame rather than through React, so scrolling
 * never triggers a re-render.
 */
export default function DisplacementSphere() {
  const { resolvedTheme } = useTheme();
  const reduceMotion = usePrefersReducedMotion();
  const { width, height } = useWindowSize();

  // Softer on the light background, where the Phong highlights otherwise wash out.
  const maxOpacity = resolvedTheme === "light" ? 0.5 : 0.95;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<any>(null);
  const camera = useRef<any>(null);
  const scene = useRef<any>(null);
  const sphere = useRef<any>(null);
  const uniforms = useRef<any>(null);
  const lights = useRef<any[]>([]);
  const rotationSpring = useRef<any>(null);
  const activeTween = useRef<any>(null);
  const start = useRef(0);
  const basePosition = useRef<[number, number]>([22, 16]);
  const scrollTarget = useRef(0);
  const scrollEased = useRef(0);

  // Scene setup once.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderer.current = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.current.setPixelRatio(1);
    renderer.current.setClearColor(0x000000, 0);
    renderer.current.outputEncoding = sRGBEncoding;

    camera.current = new PerspectiveCamera(54, 1, 0.1, 100);
    camera.current.position.z = 52;
    scene.current = new Scene();

    const material = new MeshPhongMaterial();
    material.onBeforeCompile = (shader: any) => {
      uniforms.current = UniformsUtils.merge([
        UniformsLib.ambient,
        UniformsLib.lights,
        shader.uniforms,
        { time: { type: "f", value: 0 } },
      ]);
      shader.uniforms = uniforms.current;
      shader.vertexShader = vertexShader;
      shader.fragmentShader = fragmentShader;
    };

    const geometry = new SphereBufferGeometry(32, 128, 128);
    sphere.current = new Mesh(geometry, material);
    scene.current.add(sphere.current);

    // No visibility observer: the canvas is fixed to the viewport, so it is always
    // on screen. The render loop pauses on `document.hidden` instead.

    return () => {
      activeTween.current?.stop?.();
      cleanScene(scene.current);
      cleanRenderer(renderer.current);
      renderer.current = null;
      scene.current = null;
      sphere.current = null;
      uniforms.current = null;
    };
  }, []);

  // Lights follow the theme.
  useEffect(() => {
    if (!scene.current) return;
    const dark = resolvedTheme !== "light";
    const dirLight = new DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(100, 100, 200);
    const ambientLight = new AmbientLight(0xffffff, dark ? 0.1 : 0.8);
    lights.current = [dirLight, ambientLight];
    lights.current.forEach((l) => scene.current.add(l));
    return () => removeLights(lights.current);
  }, [resolvedTheme]);

  // Size and resting placement. Scroll offsets are applied per frame from here.
  useEffect(() => {
    if (!renderer.current || !camera.current || !sphere.current || width === 0) return;
    renderer.current.setSize(width, height);
    camera.current.aspect = width / height;
    camera.current.updateProjectionMatrix();

    if (width <= BREAKPOINTS.mobile) basePosition.current = [14, 10];
    else if (width <= BREAKPOINTS.tablet) basePosition.current = [18, 14];
    else basePosition.current = [22, 16];

    applyScroll(sphere.current, basePosition.current, scrollEased.current);
    if (reduceMotion) renderer.current.render(scene.current, camera.current);
  }, [width, height, reduceMotion]);

  // Whole-page scroll progress, read passively and eased in the render loop.
  useEffect(() => {
    const read = () => {
      const span = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget.current = span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0;
    };
    read();
    if (reduceMotion) {
      scrollEased.current = scrollTarget.current;
      return;
    }
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read, { passive: true });
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [reduceMotion]);

  // Pointer parallax, spring-damped.
  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (event: MouseEvent) => {
      const rotation = sphere.current?.rotation;
      if (!rotation) return;
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      if (!rotationSpring.current) {
        rotationSpring.current = value(rotation.toArray(), (values: number[]) =>
          rotation.set(values[0], values[1], sphere.current.rotation.z),
        );
      }
      activeTween.current = spring({
        from: rotationSpring.current.get(),
        to: [y / 2, x / 2],
        stiffness: 30,
        damping: 20,
        velocity: rotationSpring.current.getVelocity(),
        mass: 2,
        restSpeed: 0.0001,
      }).start(rotationSpring.current);
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      activeTween.current?.stop?.();
    };
  }, [reduceMotion]);

  // Render loop.
  useEffect(() => {
    if (!renderer.current || !sphere.current) return;
    if (!start.current) start.current = Date.now();
    let frame = 0;
    let hidden = document.hidden;

    const paint = (entrance: number) => {
      const canvas = canvasRef.current;
      if (canvas) canvas.style.opacity = String(entrance * maxOpacity * scrollFade(scrollEased.current));
      renderer.current.render(scene.current, camera.current);
    };

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const elapsed = Date.now() - start.current;
      if (uniforms.current) uniforms.current.time.value = 0.00005 * elapsed;
      scrollEased.current += (scrollTarget.current - scrollEased.current) * SCROLL_EASE;
      applyScroll(sphere.current, basePosition.current, scrollEased.current);
      sphere.current.rotation.z += 0.001;
      // Ease the fade-in out of the same clock the noise uses.
      const t = Math.min(1, elapsed / ENTRANCE_MS);
      paint(1 - (1 - t) ** 3);
    };

    const onVisibility = () => {
      hidden = document.hidden;
      if (hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (!frame && !reduceMotion) {
        animate();
      }
    };

    if (!reduceMotion && !hidden) animate();
    else paint(1);

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(frame);
    };
  }, [reduceMotion, maxOpacity]);

  return <canvas ref={canvasRef} aria-hidden className="block h-full w-full" style={{ opacity: 0 }} />;
}
