import { describe, expect, it } from "vitest";
import {
  CONTACT_SUBJECT,
  emailConfig,
  emailParams,
  validateContact,
} from "../contact";

const good = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I'd like to talk about a project.",
};

describe("validateContact", () => {
  it("accepts a complete message", () => {
    expect(validateContact(good)).toEqual({});
  });

  it("flags each field that is missing or malformed", () => {
    const errors = validateContact({ name: "A", email: "nope", message: "hi" });
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name"]);
  });

  it("ignores surrounding whitespace", () => {
    expect(validateContact({ ...good, name: "  A  " }).name).toBeDefined();
    expect(validateContact({ ...good, email: " ada@example.com " })).toEqual(
      {},
    );
  });

  it("caps the lengths the old form capped", () => {
    expect(
      validateContact({ ...good, name: "x".repeat(51) }).name,
    ).toBeDefined();
    expect(
      validateContact({ ...good, message: "x".repeat(1001) }).message,
    ).toBeDefined();
  });
});

describe("emailParams", () => {
  it("maps the form onto the EmailJS template the old form used", () => {
    expect(emailParams({ ...good, name: " Ada Lovelace " })).toEqual({
      from_name: "Ada Lovelace",
      from_email: "ada@example.com",
      subject: CONTACT_SUBJECT,
      message: good.message,
    });
  });
});

describe("emailConfig", () => {
  it("needs all three ids", () => {
    expect(emailConfig("s", "t", "k")).toEqual({
      serviceId: "s",
      templateId: "t",
      publicKey: "k",
    });
    expect(emailConfig("s", undefined, "k")).toBeNull();
    expect(emailConfig("", "t", "k")).toBeNull();
  });
});
