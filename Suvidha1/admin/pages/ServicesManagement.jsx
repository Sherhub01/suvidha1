import { useCallback, useState } from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import {
  Card, Btn, Modal, SectionHeader, Input, Select, ConfirmDialog,
  Badge, Alert, LoadingState, EmptyState,
} from "../components/ui";
import { adminServicesApi } from "../../shared/services/api";
import { errorMessage } from "../../shared/services/http";
import useApiData from "../../shared/hooks/useApiData";

const swal = {
  background: "linear-gradient(135deg,#0f172a,#1e3a5f)",
  color: "#fff",
  customClass: { popup: "!rounded-2xl !border !border-white/10" },
};

const BLANK = {
  slug: "",
  name: "",
  category: "",
  description: "",
  icon: "🔧",
  basePrice: "",
  visitFee: 0,
  priceType: "fixed",
  minPrice: 0,
  maxPrice: 100000,
  commissionPercent: 15,
  taxPercent: 18,
  defaultDurationMins: 60,
};

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const slugify = (value) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Service catalogue admin.
 *
 * This screen used to hold its list in React state, so every add, edit and
 * delete vanished on refresh. It is now backed by the Service collection, and
 * these rates are what the pricing engine actually charges.
 */
export default function ServicesManagement() {
  const [modal, setModal] = useState(null); // null | "create" | "edit"
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchServices = useCallback(({ signal }) => adminServicesApi.list({ signal }), []);
  const { data, loading, error, reload } = useApiData(fetchServices, { initial: null });

  const services = data?.services || [];

  const openCreate = () => {
    setForm(BLANK);
    setEditing(null);
    setFormError("");
    setModal("create");
  };

  const openEdit = (service) => {
    setForm({ ...BLANK, ...service });
    setEditing(service);
    setFormError("");
    setModal("edit");
  };

  const handle = (event) => {
    const { name, value } = event.target;
    setForm((f) => ({
      ...f,
      [name]: value,
      // Derive the slug from the name while creating, but never rewrite an
      // existing one — bookings reference it.
      ...(name === "name" && !editing ? { slug: slugify(value) } : {}),
    }));
  };

  const save = async () => {
    setFormError("");

    if (!form.name.trim() || !form.category.trim()) {
      setFormError("Name and category are required.");
      return;
    }
    if (Number(form.minPrice) > Number(form.maxPrice)) {
      setFormError("The minimum price cannot exceed the maximum price.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description?.trim() || "",
        icon: form.icon || "🔧",
        basePrice: Number(form.basePrice) || 0,
        visitFee: Number(form.visitFee) || 0,
        priceType: form.priceType,
        minPrice: Number(form.minPrice) || 0,
        maxPrice: Number(form.maxPrice) || 100000,
        commissionPercent: Number(form.commissionPercent) || 0,
        taxPercent: Number(form.taxPercent) || 0,
        defaultDurationMins: Number(form.defaultDurationMins) || 60,
      };

      if (editing) {
        await adminServicesApi.update(editing._id, payload);
      } else {
        await adminServicesApi.create({ ...payload, slug: form.slug || slugify(form.name) });
      }

      setModal(null);
      reload();
    } catch (err) {
      setFormError(errorMessage(err, "Could not save the service."));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (service) => {
    try {
      const result = await adminServicesApi.toggle(service._id);
      reload();
      await Swal.fire({
        ...swal,
        icon: "success",
        title: result.service.isActive ? "Service is live" : "Service hidden",
        text: result.message,
        timer: 2400,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({ ...swal, icon: "error", title: "Failed", text: errorMessage(err) });
    }
  };

  const remove = async () => {
    try {
      await adminServicesApi.remove(confirm._id);
      setConfirm(null);
      reload();
    } catch (err) {
      setConfirm(null);
      await Swal.fire({
        ...swal,
        icon: "warning",
        title: "Cannot delete",
        text: errorMessage(err),
      });
    }
  };

  return (
    <div>
      <SectionHeader
        title="Services Management"
        subtitle={`${services.length} services · rates here drive every booking price`}
        action={
          <div className="flex gap-2">
            <Btn variant="secondary" icon={RefreshCw} onClick={reload} loading={loading}>
              Refresh
            </Btn>
            <Btn icon={Plus} onClick={openCreate}>
              Add Service
            </Btn>
          </div>
        }
      />

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      {loading && !data ? (
        <LoadingState label="Loading services…" />
      ) : services.length === 0 ? (
        <EmptyState icon={Plus} title="No services yet" description="Add your first service to start taking bookings." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((s) => (
            <Card key={s._id} className={s.isActive ? "" : "opacity-60"}>
              <div className="flex items-start justify-between">
                <span className="text-2xl" aria-hidden="true">{s.icon}</span>
                <Badge status={s.isActive ? "active" : "disabled"}>
                  {s.isActive ? "Live" : "Hidden"}
                </Badge>
              </div>

              <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-50">{s.name}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">{s.category}</p>

              <dl className="mt-3 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <dt className="text-slate-400 dark:text-slate-500">Base rate</dt>
                  <dd className="font-semibold text-slate-700 dark:text-slate-200">
                    {inr(s.basePrice)}
                    {s.priceType === "hourly" ? "/hr" : ""}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400 dark:text-slate-500">Visit fee</dt>
                  <dd className="text-slate-600 dark:text-slate-300">{inr(s.visitFee)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400 dark:text-slate-500">Commission</dt>
                  <dd className="text-slate-600 dark:text-slate-300">{s.commissionPercent}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400 dark:text-slate-500">GST</dt>
                  <dd className="text-slate-600 dark:text-slate-300">{s.taxPercent}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400 dark:text-slate-500">Bookings</dt>
                  <dd className="font-semibold text-slate-700 dark:text-slate-200">{s.bookings}</dd>
                </div>
              </dl>

              <div className="mt-3 flex gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Btn size="xs" variant="secondary" icon={Edit} onClick={() => openEdit(s)}>
                  Edit
                </Btn>
                <Btn
                  size="xs"
                  variant="ghost"
                  icon={s.isActive ? ToggleRight : ToggleLeft}
                  onClick={() => toggle(s)}
                >
                  {s.isActive ? "Hide" : "Show"}
                </Btn>
                <Btn size="xs" variant="ghost" icon={Trash2} onClick={() => setConfirm(s)} className="text-rose-600!" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / edit */}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        size="lg"
        title={editing ? `Edit ${editing.name}` : "Add a service"}
        description="These rates are used to price every booking of this service."
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(null)} disabled={saving}>
              Cancel
            </Btn>
            <Btn onClick={save} loading={saving}>
              {editing ? "Save changes" : "Create service"}
            </Btn>
          </>
        }
      >
        <div className="space-y-4">
          {formError && <Alert tone="error">{formError}</Alert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" name="name" value={form.name} onChange={handle} required />
            <Input label="Category" name="category" value={form.category} onChange={handle} required />
            <Input
              label="Slug"
              name="slug"
              value={form.slug}
              onChange={handle}
              disabled={Boolean(editing)}
              hint={editing ? "Cannot change — bookings reference it." : "Auto-generated from the name."}
            />
            <Input label="Icon" name="icon" value={form.icon} onChange={handle} hint="A single emoji." />
          </div>

          <Input label="Description" name="description" value={form.description} onChange={handle} />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Base rate (₹)" name="basePrice" type="number" min="0" value={form.basePrice} onChange={handle} required />
            <Select
              label="Charged"
              name="priceType"
              value={form.priceType}
              onChange={handle}
              options={[
                { value: "fixed", label: "Fixed price" },
                { value: "hourly", label: "Per hour" },
              ]}
            />
            <Input label="Visit fee (₹)" name="visitFee" type="number" min="0" value={form.visitFee} onChange={handle} hint="Travel charge." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Min rate (₹)" name="minPrice" type="number" min="0" value={form.minPrice} onChange={handle} hint="Professionals cannot price below this." />
            <Input label="Max rate (₹)" name="maxPrice" type="number" min="0" value={form.maxPrice} onChange={handle} hint="…or above this." />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Commission (%)" name="commissionPercent" type="number" min="0" max="100" value={form.commissionPercent} onChange={handle} hint="Platform's cut." />
            <Input label="GST (%)" name="taxPercent" type="number" min="0" max="100" value={form.taxPercent} onChange={handle} />
            <Input label="Duration (mins)" name="defaultDurationMins" type="number" min="15" value={form.defaultDurationMins} onChange={handle} hint="Blocks the calendar." />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={`Delete ${confirm?.name}?`}
        message="Services with existing bookings cannot be deleted — hide them instead so historical pricing stays intact."
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
