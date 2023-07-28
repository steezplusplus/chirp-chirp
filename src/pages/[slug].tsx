import Head from "next/head";
import { useRouter } from "next/router";

export default function Profile() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>ChirpChirp | Profile</title>
      </Head>
      <main className="h-screen flex justify-center">
        <div className="w-full h-full border-x border-slate-400 md:max-w-2xl p-2">
          <div className="flex h-screen justify-center">
            Show profile with id {router.query.slug}
          </div>
        </div>
      </main>
    </>
  );
}