"use client";

import { useEffect, useState } from "react";

import { CreateChannelModal } from "@/features/channels/components/create-channel-motal";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";

export function Modals() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <CreateChannelModal />
      <CreateWorkspaceModal />
    </>
  );
}
