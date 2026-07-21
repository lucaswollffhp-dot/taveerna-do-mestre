interface TokenAvatarProps {
  name: string;
  imageUrl?: string | null;
  /** Diâmetro em px. */
  size?: number;
  /** Cor de fundo do fallback (moeda com inicial). */
  color?: string;
  className?: string;
  /** Destaque (ex.: token do turno atual no combate). */
  highlight?: boolean;
}

/**
 * Token em forma de moeda: mostra a imagem (PNG) quando existe, ou uma
 * moeda colorida com a inicial do nome como fallback.
 */
export function TokenAvatar({
  name,
  imageUrl,
  size = 40,
  color = "#8b1a1a",
  className = "",
  highlight = false,
}: TokenAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 shadow ${
        highlight
          ? "border-accent shadow-[0_0_0_3px_rgba(212,163,31,.6)]"
          : "border-black/40"
      } ${className}`}
      style={{ width: size, height: size, background: imageUrl ? undefined : color }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <span
          className="font-title font-semibold text-white"
          style={{ fontSize: Math.max(11, size * 0.42) }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
