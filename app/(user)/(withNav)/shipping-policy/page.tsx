import type { Metadata } from "next";
import Link from "next/link";
import { Truck, Clock, Utensils, ShoppingBag, ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Order Fulfillment & Delivery Policy | Tea 20 Cafe",
  description: "Dine-in and takeaway food delivery / fulfillment policy for Tea 20 Cafe.",
};

export default function ShippingPolicyPage() {
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
              <Truck className="h-3.5 w-3.5" /> Service Fulfillment Terms
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Order Fulfillment & Delivery Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Last Updated: <span className="font-medium text-foreground">{lastUpdated}</span>
            </p>
          </div>

          {/* Content sections */}
          <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">1. Nature of Service</h2>
              <p>
                <strong className="text-foreground">Tea 20 Cafe</strong> operates a physical food and beverage cafe in Jaipur, Rajasthan. All orders placed on our website are culinary goods prepared on-premises for immediate consumption or takeaway pickup. We do not dispatch physical goods via third-party national postal courier services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">2. Fulfillment Methods</h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-5 rounded-xl border bg-muted/20 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <Utensils className="h-5 w-5 text-primary" />
                    <span>Dine-In (Table QR Service)</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    When you order by scanning the QR code at your cafe table, our staff serves the prepared food and beverages directly to your designated table number.
                  </p>
                  <div className="text-xs font-semibold text-foreground pt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" /> Estimated Time: 10 – 20 mins
                  </div>
                </div>

                <div className="p-5 rounded-xl border bg-muted/20 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <span>Takeaway (Counter Pickup)</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    When placing a takeaway order online, you will receive an Order ID. Collect your packed order directly from the Tea 20 Cafe pickup counter by showing your Order ID.
                  </p>
                  <div className="text-xs font-semibold text-foreground pt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" /> Estimated Time: 15 – 25 mins
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">3. Preparation Timelines & Delays</h2>
              <p>
                Estimated preparation times may vary during peak cafe rush hours, weekends, or special events. Our kitchen team prioritizes quality, hygiene, and fresh ingredients. If an unforeseen kitchen delay occurs, our staff will notify you at your table or by phone.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">4. Pickup Verification</h2>
              <p>
                For takeaway orders, please collect your items within 45 minutes of the confirmed preparation time to ensure food temperature and freshness. If you need someone else to collect your order, ensure they have the valid Order ID and customer phone number.
              </p>
            </section>

            <section className="space-y-3 border-t pt-6">
              <h2 className="text-lg font-bold text-foreground">5. Cafe Pickup Location</h2>
              <div className="bg-muted/30 p-4 rounded-xl space-y-1 text-sm border">
                <p className="font-bold text-foreground">Tea 20 Cafe Pickup Counter</p>
                <p><span className="text-muted-foreground">Address:</span> Gyan Vihar Marg, OBC Colony, Karolan Ka Barh, Jagatpura, Jaipur, Rajasthan 302017</p>
                <p><span className="text-muted-foreground">Contact:</span> +91 98765 43210</p>
                <p><span className="text-muted-foreground">Hours:</span> 10:00 AM – 11:00 PM (All 7 Days)</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
