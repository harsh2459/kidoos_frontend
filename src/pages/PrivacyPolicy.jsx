import React, { useEffect } from 'react';
import { Shield, Lock, Users, FileText, Mail, Phone } from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';

const PrivacyPolicy = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-surface-subtle">
      {/* Hero Section */}
      <div className="hero py-16 mb-12">
        <div className="max-w-container mx-auto px-6">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-brand" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center text-fg mb-4">
            Privacy Policy
          </h1>
          <p className="text-center text-fg-muted text-lg max-w-2xl mx-auto">
            Your trust is our priority. Learn how Kiddos Intallcat protects and manages your personal information.
          </p>
          <p className="text-center text-fg-subtle text-sm mt-3">
            Last Updated: November 02, 2025
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-container mx-auto px-6 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Introduction */}
          <section className="card">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-fg mb-3">Introduction</h2>
                <p className="text-fg-muted leading-relaxed">
                  Kiddos Intallcat is committed to protecting the privacy and security of your personal information.
                  This privacy policy describes how we collect and use personal information and your choices regarding
                  our use of this information. By visiting our website or using our services, you consent to the
                  practices described in this policy.
                </p>
              </div>
            </div>
          </section>

          {/* Collection of Personal Information */}
          <section className="card">
            <h2 className="text-2xl font-bold text-fg mb-4">Collection of Personal Information</h2>
            <p className="text-fg-muted leading-relaxed mb-4">
              We collect personal information from you when you visit our website, register for an account, place an
              order, subscribe to our newsletter, or fill out a form. The types of personal information we collect may include:
            </p>
            <ul className="space-y-2 text-fg-muted">
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                <span>Your name</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                <span>Email address</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                <span>Mailing address</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                <span>Phone number</span>
              </li>
            </ul>
          </section>

          {/* Use of Personal Information */}
          <section className="card">
            <h2 className="text-2xl font-bold text-fg mb-4">Use of Personal Information</h2>
            <p className="text-fg-muted leading-relaxed mb-4">
              We use the personal information we collect for the following purposes:
            </p>
            <ul className="space-y-2 text-fg-muted">
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                <span>To fulfill orders and provide services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                <span>To communicate with you about your orders, products, and services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                <span>To send you marketing communications and newsletters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                <span>To improve our website and services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                <span>To comply with legal obligations</span>
              </li>
            </ul>
          </section>

          {/* Types of Data Collected */}
          <section className="card">
            <h2 className="text-2xl font-bold text-fg mb-4">Types of Data Collected</h2>
            <h3 className="text-lg font-semibold text-fg mb-3">Personal Data</h3>
            <p className="text-fg-muted leading-relaxed mb-4">
              While using our service, we may ask you to provide us with certain personally identifiable information
              that can be used to contact or identify you. Personally identifiable information may include, but is not limited to:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-surface-subtle rounded-lg p-3">
                <p className="text-fg-muted">• Email address</p>
              </div>
              <div className="bg-surface-subtle rounded-lg p-3">
                <p className="text-fg-muted">• First name and last name</p>
              </div>
              <div className="bg-surface-subtle rounded-lg p-3">
                <p className="text-fg-muted">• Phone number</p>
              </div>
              <div className="bg-surface-subtle rounded-lg p-3">
                <p className="text-fg-muted">• Address, State, Province, ZIP/Postal code, City</p>
              </div>
            </div>
            <p className="text-fg-muted leading-relaxed mt-4">
              <span className="font-semibold text-fg">Usage Data:</span> We may also collect information about how
              you access and use our service to improve functionality and user experience.
            </p>
          </section>

          {/* Sharing of Personal Information */}
          <section className="card">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-fg mb-3">Sharing of Personal Information</h2>
                <p className="text-fg-muted leading-relaxed">
                  We may share your personal information with third-party service providers who help us fulfill orders
                  and provide services, such as payment processors, shipping carriers, and marketing agencies. We may
                  also share your information with law enforcement agencies or other third parties if required by law.
                </p>
              </div>
            </div>
          </section>

          {/* Security of Personal Information */}
          <section className="card">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-fg mb-3">Security of Personal Information</h2>
                <p className="text-fg-muted leading-relaxed mb-4">
                  We take the security of your personal information seriously and take reasonable measures to protect
                  it from unauthorized access, use, or disclosure. We use industry-standard encryption technologies to
                  protect sensitive information, such as credit card numbers.
                </p>
                <div className="bg-surface-subtle border border-border-subtle rounded-lg p-4">
                  <p className="text-fg-muted text-sm">
                    <span className="font-semibold text-fg">Important:</span> The security of your personal data is
                    important to us, but remember that no method of transmission over the Internet, or method of
                    electronic storage is 100% secure. While we strive to use commercially acceptable means to protect
                    your personal data, we cannot guarantee its absolute security.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Third-party Links */}
          <section className="card">
            <h2 className="text-2xl font-bold text-fg mb-4">Third-party Links</h2>
            <p className="text-fg-muted leading-relaxed">
              Our website may contain links to third-party websites or services. We are not responsible for the privacy
              practices or content of these websites or services. We encourage you to review the privacy policies of
              these websites or services before using them.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="card bg-surface-subtle">
            <h2 className="text-2xl font-bold text-fg mb-4">Children's Privacy</h2>
            <p className="text-fg-muted leading-relaxed mb-3">
              Our service does not address anyone under the age of 13. We do not knowingly collect personally
              identifiable information from anyone under the age of 13.
            </p>
            <p className="text-fg-muted leading-relaxed mb-3">
              If you are a parent or guardian and you are aware that your child has provided us with personal data,
              please contact us. If we become aware that we have collected personal data from anyone under the age of
              13 without verification of parental consent, we take steps to remove that information from our servers.
            </p>
            <p className="text-fg-muted leading-relaxed">
              If we need to rely on consent as a legal basis for processing your information and your country requires
              consent from a parent, we may require your parent's consent before we collect and use that information.
            </p>
          </section>

          {/* Changes to this Policy */}
          <section className="card">
            <h2 className="text-2xl font-bold text-fg mb-3">Changes to this Policy</h2>
            <p className="text-fg-muted leading-relaxed">
              We may update this privacy policy from time to time. The revised policy will be posted on our website,
              and we encourage you to review it periodically.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section className="card">
            <h2 className="text-2xl font-bold text-fg mb-4">Dispute Resolution Statement</h2>
            <p className="text-fg-muted leading-relaxed mb-3">
              To the best of our abilities, we do not foresee a cause or reason for dispute in the above mentioned
              privacy policy. Yet, if any dispute does arise, the same can be amicably solved between both the parties
              by means of discussion and arbitration.
            </p>
            <p className="text-fg-muted leading-relaxed mb-3">
              At the maximum extent, the user is entitled to stop using our services if our privacy policy is not
              acceptable to the user. Further for existing users, we will take steps to remove all user related details
              from our records if so specifically requested by the user. But thereafter, the user will not be able to
              access or use our services.
            </p>
            <div className="bg-surface-subtle rounded-lg p-4 border border-border-subtle">
              <h3 className="text-fg font-semibold mb-2">Other Legal Requirements</h3>
              <p className="text-fg-muted text-sm leading-relaxed mb-2">
                The Company may disclose your personal data in the good faith belief that such action is necessary to:
              </p>
              <ul className="space-y-1 text-fg-muted text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-brand mt-1">•</span>
                  <span>Comply with a legal obligation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand mt-1">•</span>
                  <span>Protect and defend the rights or property of the Company</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand mt-1">•</span>
                  <span>Prevent or investigate possible wrongdoing in connection with the Service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand mt-1">•</span>
                  <span>Protect the personal safety of users of the Service or the public</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand mt-1">•</span>
                  <span>Protect against legal liability</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Contact Us */}
          <section className="card bg-brand text-brand-foreground">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-3">Contact Us</h2>
              <p className="mb-6 opacity-90">
                If you have any questions or concerns about this privacy statement, the practices of this site,
                or your dealings with Kiddos Intallcat, please contact our Customer Support for accurate and
                precise clarification.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="mailto:kiddosintellect@gmail.com"
                  className="btn-secondary bg-brand-foreground text-brand hover:bg-brand-foreground/90 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email Us
                </a>
                <a
                  href="tel:+9198798 57529"
                  className="btn-secondary bg-brand-foreground/10 text-brand-foreground hover:bg-brand-foreground/20 flex items-center gap-2 border border-brand-foreground/20"
                >
                  <Phone className="w-4 h-4" />
                  Call Us
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default PrivacyPolicy;
