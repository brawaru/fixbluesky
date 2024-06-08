import { getPostData } from "~/lib/fixbluesky";
import { makePostRedirect } from "~/lib/fixbluesky/html";
import { getOEmbedLinks } from "~/lib/fixbluesky/oembed";

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

    let oEmbedLinks;
    try {
      oEmbedLinks = getOEmbedLinks(
        getRequestURL(event, {
          xForwardedHost: true,
          xForwardedProto: true,
        })
      );
    } catch {}

    return sendHTML(event, makePostRedirect({ post, oEmbedLinks }));
  },
  {
    swr: true,
    staleMaxAge: 3_600,
    maxAge: 1_800,
  }
);
