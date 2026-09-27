import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, CreditCard, Mail, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy | Tea 20 Cafe",
  description: "Privacy Policy for Tea 20 Cafe online ordering system and payment processing via Razorpay.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 27, 2026";

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>

        <div className="bg-card border rounded-2xl shadow-sm p-6 sm:p-10 space-y-8">
          {/* Header */}
          <div className="border-b pb-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" /> Razorpay Compliant Policy
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Last Updated: <span className="font-medium text-foreground">{lastUpdated}</span>
            </p>
          </div>

          {/* Content sections */}
          <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">1. Introduction</h2>
              <p>
                Welcome to <strong className="text-foreground">Tea 20 Cafe</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We operate the digital ordering system for dine-in table ordering, takeaway bookings, and online billing available at <Link href="https://tea20cafe.com" className="text-primary hover:underline">tea20cafe.com</Link>.
              </p>
              <p>
                We value the privacy of our customers (&ldquo;you&rdquo; or &ldquo;user&rdquo;) and are committed to protecting your personal data in accordance with applicable Indian laws, including the Information Technology Act, 2000 and the Digital Personal Data Protection Act (DPDP), 2023.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
              <p>When you browse our digital menu, scan table QR codes, or place an order, we may collect the following information:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li><strong className="text-foreground">Contact Information:</strong> Customer name, mobile phone number, and optional email address provided during checkout.</li>
                <li><strong className="text-foreground">Order & Dining Information:</strong> Table number, selected items, dish customizations/add-ons, takeaway schedule, order timestamps, and special instructions.</li>
                <li><strong className="text-foreground">Transaction Details:</strong> Payment order ID, payment status, transaction reference numbers, and billing totals.</li>
                <li><strong className="text-foreground">Device & Usage Data:</strong> Browser type, IP address, device identifier, and session cookies to maintain your shopping cart state.</li>
              </ul>
            </section>

            <section className="space-y-3 bg-muted/40 p-5 rounded-xl border border-border/70">
              <div className="flex items-center gap-2 text-foreground font-bold text-base">
                <CreditCard className="h-5 w-5 text-primary" />
                <span>3. Payment Gateway & Financial Security (Razorpay)</span>
              </div>
              <p>
                We use <strong className="text-foreground">Razorpay</strong> as our authorized third-party payment gateway aggregator to securely process digital payments (UPI, Credit/Debit Cards, Net Banking, and Wallets).
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li><strong className="text-foreground">Zero Sensitive Card Storage:</strong> Tea 20 Cafe does <span className="underline decoration-primary">NOT</span> collect, store, or process your credit/debit card numbers, CVV, OTPs, or bank account passwords on our servers.</li>
                <li><strong className="text-foreground">PCI-DSS Compliant:</strong> All payment transactions are encrypted and transmitted directly through Razorpay&apos;s 128-bit/256-bit SSL encrypted, PCI-DSS Level 1 certified gateway.</li>
                <li>Razorpay&apos;s privacy policy governs the processing of payment transactions. You can review Razorpay&apos;s terms at <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">razorpay.com/privacy</a>.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">4. How We Use Your Information</h2>
              <p>We use your information strictly for legitimate operational purposes:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>To accept, prepare, and deliver your food and beverage orders to your designated cafe table or takeaway counter.</li>
                <li>To facilitate and verify payments via Razorpay and generate digital bills/receipts.</li>
                <li>To send order confirmations and real-time status updates via SMS, WhatsApp, or web notifications.</li>
                <li>To handle customer inquiries, order modifications, cancellations, and dispute resolutions.</li>
                <li>To comply with regulatory, accounting, tax, and legal obligations.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">5. Cookies and Local Storage</h2>
              <p>
                Our web application uses lightweight browser cookies and client-side storage (e.g., Zustand local storage) to remember your active table number, cart items, and recent order history. These ensure a seamless ordering experience without requiring account login. You can clear cookies at any time via your browser settings.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">6. Data Sharing and Disclosure</h2>
              <p>
                We do not sell, rent, or trade your personal information to any third parties for advertising or marketing purposes. We only share information with:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li><strong className="text-foreground">Payment Partners:</strong> Razorpay Software Private Limited for secure transaction verification.</li>
                <li><strong className="text-foreground">Cafe Staff & Kitchen Operations:</strong> Authorized kitchen and counter staff to prepare and fulfill your order.</li>
                <li><strong className="text-foreground">Legal Authorities:</strong> When required by Indian law, court orders, or law enforcement investigations.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">7. Data Security</h2>
              <p>
                We implement industry-standard technical and organizational security measures, including HTTPS encryption, restricted database access, and secure authentication to safeguard your information against unauthorized access, loss, or misuse.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">8. Your Rights</h2>
              <p>
                As a customer in India under applicable data protection laws, you have the right to request access to your personal data, ask for correction of inaccurate details, or request deletion of your order records by contacting us.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">9. Changes to This Privacy Policy</h2>
              <p>
                We reserve the right to update this Privacy Policy from time to time. Any changes will be posted immediately on this page with an updated revision date. We encourage you to review this page periodically.
              </p>
            </section>

            <section className="space-y-3 border-t pt-6">
              <h2 className="text-lg font-bold text-foreground">10. Contact & Grievance Redressal</h2>
              <p>
                If you have any questions, concerns, or grievances regarding this Privacy Policy or your data handling, please contact our Grievance Officer:
              </p>
              <div className="bg-muted/30 p-4 rounded-xl space-y-1 text-sm border">
                <p><strong className="text-foreground">Tea 20 Cafe</strong></p>
                <p><span className="text-muted-foreground">Address:</span> Gyan Vihar Marg, OBC Colony, Karolan Ka Barh, Jagatpura, Jaipur, Rajasthan 302017</p>
                <p><span className="text-muted-foreground">Email:</span> <a href="mailto:support@tea20cafe.com" className="text-primary hover:underline">support@tea20cafe.com</a></p>
                <p><span className="text-muted-foreground">Phone:</span> +91 98765 43210</p>
                <p><span className="text-muted-foreground">Operational Hours:</span> Monday – Sunday: 10:00 AM – 11:00 PM IST</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
