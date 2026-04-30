"use client"
import { useEffect } from "react"

export default function AdminPage() {

    useEffect(() => {
        subscribeUser()
    }, [])

    async function subscribeUser() {
        const permission = await Notification.requestPermission()
        if (permission !== "granted") return

        const registration = await navigator.serviceWorker.ready

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        })

        await fetch("/api/save-subscription", {
            method: "POST",
            body: JSON.stringify(subscription),
        })
    }

    async function sendNotification() {
        await fetch("/api/send")
    }

    return (
        <div className="p-10 flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <button
                onClick={sendNotification}
                className="bg-blue-500 text-white px-4 py-2 rounded-md w-fit hover:bg-blue-600 transition-colors"
            >
                Send Notification
            </button>
        </div>
    )
}