import { Mail, MapPin, Send, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSubmitContactForm } from "@/hooks/useContactInfo";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import { motion, type Transition } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ComponentType,
} from "react";

/* -------------------------------------------------------------------------- */
/*                                Motion Config                                */
/* -------------------------------------------------------------------------- */

const FADE_UP: Transition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1], // easeOutCubic
};

const STAGGER: Transition = {
  staggerChildren: 0.04,
};

/* -------------------------------------------------------------------------- */
/*                              Floating Input                                 */
/* -------------------------------------------------------------------------- */

type FloatingInputProps =
  | ({
      textarea?: false;
    } & InputHTMLAttributes<HTMLInputElement> & {
        label: string;
        id: string;
      })
  | ({
      textarea: true;
    } & TextareaHTMLAttributes<HTMLTextAreaElement> & {
        label: string;
        id: string;
      });

const FloatingInput = (props: FloatingInputProps) => {
  const { label, id, className, textarea, ...rest } = props;

  const baseClassName = cn(
    "peer w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl outline-none text-white placeholder-transparent",
    "focus:border-accent focus:ring-2 focus:ring-accent/20 focus:bg-white/[0.08]",
    "aria-[invalid=true]:border-red-400/60 aria-[invalid=true]:ring-red-400/20",
    "transition-all duration-200 resize-none",
    textarea ? "min-h-[100px]" : "",
    className,
  );

  return (
    <div className="relative">
      {textarea ? (
        <textarea
          id={id}
          placeholder=" "
          className={baseClassName}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={id}
          placeholder=" "
          className={baseClassName}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      <label
        htmlFor={id}
        className="absolute left-4 top-3 text-white/50 text-sm font-medium pointer-events-none
          transition-all duration-200 ease-out
          peer-focus:top-1.5 peer-focus:text-[8px] peer-focus:text-accent
          peer-[&:not(:placeholder-shown)]:top-1.5
          peer-[&:not(:placeholder-shown)]:text-[8px] peer-[&:not(:placeholder-shown)]:text-white/60"
      >
        {label}
      </label>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  Contact                                    */
/* -------------------------------------------------------------------------- */

type TouchedFields = Partial<
  Record<"name" | "email" | "subject" | "message", boolean>
>;

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<TouchedFields>({});

  const prefersReducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (submitted) {
      document.getElementById("contact")?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }
  }, [submitted, prefersReducedMotion]);

  useEffect(() => {
    if (submitted && Object.values(formData).some(Boolean)) {
      setSubmitted(false);
    }
  }, [formData, submitted]);

  const { data: settings } = useSiteSettings();
  const submitContact = useSubmitContactForm();

  type ContactSettingKey =
    | "contact_email"
    | "contact_address"
    | "contact_map_url";

  const getVal = (key: ContactSettingKey, fallback: string) =>
    settings?.find((s) => s.setting_key === key)?.setting_value || fallback;

  const email = getVal("contact_email", "sac@iimsambalpur.ac.in");
  const address = getVal("contact_address", "IIM Sambalpur, Odisha");
  const mapUrl = getVal("contact_map_url", "");

  /* ---------------------------------------------------------------------- */
  /*  FUTURE EXTENSION POINT – Google Email Sync                              */
  /*                                                                          */
  /*  Intention:                                                             */
  /*  - On successful submit, also send email via Gmail API                  */
  /*  - Requires OAuth + backend token exchange                              */
  /*                                                                          */
  /*  Example (future):                                                      */
  /*  await sendViaGmail({                                                    */
  /*    to: "yourname@gmail.com",                                             */
  /*    subject, message                                                     */
  /*  })                                                                      */
  /* ---------------------------------------------------------------------- */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitContact.isPending || submitted) return;

    const form = e.currentTarget as HTMLFormElement & {
      company?: { value: string };
    };

    // Honeypot check — silently ignore spam
    if (form.company?.value) return;

    try {
      await submitContact.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTouched({});
    } catch {
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <section
      id="contact"
      className="relative bg-[#0a0f1d] py-8 md:py-14 overflow-hidden"
    >
      {/* Subtle Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[30%] right-[-15%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-15%] w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="container-wide mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={STAGGER}
          className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start"
        >
          {/* ------------------------------------------------------------------ */}
          {/* Info Side                                                           */}
          {/* ------------------------------------------------------------------ */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={FADE_UP}
            className="space-y-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-white/80 text-[10px] uppercase tracking-widest font-bold">
                  Contact
                </span>
              </div>

              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">
                Get in Touch
              </h2>

              <p className="text-white/60 text-sm max-w-md leading-relaxed">
                This section is optional — but if you have a question, idea, or
                collaboration in mind, we’re happy to hear from you.
              </p>
            </div>

            <div className="space-y-4">
              <ContactRow
                icon={Mail}
                label="Email"
                value={email}
                href={`mailto:${email}`}
              />
              <ContactRow
                icon={MapPin}
                label="Address"
                value={address}
                href={mapUrl}
              />
            </div>
          </motion.div>

          {/* ------------------------------------------------------------------ */}
          {/* Form Side                                                           */}
          {/* ------------------------------------------------------------------ */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={FADE_UP}
            className="bg-white/[0.035] border border-white/10 rounded-2xl p-5 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
          >
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              aria-label="Contact form"
            >
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingInput
                  id="name"
                  label="Name"
                  value={formData.name}
                  aria-invalid={touched.name && !formData.name}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  disabled={submitted}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.currentTarget.value })
                  }
                  required
                  maxLength={80}
                />
                <FloatingInput
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  aria-invalid={touched.email && !formData.email}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  inputMode="email"
                  autoComplete="email"
                  disabled={submitted}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.currentTarget.value })
                  }
                  required
                />
              </div>

              <FloatingInput
                id="subject"
                label="Subject"
                value={formData.subject}
                aria-invalid={touched.subject && !formData.subject}
                onBlur={() => setTouched((t) => ({ ...t, subject: true }))}
                disabled={submitted}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.currentTarget.value })
                }
                required
                maxLength={120}
              />

              <FloatingInput
                id="message"
                label="Message"
                textarea
                rows={3}
                value={formData.message}
                aria-invalid={touched.message && !formData.message}
                onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                disabled={submitted}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.currentTarget.value })
                }
                required
                maxLength={500}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 bg-accent text-black hover:bg-white hover:text-black font-semibold text-sm transition-all active:scale-[0.98]"
                disabled={submitContact.isPending || submitted}
                aria-busy={submitContact.isPending}
              >
                {submitContact.isPending ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Message
              </Button>

              {submitted && (
                <motion.div
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="text-sm text-accent text-center pt-2"
                >
                  Thanks for reaching out — we’ll get back to you soon.
                </motion.div>
              )}

              {/* Future hint */}
              <p className="text-[10px] text-white/40 text-center">
                Messages can be configured to sync with Google Mail in future.
              </p>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*                               Contact Row                                   */
/* -------------------------------------------------------------------------- */

type ContactRowProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
};

const ContactRow = ({ icon: Icon, label, value, href }: ContactRowProps) => {
  const Wrapper = href ? "a" : "div";
  const props = href ? { href, target: "_blank", rel: "noreferrer" } : {};

  return (
    <Wrapper
      {...props}
      className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors"
    >
      <div className="p-2 rounded-lg bg-accent/10 text-accent">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-widest text-white/40">
          {label}
        </p>
        <p className="text-sm text-white/70">{value}</p>
      </div>
      {href && (
        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-accent" />
      )}
    </Wrapper>
  );
};
