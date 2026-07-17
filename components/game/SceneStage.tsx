"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TokenAvatar } from "@/components/ui/TokenAvatar";
import type { Scene, Token } from "@/lib/types/database.types";

interface SceneStageProps {
  scene: Scene | null;
  tokens: Token[];
  canMove: (t: Token) => boolean;
  onPersist: (id: string, x: number, y: number) => void;
}

interface LocalPos {
  id: string;
  x: number;
  y: number;
}

/** Palco: o mapa de fundo e os tokens-moeda arrastáveis. */
export function SceneStage({
  scene,
  tokens,
  canMove,
  onPersist,
}: SceneStageProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<LocalPos | null>(null);
  const lastWrite = useRef(0);

  const posFromEvent = useCallback((clientX: number, clientY: number) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
    };
  }, []);

  useEffect(() => {
    if (!drag) return;
    const id = drag.id;

    function onMove(e: PointerEvent) {
      const p = posFromEvent(e.clientX, e.clientY);
      if (!p) return;
      setDrag((d) => (d ? { ...d, x: p.x, y: p.y } : d));
      const now = Date.now();
      if (now - lastWrite.current > 90) {
        lastWrite.current = now;
        onPersist(id, p.x, p.y);
      }
    }
    function onUp(e: PointerEvent) {
      const p = posFromEvent(e.clientX, e.clientY);
      if (p) onPersist(id, p.x, p.y);
      setDrag(null);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, posFromEvent, onPersist]);

  if (!scene) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-text-muted">
        Nenhuma cena ativa.
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="relative h-full w-full select-none overflow-hidden bg-black/40"
      style={{
        backgroundImage: scene.map_image_url
          ? `url(${scene.map_image_url})`
          : undefined,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        touchAction: "none",
      }}
    >
      {!scene.map_image_url && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-text-muted">
          Esta cena ainda não tem mapa.
        </div>
      )}
      {tokens.map((t) => {
        const pos = drag && drag.id === t.id ? drag : { x: t.x, y: t.y };
        const movable = canMove(t);
        return (
          <div
            key={t.id}
            onPointerDown={(e) => {
              if (!movable) return;
              e.preventDefault();
              setDrag({ id: t.id, x: t.x, y: t.y });
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 ${
              movable ? "cursor-grab active:cursor-grabbing" : "cursor-default"
            }`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, touchAction: "none" }}
            title={t.name}
          >
            <TokenAvatar
              name={t.name}
              imageUrl={t.image_url}
              color={t.color}
              size={t.size}
            />
            {t.name && (
              <span className="pointer-events-none absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                {t.name}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
