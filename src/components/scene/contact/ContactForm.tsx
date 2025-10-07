"use client";

import emailjs from "@emailjs/browser";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue } from "jotai";
import { domAnimation, LazyMotion } from "motion/react";
import * as m from "motion/react-m";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  activeInputElementAtom,
  isMobileAtom,
  keyboardVisibleAtom,
} from "@/atoms/atomStore";

import { Button } from "@/components/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shared/ui/form";
import { Input } from "@/components/shared/ui/input";
import { Separator } from "@/components/shared/ui/separator";
import { Spinner } from "@/components/shared/ui/spinner";
import { Textarea } from "@/components/shared/ui/textarea";

// Validation schema
const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z
    .string()
    .min(5, { message: "Subject must be at least 5 characters" })
    .max(100, { message: "Subject must be less than 100 characters" }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isMounted, setIsMounted] = useState(false);
  const [activeFieldName, setActiveFieldName] = useState<string | null>(null);

  const isMobile = useAtomValue(isMobileAtom);
  const keyboardVisible = useAtomValue(keyboardVisibleAtom);
  const activeInput = useAtomValue(activeInputElementAtom);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Track which form field is active based on the focused input
  useEffect(() => {
    if (activeInput && activeInput.name) {
      // Check if it's one of our contact form inputs
      const validFields = ["name", "email", "subject", "message"];
      if (validFields.includes(activeInput.name)) {
        setActiveFieldName(activeInput.name);
      } else {
        setActiveFieldName(null);
      }
    } else {
      setActiveFieldName(null);
    }
  }, [activeInput]);

  const showFloating = isMobile && keyboardVisible && activeFieldName !== null;

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // EmailJS configuration from environment variables
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error("EmailJS configuration is missing");
      }

      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: data.name,
          from_email: data.email,
          subject: data.subject,
          message: data.message,
        },
        publicKey,
      );

      setSubmitStatus("success");
      form.reset();

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    } catch (error) {
      console.debug("Failed to send email - Full error:", error);
      console.debug("Error text:", (error as any)?.text);
      console.debug("Error status:", (error as any)?.status);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to render a floating field
  const renderFloatingField = () => {
    if (!activeFieldName) return null;

    const fieldConfig = {
      name: { label: "Name", placeholder: "Your name", type: "text" as const },
      email: {
        label: "Email",
        placeholder: "your.email@example.com",
        type: "email" as const,
      },
      subject: {
        label: "Subject",
        placeholder: "What's this about?",
        type: "text" as const,
      },
      message: {
        label: "Message",
        placeholder: "Your message...",
        type: "textarea" as const,
      },
    };

    const config = fieldConfig[activeFieldName as keyof typeof fieldConfig];
    if (!config) return null;

    return (
      <FormField
        control={form.control}
        name={activeFieldName as keyof ContactFormValues}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-inter text-sm">{config.label}</FormLabel>
            <FormControl>
              {config.type === "textarea" ? (
                <Textarea
                  placeholder={config.placeholder}
                  className="min-h-32 resize-none px-4 py-2"
                  {...field}
                  disabled={isSubmitting}
                  autoFocus
                />
              ) : (
                <Input
                  type={config.type}
                  placeholder={config.placeholder}
                  {...field}
                  disabled={isSubmitting}
                  className="px-4 py-2"
                  autoFocus
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <>
      <LazyMotion features={domAnimation}>
        <div className="flex flex-col items-center justify-start h-full w-full px-2 pt-2 gap-2 overflow-y-auto">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            <h1 className="w-full font-regular font-merriweather text-base text-center [@media(min-width:700px)_and_(min-height:700px)]:text-lg [@media(min-width:800px)_and_(min-height:800px)]:text-xl text-muted-foreground/90">
              Get in Touch
            </h1>
          </m.div>

          <Separator className="w-full" />

          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-xl items-center justify-center my-auto"
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-inter text-sm">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your name"
                          {...field}
                          disabled={isSubmitting}
                          className="px-4 py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-inter text-sm">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          {...field}
                          disabled={isSubmitting}
                          className="px-4 py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-inter text-sm">
                        Subject
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="What's this about?"
                          {...field}
                          className="px-4 py-2"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-inter text-sm">
                        Message
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your message..."
                          className="min-h-32 resize-none px-4 py-2"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full font-inter rounded-[25px] max-w-50 mx-auto cursor-pointer h-[45px]"
                    variant="default"
                    matchBgColor={true}
                  >
                    {isSubmitting ? <Spinner /> : "Send Message"}
                  </Button>

                  {submitStatus === "success" && (
                    <p className="text-sm text-center text-muted-foreground font-inter">
                      Message sent successfully!
                    </p>
                  )}

                  {submitStatus === "error" && (
                    <>
                      <p className="text-sm text-center text-muted-foreground font-inter pt-2">
                        Failed to send message. Please try again or email me
                        directly at{" "}
                        <span className="text-sm text-center text-muted-foreground font-inter">
                          <a
                            href="mailto:contact@levezze.com"
                            className="text-sm underline-offset-4 hover:underline font-semibold"
                          >
                            contact@levezze.com
                          </a>
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </form>
            </Form>
          </m.div>
        </div>
      </LazyMotion>

      {/* Floating Input Portal for Mobile */}
      {isMounted &&
        showFloating &&
        createPortal(
          <div className="fixed left-0 right-0 bottom-0 z-[9999] py-2 bg-background/95 px-4">
            <Form {...form}>{renderFloatingField()}</Form>
          </div>,
          document.body,
        )}
    </>
  );
};

export default ContactForm;
