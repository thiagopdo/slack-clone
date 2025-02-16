import { v } from "convex/values";

import { Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx } from "./_generated/server";
import { auth } from "./auth";

// Helper function to populate user data for a member
function populateUser(ctx: QueryCtx, id: Id<"users">) {
  return ctx.db.get(id);
}

// Query to get a member by id with user data
export const getById = query({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return null;
    }

    const member = await ctx.db.get(args.id);
    if (!member) {
      return null;
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      );

    if (!currentMember) {
      return null;
    }

    const user = await populateUser(ctx, member.userId);
    if (!user) {
      return null;
    }

    return {
      ...member,
      user,
    };
  },
});

// Query to get all members of a workspace with user data
export const get = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return [];
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) {
      return [];
    }
    const data = await ctx.db
      .query("members")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();

    const members = [];

    // Populate user data for each member
    for (const member of data) {
      const user = await populateUser(ctx, member.userId);
      if (user) {
        members.push({
          ...member,
          user,
        });
      }
    }

    return members;
  },
});

// Query to get the current member of a workspace
export const current = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) return null;

    return member;
  },
});

// Mutation to update a member's role, name, email, or image

export const update = mutation({
  args: {
    id: v.id("members"),
    role: v.union(v.literal("admin"), v.literal("member")),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db.get(args.id);
    if (!member) {
      throw new Error("Member not found");
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember || currentMember.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      role: args.role,
    });

    return args.id;
  },
});

// Mutation to remove a member from a workspace
export const remove = mutation({
  args: {
    id: v.id("members"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db.get(args.id);
    if (!member) {
      throw new Error("Member not found");
    }

    // Check if the current user is an admin
    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    // Check if the current user is an admin
    if (!currentMember) {
      throw new Error("Unauthorized");
    }

    if (member.role === "admin") {
      throw new Error("Cannot remove admin member");
    }

    // Check if the current user is an admin
    if (currentMember._id === args.id && currentMember.role === "admin") {
      throw new Error("Cannot remove yourself if you are not an admin");
    }

    // Delete all messages, reactions, and conversations associated with the member
    const [messages, reactions, conversations] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_member_id", (q) => q.eq("memberId", member._id))
        .collect(),
      ctx.db
        .query("reactions")
        .withIndex("by_member_id", (q) => q.eq("memberId", member._id))
        .collect(),
      ctx.db
        .query("conversations")
        .filter((q) =>
          q.or(
            q.eq(q.field("memberOneId"), member._id),
            q.eq(q.field("memberTwoId"), member._id)
          )
        )
        .collect(),
    ]);

    // Delete all messages, reactions, and conversations associated with the member
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }
    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});
