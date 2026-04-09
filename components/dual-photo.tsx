"use client";
import { useState } from "react";

export function DualPhoto({
  main,
  secondary,
  swappable = false,
  size = "small",
}: {
  main: string;
  secondary?: string | null;
  swappable?: boolean;
  size?: "small" | "large";
}) {
  const [swapped, setSwapped] = useState(false);
  const big = swapped && secondary ? secondary : main;
  const small = swapped && secondary ? main : secondary;

  return (
    <div className="relative h-full w-full">
      <img src={big} className="h-full w-full object-cover" alt="" />
      {small && (
        <button
          type="button"
          onClick={(e) => {
            if (!swappable) return;
            e.stopPropagation();
            setSwapped((v) => !v);
          }}
          className={`absolute overflow-hidden border-2 border-white shadow-lg ${
            size === "large"
              ? "left-4 top-4 h-40 w-32 rounded-2xl"
              : "left-1.5 top-1.5 h-12 w-9 rounded-md"
          } ${swappable ? "cursor-pointer active:scale-95" : "pointer-events-none"}`}
        >
          <img src={small} className="h-full w-full object-cover" alt="" />
        </button>
      )}
    </div>
  );
}
