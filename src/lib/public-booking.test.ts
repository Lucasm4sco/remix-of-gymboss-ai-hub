import { test } from "node:test";
import { strict as assert } from "node:assert";
import { publicBookingSchema } from "./public-booking";

const booking = {
  academy: { id: "fictional-academy", name: "Fictional gym", slug: "fictional", cor_primaria: null, telefone: null },
  plans: [], schedule: [],
};
test("public booking accepts only public academy fields", () => {
  assert.equal(publicBookingSchema.safeParse(booking).success, true);
  for (const field of ["owner_email", "owner_nome", "owner_telefone", "cnpj", "email", "endereco", "valor_mensal", "ultimo_acesso"]) {
    assert.equal(publicBookingSchema.safeParse({ ...booking, academy: { ...booking.academy, [field]: "fictional-private" } }).success, false);
  }
});
test("public schedule never includes internal staff identities", () => {
  const slot = { id: "fictional-slot", name: "Class", modality: null, day_of_week: 1, start_time: "09:00", end_time: "10:00" };
  assert.equal(publicBookingSchema.safeParse({ ...booking, schedule: [slot] }).success, true);
  for (const field of ["instructor_id", "instructor_name"]) {
    assert.equal(publicBookingSchema.safeParse({ ...booking, schedule: [{ ...slot, [field]: "fictional-private" }] }).success, false);
  }
});