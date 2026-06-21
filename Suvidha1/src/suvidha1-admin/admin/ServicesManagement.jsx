import { useState } from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Card, Btn, Modal, SectionHeader, Input, ConfirmDialog, Badge } from "./ui";

const INITIAL = [
  { id:1, name:"AC Repair",      icon:"❄️",  category:"HVAC",        price:"₹499–₹999",   enabled:true  },
  { id:2, name:"Electrician",    icon:"⚡",  category:"Electrical",  price:"₹299–₹799",   enabled:true  },
  { id:3, name:"Plumber",        icon:"🔧",  category:"Plumbing",    price:"₹199–₹599",   enabled:true  },
  { id:4, name:"Carpenter",      icon:"🪵",  category:"Carpentry",   price:"₹399–₹1,499", enabled:true  },
  { id:5, name:"Painter",        icon:"🎨",  category:"Painting",    price:"₹499–₹2,999", enabled:true  },
  { id:6, name:"Mechanic",       icon:"🔩",  category:"Auto",        price:"₹299–₹999",   enabled:false },
  { id:7, name:"Deep Cleaning",  icon:"🧹",  category:"Cleaning",    price:"₹799–₹2,499", enabled:true  },
  { id:8, name:"Pest Control",   icon:"🐛",  category:"Pest",        price:"₹699–₹1,999", enabled:true  },
  { id:9, name:"Welder",         icon:"🔥",  category:"Fabrication", price:"₹599–₹1,999", enabled:true  },
  { id:10,name:"Lab Technician", icon:"🧪",  category:"Healthcare",  price:"₹399–₹999",   enabled:false },
];

const BLANK = { name:"", icon:"🔧", category:"", price:"" };

export default function ServicesManagement() {
  const [services, setServices] = useState(INITIAL);
  const [modal,    setModal]    = useState(null);   // null | "create" | "edit"
  const [form,     setForm]     = useState(BLANK);
  const [editId,   setEditId]   = useState(null);
  const [confirm,  setConfirm]  = useState(null);

  const openCreate = () => { setForm(BLANK); setEditId(null); setModal("create"); };
  const openEdit   = (s) => { setForm({ name:s.name, icon:s.icon, category:s.category, price:s.price }); setEditId(s.id); setModal("edit"); };

  const save = () => {
    if (editId) {
      setServices(l => l.map(s => s.id === editId ? { ...s, ...form } : s));
    } else {
      setServices(l => [...l, { id: Date.now(), ...form, enabled: true }]);
    }
    setModal(null);
  };

  const toggle = (id) => setServices(l => l.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  const remove  = (id) => { setServices(l => l.filter(s => s.id !== id)); setConfirm(null); };

  return (
    <div>
      <SectionHeader
        title="Services Management"
        subtitle={`${services.length} services`}
        action={<Btn variant="primary" size="sm" onClick={openCreate}><Plus size={13} /> Add Service</Btn>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {services.map(s => (
          <Card key={s.id} className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-2xl border border-gray-100">
                {s.icon}
              </div>
              <button onClick={() => toggle(s.id)} className="text-gray-400 hover:text-gray-600">
                {s.enabled
                  ? <ToggleRight size={22} className="text-blue-500" />
                  : <ToggleLeft  size={22} className="text-gray-400" />}
              </button>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-[15px]">{s.name}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{s.category}</div>
              <div className="text-xs text-blue-600 font-semibold mt-1">{s.price}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge status={s.enabled ? "active" : "disabled"} />
            </div>
            <div className="flex gap-2 border-t border-gray-100 pt-3">
              <Btn variant="outline" size="xs" className="flex-1" onClick={() => openEdit(s)}><Edit size={11} /> Edit</Btn>
              <Btn variant="danger"  size="xs" className="flex-1" onClick={() => setConfirm(s)}><Trash2 size={11} /> Delete</Btn>
            </div>
          </Card>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "edit" ? "Edit Service" : "Add New Service"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Service Name"  value={form.name}     onChange={e => setForm(f => ({...f, name:e.target.value}))}     placeholder="e.g. AC Repair" />
            <Input label="Icon (emoji)"  value={form.icon}     onChange={e => setForm(f => ({...f, icon:e.target.value}))}     placeholder="❄️" />
            <Input label="Category"      value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))} placeholder="e.g. HVAC" />
            <Input label="Price Range"   value={form.price}    onChange={e => setForm(f => ({...f, price:e.target.value}))}    placeholder="₹299–₹999" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Btn variant="outline" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={save} disabled={!form.name}>{modal === "edit" ? "Save Changes" : "Create Service"}</Btn>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete Service"
        message={`Delete "${confirm?.name}"? This cannot be undone.`}
        onConfirm={() => remove(confirm.id)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
