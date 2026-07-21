"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TokenAvatar } from "@/components/ui/TokenAvatar";
import { Icon } from "@/components/ui/Icon";
import type { Scene, Token } from "@/lib/types/database.types";

interface FogRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SceneStageProps {
  scene: Scene | null;
  tokens: Token[];
  canMove: (t: Token) => boolean;
  onPersist: (id: string, x: number, y: number) => void;
  isMaster?: boolean;
  /** Modo de pintar névoa (revelar áreas) — só faz sentido no Mestre. */
  fogMode?: boolean;
  onRevealRect?: (rect: FogRect) => void;
  /** Combatente do turno atual — destaca o token correspondente. */
  activeMatch?: { characterId: string | null; name: string } | null;
}

interface LocalPos {
  id: string;
  x: number;
  y: number;
}

function parseFog(raw: unknown): FogRect[] {
  return Array.isArray(raw) ? (raw as FogRect[]) : [];
}

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 4;

/** Palco: mapa com pan/zoom e tokens-moeda arrastáveis em tempo real. */
export function SceneStage({
  scene,
  tokens,
  canMove,
  onPersist,
  isMaster = false,
  fogMode = false,
  onRevealRect,
  activeMatch = null,
}: SceneStageProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const [drag, setDrag] = useState<LocalPos | null>(null);
  const [panning, setPanning] = useState(false);
  const [fogDraw, setFogDraw] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const lastWrite = useRef(0);

  // ── Arraste de token (coordenadas relativas ao "mundo" transformado) ──
  const posFromEvent = useCallback((clientX: number, clientY: number) => {
    const rect = worldRef.current?.getBoundingClientRect();
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

  // ── Pan (arrastar o fundo) ──
  useEffect(() => {
    if (!panning) return;
    function onMove(e: PointerEvent) {
      const p = panRef.current;
      if (!p) return;
      setPan({ x: p.ox + (e.clientX - p.startX), y: p.oy + (e.clientY - p.startY) });
    }
    function onUp() {
      panRef.current = null;
      setPanning(false);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [panning]);

  // ── Desenho de névoa (revelar retângulo) ──
  useEffect(() => {
    if (!fogDraw) return;
    function onMove(e: PointerEvent) {
      const p = posFromEvent(e.clientX, e.clientY);
      if (!p) return;
      setFogDraw((d) => (d ? { ...d, x1: p.x, y1: p.y } : d));
    }
    function onUp() {
      setFogDraw((d) => {
        if (d && onRevealRect) {
          const x = Math.min(d.x0, d.x1);
          const y = Math.min(d.y0, d.y1);
          const w = Math.abs(d.x1 - d.x0);
          const h = Math.abs(d.y1 - d.y0);
          if (w > 1 && h > 1) onRevealRect({ x, y, w, h });
        }
        return null;
      });
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [fogDraw, posFromEvent, onRevealRect]);

  function startPan(e: React.PointerEvent) {
    // só o botão esquerdo / toque, e apenas no fundo (não em token)
    panRef.current = { startX: e.clientX, startY: e.clientY, ox: pan.x, oy: pan.y };
    setPanning(true);
  }

  // ── Zoom (scroll), mantendo o ponto sob o cursor ──
  function onWheel(e: React.WheelEvent) {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * factor));
    const k = next / zoom;
    setPan((p) => ({ x: cx - (cx - p.x) * k, y: cy - (cy - p.y) * k }));
    setZoom(next);
  }

  function zoomBy(factor: number) {
    const rect = viewportRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 0;
    const cy = rect ? rect.height / 2 : 0;
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * factor));
    const k = next / zoom;
    setPan((p) => ({ x: cx - (cx - p.x) * k, y: cy - (cy - p.y) * k }));
    setZoom(next);
  }

  function reset() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  if (!scene) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-text-muted">
        Nenhuma cena ativa.
      </div>
    );
  }

  const gridStyle =
    scene.grid_enabled && scene.grid_size > 0
      ? {
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.12) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,.12) 1px, transparent 1px)",
          backgroundSize: `${scene.grid_size}px ${scene.grid_size}px`,
        }
      : undefined;

  const revealed = parseFog(scene.fog_revealed);
  const showFog = scene.fog_enabled;
  // Jogador: névoa opaca. Mestre: névoa translúcida (enxerga por baixo).
  const fogOpacity = isMaster ? 0.5 : 1;

  function startFogDraw(e: React.PointerEvent) {
    const p = posFromEvent(e.clientX, e.clientY);
    if (!p) return;
    setFogDraw({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
  }

  return (
    <div
      ref={viewportRef}
      onWheel={onWheel}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget || e.target === worldRef.current) {
          if (fogMode && isMaster) startFogDraw(e);
          else startPan(e);
        }
      }}
      className={`relative h-full w-full overflow-hidden bg-black/50 ${
        fogMode ? "cursor-crosshair" : panning ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{ touchAction: "none" }}
    >
      <div
        ref={worldRef}
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          backgroundImage: scene.map_image_url
            ? `url(${scene.map_image_url})`
            : undefined,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {gridStyle && <div className="pointer-events-none absolute inset-0" style={gridStyle} />}
        {tokens.map((t) => {
          const pos = drag && drag.id === t.id ? drag : { x: t.x, y: t.y };
          const movable = canMove(t);
          const isActive = Boolean(
            activeMatch &&
              ((t.ref_id && t.ref_id === activeMatch.characterId) ||
                (!!t.name && t.name === activeMatch.name)),
          );
          return (
            <div
              key={t.id}
              onPointerDown={(e) => {
                e.stopPropagation();
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
                highlight={isActive}
              />
              {t.name && (
                <span className="pointer-events-none absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                  {t.name}
                </span>
              )}
            </div>
          );
        })}

        {/* Névoa de guerra */}
        {showFog && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <mask id={`fog-${scene.id}`}>
                <rect x="0" y="0" width="100" height="100" fill="white" />
                {revealed.map((r, i) => (
                  <rect
                    key={i}
                    x={r.x}
                    y={r.y}
                    width={r.w}
                    height={r.h}
                    fill="black"
                  />
                ))}
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100"
              height="100"
              fill="black"
              fillOpacity={fogOpacity}
              mask={`url(#fog-${scene.id})`}
            />
          </svg>
        )}

        {/* Prévia do retângulo sendo revelado */}
        {fogDraw && (
          <div
            className="pointer-events-none absolute border-2 border-accent bg-accent/20"
            style={{
              left: `${Math.min(fogDraw.x0, fogDraw.x1)}%`,
              top: `${Math.min(fogDraw.y0, fogDraw.y1)}%`,
              width: `${Math.abs(fogDraw.x1 - fogDraw.x0)}%`,
              height: `${Math.abs(fogDraw.y1 - fogDraw.y0)}%`,
            }}
          />
        )}
      </div>

      {!scene.map_image_url && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-text-muted">
          Esta cena ainda não tem mapa.
        </div>
      )}

      {/* Controles de zoom */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md border border-border bg-surface/90 p-1 text-text-secondary backdrop-blur">
        <button
          onClick={() => zoomBy(1 / 1.2)}
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-surface-raised hover:text-text"
          aria-label="Diminuir zoom"
        >
          −
        </button>
        <span className="w-10 text-center text-xs">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => zoomBy(1.2)}
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-surface-raised hover:text-text"
          aria-label="Aumentar zoom"
        >
          +
        </button>
        <button
          onClick={reset}
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-surface-raised hover:text-text"
          aria-label="Centralizar"
          title="Centralizar"
        >
          <Icon name="pin" size={14} />
        </button>
      </div>
    </div>
  );
}
