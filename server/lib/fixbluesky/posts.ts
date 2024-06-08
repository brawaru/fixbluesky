import type { Storage } from "unstorage";
import {
  isDid,
  resolveBskyPost,
  resolveBskyProfile,
  type BskyPost,
} from "../bluesky";

export async function getPostData(
  agent: BskyAgentActivator,
  cache: Storage,
  actor: string,
  postRecordId: string
): Promise<
  | [BskyPost, undefined]
  | [
      undefined,
      {
        code: FBSError;
        details: string;
      }
    ]
> {
  let authorDid;
  if (isDid(actor)) {
    authorDid = actor;
  } else {
    let author;
    try {
      author = await resolveBskyProfile(agent, cache, actor);
    } catch {
      return [
        undefined,
        {
          code: FBSError.Fetch,
          details: "Cannot retrieve the author of the post",
        },
      ];
    }

    if (author == null) {
      return [
        undefined,
        {
          code: FBSError.Exist,
          details:
            "Author of the post does not exist or cannot be retrieved at this time",
        },
      ];
    }

    authorDid = author.did;
  }

  let post;
  try {
    post = await resolveBskyPost(agent, cache, authorDid, postRecordId);
  } catch (cause) {
    console.error("Post resolving error", cause);
    return [
      undefined,
      { code: FBSError.Fetch, details: "Cannot retrieve post at this time" },
    ];
  }

  if (post == null) {
    return [
      undefined,
      {
        code: FBSError.Exist,
        details: "Post does not exist or cannot be retrieved at this time",
      },
    ];
  }

  return [post, undefined];
}
