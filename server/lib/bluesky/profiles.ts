import { Storage } from "unstorage";
import { isDid, isHandle } from "./validation";
import { XRPCError } from "@atproto/xrpc";

const ProfileVersion = 1;

export interface BskyProfile {
  version: typeof ProfileVersion;
  handle: string;
  did: string;
  displayName?: string;
  avatar?: string;
  description?: string;
}

const DidResolutionCache = defineCache({
  getKey(handle: string) {
    return `did_for:${handle}`;
  },
  isValid(value): value is string | null {
    return typeof value === "string" || value == null;
  },
  ttl: 3_600, // 1 hour
});

const ProfileCache = defineCache({
  getKey(didOrProfile: string | BskyProfile) {
    const did =
      typeof didOrProfile === "string" ? didOrProfile : didOrProfile.did;

    return `profile:${did.replaceAll(":", "__")}:data`;
  },
  isValid(value): value is BskyProfile {
    return (
      value != null &&
      typeof value === "object" &&
      "version" in value &&
      value.version === ProfileVersion
    );
  },
  ttl: 3_600, // 1 hour
});

export async function resolveProfile(
  agent: BskyAgentActivator,
  cache: Storage,
  actor: string
) {
  let actorDid: string | null = isDid(actor) ? actor : null;

  if (actorDid == null) {
    if (!isHandle(actor)) throw new Error("Invalid user DID or handle");

    try {
      const resp = await getFromCache(cache, DidResolutionCache, [actor]);
      if (resp !== undefined) {
        if (resp == null) return null;
        actorDid = resp;
      }
    } catch {}
  }

  if (actorDid != null) {
    try {
      const profile = await getFromCache(cache, ProfileCache, [actorDid]);
      if (profile != null) return profile;
    } catch {}
  }

  let profile: BskyProfile | null = null;
  try {
    const { data } = await agent().then((agent) => agent.getProfile({ actor }));

    profile = {
      version: ProfileVersion,
      did: data.did,
      displayName: data.displayName,
      handle: data.handle,
      avatar: data.avatar,
      description: data.description,
    };

    actorDid = data.did;
  } catch (err) {
    if (
      err instanceof XRPCError &&
      !err.message.includes("Profile not found")
    ) {
      const { message, status, error } = err;
      console.error("unknown profile fetch error", { message, status, error });
      return;
    }
  }

  if (profile == null) {
    try {
      await setInCache(cache, DidResolutionCache, null, [actor]);
    } catch (err) {
      console.error("failed to cache non-resolution", err);
    }
    return null;
  }

  try {
    await setInCache(cache, DidResolutionCache, actorDid, [profile.handle]);
    await setInCache(cache, ProfileCache, profile, [profile.did]);
  } catch (err) {
    console.error("failed to cache profile and its resolution");
  }

  return profile;
}
