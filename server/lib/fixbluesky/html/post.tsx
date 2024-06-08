/** @jsxImportSource hastscript */
import { BskyPost } from "~/lib/bluesky/posts.ts";
import { OEmbedLinks } from "../oembed/links.ts";
import { makeRedirect } from "./layout.tsx";
import { parseURL, joinURL } from "ufo";

export interface PostRedirectProps {
  post: BskyPost;
  oEmbedLinks?: OEmbedLinks;
}

function postURIToURL(uri: string) {
  const [protocol, skip, actor, type, postRecordId] = uri.split("/");
  if (protocol !== "at:" || skip !== "" || type !== "app.bsky.feed.post") {
    throw new Error("Sanity check failed, malformed post URI");
  }
  return joinURL("https://bsky.app/", `/profile/${actor}/post/${postRecordId}`);
}

export function makePostRedirect({ post, oEmbedLinks }: PostRedirectProps) {
  let twitterCardType = "summary";

  let imagesMeta;
  if (post.images == null) {
    const { author } = post;
    if (author.avatar != null) {
      imagesMeta = (
        <>
          <meta property="og:image" content={post.author.avatar} />
          <meta
            property="og:image:alt"
            content={
              author.displayName != null
                ? `Avatar of ${author.displayName} (@${author.handle})`
                : `Avatar of @${author.handle}`
            }
          />
        </>
      );
    }
  } else {
    const imagesMetaEnumeration = post.images.map((image) => {
      let imageSizes;
      if (image.aspectRatio != null) {
        imageSizes = (
          <>
            <meta
              property="og:image:width"
              content={String(image.aspectRatio.width)}
            />

            <meta
              property="og:image:height"
              content={String(image.aspectRatio.height)}
            />
          </>
        );
      }

      return (
        <>
          <meta property="og:image" content={image.fullsize} />
          <meta property="og:image:alt" content={image.alt} />
          {imageSizes}
        </>
      );
    });

    imagesMeta = <>{imagesMetaEnumeration}</>;
    twitterCardType = "summary_large_image";
  }

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
    post.author.displayName == null
      ? `Post by @${post.author.handle} on Bluesky`
      : `Post by ${post.author.displayName} (@${post.author.handle}) on Bluesky`;

  return makeRedirect({
    url: postURIToURL(post.uri),
    children: (
      <>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={post.text} />
        <meta property="og:locale" content={post.lang} />
        <meta property="og:site_name" content={"Bluesky"} />
        <meta property="twitter:card" content={twitterCardType} />
        {imagesMeta}
        {oEmbedLinksMeta}
      </>
    ),
  });
}
