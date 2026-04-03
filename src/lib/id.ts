import { nanoid } from "nanoid";

export function newPublicId() {
  return nanoid(10);
}

