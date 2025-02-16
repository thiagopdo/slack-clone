import { BellIcon, Home, MessagesSquare, MoreHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";

import UserButton from "@/features/auth/components/user-button";

import { SidebarButton } from "./sidebar-button";
import { WorkspaceSwitcher } from "./wokspace-switcher";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[70px] h-full bg-[#481349] flex flex-col gap-y-4 items-center pt-[9px] pb-4">
      <WorkspaceSwitcher />
      <SidebarButton
        icon={Home}
        label="Home"
        isActive={pathname.includes("/workspace")}
      />
      <SidebarButton icon={MessagesSquare} label="Dms" />
      <SidebarButton icon={BellIcon} label="Activity" />
      <SidebarButton icon={MoreHorizontal} label="More" />
      <div className="flex flex-col items-center justify-center mt-auto gap-y-1">
        <UserButton />
      </div>
    </aside>
  );
}
