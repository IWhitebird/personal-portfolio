"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const DisplacementSphere = dynamic(() => import("./DisplacementSphere"), { ssr: false });

/**
 * Mounts the WebGL sphere only after the browser is idle so the hero text and
 * fonts win the first paint. Fixed to the viewport and behind every section, so
 * the sphere travels with the scroll instead of leaving with the hero.
 */
export function SphereBackground() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(() => setReady(true), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      {ready ? <DisplacementSphere /> : null}
    </div>
  );
}
