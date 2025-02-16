"use client";

import { AlertTriangle, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";
import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { Id } from "../../../../../../convex/_generated/dataModel";
import { Conversation } from "./conversation";

export default function MemberIdPage() {
  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();

  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);

  const { mutate, isPending } = useCreateOrGetConversation();

  useEffect(() => {
    mutate(
      { workspaceId, memberId },
      {
        onSuccess(data) {
          setConversationId(data);
        },
        onError() {
          toast.error("Failed to create conversation");
        },
      }
    );
  }, [memberId, mutate, workspaceId]);

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!conversationId) {
    return (
      <div className="flex flex-col gap-2 h-full w-full items-center justify-center">
        <AlertTriangle className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Conversation not found
        </span>
      </div>
    );
  }

  return <Conversation id={conversationId} />;
}
