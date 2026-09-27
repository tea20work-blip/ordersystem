import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact Us | Tea 20 Cafe",
  description:
    "Contact Tea 20 Cafe in Jaipur for order inquiries, support, reservations, and feedback.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>

        <div className="bg-card border rounded-2xl shadow-sm p-6 sm:p-10 space-y-8">
          {/* Header */}
          <div className="border-b pb-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <MessageSquare className="h-3.5 w-3.5" /> Customer Support Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Contact Us
            </h1>
            <p className="text-sm text-muted-foreground">
              Have questions about your order, payment, or feedback? Get in
              touch with us anytime.
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid gap-4 ">
            <div className="p-5 rounded-xl border bg-muted/20 space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>Cafe Location & Address</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tea 20 Cafe
                <br />
                Gyan Vihar Marg, OBC Colony,
                <br />
                Karolan Ka Barh, Jagatpura,
                <br />
                Jaipur, Rajasthan – 302017, India
              </p>
            </div>

            <div className="p-5 rounded-xl border bg-muted/20 space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <span>Operational Hours</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monday to Sunday:{" "}
                <strong className="text-foreground">10:00 AM – 11:00 PM</strong>
                <br />
                Kitchen & Counter Open All 7 Days
              </p>
            </div>

            <div className="p-5 rounded-xl border bg-muted/20 space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span>Phone & WhatsApp</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Call / WhatsApp:{" "}
                <a
                  href="tel:+918072152345"
                  className="text-primary font-medium hover:underline"
                >
                  +91 80721 52345
                </a>
                <br />
                Counter Assistance: Available during operational hours
              </p>
            </div>

            <div className="p-5 rounded-xl border bg-muted/20 space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>Email Support</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Support & Billing:{" "}
                <a
                  href="mailto:tea20work@gmail.com"
                  className="text-primary font-medium hover:underline"
                >
                  tea20work@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Grievance & Payment Support Notice */}
          <div className="p-5 rounded-xl border bg-primary/5 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Razorpay Payment & Transaction Support</span>
            </div>
            <p>
              If your payment was debited but your order was not confirmed, or
              for any duplicate transaction inquiries, please provide your{" "}
              <strong className="text-foreground">Razorpay Payment ID</strong>{" "}
              and <strong className="text-foreground">Mobile Number</strong>{" "}
              when contacting us. We will assist with reconciliation within 24
              hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
