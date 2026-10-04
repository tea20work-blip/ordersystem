"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, X } from "lucide-react";

type Alert = { id: number; orderId: number; title: string; body: string; createdAt: string };

export default function AdminNotifications() {
    const pathname = usePathname();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [status, setStatus] = useState("");
    const [enabled, setEnabled] = useState(false);
    const [busy, setBusy] = useState(false);
    const [token, setToken] = useState("");
    const [showToken, setShowToken] = useState(false);
    const audio = useRef<AudioContext | null>(null);
    const seen = useRef(new Set<number>());
    const initialized = useRef(false);
    const syncing = useRef(false);
    const active = pathname !== "/admin/login";

    const beep = useCallback(() => {
        const context = audio.current;
        if (!context || context.state !== "running") return;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.frequency.value = 880;
        gain.gain.setValueAtTime(0.15, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.35);
    }, []);

    const sync = useCallback(async () => {
        if (syncing.current) return;
        syncing.current = true;
        try {
            const response = await fetch("/api/admin/notifications", { cache: "no-store" });
            if (!response.ok) throw new Error("Unable to load order alerts");
            const { notifications }: { notifications: Alert[] } = await response.json();
            if (initialized.current && notifications.some(item => !seen.current.has(item.id))) beep();
            notifications.forEach(item => seen.current.add(item.id));
            initialized.current = true;
            setAlerts(notifications);
        } catch {
            setStatus("Order alerts are offline. Retrying automatically.");
        } finally {
            syncing.current = false;
        }
    }, [beep]);

    useEffect(() => {
        if (!active) return;
        void sync();
        // Polling recovers missed pushes and works before Firebase is configured.
        const interval = setInterval(() => void sync(), 5000);
        const focus = () => void sync();
        window.addEventListener("focus", focus);
        return () => { clearInterval(interval); window.removeEventListener("focus", focus); };
    }, [active, sync]);

    useEffect(() => {
        if (!active) return;
        let unsubscribe: (() => void) | undefined;
        let cancelled = false;
        void (async () => {
            try {
                const { isSupported, getMessaging, onMessage } = await import("firebase/messaging");
                if (!await isSupported() || cancelled) return;
                const response = await fetch("/api/firebase-config");
                const { config } = await response.json();
                if (!config.apiKey || !config.projectId || !config.messagingSenderId || !config.appId || cancelled) return;
                const { getApps, initializeApp } = await import("firebase/app");
                const app = getApps().find(app => app.name === "admin-notifications") ?? initializeApp(config, "admin-notifications");
                unsubscribe = onMessage(getMessaging(app), () => void sync());
                if (cancelled) unsubscribe();
            } catch {
                // Database alerts remain available without push support.
            }
        })();
        return () => { cancelled = true; unsubscribe?.(); };
    }, [active, sync]);

    useEffect(() => () => { void audio.current?.close(); }, []);

    const registerPush = useCallback(async () => {
        const { isSupported, getMessaging, getToken } = await import("firebase/messaging");
        if (!await isSupported()) throw new Error("Push is unsupported in this browser. Sound and panel alerts are enabled.");
        const response = await fetch("/api/firebase-config");
        const { config, vapidKey } = await response.json();
        if (!config.apiKey || !config.projectId || !config.messagingSenderId || !config.appId || !vapidKey) {
            throw new Error("Sound enabled. Add Firebase settings to enable push.");
        }
        if (Notification.permission !== "granted") throw new Error("Sound enabled. Allow notifications in browser settings for push.");
        const { getApps, initializeApp } = await import("firebase/app");
        const app = getApps().find(app => app.name === "admin-notifications") ?? initializeApp(config, "admin-notifications");
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/admin/" });
        const currentToken = await getToken(getMessaging(app), { vapidKey, serviceWorkerRegistration: registration });
        if (!currentToken) throw new Error("Firebase did not return a device token.");
        const saved = await fetch("/api/admin/push-token", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: currentToken }),
        });
        if (!saved.ok) throw new Error("Unable to save push token. Please try again.");
        setToken(currentToken);
    }, []);

    useEffect(() => {
        if (active && "Notification" in window && Notification.permission === "granted") {
            void registerPush().catch(() => { /* The enable button reports configuration errors. */ });
        }
    }, [active, registerPush]);

    async function enable() {
        setBusy(true);
        try {
            audio.current ??= new AudioContext();
            await audio.current.resume();
            setEnabled(true);
            beep();
            if ("Notification" in window && await Notification.requestPermission() !== "granted") {
                throw new Error("Sound enabled. Allow notifications in browser settings for push.");
            }
            await registerPush();
            setStatus("Push notifications and sound enabled.");
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Could not enable notifications.");
        } finally {
            setBusy(false);
        }
    }

    async function dismiss(id: number) {
        try {
            const response = await fetch("/api/admin/notifications", {
                method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
            });
            if (!response.ok) throw new Error();
            setAlerts(current => current.filter(item => item.id !== id));
        } catch { setStatus("Could not dismiss notification. Please try again."); }
    }

    if (!active) return null;
    return <div className="ml-auto flex items-center gap-3">
        <span className="flex items-center gap-1 text-sm"><Bell size={18} />{alerts.length}</span>
        <button type="button" className="rounded border px-3 py-1 text-sm" disabled={busy} onClick={enable}>
            {busy ? "Enabling…" : enabled ? "Enable / test notifications" : "Enable notifications & sound"}
        </button>
        {token && <button type="button" className="text-xs underline" onClick={() => setShowToken(value => !value)}>FCM token</button>}
        <div className="fixed right-4 top-20 z-50 w-[calc(100vw-2rem)] max-w-sm space-y-3 max-h-[calc(100dvh-6rem)] overflow-y-auto" aria-live="polite">
            {status && <div className="rounded-lg border bg-background p-3 text-sm shadow flex gap-2"><span className="flex-1">{status}</span><button aria-label="Close notification status" onClick={() => setStatus("")}><X size={16} /></button></div>}
            {showToken && <textarea readOnly aria-label="FCM device token" value={token} className="w-full rounded border bg-background p-3 text-xs" />}
            {alerts.map(alert => <div key={alert.id} className="rounded-lg border border-orange-300 bg-background p-4 shadow-lg">
                <div className="flex items-start gap-2"><Link href="/admin/orders" className="flex-1 font-semibold">{alert.title}</Link>
                    <button type="button" aria-label={`Dismiss ${alert.title}`} onClick={() => void dismiss(alert.id)} className="rounded p-1 hover:bg-muted"><X size={18} /></button></div>
                <p className="mt-1 text-sm">{alert.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">{new Date(alert.createdAt).toLocaleString()}</p>
            </div>)}
        </div>
    </div>;
}
