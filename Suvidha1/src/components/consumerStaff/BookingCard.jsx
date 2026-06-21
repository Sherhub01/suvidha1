import { MapPin, Clock, IndianRupee, Star, Phone, MessageSquare, Navigation, Check, X } from "lucide-react";
import { T, card } from "../../staff/theme";

const STATUS = {
  pending:   { bg: `${T.warning}20`,  color: T.warning,  border: `${T.warning}40`  },
  confirmed: { bg: `${T.info}20`,     color: T.info,     border: `${T.info}40`     },
  completed: { bg: `${T.success}20`,  color: T.success,  border: `${T.success}40`  },
  rejected:  { bg: `${T.danger}20`,   color: T.danger,   border: `${T.danger}40`   },
};

export default function BookingCard({ booking }) {
  const { customerName, customerInitials, avatarGradient, service, address, time, amount, rating, reviewCount, status, isPending } = booking;
  const sc = STATUS[status] || STATUS.pending;

  return (
    <div className="rounded-2xl p-4 mb-3 transition hover:brightness-110" style={card}>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: avatarGradient }}>{customerInitials}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: T.heading }}>{customerName}</p>
          <p className="text-xs truncate" style={{ color: T.subText }}>{service}</p>
        </div>
        <span className="rounded-lg px-2.5 py-0.5 text-xs font-semibold capitalize"
          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{status}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { icon: MapPin,      text: address },
          { icon: Clock,       text: time },
          { icon: IndianRupee, text: amount },
          { icon: Star,        text: `${rating} (${reviewCount} reviews)`, amber: true },
        ].map(({ icon: Icon, text, amber }, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: amber ? T.warning : T.subText }}>
            <Icon size={12} className="shrink-0" /> {text}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: `1px solid ${T.cardBorder}` }}>
        {isPending && (
          <>
            <Btn icon={Check} label="Accept"   bg={`${T.success}20`} color={T.success} border={`${T.success}40`} />
            <Btn icon={X}     label="Reject"   bg={`${T.danger}20`}  color={T.danger}  border={`${T.danger}40`}  />
          </>
        )}
        <Btn icon={Phone}         label="Call"     bg={T.cardBg} color={T.text} border={T.cardBorder} />
        <Btn icon={MessageSquare} label="Chat"     bg={T.cardBg} color={T.text} border={T.cardBorder} />
        <Btn icon={Navigation}    label="Navigate" bg={`${T.info}20`} color={T.info} border={`${T.info}40`} />
      </div>
    </div>
  );
}

function Btn({ icon: Icon, label, bg, color, border }) {
  return (
    <button className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition hover:opacity-80"
      style={{ background: bg, color, border: `1px solid ${border}` }}>
      <Icon size={12} /> {label}
    </button>
  );
}
