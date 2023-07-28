import Head from "next/head";
import { useRouter } from "next/router";
import { RootLayout } from "~/components/RootLayout";

export default function Post() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>ChirpChirp | Post</title>
      </Head>
      <RootLayout>
        <div className="flex justify-center">
          Show post with id {router.query.id}
        </div>
      </RootLayout>
    </>
  );
}
