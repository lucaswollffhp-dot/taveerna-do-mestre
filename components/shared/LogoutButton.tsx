"use client";

import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="ghost" size="sm">
        <Icon name="logout" size={15} />
        Sair
      </Button>
    </form>
  );
}
