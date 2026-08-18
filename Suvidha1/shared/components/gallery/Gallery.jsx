import { useCallback, useState } from "react";

import GalleryCard from "./GalleryCard";
import GalleryModal from "./GalleryModel";
import GalleryUpload from "./GalleryUpload";
import useApiData from "../../hooks/useApiData";

import {
    getMyGallery,
    getStaffGallery,
    uploadGalleryMedia,
    deleteGalleryMedia,
} from "../../services/GalleryApi";

const Gallery = ({
    mode = "mine",
    staffId = null,
    editable = false,
    title = "Gallery",
}) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [uploading, setUploading] = useState(false);
    // Errors from upload/delete, kept separate from the hook's load error.
    const [actionError, setActionError] = useState("");

    const fetchGallery = useCallback(async () => {
        const response = mode === "staff" ? await getStaffGallery(staffId) : await getMyGallery();
        return response.gallery || [];
    }, [mode, staffId]);

    // A staff gallery needs an id before it can be fetched at all.
    const {
        data: items,
        loading,
        error,
        setData: setItems,
        reload: reloadGallery,
    } = useApiData(fetchGallery, {
        initial: [],
        enabled: mode !== "staff" || Boolean(staffId),
    });

    const handleUpload = async (file, caption) => {
        try {
            setUploading(true);
            setActionError("");

            const response = await uploadGalleryMedia(
                file,
                caption
            );

            if (response.gallery) {
                setItems((previous) => [
                    response.gallery,
                    ...previous,
                ]);
            }
        } catch (error) {
            console.error("Gallery upload error:", error);

            setActionError(
                error.response?.data?.message ||
                "Upload failed. Please try again."
            );
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this media?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteGalleryMedia(id);

            setItems((previous) =>
                previous.filter((item) => item._id !== id)
            );

            if (selectedItem?._id === id) {
                setSelectedItem(null);
            }
        } catch (error) {
            console.error("Gallery delete error:", error);

            setActionError(
                error.response?.data?.message ||
                "Unable to delete media."
            );
        }
    };

    return (
        <section className="w-full">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Photos and videos
                    </p>
                </div>

                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    {items.length} {items.length === 1 ? "item" : "items"}
                </span>
            </div>

            {editable && (
                <div className="mb-8">
                    <GalleryUpload
                        onUpload={handleUpload}
                        uploading={uploading}
                    />
                </div>
            )}

            {(error || actionError) && (
                <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <span>{error || actionError}</span>
                    {error && (
                        <button
                            type="button"
                            onClick={reloadGallery}
                            className="shrink-0 rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold hover:bg-red-100"
                        >
                            Retry
                        </button>
                    )}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="aspect-square animate-pulse rounded-2xl bg-gray-200"
                        />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                    <div className="text-4xl">🖼️</div>

                    <h3 className="mt-3 font-semibold text-gray-900">
                        No gallery items yet
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        {editable
                            ? "Upload your first photo or video."
                            : "There are no photos or videos available yet."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {items.map((item) => (
                        <GalleryCard
                            key={item._id}
                            item={item}
                            editable={editable}
                            onDelete={handleDelete}
                            onOpen={setSelectedItem}
                        />
                    ))}
                </div>
            )}

            <GalleryModal
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
            />
        </section>
    );
};

export default Gallery;
