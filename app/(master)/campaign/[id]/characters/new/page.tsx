import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { CharacterForm } from "../CharacterForm";
import { createCharacter } from "../actions";

export default async function NewCharacterPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Novo personagem"
        icon="character"
        backHref={`/campaign/${params.id}/characters`}
        backLabel="Personagens"
      />
      <CharacterForm
        campaignId={params.id}
        currentUserId={user!.id}
        action={createCharacter}
      />
    </main>
  );
}
