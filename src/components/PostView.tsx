import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export function PostView(props: PostWithUser) {
  const { post, author } = props;
  return (
    <div className="flex items-center w-full gap-x-3 border-b border-slate-400 p-8" key={post.id}>
      <Image
        src={author.profileImageUrl}
        alt={`@${author.username}'s profile image`}
        className="w-14 h-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col text-slate-300">
        <div className="flex items-center gap-x-1 text-xs">
          <Link
            href={`/@${author.username}`}
            className="hover:underline"
          >
            {`@${author.username}`}
          </Link>
          {` · `}
          <p className="font-thin">{dayjs(post.createdAt).fromNow()}</p>
        </div>
        <Link href={`/post/${post.id}`}>
          <p>{post.content}</p>
        </Link>
      </div>
    </div>
  );
}