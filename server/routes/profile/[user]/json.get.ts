import { getProfileData } from "~/lib/fixbluesky";

export default cachedEventHandler(
  async (event) => {
    const bskyAgent = getBlueskyAgent(event);
    const bskyCache = useBskyStorage();

    const user = getRouterParam(event, "user", { decode: true })!;

    const [profile, err] = await getProfileData(bskyAgent, bskyCache, user);
    if (err != null) {
      return sendFBSError(event, "json", err.code, err.details);
    }

    return sendJSON(event, profile);
  },
  {
    swr: true,
    staleMaxAge: 3_600,
    maxAge: 1_800,
    varies: ["host", "x-forwarded-host", "x-forwarded-proto"],
  }
);
