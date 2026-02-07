import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3 max-w-3xl mx-auto">
          <Link to="/" className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </Link>
          <h1 className="font-bold text-foreground text-lg">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: February 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-foreground/80 mb-4">
              NYSC Buddy ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            <p className="text-foreground/80 mb-4">We collect information you provide directly:</p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 mb-4">
              <li>Account information (email, username)</li>
              <li>Profile information (batch, stream, state, PPA details)</li>
              <li>Content you post on forums</li>
              <li>Allowance and clearance tracking data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
            <p className="text-foreground/80 mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 mb-4">
              <li>Provide and maintain our services</li>
              <li>Personalize your NYSC journey experience</li>
              <li>Send you reminders and notifications</li>
              <li>Improve our application</li>
              <li>Respond to your requests and support needs</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Data Storage</h2>
            <p className="text-foreground/80 mb-4">
              Your data is stored locally on your device and/or on secure cloud servers. We implement appropriate security measures to protect against unauthorized access.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Data Sharing</h2>
            <p className="text-foreground/80 mb-4">
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 mb-4">
              <li>Service providers who assist in operating our app</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Your Rights</h2>
            <p className="text-foreground/80 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Opt-out of non-essential communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Contact Us</h2>
            <p className="text-foreground/80">
              If you have questions about this Privacy Policy, please contact us at{" "}
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
