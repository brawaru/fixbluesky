import { createRouter } from "radix3";
import type { H3Event } from "h3";
import { OEmbedContext } from "./types.ts";
import { route as getProfileOEmbedRoute } from "./profile.tsx";
import { route as getPostOEmbedRoute } from "./post.tsx";

const router = createRouter<{
  invoke(ctx: OEmbedContext): Promise<void> | void;
}>();

router.insert(getProfileOEmbedRoute.path, getProfileOEmbedRoute);
router.insert(getPostOEmbedRoute.path, getPostOEmbedRoute);

export async function handleOEmbed(
  path: string,
  event: H3Event,
  format: "json" | "xml"
) {
  const match = router.lookup(path);
  if (match == null) return false;

  await match.invoke({
    event,
    format,
    agent: getBlueskyAgent(event),
    cache: useBskyStorage(),
    params: match.params,
  });

  return true;
}

export { getOEmbedLinks } from "./links.ts";
