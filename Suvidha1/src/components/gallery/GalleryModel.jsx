const GalleryModal = ({ item, onClose }) => {
    if (!item) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={onClose}
        >
            <div
                className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-black"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 rounded-full bg-black/60 px-3 py-2 text-xl text-white"
                >
                    ×
                </button>

                {item.type === "video" ? (
                    <video
                        src={item.url}
                        controls
                        autoPlay
                        className="max-h-[85vh] max-w-full"
                    />
                ) : (
                    <img
                        src={item.url}
                        alt={item.caption || "Gallery"}
                        className="max-h-[85vh] max-w-full object-contain"
                    />
                )}

                {item.caption && (
                    <div className="bg-black px-5 py-4 text-sm text-white">
                        {item.caption}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryModal;