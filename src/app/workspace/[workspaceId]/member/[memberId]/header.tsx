import { ChevronDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  memberName?: string;
  memberImage?: string;
  onClick?: () => void;
}

export function Header({ memberName, memberImage, onClick }: HeaderProps) {
  const avatarFallBack = memberName?.charAt(0).toUpperCase();

  return (
    <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
      <Button
        variant="ghost"
        className="text-lg font-semibold px-2 overflow-hidden w-auto"
        size="sm"
        onClick={onClick}
      >
        <Avatar className="size-6 mr-2">
          <AvatarImage src={memberImage} />
          <AvatarFallback>{avatarFallBack}</AvatarFallback>
        </Avatar>
        <span className="truncate">{memberName}</span>
        <ChevronDown className="size-2.5 ml-2" />
      </Button>
    </div>
  );
}
