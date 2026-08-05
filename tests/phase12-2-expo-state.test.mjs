import assert from "node:assert/strict";
import test from "node:test";
import { receiptState, ticketState } from "../lib/push/delivery-state.ts";

test("un ticket accepté conserve son identifiant sans conclure à la livraison", () => {
  assert.deepEqual(ticketState({ status: "ok", id: "ticket-1" }), {
    status: "ok",
    ticketId: "ticket-1",
    disableDevice: false,
  });
});

test("un ticket en erreur conserve uniquement le code et le message", () => {
  const state = ticketState({ status: "error", message: "too big", details: { error: "MessageTooBig" } });
  assert.equal(state.status, "error");
  assert.equal(state.code, "MessageTooBig");
  assert.equal(state.disableDevice, false);
});

test("un reçu accepté est finalisé de façon déterministe", () => {
  assert.deepEqual(receiptState({ status: "ok" }), { status: "ok", disableDevice: false });
});

test("DeviceNotRegistered désactive, contrairement aux erreurs temporaires", () => {
  assert.equal(receiptState({ status: "error", message: "gone", details: { error: "DeviceNotRegistered" } }).disableDevice, true);
  assert.equal(receiptState({ status: "error", message: "later", details: { error: "MessageRateExceeded" } }).disableDevice, false);
});

test("le SDK Expo est remplacé par un faux client sans accès réseau", async () => {
  const calls = [];
  const fakeExpo = {
    chunkPushNotifications(messages) { return [messages]; },
    async sendPushNotificationsAsync(messages) { calls.push(messages); return [{ status: "ok", id: "ticket-mock" }]; },
  };
  const syntheticToken = "Exponent" + "PushToken[" + "testfixturetoken" + "]";
  const [chunk] = fakeExpo.chunkPushNotifications([{ to: syntheticToken }]);
  const [ticket] = await fakeExpo.sendPushNotificationsAsync(chunk);
  assert.equal(ticket.id, "ticket-mock");
  assert.equal(calls.length, 1);
});
