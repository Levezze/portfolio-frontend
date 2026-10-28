"use client";

import { type CSSProperties, useState } from "react";
import {
  type ContactErrors,
  type ContactValues,
  emailConfig,
  emailParams,
  validateContact,
} from "../contact";
import { CONTACT } from "../content";
import type { Design } from "../presets";
import { Frame, h1, type PageProps, panel } from "./shared";

const field: CSSProperties = {
  ...panel,
  background: "var(--well)",
};

const inputClass =
  "px-4 py-3 text-base outline-none placeholder:text-[var(--faint)] focus:[--panel-line:var(--accent)]";

type SendState = "idle" | "sending" | "sent" | "error";

/** Sends through EmailJS, to the same template the old site's form used. */
function ContactForm({ design }: { design: Design }) {
  const [values, setValues] = useState<ContactValues>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [state, setState] = useState<SendState>("idle");
  const set =
    (k: keyof ContactValues) => (e: { target: { value: string } }) => {
      setValues((v) => ({ ...v, [k]: e.target.value }));
      if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
      if (state === "sent" || state === "error") setState("idle");
    };

  const submit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const config = emailConfig(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    );
    if (!config) {
      // A deploy without the NEXT_PUBLIC_EMAILJS_* ids: say so where it's seen.
      console.error("Contact form: EmailJS ids are not configured.");
      setState("error");
      return;
    }
    setState("sending");
    try {
      const { default: emailjs } = await import("@emailjs/browser");
      await emailjs.send(
        config.serviceId,
        config.templateId,
        emailParams(values),
        config.publicKey,
      );
      setValues({ name: "", email: "", message: "" });
      setState("sent");
      window.gtag?.("event", "contact_form_submitted");
    } catch (error) {
      console.error("Contact form: EmailJS send failed.", error);
      setState("error");
    }
  };

  const fieldError = (k: keyof ContactValues) =>
    errors[k] && (
      <span id={`contact-${k}-error`} className="text-sm text-[var(--accent)]">
        {errors[k]}
      </span>
    );
  const aria = (k: keyof ContactValues) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `contact-${k}-error` : undefined,
  });

  return (
    <form
      className="flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
      onSubmit={submit}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={`text-[var(--faint)] ${design.label}`}>Name</span>
          <input
            className={inputClass}
            style={field}
            placeholder="Your name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={set("name")}
            {...aria("name")}
          />
          {fieldError("name")}
        </label>
        <label className="flex flex-col gap-2">
          <span className={`text-[var(--faint)] ${design.label}`}>Email</span>
          <input
            className={inputClass}
            style={field}
            placeholder="you@company.com"
            type="email"
            name="email"
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
            {...aria("email")}
          />
          {fieldError("email")}
        </label>
      </div>
      <label className="flex flex-col gap-2 lg:max-h-[24rem] lg:min-h-0 lg:flex-1">
        <span className={`text-[var(--faint)] ${design.label}`}>Message</span>
        <textarea
          className={`min-h-40 resize-none lg:flex-1 ${inputClass}`}
          style={field}
          placeholder="Your message"
          name="message"
          value={values.message}
          onChange={set("message")}
          {...aria("message")}
        />
        {fieldError("message")}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <button
          type="submit"
          disabled={state === "sending"}
          className={`w-full px-6 py-3 sm:w-auto text-[var(--on-accent)] transition-opacity hover:opacity-85 disabled:opacity-60 ${design.label}`}
          style={{
            background: "var(--accent)",
            borderRadius: "var(--radius)",
          }}
        >
          {state === "sending" ? "Sending…" : "Send message"}
        </button>
        <output className="text-sm text-[var(--muted)]">
          {state === "sent" && "Thanks, your message is on its way."}
          {state === "error" &&
            `Couldn't send it. Email me at ${CONTACT.email} instead.`}
        </output>
      </div>
    </form>
  );
}

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: object) => void;
  }
}

export function ContactPage({ skin, nav, ref }: PageProps) {
  const { design } = skin;
  const [copied, setCopied] = useState(false);
  const input = field;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the address is on screen to select.
    }
  };
  return (
    <Frame index={3} title="Contact" skin={skin} nav={nav} ref={ref}>
      <div
        className="mt-8 grid min-h-0 flex-1 gap-10 overflow-y-auto lg:grid-cols-[1fr_1.1fr] lg:overflow-visible"
        data-lab-scroll
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full">
              {/* biome-ignore lint/performance/noImgElement: snapshot test needs a plain img */}
              <img
                src="/images/photo-lev.jpg"
                alt="Lev Zhitnik"
                className="h-full w-full object-cover grayscale"
              />
            </div>
            <h1 className={h1(design)}>Contact</h1>
          </div>
          <p className="mt-6 max-w-md text-[var(--muted)]">{CONTACT.blurb}</p>
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center" style={input}>
              <a
                href={`mailto:${CONTACT.email}`}
                className={`py-4 text-lg transition-colors hover:text-[var(--accent)] px-5`}
              >
                {CONTACT.email}
              </a>
              <button
                type="button"
                onClick={copy}
                className={`ml-auto py-4 text-[var(--accent)] transition-opacity hover:opacity-70 px-5 ${design.label}`}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className={`flex gap-6 text-[var(--muted)] ${design.label}`}>
              {CONTACT.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-[var(--accent)]"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
          <p className="mt-auto hidden pt-8 text-sm text-[var(--faint)] lg:block">
            {CONTACT.location}
          </p>
        </div>
        <ContactForm design={design} />
      </div>
    </Frame>
  );
}
