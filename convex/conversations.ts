import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation } from "./_generated/server";

/**
 * Creates or retrieves a conversation between two workspace members.
 *
 * @param args.memberId - The ID of the other member to create/get conversation with
 * @param args.workspaceId - The ID of the workspace where the conversation takes place
 * @throws {Error} If the user is not authenticated
 * @returns The conversation object or null if members are not found
 */
export const createOrGet = mutation({
  args: {
    memberId: v.id("members"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    const otherMember = await ctx.db.get(args.memberId);

    if (!currentMember || !otherMember) {
      throw new Error("Member not found");
    }

    // Check if a conversation already exists between the two members
    // If it does, return it
    // If it doesn't, create a new conversation
    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("memberOneId"), currentMember._id),
            q.eq(q.field("memberTwoId"), otherMember._id)
          ),
          q.and(
            q.eq(q.field("memberOneId"), otherMember._id),
            q.eq(q.field("memberTwoId"), currentMember._id)
          )
        )
      )
      .unique();

    if (existingConversation) {
      return existingConversation._id;
    }

    const conversationId = await ctx.db.insert("conversations", {
      memberOneId: currentMember._id,
      memberTwoId: otherMember._id,
      workspaceId: args.workspaceId,
    });

    return conversationId;
  },
});
