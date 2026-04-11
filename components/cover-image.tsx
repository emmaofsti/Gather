"use client";
import { useState, useRef, useEffect } from "react";

export function CoverImage({ src }: { src: string }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true);
  }, []);
  return (
    <>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-bg2" />}
      <img
        ref={imgRef}
        src={src}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        alt=""
      />
    </>
  );
}
