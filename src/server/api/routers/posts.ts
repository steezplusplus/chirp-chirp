import { createTRPCRouter, publicProcedure, privateProcedre } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 3 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});


const filterUsersForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }]
    });

    const users = (await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })).map(filterUsersForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId)

      if (!author) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for post not found"
        });
      }

      if (!author.username) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Username for Author not found"
        });
      }

      return {
        post,
        author: {
          ...author,
          username: author.username,
        }
      }
    });
  }),
  create: privateProcedre.input(
    z.object({
      content: z.string().min(1).max(280),

    })
  ).mutation(async ({ ctx, input }) => {
    const authorId = ctx.userId;

    const { success } = await ratelimit.limit(authorId);

    // TODO Show user in UI
    if (!success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
      });
    }

    const post = await ctx.prisma.post.create({
      data: {
        authorId,
        content: input.content,
      }
    });

    return post;
  }),
});
