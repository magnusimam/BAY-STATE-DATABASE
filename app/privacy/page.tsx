import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — HUMAID',
  description: 'Privacy policy for the HUMAID BAY States humanitarian data intelligence platform (web and mobile).',
}

const EFFECTIVE_DATE = 'April 20, 2026'
const CONTACT_EMAIL = 'imammagnus40@gmail.com'
const ORG_NAME = 'BAY States Intelligence'
const PRODUCT_NAME = 'HUMAID'

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-zinc-200">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-[#f4b942] hover:underline">
          ← Back to HUMAID
        </Link>

        <h1 className="mt-8 text-4xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-400">Effective: {EFFECTIVE_DATE}</p>

        <section className="prose prose-invert mt-10 max-w-none space-y-8 text-zinc-300">
          <p>
            {ORG_NAME} (&quot;we&quot;, &quot;us&quot;) operates the {PRODUCT_NAME}{' '}
            humanitarian and youth data intelligence platform, available as a web application and as
            an Android/iOS mobile application. This Privacy Policy explains what information we
            collect, how we use it, and the choices you have. It applies to both the web and mobile
            versions of {PRODUCT_NAME}.
          </p>

          <div>
            <h2 className="text-2xl font-semibold text-white">1. Information We Collect</h2>
            <p>
              We collect the minimum information required to operate the platform:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Account information:</strong> email address, display name, and (optionally)
                profile photo, provided when you create an account or sign in with Google. This is
                handled by Firebase Authentication (Google LLC).
              </li>
              <li>
                <strong>Authentication metadata:</strong> account creation timestamp, last sign-in
                timestamp, and authentication provider (email/password, Google).
              </li>
              <li>
                <strong>Technical data:</strong> standard request logs (IP address, user agent,
                request path, timestamp) retained by our hosting providers for security and
                debugging. These logs are not linked to individual user accounts for analytics
                purposes.
              </li>
            </ul>
            <p>
              {PRODUCT_NAME} does <strong>not</strong> collect precise device location, contacts,
              photos, microphone audio, or health data. The humanitarian datasets displayed in the
              app (indicators for Borno, Adamawa, and Yobe states) come from publicly reported
              regional data, not from individual users.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">2. How We Use Information</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>To authenticate you and keep you signed in across sessions.</li>
              <li>To determine whether your account has administrative privileges.</li>
              <li>To communicate essential account notices (e.g. password reset emails).</li>
              <li>To secure the service and investigate abuse.</li>
            </ul>
            <p>
              We do not sell personal information. We do not use your information for advertising
              and we do not integrate third-party advertising SDKs.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">3. Third-Party Services</h2>
            <p>{PRODUCT_NAME} relies on the following processors:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Firebase Authentication</strong> (Google LLC) — stores account credentials,
                email address, and display name. Governed by Google&apos;s privacy policy.
              </li>
              <li>
                <strong>Cloudflare Workers / D1 / KV</strong> (Cloudflare, Inc.) — hosts the API
                backend and caches aggregated, non-personal humanitarian indicator data.
              </li>
              <li>
                <strong>Expo Application Services</strong> (650 Industries, Inc.) — used to build
                and distribute the mobile application.
              </li>
            </ul>
            <p>
              These providers act as data processors on our behalf and are contractually obligated
              to protect your information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">4. Data Storage &amp; Retention</h2>
            <p>
              Account data is retained for the life of your account. If you delete your account,
              your authentication record is removed from Firebase within 30 days. Technical request
              logs are retained for up to 30 days by our infrastructure providers and are then
              purged on a rolling basis.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">5. Your Rights &amp; Choices</h2>
            <p>
              Depending on your location (including rights under the EU GDPR, UK GDPR, and Nigeria
              Data Protection Act 2023), you may have the right to:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>access the personal information we hold about you;</li>
              <li>correct inaccurate information;</li>
              <li>request deletion of your account and associated data;</li>
              <li>withdraw consent for processing at any time;</li>
              <li>object to or restrict certain processing activities.</li>
            </ul>
            <p>
              To exercise any of these rights, email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#f4b942] hover:underline">
                {CONTACT_EMAIL}
              </a>
              . We will respond within 30 days.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">6. Security</h2>
            <p>
              All network traffic is encrypted in transit via HTTPS/TLS. Passwords are never stored
              by {PRODUCT_NAME} directly — authentication is delegated to Firebase, which hashes
              credentials according to industry standards. Administrative actions require
              server-side verification of a Firebase ID token.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">7. Children&apos;s Privacy</h2>
            <p>
              {PRODUCT_NAME} is not directed to children under 13. We do not knowingly collect
              personal information from children under 13. If you believe a child has provided us
              with personal information, contact us and we will delete it.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">8. International Transfers</h2>
            <p>
              {PRODUCT_NAME} users may be located worldwide. Our processors (Google, Cloudflare,
              Expo) may store data in the United States, the European Union, or other regions, with
              standard contractual clauses in place where required.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">9. Changes to This Policy</h2>
            <p>
              We may update this policy to reflect changes in our practices or for legal reasons.
              The effective date above will be updated when we do. Material changes will be
              announced on the home page and in-app where applicable.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">10. Contact</h2>
            <p>
              Questions or requests can be sent to{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#f4b942] hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
