"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });

function runWhenIdle(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const idleWindow = window as Window & typeof globalThis & {
    requestIdleCallback?: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (idleWindow.requestIdleCallback) {
    const id = idleWindow.requestIdleCallback(callback, { timeout: 2500 });
    return () => idleWindow.cancelIdleCallback?.(id);
  }

  const timeout = globalThis.setTimeout(callback, 1800);
  return () => globalThis.clearTimeout(timeout);
}

export default function DeferredCommandPalette() {
  const [ready, setReady] = useState(false);

  useEffect(() => runWhenIdle(() => setReady(true)), []);

  return ready ? <CommandPalette /> : null;
}
