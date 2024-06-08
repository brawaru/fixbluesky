import type { H3Event } from "h3";

interface SendJSONOptions {
  space?: number | string;
}

export function sendJSON(event: H3Event, value: any, opts?: SendJSONOptions) {
  return send(
    event,
    JSON.stringify(value, null, opts?.space),
    "application/json; charset=utf-8"
  );
}
