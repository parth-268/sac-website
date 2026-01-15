import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useContactInfo, useSubmitContactForm } from "@/hooks/useContactInfo";
import { toast } from "sonner";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const { data: contactInfo, isLoading } = useContactInfo();
  const submitContact = useSubmitContactForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitContact.mutateAsync(formData);
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <section id="contact" className="section-padding bg-background">
      <div className="container-wide mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-accent font-semibold text-sm tracking-wider uppercase mb-4 font-body">
            Get in Touch
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Contact Us
          </h2>
          <p className="text-muted-foreground text-lg font-body leading-relaxed">
            Have questions or suggestions? We'd love to hear from you. Reach out
            to the Student Affairs Council.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : (
              <>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
                      Address
                    </h3>
                    <p className="text-muted-foreground font-body whitespace-pre-line">
                      {contactInfo?.address ||
                        "Indian Institute of Management Sambalpur\nJyoti Vihar, Burla, Sambalpur\nOdisha - 768019"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
                      Email
                    </h3>
                    <a
                      href={`mailto:${contactInfo?.email || "sac@iimsambalpur.ac.in"}`}
                      className="text-muted-foreground hover:text-accent font-body transition-colors"
                    >
                      {contactInfo?.email || "sac@iimsambalpur.ac.in"}
                    </a>
                  </div>
                </div>

                {contactInfo?.phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
                        Phone
                      </h3>
                      <p className="text-muted-foreground font-body">
                        {contactInfo.phone}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Social Links */}
            <div className="pt-4">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                Follow Us
              </h3>
              <div className="flex gap-4">
                {["Instagram", "LinkedIn", "Twitter", "Facebook"].map(
                  (social) => (
                    <a
                      key={social}
                      href="#"
                      className="px-4 py-2 bg-secondary rounded-lg text-sm font-body text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {social}
                    </a>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl p-8 shadow-card"
          >
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-2 font-body"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all font-body text-foreground"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2 font-body"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all font-body text-foreground"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-foreground mb-2 font-body"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all font-body text-foreground"
                  placeholder="Enter subject"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-foreground mb-2 font-body"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all font-body text-foreground resize-none"
                  placeholder="Your message..."
                  required
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                size="xl"
                className="w-full"
                disabled={submitContact.isPending}
              >
                {submitContact.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
