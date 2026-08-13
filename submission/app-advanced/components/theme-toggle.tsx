"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

// next-themes only knows the real theme after client mount (it reads
// localStorage). Using useSyncExternalStore avoids the "setState inside an
// effect" pattern the React Compiler eslint rule flags, while still avoiding
// a hydration mismatch.
function useMounted() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) return <Button variant="ghost" size="icon" aria-label="Toggle theme" />;

  const isDark = resolvedTheme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? "☀" : "☾"}
    </Button>
  );
}
