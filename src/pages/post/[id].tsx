import Head from "next/head";
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import { RootLayout } from "~/components/RootLayout";
import { generateSSGHelper } from "~/server/helpers/generateSSGHelper";
import { api } from "~/utils/api";
import { PostView } from "~/components/PostView";

type SinglePost = InferGetStaticPropsType<typeof getStaticProps>;
export default function SinglePost(props: SinglePost) {
  const { id } = props;
  const { data } = api.posts.getById.useQuery({ id });

  if (!data) {
    return <p>Post not found.</p> // TODO redirect to 404
  }

  return (
    <>
      <Head>
        <title>{`${data.post.content} | @${data.author.username}`}</title>
      </Head>
      <RootLayout>
        <PostView {...data} />
      </RootLayout >
    </>
  );
};

export async function getStaticProps(context: GetStaticPropsContext<{ id: string }>) {
  const helpers = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") {
    throw new Error("No id"); // TODO Should redirect to 404 page
  }

  await helpers.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    }
  };
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
}