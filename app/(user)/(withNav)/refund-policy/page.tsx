import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, CheckCircle2, Clock, AlertTriangle, ArrowLeft, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Tea 20 Cafe",
  description: "Cancellation, return and refund policy for Tea 20 Cafe online orders processed via Razorpay.",
};

export default function RefundPolicyPage() {
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
              <RefreshCw className="h-3.5 w-3.5" /> Razorpay Policy Guidelines
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Cancellation & Refund Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Last Updated: <span className="font-medium text-foreground">{lastUpdated}</span>
            </p>
          </div>

          {/* Content sections */}
          <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">1. Overview</h2>
              <p>
                At <strong className="text-foreground">Tea 20 Cafe</strong>, we strive to deliver top-quality food, tea, and beverages with every order. Because our food items are freshly prepared upon receipt of an order, cancellations and refunds are subject to specific conditions outlined below.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">2. Order Cancellation Policy</h2>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong className="text-foreground">Before Kitchen Preparation:</strong> You may request an order cancellation immediately after placing it, provided our kitchen has not yet started preparing your items. To cancel, immediately notify the counter staff or contact our support team with your Order ID.
                </li>
                <li>
                  <strong className="text-foreground">After Kitchen Preparation Commences:</strong> Once food preparation has started, orders cannot be cancelled or modified, and no refund will be issued, as perishable culinary items cannot be restocked or reused.
                </li>
                <li>
                  <strong className="text-foreground">Cancellation by Tea 20 Cafe:</strong> In rare circumstances (such as an ingredient running out of stock, technical errors, or kitchen equipment downtime), Tea 20 Cafe reserves the right to cancel your order. In such events, a <strong className="text-foreground">100% full refund</strong> will be initiated immediately.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">3. Eligibility for Refunds</h2>
              <p>A customer is eligible for a full or partial refund under the following situations:</p>
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Double or Multiple Debits
                  </div>
                  <p className="text-xs text-muted-foreground">
                    If your bank account was charged multiple times for a single order due to network latency.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Payment Deducted, Order Not Created
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Amount was deducted via Razorpay but the order did not register due to a connection break.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Missing or Wrong Item Delivered
                  </div>
                  <p className="text-xs text-muted-foreground">
                    If an ordered item was unavailable or missing from your dine-in/takeaway package.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Unfulfilled Cafe Cancellation
                  </div>
                  <p className="text-xs text-muted-foreground">
                    If the cafe staff cancels the order due to item unavailability or unforeseen kitchen issues.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3 bg-muted/40 p-5 rounded-xl border border-border/70">
              <div className="flex items-center gap-2 text-foreground font-bold text-base">
                <IndianRupee className="h-5 w-5 text-primary" />
                <span>4. Refund Mode and Timelines (Razorpay)</span>
              </div>
              <p>
                All approved refunds are processed automatically through <strong className="text-foreground">Razorpay</strong> back to the original payment source (UPI ID, Debit/Credit Card, Net Banking account, or Digital Wallet).
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li><strong className="text-foreground">UPI Payments:</strong> Typically credited within <strong className="text-foreground">24 to 48 hours</strong>.</li>
                <li><strong className="text-foreground">Credit / Debit Cards & Net Banking:</strong> Credited within <strong className="text-foreground">5 to 7 working days</strong>, depending on your bank&apos;s processing cycle.</li>
                <li><strong className="text-foreground">Direct Cash Orders (if applicable):</strong> Refunded immediately at the cafe billing counter.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">5. Non-Refundable Scenarios</h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Uncollected takeaway orders where the customer failed to pick up the order within reasonable time.</li>
                <li>Incorrect table selection by the customer that led to misdelivery after items were served.</li>
                <li>Taste preference disaffections where the food was prepared according to the standard menu recipe.</li>
              </ul>
            </section>

            <section className="space-y-3 border-t pt-6">
              <h2 className="text-lg font-bold text-foreground">6. How to Request a Refund or Support</h2>
              <p>
                To request a refund or report a billing discrepancy, please contact our support desk with your <strong className="text-foreground">Order ID</strong> and payment receipt / screenshot:
              </p>
              <div className="bg-muted/30 p-4 rounded-xl space-y-1 text-sm border">
                <p><strong className="text-foreground">Tea 20 Cafe Customer Helpdesk</strong></p>
                <p><span className="text-muted-foreground">Email:</span> <a href="mailto:support@tea20cafe.com" className="text-primary hover:underline">support@tea20cafe.com</a></p>
                <p><span className="text-muted-foreground">Phone / WhatsApp:</span> +91 98765 43210</p>
                <p><span className="text-muted-foreground">Address:</span> Gyan Vihar Marg, OBC Colony, Karolan Ka Barh, Jagatpura, Jaipur, Rajasthan 302017</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
