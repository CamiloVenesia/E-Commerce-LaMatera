const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImageToCloudinary(file) {
    if (!file) {
        throw new Error("No se seleccionó ninguna imagen.");
    }

    if (!file.type.startsWith("image/")) {
        throw new Error("El archivo seleccionado no es una imagen.");
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        console.error("Error de Cloudinary:", errorData);

        throw new Error("No se pudo subir la imagen.");
    }

    const data = await response.json();

    return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
    };
}