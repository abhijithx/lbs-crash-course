import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const rawSource = req.headers.get("x-upload-source");
        const source = rawSource?.trim().toLowerCase();

        // 1. Basic Origin/Source Validation
        if (source !== "registration-flow") {
            console.warn(`[UPLOAD_SECURITY] Blocked unauthorized source: ${source}`);
            return NextResponse.json({ error: "Forbidden: Security policy violation" }, { status: 403 });
        }

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: "No valid file provided" }, { status: 400 });
        }

        // 1. Validate File Size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File too large (Max 5MB)" }, { status: 400 });
        }

        // 2. Validate File Type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, and WEBP allowed." }, { status: 400 });
        }

        // 3. Simple protection for Registration flow
        // In a more complex app, we'd use CSRF tokens or short-lived registration sessions.
        // For now, we ensure the file is an image and limit its size.
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        return await new Promise<NextResponse>((resolve) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    upload_preset: uploadPreset,
                    folder: "lbs-mca-uploads",
                    resource_type: "image"
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload stream error:", error);
                        resolve(NextResponse.json({ error: error.message }, { status: 500 }));
                    } else {
                        resolve(NextResponse.json({ secure_url: result?.secure_url }, { status: 200 }));
                    }
                }
            );

            uploadStream.end(buffer);
        });

    } catch (error: unknown) {
        console.error("Backend Upload Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
