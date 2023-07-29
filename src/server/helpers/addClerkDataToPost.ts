import { filterClerkUserForClient } from "~/server/helpers/filterClerkUserForClient";
import type { Post } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

export async function addClerkDataToPost(posts: Post[]) {
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
}