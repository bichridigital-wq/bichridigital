"use server";

import { getPublishedTvNews } from "../../lib/tv-news";

export async function getPublishedTvNewsAction() {
  return getPublishedTvNews();
}
