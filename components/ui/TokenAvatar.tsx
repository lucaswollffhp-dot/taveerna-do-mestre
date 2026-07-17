interface TokenAvatarProps {
  name: string;
  imageUrl?: string | null;
  /** Diâmetro em px. */
  size?: number;
  /** Cor de fundo do fallback (moeda com inicial). */
  color?: string;
  className?: string;
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
}: TokenAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-black/40 shadow ${className}`}
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
