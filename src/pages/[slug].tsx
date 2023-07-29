import Image from "next/image"
import Head from "next/head";
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import { api } from "~/utils/api";
import { RootLayout } from "~/components/RootLayout";
import { LoadingPageOverlay } from "~/components/LoadingSpinner";
import { PostView } from "~/components/PostView";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";

function ProfileFeed(props: { userId: string }) {
  const { userId } = props
  const { data, isLoading: postsLoading } = api.posts.getPostsByUserId.useQuery({ userId });

  if (postsLoading) {
    return (
      <LoadingPageOverlay />
    );
  }

  if (!data || data.length === 0) {
    return (
      <p>This user has not made any posts yet.</p>
    );
  }

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => {
        return <PostView {...fullPost} key={fullPost.post.id} />
      })}
    </div>
  );
}

type ProfileProps = InferGetStaticPropsType<typeof getStaticProps>;
export default function Profile(props: ProfileProps) {
  const { username } = props;
  const { data: userData } = api.profile.getUserByUsername.useQuery({ username }); // TODO `data.username` should not be nullable

  if (!userData) {
    return <p>Profile not found!</p>  // TODO Should redirect to 404 page
  }

  return (
    <>
      <Head>
        <title>{`ChirpChirp | @${userData.username}`}</title>
      </Head>
      <RootLayout>
        <div className="flex flex-col items-center">
          <Image
            src={userData.profileImageUrl}
            alt={`${userData.username}'s profile picture`}
            width={56}
            height={56}
          />
          <p className="text-xs font-light">{`@${userData.username}`}</p>
        </div>
        <ProfileFeed userId={userData.id} />
      </RootLayout >
    </>
  );
};

export async function getStaticProps(context: GetStaticPropsContext<{ slug: string }>) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") {
    throw new Error("No slug"); // TODO Should redirect to 404 page
  }

  const username = slug.replace('@', '');
  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    }
  };
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
}