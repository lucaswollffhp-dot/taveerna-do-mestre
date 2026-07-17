import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { CharacterForm } from "../../CharacterForm";
import { updateCharacter } from "../../actions";
import type { Character } from "@/lib/types/database.types";

export default async function EditCharacterPage({
  params,
}: {
  params: { id: string; charId: string };
}) {
  const supabase = await createClient();
  const [{ data: character }, { data: auth }] = await Promise.all([
    supabase.from("characters").select("*").eq("id", params.charId).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!character) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Editar personagem"
        icon="character"
        backHref={`/campaign/${params.id}/characters/${params.charId}`}
        backLabel={(character as Character).name}
      />
      <CharacterForm
        campaignId={params.id}
        currentUserId={auth.user!.id}
        action={updateCharacter}
        character={character as Character}
      />
    </main>
  );
}
