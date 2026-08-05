export function hasHistoricalPhotoReferences(referenceCount: number | null) {
  return (referenceCount ?? 0) > 0;
}
