import { galleryApi } from "./http";

// Endpoint map only — the axios instance, auth header and 401 handling live in
// services/http.js.

export const getMyGallery = async () => {
    const response = await galleryApi.get("/me");

    return response.data;
};

export const getStaffGallery = async (staffId) => {
    const response = await galleryApi.get(`/staff/${staffId}`);

    return response.data;
};

export const uploadGalleryMedia = async (file, caption = "") => {
    const formData = new FormData();

    formData.append("media", file);
    formData.append("caption", caption);

    const response = await galleryApi.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
};

export const deleteGalleryMedia = async (id) => {
    const response = await galleryApi.delete(`/${id}`);

    return response.data;
};

export const updateGalleryCaption = async (id, caption) => {
    const response = await galleryApi.patch(`/${id}`, { caption });

    return response.data;
};
