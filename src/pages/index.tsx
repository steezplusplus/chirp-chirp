import { useState } from 'react';
import Image from "next/image";
import { RootLayout } from '~/components/RootLayout';
import { LoadingPageOverlay, LoadingSpinner } from "~/components/LoadingSpinner";
import { PostView } from '~/components/PostView';
import { api } from "~/utils/api";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import toast from 'react-hot-toast';


const CreatePostWizard = () => {
  const [input, setInput] = useState<string>(''); // TODO Bad re-render on every key-press
  const { user } = useUser();
  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
      toast.success("Success!")
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage) {
        toast.error(errorMessage.join("\n"));
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  if (!user) {
    return null;
  }

  // TODO a11y issue: should not disable button elements
  return (
    <div className="flex w-full gap-x-3">
      <Image
        src={user.profileImageUrl}
        alt="Your profile image"
        className="w-14 h-14 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="Make a post..."
        className="grow bg-transparent outline-none pl-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            mutate({ content: input });
          }
        }}
        disabled={isPosting}
      />
      {input.length > 0 &&
        <button
          onClick={() => mutate({ content: input })}
          disabled={isPosting}
        >
          {isPosting ? <LoadingSpinner /> : 'Submit'}
        </button>}
    </div>
  );
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) {
    return <LoadingPageOverlay />;
  }

  if (!data) {
    return <div>Something went wrong!</div>;
  }

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => {
        return <PostView {...fullPost} key={fullPost.post.id} />
      })}
    </div>
  );
}

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  api.posts.getAll.useQuery(); // Start fetching early

  if (!userLoaded) {
    return <div></div>;
  }

  // TODO Dont show CreatePostWizard when not logged in
  return (
    <RootLayout>
      <div className="flex items-center border-b border-slate-400 p-4">
        <CreatePostWizard />
        <span className="ml-auto">
          {!isSignedIn && <SignInButton />}
          {!!isSignedIn && <SignOutButton />}
        </span>
      </div>
      <Feed />
    </RootLayout>
  );
}
