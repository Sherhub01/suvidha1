const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="mb-2 text-base font-bold text-gray-900">{title}</h2>
    <div className="space-y-2 text-sm text-gray-600">{children}</div>
  </div>
);

const PrivacyPolicy = () => (
  <div className="mx-auto max-w-2xl pb-10">
    <h1 className="mb-1 text-2xl font-bold text-gray-900">Privacy Policy</h1>
    <p className="mb-6 text-sm text-gray-500">Last updated: June 2026</p>

    <Section title="1. Information we collect">
      <p>
        When you create a Suvidha1 account we collect your name, email address, phone number
        and optionally your address and Aadhaar number for verification purposes.
      </p>
      <p>
        When you use the app we may collect approximate location data (with your permission)
        to surface professionals near you, and device/usage information to improve performance.
      </p>
    </Section>

    <Section title="2. How we use your information">
      <p>We use collected data to operate the platform, match you with service professionals, send booking confirmations and service updates, detect fraud and enforce our terms.</p>
      <p>We do not sell your personal data to third parties.</p>
    </Section>

    <Section title="3. Sharing with professionals">
      <p>
        When you book a service, your name and phone number are shared with the professional so
        they can contact you and fulfil the booking. Your Aadhaar number and full email are never
        shared with professionals.
      </p>
    </Section>

    <Section title="4. Data retention">
      <p>
        We retain account data for as long as your account is active. You may request deletion at
        any time from Settings → Account → Delete account, which permanently removes your personal
        data within 30 days.
      </p>
    </Section>

    <Section title="5. Cookies">
      <p>
        Suvidha1 uses strictly necessary cookies to maintain your session and preference cookies to
        remember your settings (e.g. dark mode, language). We don't use tracking or advertising
        cookies.
      </p>
    </Section>

    <Section title="6. Security">
      <p>
        All data is transmitted over HTTPS and passwords are hashed using bcrypt. We use
        industry-standard practices to protect your information, but no system is completely
        impenetrable.
      </p>
    </Section>

    <Section title="7. Contact">
      <p>
        For privacy-related queries contact us at{" "}
        <a href="mailto:privacy@suvidha1.app" className="text-indigo-600 hover:underline">
          privacy@suvidha1.app
        </a>
        .
      </p>
    </Section>
  </div>
);

export default PrivacyPolicy;
