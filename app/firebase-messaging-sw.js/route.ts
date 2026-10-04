import { firebaseConfig } from "@/lib/firebase-config";

export function GET() {
    const source = `
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil((async () => {
        const url = new URL('/admin/orders', self.location.origin).href;
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of windows) {
            if (new URL(client.url).origin === self.location.origin && new URL(client.url).pathname.startsWith('/admin')) {
                await client.navigate(url);
                return client.focus();
            }
        }
        return self.clients.openWindow(url);
    })());
});
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(firebaseConfig())});
firebase.messaging();
`;
    return new Response(source, { headers: { "Content-Type": "application/javascript", "Cache-Control": "no-cache", "Service-Worker-Allowed": "/" } });
}
