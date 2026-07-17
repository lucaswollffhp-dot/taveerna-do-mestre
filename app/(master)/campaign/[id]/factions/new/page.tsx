import { PageHeader } from "@/components/ui/PageHeader";
import { FactionForm } from "../FactionForm";
import { createFaction } from "../actions";

export default function NewFactionPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="Nova facção"
        icon="factions"
        backHref={`/campaign/${params.id}/factions`}
        backLabel="Facções"
      />
      <FactionForm campaignId={params.id} action={createFaction} />
    </main>
  );
}
