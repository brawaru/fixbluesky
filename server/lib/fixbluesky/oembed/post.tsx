/** @jsxImportSource xastscript */
import { encodeHTML } from "entities";
import { decode } from "ufo";
import { u } from "unist-builder";
import { getPostData } from "../posts";
import { OEmbedContext } from "./types";

function assertParameters<P extends Record<string, any>>(
  params?: P | undefined
): asserts params is P & { user: string; post: string } {
  if (params == null) {
    throw "Path parameters must be provided";
  }

  for (const param of ["user", "post"]) {
    if (!(param in params)) {
      throw `Path parameter \`${param}\` must be provided`;
    }

    if (typeof params[param] !== "string") {
      throw `Path parameter \`${param}\` must be a string`;
    }
  }
}

async function invoke({ event, agent, cache, params, format }: OEmbedContext) {
  try {
    assertParameters(params);
  } catch (reason) {
    return sendFBSError(event, format, FBSError.BadRequest, reason as string);
  }

  const userHandleOrDid = decode(params.user);
  const postRecordKey = decode(params.post);

  const [post, err] = await getPostData(
    agent,
    cache,
    userHandleOrDid,
    postRecordKey
  );

  if (err != null) {
    return sendFBSError(event, format, err.code, err.details);
  }

  const { author } = post;

  const authorName = author.displayName
    ? `${author.displayName} (@${author.handle})`
    : `@${author.handle}`;

  const html = `<blockquote class="bluesky-embed" data-bluesky-uri="${
    post.uri
  }" data-bluesky-cid="${post.cid}"><p lang="${post.lang}">${encodeHTML(
    post.text
  )}</p>&mdash; ${encodeHTML(authorName)} (<a href="https://bsky.app/profile/${
    author.did
  }?ref_src=embed">@${author.handle}</a>) <a href="https://bsky.app/profile/${
    author.did
  }/post/${postRecordKey}?ref_src=embed">${new Date(
    post.createdAt
  ).toLocaleString("en", {
    dateStyle: "long",
    timeStyle: "short",
  })}</a></blockquote><script async src="https://embed.bsky.app/static/embed.js" charset="utf-8"></script>`;

  let title = post.text.slice(0, 64);
  if (post.text.length > 64) {
    title += "...";
  }

  if (format === "json") {
    return sendJSON(event, {
      version: "1.0",
      type: "link",
      provider_name: "Bluesky",
      provider_url: "https://bsky.app/",
      title,
      author_name: authorName,
      author_url: `https://bsky.app/profile/${author.did}`,
      thumbnail_url: author.avatar ?? undefined,
      thumbnail_width: author.avatar ? 1000 : undefined,
      thumbnail_height: author.avatar ? 1000 : undefined,
      html,
    });
  } else if (format === "xml") {
    let thumbnailMeta;
    if (author.avatar) {
      thumbnailMeta = (
        <>
          <thumbnail_url>{author.avatar}</thumbnail_url>
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
          'version="1.0" encoding="utf-8" standalone="yes"'
        )}
        <oembed>
          <version>1.0</version>
          <type>link</type>
          <provider_name>Bluesky</provider_name>
          <provider_url>https://bsky.app/</provider_url>
          <title>{title}</title>
          <author_name>{authorName}</author_name>
          <author_url>{`https://bsky.app/profile/${author.did}`}</author_url>
          {thumbnailMeta}
          <html>{html}</html>
        </oembed>
      </>
    );
  }
}

export const route = {
  path: "/profile/:user/post/:post",
  invoke,
};
