import type { ExpoPushReceipt, ExpoPushTicket } from "expo-server-sdk";

function shouldDisableDevice(errorCode: string | undefined) {
  return errorCode === "DeviceNotRegistered";
}

export function ticketState(ticket: ExpoPushTicket) {
  if (ticket.status === "ok") {
    return { status: "ok" as const, ticketId: ticket.id, disableDevice: false };
  }
  const code = ticket.details?.error ?? "ExpoError";
  return {
    status: "error" as const,
    code,
    message: "Ticket Expo refusé.",
    disableDevice: shouldDisableDevice(code),
  };
}

export function receiptState(receipt: ExpoPushReceipt) {
  if (receipt.status === "ok") {
    return { status: "ok" as const, disableDevice: false };
  }
  const code = receipt.details?.error ?? "ExpoError";
  return {
    status: "error" as const,
    code,
    message: "Reçu Expo en erreur.",
    disableDevice: shouldDisableDevice(code),
  };
}
