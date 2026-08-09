import { useRef, useState } from "react";

const GalleryUpload = ({ onUpload, uploading = false }) => {
    const inputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState("");
    const [error, setError] = useState("");

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        const isAllowed = /^(image\/(jpeg|png|webp)|video\/(mp4|webm|quicktime))$/.test(selectedFile.type);
        const maxBytes = 50 * 1024 * 1024;

        if (!isAllowed) {
            setFile(null);
            setError("Choose a JPG, PNG, WEBP, MP4, WEBM, or MOV file.");
            event.target.value = "";
            return;
        }

        if (selectedFile.size > maxBytes) {
            setFile(null);
            setError("Files must be 50 MB or smaller.");
            event.target.value = "";
            return;
        }

        setFile(selectedFile);
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!file) {
            return;
        }

        try {
            await onUpload(file, caption);
            setFile(null);
            setCaption("");

            if (inputRef.current) {
                inputRef.current.value = "";
            }
        } catch (uploadError) {
            setError(uploadError?.response?.data?.message || "Upload failed. Please try again.");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
            <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                    Add to Gallery
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    Share photos or videos of your work.
                </p>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
                className="block w-full rounded-xl border border-gray-200 p-3 text-sm"
            />

            {file && (
                <p className="mt-2 text-xs text-gray-500">
                    Selected: {file.name}
                </p>
            )}

            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

            <textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Add a short description..."
                maxLength={300}
                rows={3}
                className="mt-4 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-purple-500"
            />

            <button
                type="submit"
                disabled={!file || uploading}
                className="mt-4 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {uploading ? "Uploading..." : "Upload Media"}
            </button>
        </form>
    );
};

export default GalleryUpload;
