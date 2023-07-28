import { createServerSideHelpers } from "@trpc/react-query/server";
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { api } from "~/utils/api";
import Image from "next/image"
import Head from "next/head";

type ProfileProps = InferGetStaticPropsType<typeof getStaticProps>;
export default function Profile(props: ProfileProps) {
  const { username } = props;
  const { data } = api.profile.getUserByUsername.useQuery({ username })

  if (!data) {
    return <p>Profile not found!</p>  // TODO Should redirect?
  }

  console.log(data);

  return (
    <>
      <Head>
        <title>{`ChirpChirp | @${username}`}</title>
      </Head>
      <main className="h-screen flex justify-center">
        <div className="w-full h-full border-x border-slate-400 md:max-w-2xl p-2">
          <div className="flex flex-col items-center">
            <Image
              src={data.profileImageUrl}
              alt={`${data.username}'s Profile picutre`}
              width={56}
              height={56}
            />
            <p className="text-xs font-light">{`@${data.username}`}</p>
          </div>
        </div>
      </main>
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