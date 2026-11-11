import { test } from "node:test";
import { strict as assert } from "node:assert";
import { enviarEmailStub, type EnviarEmailPayload } from "./email-stub.server";

const safeLog = "[EMAIL STUB] (Resend nao configurado)";

for (const template of ["welcome_academy_admin", "booking_confirmation", "password_reset"] as const) {
  test(`${template}: logs contain no recipient, subject or nested sensitive data`, async () => {
    const payload: EnviarEmailPayload = {
      to: "fictional-person@example.invalid",
      subject: "Fictional private contact information",
      template,
      data: {
        email: "fictional-contact@example.invalid",
        senha: "fictional-password-marker",
        nova_senha: "fictional-reset-marker",
        telefone: "fictional-phone-marker",
        contato: { nome: "fictional-name-marker", credenciais: { token: "fictional-token-marker" } },
        arbitrary: ["fictional-private-marker"],
      },
    };
    const calls: unknown[][] = [];
    const originals = { log: console.log, info: console.info, warn: console.warn, error: console.error, debug: console.debug };
    const capture = (...args: unknown[]) => { calls.push(args); };
    let result;
    try {
      console.log = console.info = console.warn = console.error = console.debug = capture;
      result = await enviarEmailStub(payload);
    } finally {
      Object.assign(console, originals);
    }
    // Do not print captured values if a regression exposes the supplied data.
    assert.ok(calls.length === 1, "Only one status log is expected");
    assert.ok(calls.every((args) => args.length === 1 && args[0] === safeLog), "Logs must contain only the fixed status message");
    assert.deepEqual(result, { success: true, stub: true });
  });
}