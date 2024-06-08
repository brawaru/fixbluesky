import type { H3Event } from "h3";
import type { Nodes, RootContent } from "hast";
import { toHtml } from "hast-util-to-html";

export function sendHTML(event: H3Event, xml: Nodes | RootContent[]) {
  return send(event, toHtml(xml), "text/html");
}
