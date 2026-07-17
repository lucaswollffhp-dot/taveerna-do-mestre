import { Icon } from "@/components/ui/Icon";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="mb-3 flex h-14 w-14 items-center justify-center
              rounded-xl border border-accent/30 bg-surface text-accent"
          >
            <Icon name="brand" size={28} />
          </div>
          <h1 className="font-title text-3xl font-bold text-accent">
            Taverna do Mestre
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Planeje e conduza suas campanhas de RPG
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
