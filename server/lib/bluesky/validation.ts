import { ensureValidDid, ensureValidHandle } from "@atproto/syntax";

export function isDid(value: string) {
  try {
    ensureValidDid(value);
    return true;
  } catch {
    return false;
  }
}

export function isHandle(value: string) {
  try {
    ensureValidHandle(value);
    return true;
  } catch {
    return false;
  }
}
