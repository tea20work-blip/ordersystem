"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const BASE_URL = "http://192.168.1.10:3000"
// const BASE_URL = "https://t20-orders.vercel.app"

export default function ScanQrPage() {
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const [invalidQr, setInvalidQr] = useState(false);
    const [scannerKey, setScannerKey] = useState(0);

    useEffect(() => {
        startScanner();

        return () => {
            stopScanner();
        };
    }, [scannerKey]);

    const startScanner = async () => {
        try {
            const scanner = new Html5Qrcode("qr-reader");

            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: {
                        width: 250,
                        height: 250,
                    },
                },
                async (decodedText) => {
                    await stopScanner();
                    const isValidQr =
                        decodedText.includes(BASE_URL);
                    if (!isValidQr) {
                        setInvalidQr(true);
                        return;
                    }

                    window.location.href = decodedText;
                },
                () => { }
            );
        } catch (error) {
            console.error(error);
        }
    };

    const stopScanner = async () => {
        try {
            if (scannerRef.current?.isScanning) {
                await scannerRef.current.stop();
            }

            await scannerRef.current?.clear();
        } catch (error) {
            console.error(error);
        }
    };

    const handleRetry = async () => {
        setInvalidQr(false);

        await stopScanner();

        /**
         * Force scanner container remount
         */
        setScannerKey((prev) => prev + 1);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted p-4">
            <Card className="w-full max-w-md rounded-3xl shadow-xl">
                <CardContent className="p-5">
                    {!invalidQr ? (
                        <>
                            <div className="mb-5">
                                <h1 className="text-2xl font-bold">
                                    Menu
                                </h1>

                                <p className="text-sm text-muted-foreground">
                                    Scan QR code to order
                                </p>
                            </div>

                            <div
                                key={scannerKey}
                                id="qr-reader"
                                className="overflow-hidden rounded-2xl"
                            />
                        </>
                    ) : (
                        <div className="py-10 text-center">
                            <h2 className="text-xl font-semibold">
                                Not able to Scan
                            </h2>

                            <p className="mt-3 text-sm text-muted-foreground">
                                Seems like this QR doesn’t belong to
                                Tea 20.
                            </p>

                            <p className="text-sm text-muted-foreground">
                                Please scan a valid Tea 20 QR code.
                            </p>

                            <Button
                                onClick={handleRetry}
                                className="mt-6 w-full"
                            >
                                Different QR Code
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}