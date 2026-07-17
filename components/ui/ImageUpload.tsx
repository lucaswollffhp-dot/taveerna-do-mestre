"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "./Icon";

interface ImageUploadProps {
  /** Nome do input oculto que carrega a URL final para o Server Action. */
  name: string;
  campaignId: string;
  /** Pasta no bucket: "tokens", "maps"… */
  folder: string;
  defaultUrl?: string | null;
  label?: string;
  hint?: string;
  required?: boolean;
  shape?: "circle" | "rect";
}

export function ImageUpload({
  name,
  campaignId,
  folder,
  defaultUrl,
  label,
  hint,
  required,
  shape = "circle",
}: ImageUploadProps) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `campaigns/${campaignId}/${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("assets")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("assets").getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch {
      setError("Falha ao enviar a imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  const previewShape = shape === "circle" ? "rounded-full" : "rounded-md";

  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center gap-1 text-sm font-medium text-text-secondary">
          {label}
          {required && <span className="text-primary">*</span>}
        </div>
      )}
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-border bg-surface-raised ${previewShape}`}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="Prévia do token"
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon name="empty" size={22} className="text-text-muted" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-accent/50 hover:text-text disabled:opacity-50"
          >
            <Icon name="add" size={14} />
            {uploading ? "Enviando…" : url ? "Trocar imagem" : "Enviar imagem"}
          </button>
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="w-fit text-xs text-text-muted hover:text-primary"
            >
              Remover
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFile}
          className="hidden"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}
