const GalleryCard = ({
    item,
    editable = false,
    onDelete,
    onOpen,
}) => {
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm">
            <button
                type="button"
                onClick={() => onOpen(item)}
                className="block w-full text-left"
            >
                <div className="aspect-square overflow-hidden bg-gray-100">
                    {item.type === "video" ? (
                        <video
                            src={item.url}
                            className="h-full w-full object-cover"
                            muted
                            preload="metadata"
                        />
                    ) : (
                        <img
                            src={item.url}
                            alt={item.caption || "Gallery"}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            loading="lazy"
                        />
                    )}
                </div>

                {item.type === "video" && (
                    <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                        ▶ Video
                    </div>
                )}
            </button>

            {editable && (
                <button
                    type="button"
                    onClick={() => onDelete(item._id)}
                    className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                >
                    Delete
                </button>
            )}

            {item.caption && (
                <div className="p-3">
                    <p className="line-clamp-2 text-sm text-gray-700">
                        {item.caption}
                    </p>
                </div>
            )}
        </div>
    );
};

export default GalleryCard;