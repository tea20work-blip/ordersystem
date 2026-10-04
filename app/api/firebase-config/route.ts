import { firebaseConfig } from "@/lib/firebase-config";
export function GET() {
    return Response.json({ config: firebaseConfig(), vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY });
}
