import { BskyAgent, type AtpSessionData } from "@atproto/api";
import { setBlueskyAgent } from "~/utils/bluesky";
import { getTimestamp } from "~/utils/timestamps";

interface SessionStorageItem {
  createdAt: number;
  value: AtpSessionData;
}

const SessionTTL = 86_400; // 1d

function useSessionStore() {
  const storage = useStorage("bsky:session");

  const sessionKey = (service: string, login: string) => `${service}:${login}`;

  async function getSession(service: string, login: string) {
    const session = await storage.getItem<SessionStorageItem>(
      sessionKey(service, login)
    );
    return session != null && getTimestamp() - session.createdAt < SessionTTL
      ? session.value
      : null;
  }

  async function setSession(
    service: string,
    login: string,
    session: AtpSessionData
  ) {
    return storage.setItem(
      sessionKey(service, login),
      JSON.stringify({
        createdAt: getTimestamp(),
        value: session,
      } satisfies SessionStorageItem)
    );
  }

  return {
    getSession,
    setSession,
  };
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * Link to a Bluesky AT service where the agent will try to connect.
       * @default "https://bsky.social"
       */
      BSKY_AGENT_SERVICE?: string;

      /**
       * Identifier of the account that the agent will use to connect to the Bluesky service.
       */
      BSKY_AUTH_LOGIN?: string;

      /**
       * Password for the account that the agent will use to connect to the Bluesky service.
       */
      BSKY_AUTH_PASSWORD?: string;
    }
  }
}

export default defineNitroPlugin((nitro) => {
  const service = process.env.BSKY_AGENT_SERVICE ?? "https://bsky.social";
  const identifier = process.env.BSKY_AUTH_LOGIN!;
  const password = process.env.BSKY_AUTH_PASSWORD!;

  if (!identifier || !password) {
    throw new Error(`Either BSKY_AUTH_LOGIN or BSKY_AUTH_PASSWORD is missing`);
  }

  const sessions = useSessionStore();

  let agent: BskyAgent | undefined;

  async function activateBluesky() {
    if (agent != null) {
      return agent;
    }

    agent = new BskyAgent({ service });

    const session = await sessions.getSession(service, identifier!);
    if (session != null) {
      try {
        await agent.resumeSession(session);
        console.info("resumed session");
        return agent;
      } catch (err) {
        console.error("session resume failed", err);
      }
    }

    await agent.login({ identifier, password });
    console.log("created new session");

    try {
      await sessions.setSession(service, identifier!, agent.session!);
    } catch (err) {
      console.error("cannot save session", err);
    }

    return agent;
  }

  nitro.hooks.hook("request", (event) => {
    setBlueskyAgent(event, activateBluesky);
  });
});
