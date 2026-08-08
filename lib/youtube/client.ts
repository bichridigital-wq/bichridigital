import "server-only";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const DEFAULT_TIMEOUT_MS = 8_000;

export class YouTubeConfigurationError extends Error {
  constructor() {
    super("La configuration YouTube du serveur est incomplète.");
    this.name = "YouTubeConfigurationError";
  }
}

export class YouTubeTimeoutError extends Error {
  constructor() {
    super("La requête YouTube a expiré.");
    this.name = "YouTubeTimeoutError";
  }
}

export class YouTubeApiError extends Error {
  constructor(public readonly status: number) {
    super("Le service YouTube a refusé la requête.");
    this.name = "YouTubeApiError";
  }
}

export class YouTubeInvalidResponseError extends Error {
  constructor() {
    super("Le service YouTube a retourné une réponse invalide.");
    this.name = "YouTubeInvalidResponseError";
  }
}

export function getYouTubeChannelId(): string {
  const channelId = process.env.YOUTUBE_CHANNEL_ID?.trim();
  if (!channelId) throw new YouTubeConfigurationError();
  return channelId;
}

type YouTubeRequestOptions = {
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
  timeoutMs?: number;
};

export async function youtubeRequest<T>(
  resource: string,
  parameters: Record<string, string | number>,
  options: YouTubeRequestOptions = {}
): Promise<T> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  getYouTubeChannelId();
  if (!apiKey) throw new YouTubeConfigurationError();

  const url = new URL(`${YOUTUBE_API_BASE_URL}/${resource}`);
  for (const [name, value] of Object.entries(parameters)) {
    url.searchParams.set(name, String(value));
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      signal: controller.signal,
      ...(options.cache
        ? { cache: options.cache }
        : {
            next: {
              revalidate: options.revalidate ?? 300,
              tags: options.tags,
            },
          }),
    });

    if (!response.ok) throw new YouTubeApiError(response.status);

    try {
      return (await response.json()) as T;
    } catch {
      throw new YouTubeInvalidResponseError();
    }
  } catch (error) {
    if (error instanceof YouTubeApiError || error instanceof YouTubeInvalidResponseError) {
      throw error;
    }
    if (controller.signal.aborted) throw new YouTubeTimeoutError();
    throw new YouTubeApiError(0);
  } finally {
    clearTimeout(timeout);
  }
}
