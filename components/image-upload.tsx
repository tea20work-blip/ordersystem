"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";

export function ImageUpload({ defaultValue, name = "imageFile" }: { defaultValue?: string, name?: string }) {
    const [preview, setPreview] = useState<string | null>(defaultValue || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-4">
            {preview ? (
                <div className="relative w-40 h-40 border rounded-lg overflow-hidden group">
                    <Image width={160} height={160} src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="destructive" size="icon" onClick={handleRemove}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    className="w-40 h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <ImagePlus className="h-8 w-8 mb-2" />
                    <span className="text-xs">Upload Image</span>
                </div>
            )}
            <input
                type="file"
                name={name}
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            {!preview && defaultValue && (
                <input type="hidden" name={`${name}Removed`} value="true" />
            )}
        </div>
    );
}
