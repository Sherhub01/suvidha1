import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IconButton } from "../../ui";

/**
 * Full-screen viewer for one gallery item.
 *
 * Was a `<div onClick={onClose}>` backdrop, which keyboard and screen-reader
 * users could neither reach nor dismiss. Now it is a real dialog: Escape closes
 * it, focus moves in and is restored on close, and the backdrop is a button
 * with an accessible name.
 */
const GalleryModal = ({ item, onClose }) => {
  const panelRef = useRef(null);
  const restoreRef = useRef(null);

  useEffect(() => {
    if (!item) return undefined;

    restoreRef.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    panelRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      restoreRef.current?.focus?.();
    };
  }, [item, onClose]);

  if (!item || typeof document === "undefined") return null;

  const isVideo = item.type === "video";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dismiss layer — a button, so it has a name and is keyboard reachable. */}
      <button
        type="button"
        aria-label="Close gallery viewer"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/80"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.caption || (isVideo ? "Gallery video" : "Gallery image")}
        tabIndex={-1}
        className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-black"
      >
        <IconButton
          icon={X}
          label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 bg-black/60 text-white hover:bg-black/80"
        />

        {isVideo ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- user uploads carry no caption track
          <video src={item.url} controls autoPlay className="max-h-[85vh] max-w-full" />
        ) : (
          <img
            src={item.url}
            alt={item.caption || "Gallery item"}
            className="max-h-[85vh] max-w-full object-contain"
          />
        )}

        {item.caption && <p className="bg-black px-5 py-4 text-sm text-white">{item.caption}</p>}
      </div>
    </div>,
    document.body
  );
};

export default GalleryModal;
