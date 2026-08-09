import axios from "axios";
import { session } from "../session";

const API_URL = import.meta.env.VITE_BACKEND_URL || "";

const galleryApi = axios.create({ baseURL: `${API_URL}/api/gallery` });
galleryApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token") || session.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

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
