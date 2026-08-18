import { useState } from "react";
import { FileText, ExternalLink, AlertCircle } from "lucide-react";
import Button from "./Button";
import { cx } from "./tokens";

/**
 * Opens a KYC document that sits behind authentication.
 *
 * Identity documents are no longer served from the public /uploads mount, so a
 * plain <a href> cannot reach them — the Authorization header would be missing.
 * This fetches the file through the given API client, turns the response into a
 * short-lived object URL and opens that in a new tab.
 *
 * @param {object}  client     axios instance carrying the right token (adminApi / staffApi)
 * @param {string}  profileId  StaffProfile id
 * @param {string}  field      "aadhaarDoc" | "panDoc" | "certDoc"
 */
export default function SecureDocLink({
  client,
  profileId,
  field,
  label,
  disabled = false,
  className = "",
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const open = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await client.get(`/document/${profileId}/${field}`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(data);
      window.open(url, "_blank", "noopener,noreferrer");

      // The tab keeps its own reference once opened; release ours so the blob
      // is not held for the lifetime of the page.
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError(err?.uiMessage || "Could not open this document.");
    } finally {
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <span className={cx("inline-flex items-center gap-1.5 text-xs text-slate-400", className)}>
        <FileText size={13} aria-hidden="true" />
        {label} — not uploaded
      </span>
    );
  }

  return (
    <span className={cx("inline-flex flex-col gap-1", className)}>
      <Button variant="secondary" size="sm" icon={FileText} iconRight={ExternalLink} loading={loading} onClick={open}>
        {label}
      </Button>
      {error && (
        <span role="alert" className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600">
          <AlertCircle size={11} aria-hidden="true" />
          {error}
        </span>
      )}
    </span>
  );
}
