import { useState } from "react";
import { Camera, Save } from "lucide-react";
import { Card, Btn, SectionHeader, Input } from "./ui";

export default function Profile() {
  const adminUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const [form, setForm] = useState({
    name:    adminUser.name  || "Admin User",
    email:   adminUser.email || "admin@suvidha1.com",
    phone:   "+91 98000 00001",
    address: "Suvidha1 HQ",
    role:    "Super Admin",
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    // updateAdminProfile(form); // ← API call
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="max-w-2xl">
      <SectionHeader title="Admin Profile" subtitle="Manage your personal information" />

      {/* Avatar */}
      <Card className="mb-4 p-6 flex items-center gap-5">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
            AD
          </div>
          <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700">
            <Camera size={13} />
          </button>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">{form.name}</div>
          <div className="text-sm text-gray-500">{form.role}</div>
          <div className="text-xs text-gray-400 mt-1">{form.email}</div>
        </div>
      </Card>

      {/* Form */}
      <Card className="p-6">
        <div className="text-sm font-bold text-gray-800 mb-4">Personal Information</div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name"    value={form.name}    onChange={set("name")}    placeholder="Your name" />
          <Input label="Email"        value={form.email}   onChange={set("email")}   type="email" />
          <Input label="Phone"        value={form.phone}   onChange={set("phone")}   />
          <Input label="Role"         value={form.role}    disabled className="bg-gray-50 cursor-not-allowed" />
          <div className="col-span-2">
            <Input label="Address"    value={form.address} onChange={set("address")} />
          </div>
        </div>

        {saved && (
          <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700">
            ✓ Profile updated successfully.
          </div>
        )}

        <div className="flex justify-end mt-5">
          <Btn variant="primary" onClick={save}><Save size={13} /> Save Changes</Btn>
        </div>
      </Card>

      {/* Stats */}
      <Card className="mt-4 p-5">
        <div className="text-sm font-bold text-gray-800 mb-3">Account Activity</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[["Last Login","Today, 9:12 AM"],["Sessions","3 active"],["Member Since","Jan 2024"]].map(([k,v]) => (
            <div key={k} className="rounded-xl bg-gray-50 border border-gray-100 py-3">
              <div className="text-[11px] text-gray-400 font-medium">{k}</div>
              <div className="text-sm font-bold text-gray-800 mt-1">{v}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
