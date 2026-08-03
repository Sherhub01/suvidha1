import { Link } from "react-router-dom";

const Section = ({ id, title, children }) => (
  <div id={id} className="mb-8 scroll-mt-6">
    <h2 className="mb-3 text-base font-bold text-gray-900 border-b border-gray-100 pb-2">{title}</h2>
    <div className="space-y-3 text-sm text-gray-600 leading-relaxed">{children}</div>
  </div>
);

const TOC = [
  { id: "acceptance",    label: "1. Acceptance of Terms" },
  { id: "platform",      label: "2. Platform Role" },
  { id: "accounts",      label: "3. User Accounts" },
  { id: "services",      label: "4. Services & Bookings" },
  { id: "payments",      label: "5. Payments & Refunds" },
  { id: "conduct",       label: "6. Prohibited Conduct" },
  { id: "content",       label: "7. User Content" },
  { id: "ip",            label: "8. Intellectual Property" },
  { id: "privacy",       label: "9. Privacy" },
  { id: "liability",     label: "10. Limitation of Liability" },
  { id: "indemnity",     label: "11. Indemnification" },
  { id: "termination",   label: "12. Termination" },
  { id: "disputes",      label: "13. Dispute Resolution" },
  { id: "governing",     label: "14. Governing Law" },
  { id: "changes",       label: "15. Changes to Terms" },
  { id: "contact",       label: "16. Contact" },
];

const TermsConditions = () => (
  <div className="mx-auto max-w-3xl pb-16">
    {/* Header */}
    <div className="mb-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Terms &amp; Conditions</h1>
      <p className="mt-1 text-sm text-gray-500">Last updated: June 2026 · Effective date: 1 July 2026</p>
      <p className="mt-3 text-sm text-gray-600 leading-relaxed">
        Please read these Terms and Conditions ("Terms") carefully before using the Suvidha1
        platform (website, mobile application, and related services) operated by{" "}
        <strong>Suvidha1 Technologies Private Limited</strong>, a company incorporated under the
        Companies Act 2013 with its registered office at Cyber Hub, DLF Phase 2, Gurugram,
        Haryana – 122002, India ("we", "us", "Company").
      </p>
      <p className="mt-2 text-sm font-semibold text-indigo-700">
        By creating an account or using our platform, you agree to be legally bound by these Terms.
      </p>
    </div>

    {/* Table of Contents */}
    <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-bold text-gray-700 uppercase tracking-wide">Table of Contents</h2>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {TOC.map(({ id, label }) => (
          <li key={id}>
            <a href={`#${id}`} className="text-sm text-indigo-600 hover:underline">{label}</a>
          </li>
        ))}
      </ul>
    </div>

    <Section id="acceptance" title="1. Acceptance of Terms">
      <p>
        By accessing or using Suvidha1 — including browsing the website, installing the mobile
        application, creating a user account, or engaging any feature — you confirm that you have
        read, understood and agree to be bound by these Terms and our{" "}
        <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>,
        which is incorporated herein by reference.
      </p>
      <p>
        If you do not agree to any part of these Terms, you must immediately stop using the platform.
        Your continued use constitutes your ongoing acceptance of these Terms as updated from time to time.
      </p>
      <p>
        These Terms constitute a legally binding agreement between you and Suvidha1 Technologies Pvt. Ltd.
        under the Information Technology Act 2000 and rules made thereunder, including the Information
        Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021.
      </p>
    </Section>

    <Section id="platform" title="2. Platform Role">
      <p>
        Suvidha1 is a technology-enabled marketplace that connects consumers seeking home and personal
        services ("Consumers") with independent service professionals ("Professionals"). Suvidha1 is
        an intermediary as defined under applicable Indian law.
      </p>
      <p>
        <strong>We are not a party</strong> to any service contract formed between a Consumer and a
        Professional through the platform. We do not employ, supervise, direct or control Professionals
        in the performance of their services.
      </p>
      <p>
        We vet Professionals through identity and background checks, but we do not guarantee the
        quality, safety, legality or suitability of any service. You engage Professionals at your
        own risk, subject to our Service Guarantee described in Section 4.
      </p>
    </Section>

    <Section id="accounts" title="3. User Accounts">
      <p><strong>Eligibility:</strong> You must be at least 18 years of age and legally capable of
      entering into a binding contract under applicable law to create an account.</p>
      <p><strong>Registration:</strong> You agree to provide accurate, current and complete information
      during registration and to keep your account information up to date. Creating multiple accounts
      or accounts on behalf of others without authorisation is prohibited.</p>
      <p><strong>Security:</strong> You are solely responsible for maintaining the confidentiality of
      your account credentials and for all activity that occurs under your account. Notify us
      immediately at <a href="mailto:security@suvidha1.app" className="text-indigo-600 hover:underline">security@suvidha1.app</a> if
      you suspect unauthorised access.</p>
      <p><strong>Verification:</strong> We may require OTP-based email or phone verification. Providing
      a false identity for verification purposes is a violation of these Terms and may constitute fraud
      under the Indian Penal Code.</p>
    </Section>

    <Section id="services" title="4. Services & Bookings">
      <p><strong>Booking requests:</strong> A booking submitted through the platform is a request,
      not a confirmed appointment. A Professional may accept or decline any booking. Confirmation
      is communicated via in-app notification and email.</p>
      <p><strong>Service Guarantee:</strong> If you are dissatisfied with a completed service, you
      may raise a dispute within 24 hours of service completion. We will investigate and may arrange
      a free re-visit, a partial refund, or a replacement Professional at our sole discretion.</p>
      <p><strong>Cancellation:</strong> You may cancel a booking free of charge up to 2 hours before
      the scheduled start time. Cancellations within 2 hours may attract a cancellation fee of up to
      ₹50, which compensates the Professional for lost opportunity.</p>
      <p><strong>Scheduling:</strong> You agree to ensure safe and reasonable access to your premises
      at the scheduled time. Failure to provide access may result in a no-show fee.</p>
    </Section>

    <Section id="payments" title="5. Payments & Refunds">
      <p><strong>Payment processing:</strong> All payments are processed through PCI-DSS compliant
      third-party payment gateways. Suvidha1 does not store your full card details on its servers.</p>
      <p><strong>Escrow:</strong> Payments are held in escrow and released to the Professional
      automatically 24 hours after service completion, unless a dispute is raised.</p>
      <p><strong>Refunds:</strong> Approved refunds are processed within 5–7 business days to your
      original payment method. Platform convenience fees (if any) are non-refundable unless the
      cancellation was due to a Professional's no-show.</p>
      <p><strong>Taxes:</strong> Prices displayed are inclusive of applicable GST. You will receive
      a GST invoice for every completed booking. Suvidha1 Technologies Pvt. Ltd. GSTIN:
      06AABCS1234F1Z0.</p>
      <p><strong>Disputes:</strong> Payment disputes must be raised through the in-app dispute
      resolution centre. Chargebacks initiated without first attempting in-app resolution may result
      in account suspension.</p>
    </Section>

    <Section id="conduct" title="6. Prohibited Conduct">
      <p>You agree not to use the platform to:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Harass, abuse, threaten or discriminate against any Professional or other user;</li>
        <li>Post false, misleading or defamatory reviews;</li>
        <li>Circumvent platform payments by dealing directly with Professionals found through Suvidha1;</li>
        <li>Collect or harvest other users' personal data without consent;</li>
        <li>Upload malicious code, spam or conduct any form of cyberattack;</li>
        <li>Impersonate any person, company or government authority;</li>
        <li>Use the platform for any unlawful purpose under Indian law;</li>
        <li>Attempt to reverse-engineer, decompile or copy any part of the platform;</li>
        <li>Create fake accounts, engage in review manipulation, or otherwise undermine platform integrity.</li>
      </ul>
      <p>Violations may result in immediate account suspension, permanent ban, and/or referral to law
      enforcement authorities as appropriate.</p>
    </Section>

    <Section id="content" title="7. User Content">
      <p>By posting reviews, photos, messages or other content ("User Content") on Suvidha1, you
      grant us a non-exclusive, royalty-free, worldwide licence to use, reproduce, display and
      distribute such content for operating and promoting the platform.</p>
      <p>You represent that you own or have the necessary rights to the User Content you post, and
      that it does not infringe any third-party rights or applicable law. We reserve the right to
      remove User Content that violates these Terms or our Community Guidelines without prior notice.</p>
    </Section>

    <Section id="ip" title="8. Intellectual Property">
      <p>All intellectual property in the Suvidha1 platform — including software, design, trademarks,
      logos, content and databases — is owned by or licenced to Suvidha1 Technologies Pvt. Ltd.
      and is protected by Indian and international intellectual property laws.</p>
      <p>You are granted a limited, non-exclusive, non-transferable, revocable licence to use the
      platform solely for your personal, non-commercial use. You may not copy, modify, distribute,
      sell or lease any part of the platform without our prior written consent.</p>
    </Section>

    <Section id="privacy" title="9. Privacy">
      <p>Our collection, use and protection of your personal data is governed by our{" "}
        <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>, which
        forms an integral part of these Terms. By using Suvidha1, you consent to the data practices
        described therein, in compliance with the Digital Personal Data Protection Act 2023.</p>
    </Section>

    <Section id="liability" title="10. Limitation of Liability">
      <p>To the maximum extent permitted by applicable law, Suvidha1 Technologies Pvt. Ltd. and its
      officers, directors, employees and agents shall not be liable for:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>The quality, safety or legality of services performed by independent Professionals;</li>
        <li>Any indirect, incidental, special, consequential or punitive damages;</li>
        <li>Loss of profits, data, goodwill or business opportunities;</li>
        <li>Any damages exceeding the total amount paid by you on the platform in the 3 months
        preceding the claim.</li>
      </ul>
      <p>Nothing in these Terms shall exclude liability for death or personal injury caused by our
      negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be
      excluded under applicable law.</p>
    </Section>

    <Section id="indemnity" title="11. Indemnification">
      <p>You agree to indemnify, defend and hold harmless Suvidha1 Technologies Pvt. Ltd. and its
      affiliates, officers, directors, employees and agents from any claims, liabilities, damages,
      losses, costs and expenses (including legal fees) arising out of or related to: (a) your use
      of the platform; (b) your violation of these Terms; (c) your violation of any third-party
      rights; or (d) any content you post on the platform.</p>
    </Section>

    <Section id="termination" title="12. Termination">
      <p><strong>By you:</strong> You may close your account at any time from Settings → Account →
      Delete Account. Pending bookings must be completed or cancelled before account deletion.</p>
      <p><strong>By us:</strong> We may suspend or permanently terminate your account at our
      discretion, with or without notice, for violation of these Terms, fraudulent activity, or
      for any reason that we deem necessary to protect the platform community.</p>
      <p>Upon termination, your right to use the platform ceases immediately. Sections 8, 10, 11,
      13 and 14 survive termination.</p>
    </Section>

    <Section id="disputes" title="13. Dispute Resolution">
      <p><strong>Consumer disputes:</strong> All disputes arising from a booking should first be
      raised through our in-app dispute centre. Our support team aims to resolve disputes within
      3 business days.</p>
      <p><strong>Escalation:</strong> If a dispute cannot be resolved through our support team,
      the parties agree to attempt resolution through mediation before initiating legal proceedings.</p>
      <p><strong>Arbitration:</strong> Any unresolved dispute shall be referred to and finally
      resolved by arbitration under the Arbitration and Conciliation Act 1996, with a single
      arbitrator appointed by mutual agreement. The seat of arbitration shall be Gurugram, Haryana.
      Proceedings shall be conducted in English.</p>
    </Section>

    <Section id="governing" title="14. Governing Law">
      <p>These Terms are governed by and construed in accordance with the laws of the Republic of
      India. Subject to the arbitration clause above, the courts of Gurugram, Haryana shall have
      exclusive jurisdiction over any disputes that proceed to litigation.</p>
    </Section>

    <Section id="changes" title="15. Changes to Terms">
      <p>We may update these Terms at any time. When we make material changes, we will notify you
      via in-app notification and email at least 14 days before the changes take effect. If you
      continue to use Suvidha1 after the effective date, you accept the revised Terms.</p>
      <p>We encourage you to review these Terms periodically. The "Last updated" date at the top
      of this page indicates when changes were last made.</p>
    </Section>

    <Section id="contact" title="16. Contact">
      <p>If you have any questions about these Terms, please contact our Legal Team:</p>
      <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-1.5">
        <p><strong>Suvidha1 Technologies Private Limited</strong></p>
        <p>Cyber Hub, DLF Phase 2, Gurugram, Haryana – 122002, India</p>
        <p>Email: <a href="mailto:legal@suvidha1.app" className="text-indigo-600 hover:underline">legal@suvidha1.app</a></p>
        <p>Phone: +91 11 4000 0001 (Mon–Fri, 10AM–6PM IST)</p>
        <p>CIN: U72900HR2024PTC12345</p>
      </div>
    </Section>

    <div className="mt-6 flex flex-wrap gap-3 text-xs text-gray-400 border-t border-gray-100 pt-6">
      <Link to="/privacy" className="hover:text-indigo-600 hover:underline transition">Privacy Policy</Link>
      <span>·</span>
      <Link to="/about"   className="hover:text-indigo-600 hover:underline transition">About Us</Link>
      <span>·</span>
      <span>© {new Date().getFullYear()} Suvidha1 Technologies Pvt. Ltd.</span>
    </div>
  </div>
);

export default TermsConditions;
