import type { Storage } from "unstorage";
import type { BskyAgentActivator } from "~/utils/bluesky";
import { resolveBskyProfile, type BskyProfile } from "../bluesky";

export async function getProfileData(
  agent: BskyAgentActivator,
  cache: Storage,
  userHandleOrDid: string
): Promise<
  | [BskyProfile, undefined]
  | [
      undefined,
      {
        code: FBSError;
        details?: string;
      }
    ]
> {
  let profile;
  try {
    profile = await resolveBskyProfile(agent, cache, userHandleOrDid);
  } catch {
    return [
      undefined,
      {
        code: FBSError.Fetch,
        details: "Cannot retrieve profile at this time",
      },
    ];
  }

  if (profile == null) {
    return [
      undefined,
      {
        code: FBSError.Exist,
        details: "Profile does not exist or cannot be retrieved at this time",
      },
    ];
  }

  return [profile, undefined];
}
