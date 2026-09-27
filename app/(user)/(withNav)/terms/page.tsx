import type { Metadata } from "next";
import Link from "next/link";
import { FileText, CheckCircle2, AlertCircle, Scale, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms and Conditions | Tea 20 Cafe",
  description: "Terms and Conditions for ordering food, dine-in table booking, and payments via Razorpay at Tea 20 Cafe.",
};

export default function TermsAndConditionsPage() {
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
              <FileText className="h-3.5 w-3.5" /> Terms of Service
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Terms and Conditions
            </h1>
            <p className="text-sm text-muted-foreground">
              Last Updated: <span className="font-medium text-foreground">{lastUpdated}</span>
            </p>
          </div>

          {/* Content sections */}
          <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">1. Agreement to Terms</h2>
              <p>
                These Terms and Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;Customer&rdquo;, &ldquo;User&rdquo;, or &ldquo;You&rdquo;) and <strong className="text-foreground">Tea 20 Cafe</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), governing your access to and use of our online ordering platform at <Link href="https://tea20cafe.com" className="text-primary hover:underline">tea20cafe.com</Link> for dine-in and takeaway services in Jaipur.
              </p>
              <p>
                By accessing our digital menu, placing an order, or completing a payment through our website, you agree that you have read, understood, and accept to be bound by these Terms and our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">2. Ordering & Service Modes</h2>
              <p>Tea 20 Cafe provides two primary modes of digital order booking:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li><strong className="text-foreground">Dine-in (Table QR Ordering):</strong> You scan the QR code placed on your table, add items to cart, provide your contact details, and submit the order. Items will be served directly to your designated table.</li>
                <li><strong className="text-foreground">Takeaway (Self-Pickup):</strong> You place an order in advance online and collect your freshly prepared food and beverages from the cafe counter.</li>
              </ul>
              <p className="text-xs bg-muted/50 p-3 rounded-lg border">
                <strong>Note:</strong> Orders placed online are accepted subject to kitchen availability and cafe operational hours. We reserve the right to decline or cancel an order in case an item is out of stock.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">3. Pricing, Taxes & Billing</h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>All item prices displayed on the website are in <strong className="text-foreground">Indian Rupees (INR / ₹)</strong>.</li>
                <li>Prices are inclusive/exclusive of applicable Goods & Services Tax (GST) as specified during checkout.</li>
                <li>We reserve the right to revise menu prices, promotions, and item offerings at any time without prior notice.</li>
                <li>The final payable amount displayed on the checkout screen prior to payment authorization is the exact amount billed.</li>
              </ul>
            </section>

            <section className="space-y-3 bg-muted/40 p-5 rounded-xl border border-border/70">
              <div className="flex items-center gap-2 text-foreground font-bold text-base">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span>4. Payment Processing (Razorpay)</span>
              </div>
              <p>
                Digital payments on our platform are processed securely via <strong className="text-foreground">Razorpay Software Private Limited</strong>.
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Accepted payment methods include UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, MasterCard, RuPay), Net Banking, and supported digital wallets.</li>
                <li>By initiating a payment, you represent and warrant that you are authorized to use the chosen payment method and have sufficient funds.</li>
                <li>Tea 20 Cafe is not responsible for transaction failures arising from incorrect bank/card details, expired cards, OTP delays, or technical downtime at the issuing bank or payment gateway.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">5. Customer Responsibilities & Conduct</h2>
              <p>When using our ordering system, you agree to:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Provide accurate personal details (name, phone number) so cafe staff can identify your order and contact you if needed.</li>
                <li>Ensure you select the correct table number when ordering inside the cafe.</li>
                <li>Inform our staff of any food allergies or specific dietary restrictions prior to placing an order.</li>
                <li>Refrain from placing fraudulent, fake, or test orders that disrupt cafe kitchen operations.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">6. Food Quality, Allergen & Preparation Disclaimer</h2>
              <p>
                All dishes and beverages at Tea 20 Cafe are freshly prepared upon receiving the order. Preparation times generally range from 10 to 25 minutes depending on order volume and item complexity.
              </p>
              <p>
                While we take utmost care with hygiene and food safety, our kitchen handles ingredients containing dairy, gluten, nuts, and spices. If you suffer from severe food allergies, please notify the counter staff before ordering.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">7. Cancellations and Refunds</h2>
              <p>
                For detailed terms on order cancellations, failed payments, and refund timelines, please review our dedicated <Link href="/refund-policy" className="text-primary hover:underline font-medium">Cancellation & Refund Policy</Link>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">8. Intellectual Property</h2>
              <p>
                All content on this website—including the Tea 20 Cafe logo, branding, menu descriptions, graphics, photos, and software code—is the proprietary property of Tea 20 Cafe and protected by applicable copyright and trademark laws.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by Indian law, Tea 20 Cafe and its owners, employees, or affiliates shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our digital ordering platform or any payment gateway disruptions beyond our reasonable control.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">10. Governing Law & Dispute Jurisdiction</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of the Republic of India. Any disputes or claims arising out of or in connection with these Terms or your purchase shall be subject to the exclusive jurisdiction of the competent courts in <strong className="text-foreground">Jaipur, Rajasthan, India</strong>.
              </p>
            </section>

            <section className="space-y-3 border-t pt-6">
              <h2 className="text-lg font-bold text-foreground">11. Contact Us</h2>
              <p>
                For any queries, feedback, or clarifications regarding these Terms & Conditions, reach out to us:
              </p>
              <div className="bg-muted/30 p-4 rounded-xl space-y-1 text-sm border">
                <p><strong className="text-foreground">Tea 20 Cafe</strong></p>
                <p><span className="text-muted-foreground">Address:</span> Gyan Vihar Marg, OBC Colony, Karolan Ka Barh, Jagatpura, Jaipur, Rajasthan 302017</p>
                <p><span className="text-muted-foreground">Email:</span> <a href="mailto:support@tea20cafe.com" className="text-primary hover:underline">support@tea20cafe.com</a></p>
                <p><span className="text-muted-foreground">Phone:</span> +91 98765 43210</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
