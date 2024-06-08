import {
  AppBskyEmbedImages,
  AppBskyFeedDefs,
  AppBskyFeedPost,
} from "@atproto/api";
import { parseEmbedImages } from "./images";
import type { Storage } from "unstorage";
import { ensureValidDid, ensureValidRecordKey } from "@atproto/syntax";

const BskyPostVersion = 1;

export interface BskyPostAuthor {
  avatar?: string;
  handle: string;
  displayName?: string;
  did: string;
}

export interface BskyPost {
  version: typeof BskyPostVersion;
  author: BskyPostAuthor;
  text: string;
  images?: AppBskyEmbedImages.ViewImage[];
  lang: string;
  uri: string;
  cid: string;
  createdAt: string;
}

function toBskyPost(value: AppBskyFeedDefs.PostView): BskyPost {
  if (!AppBskyFeedPost.isRecord(value.record)) {
    throw new Error("PostView#record is not a post");
  }

  const { author, uri, cid } = value;
  const { text, langs, createdAt } = value.record;

  return {
    version: BskyPostVersion,
    author: {
      did: author.did,
      handle: author.handle,
      avatar: author.avatar,
      displayName: author.displayName,
    },
    text,
    images: parseEmbedImages(value),
    lang: langs?.[0] ?? "en",
    uri,
    cid,
    createdAt,
  };
}

const PostCache = defineCache({
  getKey(authorDid: string, postRecordKey: string) {
    return `profile:${authorDid.replaceAll(":", "__")}:posts:${postRecordKey}`;
  },
  isValid(value): value is BskyPost {
    return (
      value != null &&
      typeof value === "object" &&
      "version" in value &&
      value.version === BskyPostVersion
    );
  },
  ttl: 3_600,
});

export async function resolvePost(
  agent: BskyAgentActivator,
  cache: Storage,
  authorDid: string,
  postRecordKey: string
) {
  try {
    ensureValidDid(authorDid);
  } catch (cause) {
    throw new Error("Invalid user DID", { cause });
  }

  try {
    ensureValidRecordKey(postRecordKey);
  } catch (cause) {
    throw new Error("Invalid post ID", { cause });
  }

  try {
    const cachedPost = await getFromCache(cache, PostCache, [
      authorDid,
      postRecordKey,
    ]);
    if (cachedPost !== undefined) return cachedPost;
  } catch {}

  let resp;
  try {
    resp = await agent().then((agent) =>
      agent.getPosts({
        uris: [`at://${authorDid}/app.bsky.feed.post/${postRecordKey}`],
      })
    );
  } catch (cause) {
    console.error(cause);
    throw new Error("Failed to fetch post", { cause });
  }

  const post =
    resp.data.posts.length === 0 ? null : toBskyPost(resp.data.posts[0]);

  try {
    await setInCache(cache, PostCache, post, [authorDid, postRecordKey]);
  } catch (err) {
    console.error("failed to cache post", err);
  }

  return post;
}
