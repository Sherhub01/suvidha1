import { useCallback, useState } from "react";
import { ShieldCheck, UserPlus, Trash2, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import {
  Card, SectionHeader, Table, TR, TD, Badge, Btn, Modal,
  Input, Select, Alert, LoadingState, EmptyState,
} from "../components/ui";
import { adminApi, errorMessage } from "../../shared/services/http";
import useApiData from "../../shared/hooks/useApiData";

const swal = {
  background: "linear-gradient(135deg,#0f172a,#1e3a5f)",
  color: "#fff",
  customClass: { popup: "!rounded-2xl !border !border-white/10" },
};

const BLANK = { name: "", email: "", password: "", confirmPassword: "", role: "admin" };

/**
 * Admin account management.
 *
 * Public admin self-registration was removed — anyone could previously create a
 * full-access account. New admins are now created here by a signed-in super
 * admin, and the backend enforces that on POST /api/admin/accounts.
 */
export default function CreateAdmin() {
  const [forbidden, setForbidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchAdmins = useCallback(async ({ signal }) => {
    try {
      const { data } = await adminApi.get("/accounts", { signal });
      setForbidden(false);
      return data.success ? data.admins || [] : [];
    } catch (err) {
      // A non-super admin gets 403 here; that is a permissions state, not an error.
      if (err.response?.status === 403) {
        setForbidden(true);
        return [];
      }
      throw err;
    }
  }, []);

  const { data: admins, loading, reload: load } = useApiData(fetchAdmins, { initial: [] });

  const handle = (event) => {
    const { name, value } = event.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password))
      e.password = "Must contain a letter and a number";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await adminApi.post("/accounts", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      setOpen(false);
      setForm(BLANK);
      await load();
      await Swal.fire({
        ...swal,
        icon: "success",
        title: "Admin created",
        text: `${form.email} can now sign in.`,
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (err) {
      setErrors({ form: errorMessage(err, "Could not create the admin account.") });
    } finally {
      setSaving(false);
    }
  };

  if (forbidden) {
    return (
      <Card>
        <EmptyState
          icon={ShieldCheck}
          title="Super admin access required"
          description="Only a super admin can view or create admin accounts. Ask your super admin to add you."
        />
      </Card>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Admin Accounts"
        subtitle={`${admins.length} account${admins.length === 1 ? "" : "s"}`}
        action={
          <div className="flex gap-2">
            <Btn variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>
              Refresh
            </Btn>
            <Btn icon={UserPlus} onClick={() => setOpen(true)}>
              New Admin
            </Btn>
          </div>
        }
      />

      <Card padded={false}>
        {loading ? (
          <LoadingState label="Loading admin accounts…" />
        ) : (
          <Table headers={["Name", "Email", "Role", "Created"]} empty={admins.length ? "" : "No admin accounts yet"}>
            {admins.map((a) => (
              <TR key={a._id}>
                <TD className="font-semibold text-slate-800 dark:text-slate-100">{a.name}</TD>
                <TD>{a.email}</TD>
                <TD>
                  <Badge status={a.role === "superadmin" ? "approved" : "neutral"}>{a.role}</Badge>
                </TD>
                <TD className="text-slate-500 dark:text-slate-400">
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-IN") : "—"}
                </TD>
              </TR>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create admin account"
        description="The new admin can sign in immediately with these credentials."
        footer={
          <>
            <Btn variant="secondary" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Btn>
            <Btn onClick={submit} loading={saving}>
              Create account
            </Btn>
          </>
        }
      >
        <div className="space-y-4">
          {errors.form && <Alert tone="error">{errors.form}</Alert>}

          <Input label="Full name" name="name" value={form.name} onChange={handle} error={errors.name} required />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handle}
            error={errors.email}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handle}
            error={errors.password}
            hint="At least 8 characters, including a letter and a number."
            required
          />
          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handle}
            error={errors.confirmPassword}
            required
          />
          <Select
            label="Role"
            name="role"
            value={form.role}
            onChange={handle}
            options={[
              { value: "admin", label: "Admin — day-to-day moderation" },
              { value: "superadmin", label: "Super admin — can create admins and delete accounts" },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
