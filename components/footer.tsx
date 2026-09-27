import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  FileText,
  RefreshCw,
  Truck,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card/60 backdrop-blur-sm mt-auto text-sm">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <Image
                src="/t20-logo.jpg"
                alt="Tea 20 Cafe Logo"
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="font-bold text-lg tracking-tight">
                Tea 20 Cafe
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Serving the best tea, coffee, snacks, and fresh meals in Jaipur.
              Quick dine-in QR ordering and takeaway service.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Secure payments powered by Razorpay
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-muted-foreground text-xs">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/qr"
                  className="hover:text-primary transition-colors"
                >
                  Scan Table QR
                </Link>
              </li>
              <li>
                <Link
                  href="/takeaway"
                  className="hover:text-primary transition-colors"
                >
                  Order Takeaway
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="hover:text-primary transition-colors"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-primary transition-colors"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies (Razorpay Mandatory) */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Legal & Policies
            </h4>
            <ul className="space-y-2 text-muted-foreground text-xs">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" /> Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Cancellation & Refund
                  Policy
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/shipping-policy"
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" /> Order Fulfillment / Delivery
                  Policy
                </Link>
              </li> */}
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 text-xs text-muted-foreground">
            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Contact Us
            </h4>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                Gyan Vihar Marg, OBC Colony, Karolan Ka Barh, Jagatpura, Jaipur,
                Rajasthan 302017
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span>+91 80721 52345</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span>tea20work@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Tea 20 Cafe. All rights reserved.</p>
          {/* <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/refund-policy" className="hover:underline">
              Refunds
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
