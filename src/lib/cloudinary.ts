export const uploadImageToCloudinary = async (file: File, token?: string, source: string = "registration-flow"): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {
        "x-upload-source": source,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch('/api/upload', {
            method: "POST",
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to upload image securely");
        }

        const data = await response.json();
        return data.secure_url; // the persistent HTTPS URL to the uploaded image
    } catch (error) {
        console.error("Cloudinary Secure Upload Error:", error);
        throw error;
    }
};
