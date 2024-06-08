/** @jsxImportSource hastscript */
import { BskyProfile } from "~/lib/bluesky/profiles.ts";
import { OEmbedLinks } from "../oembed/links.ts";
import { makeRedirect } from "./layout.tsx";

interface ProfileRedirectProps {
  profile: BskyProfile;
  oEmbedLinks?: OEmbedLinks;
}

export function makeProfileRedirect({
  profile,
  oEmbedLinks,
}: ProfileRedirectProps) {
  let oEmbedLinksMeta;
  if (oEmbedLinks != null) {
    oEmbedLinksMeta = (
      <>
        <link type="application/json+oembed" href={oEmbedLinks.json} />
        <link type="application/xml+oembed" href={oEmbedLinks.xml} />
      </>
    );
  }

  const title =
    profile.displayName == null
      ? `@${profile.handle} on Bluesky`
      : `${profile.displayName} (@${profile.handle}) on Bluesky`;

  let descriptionMeta;
  if (profile.description) {
    descriptionMeta = (
      <meta property="og:description" content={profile.description} />
    );
  }

  return makeRedirect({
    url: `https://bsky.app/profile/${profile.did}`,
    children: (
      <>
        <meta property="og:title" content={title} />
        {descriptionMeta}
        <meta property="og:site_name" content={"Bluesky"} />
        <meta property="og:image" content={profile.avatar} />
        {oEmbedLinksMeta}
      </>
    ),
  });
}
