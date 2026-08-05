import assert from "node:assert/strict";
import test from "node:test";
import { hasHistoricalPhotoReferences } from "../lib/guests/photo-retention.ts";

test("une ancienne photo référencée doit être conservée", () => {
  assert.equal(hasHistoricalPhotoReferences(1), true);
  assert.equal(hasHistoricalPhotoReferences(12), true);
});

test("une photo sans référence historique peut être supprimée", () => {
  assert.equal(hasHistoricalPhotoReferences(0), false);
  assert.equal(hasHistoricalPhotoReferences(null), false);
});
