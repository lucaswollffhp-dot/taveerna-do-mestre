"use client";

import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="ghost" size="sm">
        Sair
      </Button>
    </form>
  );
}
