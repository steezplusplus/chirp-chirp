import { createTRPCRouter, publicProcedure, privateProcedre } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { filterClerkUserForClient } from "~/server/helpers/filterClerkUserForClient";

// Create a new ratelimiter, that allows 3 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }]
    });

    const users = (await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })).map(filterClerkUserForClient);

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
  getPostsByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        where: { authorId: input.userId },
        take: 100,
        orderBy: [{ createdAt: "desc" }]
      })
      return posts;
    }),
  create: privateProcedre.input(
    z.object({
      content: z.string().min(1, 'Post cannot be empty').max(280, 'Post cannot exceed 280 characters'),
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
