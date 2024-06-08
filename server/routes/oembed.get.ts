import { handleOEmbed } from "~/lib/fixbluesky/oembed";

export default cachedEventHandler(
  async (event) => {
    const { format, url } = getQuery(event);

    // TODO: infer format from accept header?
    if (format !== "json" && format !== "xml") {
      return sendFBSError(
        event,
        "text",
        FBSError.BadRequest,
        "Parameter `format` must be either `xml` or `json`"
      );
    }

    if (typeof url !== "string") {
      return sendFBSError(
        event,
        format,
        FBSError.BadRequest,
        "Parameter `url` must be a valid URL"
      );
    }

    let urlObj;
    try {
      urlObj = new URL(url);
    } catch {
      return sendFBSError(
        event,
        format,
        FBSError.BadRequest,
        "Parameter `url` must be a valid URL"
      );
    }

    let reqUrlObj;
    try {
      reqUrlObj = new URL(
        getRequestURL(event, { xForwardedHost: true, xForwardedProto: true })
      );
    } catch {
      return sendFBSError(
        event,
        format,
        FBSError.BadRequest,
        "Bad request URL"
      );
    }

    if (urlObj.protocol !== "https:" || urlObj.host !== reqUrlObj.host) {
      return sendFBSError(
        event,
        format,
        FBSError.BadRequest,
        "Parameter `url` must be an URL belonging to FixBluesky service"
      );
    }

    if (!(await handleOEmbed(urlObj.pathname, event, format))) {
      return sendFBSError(
        event,
        format,
        FBSError.BadRequest,
        "No OEmbed handler for this URL"
      );
    }
  },
  {
    swr: true,
    staleMaxAge: 3_600,
    maxAge: 1_800,
  }
);
