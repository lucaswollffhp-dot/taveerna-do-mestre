import {
  Activity,
  ArrowLeft,
  BookOpen,
  Castle,
  CheckSquare,
  Coins,
  Construction,
  Dices,
  Eye,
  EyeOff,
  Flag,
  Gift,
  Inbox,
  LayoutDashboard,
  Lock,
  LogIn,
  LogOut,
  Map,
  MapPin,
  Plus,
  ScrollText,
  Shield,
  Sparkles,
  Square,
  Swords,
  UserPlus,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Vocabulário de ícones da aplicação. Os componentes referenciam ícones por
 * nome semântico (ex.: `name="npcs"`), não pelo ícone concreto — assim o
 * conjunto visual fica centralizado, como `labels.ts` faz com os textos.
 */
export type IconName =
  | "overview"
  | "campaign"
  | "sessions"
  | "live"
  | "npcs"
  | "locations"
  | "factions"
  | "quests"
  | "loot"
  | "ai"
  | "character"
  | "dice"
  | "brand"
  | "back"
  | "private"
  | "empty"
  | "add"
  | "remove"
  | "visible"
  | "hidden"
  | "login"
  | "register"
  | "logout"
  | "construction"
  | "checkDone"
  | "checkTodo"
  | "gold"
  | "xp"
  | "reward"
  | "pin";

const icons: Record<IconName, LucideIcon> = {
  overview: LayoutDashboard,
  campaign: Castle,
  sessions: BookOpen,
  live: Activity,
  npcs: Users,
  locations: Map,
  factions: Flag,
  quests: ScrollText,
  loot: Coins,
  ai: Sparkles,
  character: Shield,
  dice: Dices,
  brand: Swords,
  back: ArrowLeft,
  private: Lock,
  empty: Inbox,
  add: Plus,
  remove: X,
  visible: Eye,
  hidden: EyeOff,
  login: LogIn,
  register: UserPlus,
  logout: LogOut,
  construction: Construction,
  checkDone: CheckSquare,
  checkTodo: Square,
  gold: Coins,
  xp: Zap,
  reward: Gift,
  pin: MapPin,
};

interface IconProps {
  name: IconName;
  /** Tamanho em px (largura = altura). Padrão 20. */
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 2,
}: IconProps) {
  const Component = icons[name];
  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden
    />
  );
}
