import { createTRPCRouter, publicProcedure, privateProcedre } from "~/server/api/trpc";
import { addClerkDataToPost } from "~/server/helpers/addClerkDataToPost";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

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
    return addClerkDataToPost(posts);
  }),
  getPostsByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        where: { authorId: input.userId },
        take: 100,
        orderBy: [{ createdAt: "desc" }]
      })
      return addClerkDataToPost(posts);
    }),
  create: privateProcedre.input(
    z.object({
      content: z.string()
        .min(1, 'Post cannot be empty')
        .max(280, 'Post cannot exceed 280 characters'),
    }))
    .mutation(async ({ ctx, input }) => {
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
