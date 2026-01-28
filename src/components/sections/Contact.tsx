import { Mail, MapPin, Send, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSubmitContactForm } from "@/hooks/useContactInfo";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import { motion, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                Motion Config                                */
/* -------------------------------------------------------------------------- */

const FADE_UP: Transition = {
  duration: 0.45,
  ease: "easeOut",
};

const STAGGER: Transition = {
  staggerChildren: 0.06,
};

/* -------------------------------------------------------------------------- */
/*                              Floating Input                                 */
/* -------------------------------------------------------------------------- */

const FloatingInput = ({ label, id, className, textarea, ...props }: any) => {
  const Component = textarea ? "textarea" : "input";

  return (
    <div className="relative">
      <Component
        id={id}
        placeholder=" "
        className={cn(
          "peer w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl outline-none text-white placeholder-transparent",
          "focus:border-accent focus:ring-1 focus:ring-accent/20 focus:bg-white/[0.06]",
          "transition-all duration-200 resize-none",
          className,
        )}
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-3.5 text-white/40 text-xs font-medium transition-all
          peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-white/50
          peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-accent"
      >
        {label}
      </label>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  Contact                                    */
/* -------------------------------------------------------------------------- */

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const { data: settings } = useSiteSettings();
  const submitContact = useSubmitContactForm();

  const getVal = (key: string, fallback: string) =>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitContact.mutateAsync(formData);
      toast.success("Message sent successfully");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send message");
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
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 md:p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  id="name"
                  label="Name"
                  value={formData.name}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <FloatingInput
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e: any) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <FloatingInput
                id="subject"
                label="Subject"
                value={formData.subject}
                onChange={(e: any) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
              />

              <FloatingInput
                id="message"
                label="Message"
                textarea
                rows={3}
                value={formData.message}
                onChange={(e: any) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
              />

              <Button
                type="submit"
                size="lg"
                className="w-full h-11 bg-accent text-black hover:bg-white hover:text-black font-semibold text-sm"
                disabled={submitContact.isPending}
              >
                {submitContact.isPending ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Message
              </Button>

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

const ContactRow = ({ icon: Icon, label, value, href }: any) => {
  const Wrapper = href ? "a" : "div";
  const props = href ? { href, target: "_blank", rel: "noreferrer" } : {};

  return (
    <Wrapper
      {...props}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors"
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
