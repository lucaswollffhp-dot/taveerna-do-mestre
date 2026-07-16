export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-2 text-4xl" aria-hidden>
            ⚔️
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
