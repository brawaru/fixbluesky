import type { H3Event } from "h3";
import type { Nodes } from "xast";
import { toXml } from "xast-util-to-xml";

export function sendXml(event: H3Event, xml: Nodes | Nodes[]) {
  return send(event, toXml(xml), "application/xml");
}
