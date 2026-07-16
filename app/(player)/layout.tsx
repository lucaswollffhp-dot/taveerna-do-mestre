import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/shared/Header";

export default async function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userLabel =
    (user.user_metadata?.display_name as string | undefined) ?? user.email;

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        userLabel={userLabel}
        homeHref="/play"
        altArea={{ href: "/dashboard", label: "Modo Mestre" }}
      />
      {children}
    </div>
  );
}
