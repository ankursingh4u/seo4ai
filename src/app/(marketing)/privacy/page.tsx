import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How SEO4AI collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-stone-500">Last updated: June 22, 2026</p>

      <div className="mt-8 space-y-5 text-sm leading-relaxed text-stone-700 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-stone-900 [&_h2]:mt-8 [&_h2]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        <p>
          This Privacy Policy explains how SEO4AI (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses,
          and protects your information when you use our service.
        </p>

        <h2>1. Information we collect</h2>
        <ul>
          <li><strong>Account data:</strong> your email address and authentication details.</li>
          <li><strong>Brand data:</strong> brand names, industries, competitors, and websites you add.</li>
          <li><strong>Scan data:</strong> the prompts we run and the AI responses we analyze for you.</li>
          <li><strong>Billing data:</strong> handled by our payment processor; we do not store card numbers.</li>
          <li><strong>Usage data:</strong> basic logs and analytics to operate and improve the Service.</li>
        </ul>

        <h2>2. How we use your information</h2>
        <ul>
          <li>To provide the Service: run scans, generate scores, recommendations, and content.</li>
          <li>To manage your account, subscription, and support requests.</li>
          <li>To send transactional emails (e.g. confirmation, reports) and important notices.</li>
          <li>To maintain security and improve the product.</li>
        </ul>

        <h2>3. Service providers we use</h2>
        <p>We share data only as needed with trusted processors that power the Service:</p>
        <ul>
          <li><strong>Supabase</strong> — authentication and database.</li>
          <li><strong>OpenAI</strong> — AI model queries and content generation.</li>
          <li><strong>Resend</strong> — transactional email delivery.</li>
          <li><strong>Vercel</strong> — hosting and infrastructure.</li>
          <li><strong>Payment processor</strong> — subscription billing.</li>
        </ul>
        <p>We do not sell your personal information.</p>

        <h2>4. Cookies</h2>
        <p>
          We use essential cookies for authentication and to keep you signed in. We do not use them
          for advertising.
        </p>

        <h2>5. Data retention</h2>
        <p>
          We keep your data for as long as your account is active or as needed to provide the Service.
          You can request deletion of your account and associated data by contacting us.
        </p>

        <h2>6. Your rights</h2>
        <p>
          Depending on your location, you may have rights to access, correct, or delete your personal
          data. To exercise these, email us and we&apos;ll respond within a reasonable time.
        </p>

        <h2>7. Security</h2>
        <p>
          We use industry-standard measures to protect your data, but no method of transmission or
          storage is 100% secure. You use the Service at your own risk.
        </p>

        <h2>8. Changes</h2>
        <p>
          We may update this policy; the date above reflects the latest version. Continued use means
          you accept the updated policy.
        </p>

        <h2>9. Contact</h2>
        <p>
          Privacy questions? Email{' '}
          <a href="mailto:support@seo4ai.app" className="text-violet-700 underline">support@seo4ai.app</a>.
        </p>
      </div>
    </div>
  )
}
