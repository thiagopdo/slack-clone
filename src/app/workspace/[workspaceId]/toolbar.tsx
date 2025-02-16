import { Info, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

export function Toolbar() {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const { data } = useGetWorkspace({ id: workspaceId });
  const { data: channels } = useGetChannels({ workspaceId });
  const { data: members } = useGetMembers({ workspaceId });

  const [open, setOpen] = useState(false);

  function onChannelClick(channelId: string) {
    setOpen(false);
    router.push(`/workspace/${workspaceId}/channel/${channelId}`);
  }
  function onMemberClick(memberId: string) {
    setOpen(false);
    router.push(`/workspace/${workspaceId}/member/${memberId}`);
  }

  return (
    <nav className="bg-[#481349] flex items-center justify-between h-10 p-1.5">
      <div className="flex-1" />
      <div className="min-w-[280px] max-[642px] grow-[2] shrink">
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          className="justify-start w-full px-2 h-7 bg-accent/25 hover:bg-accent-25"
        >
          <Search className="mr-2 text-white size-4" />
          <span className="text-sm text-white">
            Search {data?.name} workspace
          </span>
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Channels">
              {channels?.map((channel) => (
                <CommandItem
                  key={channel._id}
                  onSelect={() => onChannelClick(channel._id)}
                >
                  {channel.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Members">
              {members?.map((member) => (
                <CommandItem
                  key={member._id}
                  onSelect={() => onMemberClick(member._id)}
                >
                  {member.user.name}
                </CommandItem>
              ))}{" "}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
      <div className="flex items-center justify-end flex-1 ml-auto">
        <Button variant="transparent" size="iconSm">
          <Info className="text-white size-5" />
        </Button>
      </div>
    </nav>
  );
}
