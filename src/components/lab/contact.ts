/**
 * Pure pieces of the contact form: validation, and the EmailJS template
 * params. The template is the one the old site's form sent to, so it keeps
 * the same param names; the new form has no subject field, so the subject is
 * fixed.
 */

export type ContactValues = { name: string; email: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

export const CONTACT_SUBJECT = "New message from levezze.com";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(v: ContactValues): ContactErrors {
  const name = v.name.trim();
  const email = v.email.trim();
  const message = v.message.trim();
  const errors: ContactErrors = {};
  if (name.length < 2) errors.name = "Please enter your name";
  else if (name.length > 50) errors.name = "Keep it under 50 characters";
  if (!EMAIL.test(email)) errors.email = "Please enter a valid email";
  if (message.length < 10)
    errors.message = "Message must be at least 10 characters";
  else if (message.length > 1000)
    errors.message = "Keep it under 1000 characters";
  return errors;
}

export function emailParams(v: ContactValues) {
  return {
    from_name: v.name.trim(),
    from_email: v.email.trim(),
    subject: CONTACT_SUBJECT,
    message: v.message.trim(),
  };
}

export type EmailConfig = {
  serviceId: string;
  templateId: string;
  publicKey: string;
};

/** Null unless all three EmailJS ids are set. */
export function emailConfig(
  serviceId: string | undefined,
  templateId: string | undefined,
  publicKey: string | undefined,
): EmailConfig | null {
  if (!serviceId || !templateId || !publicKey) return null;
  return { serviceId, templateId, publicKey };
}
