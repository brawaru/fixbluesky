import { encodeXML, encodeHTML } from "entities";
import type { H3Event } from "h3";

export enum FBSError {
  /** Request is malformed. */
  BadRequest = "bad_request",
  /** Object does not exist. */
  Exist = "exist",
  /** Object cannot be fetched. */
  Fetch = "fetch",
  /** Internal Server Error */
  InternalServerError = "server",
}

function toStatus(err: FBSError) {
  switch (err) {
    case FBSError.BadRequest:
      return 400;
    case FBSError.Exist:
      return 404;
    case FBSError.Fetch:
      return 500;
    default:
      return 500;
  }
}

function toMessage(err: FBSError) {
  switch (err) {
    case FBSError.Exist:
      return "Not Found";
    case FBSError.Fetch:
      return "Fetch Error";
    case FBSError.InternalServerError:
      return "Internal Server Error";
    case FBSError.BadRequest:
      return "Bad Request";
    default:
      return "Unknown Error";
  }
}

export function sendFBSError(
  event: H3Event,
  format: "xml" | "json" | "text",
  err: FBSError,
  details?: string
) {
  const message = toMessage(err);

  setResponseStatus(event, toStatus(err));

  if (format === "json") {
    return send(
      event,
      JSON.stringify({ code: err, message, details }, null, "\t"),
      "application/json"
    );
  } else if (format === "xml") {
    let xmlBody = '<?xml version="1.0" encoding="utf-8" standalone="yes"?>';
    xmlBody += "<error>";
    xmlBody += `  <code>${err}</code>`;
    xmlBody += `  <message>${message}</message>`;

    if (details) xmlBody += `  <details>${encodeXML(details)}</details>`;

    xmlBody += `</error>`;

    return send(event, xmlBody, "application/xml");
  }

  let txtBody = "Error\n";
  txtBody += `Code: ${err}\n`;
  txtBody += `Message: ${message}\n`;
  if (details) txtBody += `Details: ${details}`;

  return send(event, txtBody, "text/plain");
}

export function sendFBSErrorHTML(
  event: H3Event,
  code: FBSError,
  details?: string
) {
  const message = toMessage(code);

  let html = "<!DOCTYPE html>\n";
  html += "<html>\n";
  html += "  <head>\n";
  html += `    <title>${encodeHTML(message)}</title>\n`;
  html += "  </head>\n";
  html += "  <body>\n";
  html += `    <h1>${encodeHTML(message)}</h1>\n`;
  html += `    <p>Error code: <code>${encodeHTML(code)}</code></p>\n`;

  if (details != null) {
    html += `    <p>${encodeHTML(details)}</p>\n`;
  }

  html += "  </body>\n";
  html += "<html>\n";

  setResponseStatus(event, toStatus(code));

  return send(event, html, "text/html");
}
