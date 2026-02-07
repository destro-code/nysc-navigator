import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3 max-w-3xl mx-auto">
          <Link to="/" className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </Link>
          <h1 className="font-bold text-foreground text-lg">Terms of Use</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: February 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-foreground/80 mb-4">
              By accessing or using NYSC Buddy, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-foreground/80 mb-4">
              NYSC Buddy is a companion application designed to help National Youth Service Corps members track their service year activities, including posting, allowance, clearance, and community forums.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">3. User Responsibilities</h2>
            <p className="text-foreground/80 mb-4">As a user, you agree to:</p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 mb-4">
              <li>Provide accurate information about yourself</li>
              <li>Keep your account credentials secure</li>
              <li>Not post harmful, offensive, or misleading content</li>
              <li>Not use the app for any illegal purposes</li>
              <li>Respect other users and their privacy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Content Guidelines</h2>
            <p className="text-foreground/80 mb-4">
              Users are responsible for the content they post. We reserve the right to remove any content that violates these terms or is deemed inappropriate.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Disclaimer</h2>
            <p className="text-foreground/80 mb-4">
              NYSC Buddy is an independent application and is <strong>NOT affiliated with, endorsed by, or connected to the National Youth Service Corps (NYSC) of Nigeria</strong>. All official NYSC information should be verified through official NYSC channels.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
            <p className="text-foreground/80 mb-4">
              We provide this service "as is" without warranties. We are not liable for any damages arising from your use of the application, including but not limited to missed deadlines, incorrect information, or data loss.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Changes to Terms</h2>
            <p className="text-foreground/80 mb-4">
              We may update these terms from time to time. Continued use of the application after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Contact</h2>
            <p className="text-foreground/80">
              For questions about these Terms of Use, contact us at{" "}
              <a href="mailto:support@nyscbuddy.app" className="text-primary hover:underline">
                support@nyscbuddy.app
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
