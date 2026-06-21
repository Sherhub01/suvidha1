import { T, card } from "../theme";

export default function StatsCard({ icon: Icon, value, label, change, changeColor, iconBg, iconColor }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-1.5" style={card}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: iconBg }}>
        <Icon size={16} color={iconColor} />
      </div>
      <div className="text-xl font-extrabold leading-none" style={{ color: T.heading }}>{value}</div>
      <div className="text-xs leading-tight" style={{ color: T.subText }}>{label}</div>
      {change && <div className="text-[11px] font-semibold" style={{ color: changeColor }}>{change}</div>}
    </div>
  );
}
