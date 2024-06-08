/** @jsxImportSource xastscript */
import { decode } from "ufo";
import { u } from "unist-builder";
import { getProfileData } from "../profiles";
import { OEmbedContext } from "./types";

async function invoke({ event, agent, cache, params, format }: OEmbedContext) {
  if (params == null || !("user" in params)) {
    return sendFBSError(
      event,
      format,
      FBSError.BadRequest,
      "Path parameter `user` must be provided"
    );
  }

  if (typeof params.user !== "string") {
    return sendFBSError(
      event,
      format,
      FBSError.BadRequest,
      "Path parameter `user` must be a string"
    );
  }

  const [profile, err] = await getProfileData(
    agent,
    cache,
    decode(params.user)
  );

  if (err != null) {
    return sendFBSError(event, format, err.code, err.details);
  }

  const authorName = profile.displayName
    ? `${profile.displayName} (@${profile.handle})`
    : `@${profile.handle}`;

  if (format === "json") {
    return sendJSON(event, {
      version: "1.0",
      type: "link",
      provider_name: "Bluesky",
      provider_url: "https://bsky.app/",
      author_name: authorName,
      author_url: `https://bsky.app/profile/${profile.did}`,
      thumbnail_url: profile.avatar ?? undefined,
      thumbnail_width: profile.avatar ? 1000 : undefined,
      thumbnail_height: profile.avatar ? 1000 : undefined,
    });
  } else if (format === "xml") {
    let avatarMeta;
    if (profile.avatar != null) {
      avatarMeta = (
        <>
          <thumbnail_url>{profile.avatar}</thumbnail_url>
          <thumbnail_width>1000</thumbnail_width>
          <thumbnail_height>1000</thumbnail_height>
        </>
      );
    }

    return sendXml(
      event,
      <>
        {u(
          "instruction",
          { name: "xml" },
          'version="1.0" encoding="UTF-8" standalone="yes"'
        )}
        <oembed>
          <version>1.0</version>
          <type>link</type>
          <provider_name>Bluesky</provider_name>
          <provider_url>https://bsky.app</provider_url>
          <author_name>{authorName}</author_name>
          <author_url>{`https://bsky.app/profile/${profile.handle}`}</author_url>
          {avatarMeta}
        </oembed>
      </>
    );
  }
}

export const route = {
  path: "/profile/:user",
  invoke,
};
