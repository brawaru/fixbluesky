import { BskyAgent } from "@atproto/api";
import { H3Event, EventHandlerRequest } from "h3";

const BskyAgentSymbol = Symbol("agent");

export type BskyAgentActivator = () => Promise<BskyAgent>;

export function setBlueskyAgent(
  event: H3Event<EventHandlerRequest>,
  activator: BskyAgentActivator
) {
  (event.context as any)[BskyAgentSymbol] = activator;
}

export function getBlueskyAgent(event: H3Event<EventHandlerRequest>) {
  const activator = (event.context as any)[BskyAgentSymbol] as
    | BskyAgentActivator
    | undefined;

  if (activator == null) {
    throw new Error("Cannot receive Bluesky agent");
  }

  return activator;
}

export function useBskyStorage() {
  return useStorage("bsky");
}
