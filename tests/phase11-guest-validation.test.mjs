import assert from "node:assert/strict";
import test from "node:test";
import {
  validateGuestFormData,
  validateGuestSelections,
} from "../lib/guests/validation.ts";

function validGuestForm() {
  const form = new FormData();
  form.set("full_name", "  Awa   Ndiaye  ");
  form.set("slug", "awa-ndiaye");
  form.set("sort_order", "2");
  form.set("is_active", "on");
  return form;
}

test("un invité sans photo est normalisé et actif", () => {
  const guest = validateGuestFormData(validGuestForm());
  assert.equal(guest.fullName, "Awa Ndiaye");
  assert.equal(guest.photoUrl, null);
  assert.equal(guest.photoStoragePath, null);
  assert.equal(guest.isActive, true);
  assert.equal(guest.sortOrder, 2);
});

test("l'absence de case active désactive l'invité", () => {
  const form = validGuestForm();
  form.delete("is_active");
  assert.equal(validateGuestFormData(form).isActive, false);
});

test("les champs obligatoires, le slug et l'ordre sont validés", () => {
  const missingName = validGuestForm();
  missingName.delete("full_name");
  assert.throws(() => validateGuestFormData(missingName), /nom est obligatoire/i);

  const invalidSlug = validGuestForm();
  invalidSlug.set("slug", "Awa Ndiaye");
  assert.throws(() => validateGuestFormData(invalidSlug), /slug doit contenir/i);

  const invalidOrder = validGuestForm();
  invalidOrder.set("sort_order", "-1");
  assert.throws(() => validateGuestFormData(invalidOrder), /entier positif/i);
});

test("un événement sans invité reste valide", () => {
  assert.deepEqual(validateGuestSelections(new FormData()), []);
});

test("une association existante conserve son identifiant et son choix de snapshot", () => {
  const form = new FormData();
  form.set(
    "guest_selections",
    JSON.stringify([
      {
        associationId: "10000000-0000-4000-8000-000000000001",
        guestId: "20000000-0000-4000-8000-000000000001",
        roleLabel: "  Invité   principal ",
      },
    ]),
  );
  const [selection] = validateGuestSelections(form);
  assert.equal(selection.associationId, "10000000-0000-4000-8000-000000000001");
  assert.equal(selection.roleLabel, "Invité principal");
  assert.equal(selection.refreshSnapshot, false);
});

test("les identifiants et doublons falsifiés sont rejetés", () => {
  const invalidId = new FormData();
  invalidId.set(
    "guest_selections",
    JSON.stringify([{ associationId: null, guestId: "invalid" }]),
  );
  assert.throws(() => validateGuestSelections(invalidId), /invité est invalide/i);

  const duplicate = new FormData();
  duplicate.set(
    "guest_selections",
    JSON.stringify([
      { associationId: null, guestId: "20000000-0000-4000-8000-000000000001" },
      { associationId: null, guestId: "20000000-0000-4000-8000-000000000001" },
    ]),
  );
  assert.throws(() => validateGuestSelections(duplicate), /deux fois/i);
});
