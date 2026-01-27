import { Mail, MapPin, Send, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
// Keep for Submission
import { useSubmitContactForm } from "@/hooks/useContactInfo";
// Use for Reading Settings
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const FloatingInput = ({ label, id, className, textarea, ...props }: any) => {
  const Component = textarea ? "textarea" : "input";
  return (
    <div className="relative group">
      <Component
        id={id}
        placeholder=" "
        className={cn(
          "peer w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl outline-none text-white placeholder-transparent focus:border-accent focus:ring-1 focus:ring-accent/20 focus:bg-white/[0.05] transition-all duration-300 pt-7 pb-2 resize-none",
          className,
        )}
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute left-5 top-4 text-white/40 text-[10px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/50 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-accent peer-focus:tracking-widest peer-focus:uppercase pointer-events-none"
      >
        {label}
      </label>
    </div>
  );
};

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const { data: settings } = useSiteSettings();
  const submitContact = useSubmitContactForm();

  // Helper with fallback
  const getVal = (key: string, fallback: string) =>
    settings?.find((s) => s.setting_key === key)?.setting_value || fallback;

  // DYNAMIC VALUES
  const email = getVal("contact_email", "sac@iimsambalpur.ac.in");
  const address = getVal("contact_address", "IIM Sambalpur, Odisha");
  const mapUrl = getVal("contact_map_url", "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitContact.mutateAsync(formData);
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message.");
    }
  };

  return (
    <section
      id="contact"
      className="relative bg-[#0a0f1d] pt-32 pb-24 overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-16 md:h-24 overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 1440 100"
          className="absolute bottom-0 w-full h-full text-slate-50 fill-current"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C480,100 960,100 1440,0 L1440,0 L0,0 Z" />
        </svg>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      </div>

      <div className="container-wide mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10 pt-4"
          >
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#eab308]"></span>
                <span className="text-white/90 font-bold tracking-widest text-[10px] uppercase">
                  Contact
                </span>
              </div>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1]">
                Let's Start a <br />{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-500">
                  Conversation.
                </span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                Have questions about student affairs, events, or policies? We
                are here to listen and help.
              </p>
            </div>

            <div className="space-y-6">
              <ContactCard
                icon={Mail}
                title="Email Us"
                value={email}
                href={`mailto:${email}`}
              />
              {/* Dynamic Map Link */}
              <ContactCard
                icon={MapPin}
                title="Visit Campus"
                value={address}
                href={mapUrl}
              />
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
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
                label="How can we help?"
                textarea
                rows={4}
                value={formData.message}
                onChange={(e: any) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
              />

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 bg-accent text-black hover:bg-white hover:text-black font-bold text-sm tracking-wide"
                disabled={submitContact.isPending}
              >
                {submitContact.isPending ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ContactCard = ({ icon: Icon, title, value, href }: any) => {
  // If href is empty (e.g. no map url), it renders as a div, otherwise as a link
  const Wrapper = href ? "a" : "div";
  const props = href ? { href, target: "_blank", rel: "noreferrer" } : {};

  return (
    <Wrapper
      {...props}
      className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group cursor-pointer block"
    >
      <div className="p-3 rounded-full bg-accent/10 text-accent group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-white text-sm">{title}</h4>
        <p className="text-white/60 text-sm whitespace-pre-wrap">{value}</p>
      </div>
      {href && (
        <ArrowRight className="ml-auto w-4 h-4 text-white/20 group-hover:text-accent transition-colors" />
      )}
    </Wrapper>
  );
};
