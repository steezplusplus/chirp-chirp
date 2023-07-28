import type { User } from "@clerk/nextjs/server";

/**
 * Filters out sensitive information about the user before the frontend has access
 * TODO Can use .output() instead, a tRPC ProcedureBuilder
 * @param user A user object from Clerk
 * @returns A subset of the Clerk object
 */
export const filterClerkUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  };
};