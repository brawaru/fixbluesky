import { getProfileData } from "~/lib/fixbluesky";
import { makeProfileRedirect } from "~/lib/fixbluesky/html";
import { getOEmbedLinks } from "~/lib/fixbluesky/oembed";

export default cachedEventHandler(
  async (event) => {
    const bskyAgent = getBlueskyAgent(event);
    const bskyCache = useBskyStorage();

    const user = getRouterParam(event, "user", { decode: true })!;

    const [profile, err] = await getProfileData(bskyAgent, bskyCache, user);
    if (err != null) {
      return sendFBSError(event, "json", err.code, err.details);
    }

    const reqUrlObj = getRequestURL(event, {
      xForwardedHost: true,
      xForwardedProto: true,
    });

    let oEmbedLinks;
    try {
      oEmbedLinks = getOEmbedLinks(reqUrlObj);
    } catch {}

    return sendHTML(event, makeProfileRedirect({ profile, oEmbedLinks }));
  },
  {
    swr: true,
    staleMaxAge: 3_600,
    maxAge: 1_800,
  }
);
