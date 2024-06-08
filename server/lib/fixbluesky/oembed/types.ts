import type { H3Event } from "h3";
import type { Storage } from "unstorage";

export interface OEmbedContext {
  event: H3Event;
  params?: Record<string, any>;
  agent: BskyAgentActivator;
  cache: Storage;
  format: "json" | "xml";
}
