import { getPostData } from "~/lib/fixbluesky";

export default cachedEventHandler(
  async (event) => {
    const bskyAgent = getBlueskyAgent(event);
    const bskyCache = useBskyStorage();

    const user = getRouterParam(event, "user", { decode: true })!;
    const postId = getRouterParam(event, "post", { decode: true })!;

    const [post, err] = await getPostData(bskyAgent, bskyCache, user, postId);
    if (err != null) {
      return sendFBSError(event, "json", err.code, err.details);
    }

    return sendJSON(event, post);
  },
  {
    swr: true,
    staleMaxAge: 3_600,
    maxAge: 1_800,
  }
);
