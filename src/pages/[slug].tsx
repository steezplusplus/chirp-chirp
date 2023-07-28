import Image from "next/image"
import Head from "next/head";
import { api } from "~/utils/api";

export default function Profile() {
  // TODO Hardcoded query
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({ username: 'steezplusplus' })

  if (isLoading) {
    return (
      <p>Loading...</p>
    );
  }

  if (!data) {
    return <p>Profile not found!</p>
  }

  console.log(data);

  return (
    <>
      <Head>
        <title>ChirpChirp | Profile</title>
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
}