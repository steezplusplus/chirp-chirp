import Head from "next/head";
import { useRouter } from "next/router";

export default function Post() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>ChirpChirp | Post</title>
      </Head>
      <main className="h-screen flex justify-center">
        <div className="w-full h-full border-x border-slate-400 md:max-w-2xl p-2">
          <div className="flex h-screen justify-center">
            Show post with id {router.query.id}
          </div>
        </div>
      </main>
    </>
  );
}
