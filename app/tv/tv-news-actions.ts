"use server";

import {
  getFreshPublishedTvNews,
  getFreshPublishedTvNewsListItemById,
} from "../../lib/tv-news";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getPublishedTvNewsAction() {
  return getFreshPublishedTvNews();
}

export async function getPublishedTvNewsToastAction(id: string) {
  if (!UUID_PATTERN.test(id)) return null;
  return getFreshPublishedTvNewsListItemById(id);
}
