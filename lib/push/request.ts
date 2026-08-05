const PUSH_BODY_MAX_BYTES = 16 * 1024;

export class PushHttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function readPushJson(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    throw new PushHttpError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type application/json requis.");
  }
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > PUSH_BODY_MAX_BYTES) {
    throw new PushHttpError(413, "PAYLOAD_TOO_LARGE", "Requête trop volumineuse.");
  }
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > PUSH_BODY_MAX_BYTES) {
    throw new PushHttpError(413, "PAYLOAD_TOO_LARGE", "Requête trop volumineuse.");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new PushHttpError(422, "INVALID_JSON", "JSON invalide.");
  }
}
