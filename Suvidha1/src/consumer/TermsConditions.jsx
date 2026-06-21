const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="mb-2 text-base font-bold text-gray-900">{title}</h2>
    <div className="space-y-2 text-sm text-gray-600">{children}</div>
  </div>
);

const TermsConditions = () => (
  <div className="mx-auto max-w-2xl pb-10">
    <h1 className="mb-1 text-2xl font-bold text-gray-900">Terms &amp; Conditions</h1>
    <p className="mb-6 text-sm text-gray-500">Last updated: June 2026</p>

    <Section title="1. Acceptance of terms">
      <p>
        By accessing or using Suvidha1 you agree to be bound by these Terms. If you do not
        agree, please do not use our platform.
      </p>
    </Section>

    <Section title="2. Platform role">
      <p>
        Suvidha1 is a marketplace that connects consumers with independent service professionals.
        We are not a party to any service contract between consumers and professionals and do
        not employ the professionals listed on the platform.
      </p>
    </Section>

    <Section title="3. User accounts">
      <p>
        You must be at least 18 years old to create an account. You are responsible for
        maintaining the confidentiality of your account credentials and for all activity that
        occurs under your account.
      </p>
    </Section>

    <Section title="4. Booking and payments">
      <p>
        Bookings are requests, not guarantees. A professional may decline a booking, in which
        case you will not be charged. Payments are processed on the platform and released to the
        professional after service completion.
      </p>
    </Section>

    <Section title="5. Prohibited conduct">
      <p>
        You may not use Suvidha1 to harass professionals, provide false reviews, circumvent
        platform payments or engage in any illegal activity. Violations may result in account
        suspension.
      </p>
    </Section>

    <Section title="6. Limitation of liability">
      <p>
        To the maximum extent permitted by law, Suvidha1 is not liable for the quality of
        services provided by independent professionals or any loss arising from your use of
        the platform.
      </p>
    </Section>

    <Section title="7. Changes to terms">
      <p>
        We may update these Terms at any time. Continued use of Suvidha1 after changes
        constitutes acceptance of the updated Terms.
      </p>
    </Section>

    <Section title="8. Governing law">
      <p>
        These Terms are governed by the laws of India. Any disputes shall be subject to the
        exclusive jurisdiction of courts in Gurugram, Haryana.
      </p>
    </Section>

    <Section title="9. Contact">
      <p>
        Questions?{" "}
        <a href="mailto:legal@suvidha1.app" className="text-indigo-600 hover:underline">
          legal@suvidha1.app
        </a>
      </p>
    </Section>
  </div>
);

export default TermsConditions;
