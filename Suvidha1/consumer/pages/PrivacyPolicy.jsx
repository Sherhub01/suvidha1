import { Link } from "react-router-dom";

const Section = ({ id, title, children }) => (
  <div id={id} className="mb-8 scroll-mt-6">
    <h2 className="mb-3 text-base font-bold text-gray-900 border-b border-gray-100 pb-2 dark:text-slate-50 dark:border-slate-800">{title}</h2>
    <div className="space-y-3 text-sm text-gray-600 leading-relaxed dark:text-slate-300">{children}</div>
  </div>
);

const TOC = [
  { id: "overview",     label: "1. Overview" },
  { id: "collection",   label: "2. Data We Collect" },
  { id: "use",          label: "3. How We Use Your Data" },
  { id: "sharing",      label: "4. Sharing with Third Parties" },
  { id: "professionals",label: "5. Data Shared with Professionals" },
  { id: "cookies",      label: "6. Cookies & Tracking" },
  { id: "retention",    label: "7. Data Retention" },
  { id: "security",     label: "8. Security" },
  { id: "rights",       label: "9. Your Rights" },
  { id: "children",     label: "10. Children's Privacy" },
  { id: "transfers",    label: "11. Cross-border Transfers" },
  { id: "changes",      label: "12. Changes to This Policy" },
  { id: "contact",      label: "13. Contact & Grievance Officer" },
];

const PrivacyPolicy = () => (
  <div className="mx-auto max-w-3xl pb-16">
    {/* Header */}
    <div className="mb-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-slate-50">Privacy Policy</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Last updated: June 2026 · Effective date: 1 July 2026</p>
      <p className="mt-3 text-sm text-gray-600 leading-relaxed dark:text-slate-300">
        This Privacy Policy describes how <strong>Suvidha1 Technologies Private Limited</strong>{" "}
        ("Suvidha1", "we", "us", "our") collects, uses, stores and protects the personal data of
        users of our platform (website and mobile application) in accordance with the{" "}
        <strong>Digital Personal Data Protection Act 2023 (DPDP Act)</strong> and other applicable
        Indian laws.
      </p>
      <p className="mt-2 text-sm font-semibold text-emerald-700">
        We do not sell your personal data. Ever.
      </p>
    </div>

    {/* Table of Contents */}
    <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-3 text-sm font-bold text-gray-700 uppercase tracking-wide dark:text-slate-200">Table of Contents</h2>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {TOC.map(({ id, label }) => (
          <li key={id}>
            <a href={`#${id}`} className="text-sm text-indigo-600 hover:underline">{label}</a>
          </li>
        ))}
      </ul>
    </div>

    <Section id="overview" title="1. Overview">
      <p>
        Suvidha1 is a marketplace connecting consumers with home service professionals. As a Data
        Fiduciary under the DPDP Act 2023, we are committed to processing your personal data
        lawfully, fairly and transparently, and only for the purposes described in this Policy.
      </p>
      <p>
        This Policy applies to all users of Suvidha1 — Consumers, Service Professionals, and
        visitors to our website. By creating an account or using our services, you consent to the
        data practices described here.
      </p>
    </Section>

    <Section id="collection" title="2. Data We Collect">
      <p><strong>Account data (required):</strong> When you register, we collect your name, email
      address, phone number, and a hashed (never plain-text) password. Professionals also provide
      Aadhaar number, PAN number, and banking details for verification and payments.</p>

      <p><strong>Profile data (optional):</strong> Profile photo, address, bio, and service
      preferences that you choose to add.</p>

      <p><strong>Location data:</strong> With your explicit permission, we collect your device's
      GPS coordinates to surface nearby professionals. You can disable location access at any
      time in your device settings. We collect precise location only when the app is actively
      in use.</p>

      <p><strong>Booking & transaction data:</strong> Details of services requested, booked,
      and completed, including dates, times, amounts, payment method type, and status.</p>

      <p><strong>Communications:</strong> Messages exchanged through the in-app chat between you
      and Professionals, and communications with our support team.</p>

      <p><strong>Device & usage data:</strong> IP address, device type, operating system, browser
      type, app version, pages visited, features used, crash reports and performance data. This
      data is collected automatically to improve the platform.</p>

      <p><strong>Verification documents:</strong> Professionals submit Aadhaar, PAN, certificates
      and other documents for verification. These are stored encrypted and accessed only by our
      verification team.</p>
    </Section>

    <Section id="use" title="3. How We Use Your Data">
      <p>We use your data for the following purposes, each with a lawful basis under the DPDP Act:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Platform operation:</strong> Creating and managing your account, processing bookings, facilitating payments, and providing customer support. <em>(Contractual necessity)</em></li>
        <li><strong>Matching & discovery:</strong> Surfacing relevant Professionals based on your location, service category, past preferences and ratings. <em>(Contractual necessity)</em></li>
        <li><strong>Communications:</strong> Sending booking confirmations, status updates, OTPs and service reminders via email and SMS. <em>(Contractual necessity)</em></li>
        <li><strong>Safety & verification:</strong> Verifying Professional identities, conducting background checks, detecting fraudulent activity, and enforcing our Terms. <em>(Legitimate interest / legal obligation)</em></li>
        <li><strong>Platform improvement:</strong> Analysing usage patterns to improve features, fix bugs, and optimise performance. Data used for this purpose is aggregated or pseudonymised where possible. <em>(Legitimate interest)</em></li>
        <li><strong>Legal compliance:</strong> Retaining records as required by the Income Tax Act 1961, GST laws, and other applicable regulations. <em>(Legal obligation)</em></li>
        <li><strong>Marketing (opt-in only):</strong> Sending promotional offers, new feature announcements and newsletters. You can unsubscribe at any time via the link in any marketing email or in Settings → Notifications. <em>(Consent)</em></li>
      </ul>
    </Section>

    <Section id="sharing" title="4. Sharing with Third Parties">
      <p>We never sell your personal data. We share data only in the following limited circumstances:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Payment gateway:</strong> When you pay online, the transaction is completed on the payment gateway's own systems. We send it only the amount, an order reference and your name, email and phone so it can send you a receipt. Your card details never reach our servers.</li>
        <li><strong>Cloud infrastructure:</strong> We use cloud hosting providers (AWS / GCP) operating data centres in India. All data at rest is encrypted using AES-256.</li>
        <li><strong>Analytics:</strong> Aggregated, anonymised usage data is shared with analytics providers to understand platform trends. No personally identifiable information is shared.</li>
        <li><strong>Legal obligations:</strong> We may disclose your data to law enforcement or government authorities when required by a valid legal order, court order, or where we have a good-faith belief that disclosure is necessary to prevent a crime or protect safety.</li>
        <li><strong>Business transfers:</strong> In the event of a merger, acquisition or asset sale, your data may be transferred to the acquiring entity subject to the same privacy protections. You will be notified via email before any such transfer.</li>
      </ul>
    </Section>

    <Section id="professionals" title="5. Data Shared with Professionals">
      <p>When you make a booking, the following information is shared with the assigned Professional:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Your first name and last initial</li>
        <li>Your phone number (for coordination)</li>
        <li>Your service address</li>
        <li>Booking details (service type, scheduled time, special instructions)</li>
      </ul>
      <p>The following data is <strong>never</strong> shared with Professionals:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Your full email address</li>
        <li>Your Aadhaar number or financial data</li>
        <li>Your payment method details</li>
        <li>Your browsing or usage history</li>
      </ul>
      <p>Professionals are contractually bound to use your data only to fulfil the booked service
      and are prohibited from contacting you for any other purpose after the booking concludes.</p>
    </Section>

    <Section id="cookies" title="6. Cookies & Tracking">
      <p>We use cookies and similar technologies for the following purposes:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Strictly necessary cookies:</strong> Essential for authentication and session management. Cannot be disabled without breaking the platform.</li>
        <li><strong>Preference cookies:</strong> Remember your settings such as notification preferences and language. Can be cleared in your browser settings.</li>
        <li><strong>Analytics cookies:</strong> Anonymised data to understand how users navigate the platform and identify areas for improvement.</li>
      </ul>
      <p>We do <strong>not</strong> use advertising, tracking or third-party retargeting cookies.</p>
      <p>You can manage cookie preferences in your browser settings. Note that disabling strictly
      necessary cookies will prevent you from logging in.</p>
    </Section>

    <Section id="retention" title="7. Data Retention">
      <p>We retain your personal data for as long as your account is active or as required to
      provide services. Specifically:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li><strong>Account data:</strong> Retained until you delete your account, after which it is permanently purged within 30 days.</li>
        <li><strong>Transaction records:</strong> Retained for 7 years as required by the Income Tax Act 1961 and GST regulations.</li>
        <li><strong>Chat messages:</strong> Retained for 90 days after booking completion, then deleted.</li>
        <li><strong>Location data:</strong> Retained for 30 days for safety and dispute resolution purposes, then automatically deleted.</li>
        <li><strong>Verification documents:</strong> Retained for the duration of the Professional's active status, plus 3 years thereafter for legal compliance.</li>
      </ul>
    </Section>

    <Section id="security" title="8. Security">
      <p>We implement industry-standard technical and organisational measures to protect your data:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>All data in transit is encrypted using TLS 1.2 or higher (HTTPS).</li>
        <li>All data at rest is encrypted using AES-256.</li>
        <li>Passwords are hashed using bcrypt with a work factor of 12 — never stored in plain text.</li>
        <li>Access to production systems is restricted to authorised personnel only, with multi-factor authentication enforced.</li>
        <li>We conduct regular security audits and penetration testing.</li>
        <li>Our platform undergoes VAPT (Vulnerability Assessment and Penetration Testing) annually by a CERT-In empanelled security firm.</li>
      </ul>
      <p>No system is completely immune to breaches. In the event of a data breach that poses a
      risk to your rights, we will notify you and the relevant regulatory authority within 72 hours
      as required by the DPDP Act 2023.</p>
    </Section>

    <Section id="rights" title="9. Your Rights">
      <p>Under the Digital Personal Data Protection Act 2023, you have the following rights:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Right to access:</strong> Request a copy of the personal data we hold about you.</li>
        <li><strong>Right to correction:</strong> Request correction of inaccurate or incomplete data.</li>
        <li><strong>Right to erasure:</strong> Request deletion of your personal data. We will comply within 30 days except where retention is required by law.</li>
        <li><strong>Right to withdraw consent:</strong> Withdraw consent for optional data uses (e.g. marketing) at any time via Settings → Notifications or by emailing privacy@suvidha1.app.</li>
        <li><strong>Right to nominate:</strong> Nominate an individual to exercise your rights in the event of your death or incapacity.</li>
        <li><strong>Right to grievance redressal:</strong> Lodge a complaint with our Grievance Officer (details below).</li>
      </ul>
      <p>To exercise any right, please email{" "}
        <a href="mailto:privacy@suvidha1.app" className="text-indigo-600 hover:underline">privacy@suvidha1.app</a>{" "}
        with your registered email address and the nature of your request. We will respond within
        30 days as required by law.</p>
    </Section>

    <Section id="children" title="10. Children's Privacy">
      <p>
        Suvidha1 is not directed at children under the age of 18. We do not knowingly collect
        personal data from minors. If we become aware that we have inadvertently collected data
        from a minor, we will delete it promptly. If you believe we have collected data from a
        child under 18, please contact us at{" "}
        <a href="mailto:privacy@suvidha1.app" className="text-indigo-600 hover:underline">privacy@suvidha1.app</a>.
      </p>
    </Section>

    <Section id="transfers" title="11. Cross-border Data Transfers">
      <p>
        We store all personal data of Indian users on servers located within India. In the limited
        cases where data is processed by third-party service providers outside India (e.g. for
        analytics or email delivery), we ensure that adequate contractual safeguards are in place,
        including standard contractual clauses and compliance with applicable Indian law governing
        cross-border data transfers.
      </p>
    </Section>

    <Section id="changes" title="12. Changes to This Policy">
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our practices,
        technology or legal requirements. We will notify you of material changes via in-app
        notification and email at least 14 days before the changes take effect.
      </p>
      <p>
        Your continued use of Suvidha1 after the effective date constitutes acceptance of the
        updated Policy. The "Last updated" date at the top of this page reflects the most
        recent revision.
      </p>
    </Section>

    <Section id="contact" title="13. Contact & Grievance Officer">
      <p>
        For any privacy-related queries, data requests, or complaints, please contact our
        designated Grievance Officer as required under Rule 5(9) of the Information Technology
        (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021:
      </p>
      <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-1.5 dark:border-slate-800 dark:bg-slate-800/60">
        <p><strong>Grievance Officer:</strong> Rohan Sharma</p>
        <p><strong>Designation:</strong> Data Protection Officer</p>
        <p><strong>Suvidha1 Technologies Private Limited</strong></p>
        <p>Cyber Hub, DLF Phase 2, Gurugram, Haryana – 122002, India</p>
        <p>Email: <a href="mailto:privacy@suvidha1.app" className="text-indigo-600 hover:underline">privacy@suvidha1.app</a></p>
        <p>Phone: +91 11 4000 0002 (Mon–Fri, 10AM–6PM IST)</p>
        <p>Response time: Within 30 days of receipt of complaint</p>
      </div>
      <p className="mt-3">
        If you are not satisfied with our response, you may lodge a complaint with the{" "}
        <strong>Data Protection Board of India</strong> once constituted under the DPDP Act 2023.
      </p>
    </Section>

    <div className="mt-6 flex flex-wrap gap-3 text-xs text-gray-400 border-t border-gray-100 pt-6 dark:text-slate-500 dark:border-slate-800">
      <Link to="/terms" className="hover:text-indigo-600 hover:underline transition">Terms & Conditions</Link>
      <span>·</span>
      <Link to="/about" className="hover:text-indigo-600 hover:underline transition">About Us</Link>
      <span>·</span>
      <span>© {new Date().getFullYear()} Suvidha1 Technologies Pvt. Ltd.</span>
    </div>
  </div>
);

export default PrivacyPolicy;
