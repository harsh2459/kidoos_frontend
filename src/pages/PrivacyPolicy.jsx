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
      <div className="hero py-8 xs:py-10 sm:py-12 md:py-14 lg:py-16 xl:py-18 2xl:py-20 mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12">
        <div className="max-w-container mx-auto px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          <div className="flex items-center justify-center mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">
            <Shield className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14 text-brand" />
          </div>
          <h1 className="text-3xl xs:text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-6xl font-bold text-center text-fg mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">
            Privacy Policy
          </h1>
          <p className="text-center text-fg-muted text-base xs:text-base sm:text-lg md:text-lg lg:text-xl xl:text-xl 2xl:text-2xl max-w-xl xs:max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
            Your trust is our priority. Learn how Kiddos Intallcat protects and manages your personal information.
          </p>
          <p className="text-center text-fg-subtle text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base mt-2 xs:mt-2.5 sm:mt-3 md:mt-4">
            Last Updated: November 02, 2025
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-container mx-auto px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 pb-8 xs:pb-10 sm:pb-12 md:pb-14 lg:pb-16 xl:pb-20">
        <div className="max-w-3xl xs:max-w-3xl sm:max-w-4xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto space-y-6 xs:space-y-7 sm:space-y-8 md:space-y-10">

          {/* Introduction */}
          <section className="card">
            <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
              <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-brand/10 flex items-center justify-center">
                <FileText className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-brand" />
              </div>
              <div>
                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Introduction</h2>
                <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
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
            <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">Collection of Personal Information</h2>
            <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
              We collect personal information from you when you visit our website, register for an account, place an
              order, subscribe to our newsletter, or fill out a form. The types of personal information we collect may include:
            </p>
            <ul className="space-y-1.5 xs:space-y-2 sm:space-y-2 md:space-y-2.5 text-fg-muted text-sm xs:text-sm sm:text-base md:text-base lg:text-lg">
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
            <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">Use of Personal Information</h2>
            <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
              We use the personal information we collect for the following purposes:
            </p>
            <ul className="space-y-1.5 xs:space-y-2 sm:space-y-2 md:space-y-2.5 text-fg-muted text-sm xs:text-sm sm:text-base md:text-base lg:text-lg">
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
            <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">Types of Data Collected</h2>
            <h3 className="text-base xs:text-base sm:text-lg md:text-lg lg:text-xl font-semibold text-fg mb-2 xs:mb-2.5 sm:mb-3">Personal Data</h3>
            <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
              While using our service, we may ask you to provide us with certain personally identifiable information
              that can be used to contact or identify you. Personally identifiable information may include, but is not limited to:
            </p>
            <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-2 xs:gap-2.5 sm:gap-3 md:gap-4">
              <div className="bg-surface-subtle rounded-lg p-2 xs:p-2.5 sm:p-3 md:p-4">
                <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">• Email address</p>
              </div>
              <div className="bg-surface-subtle rounded-lg p-2 xs:p-2.5 sm:p-3 md:p-4">
                <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">• First name and last name</p>
              </div>
              <div className="bg-surface-subtle rounded-lg p-2 xs:p-2.5 sm:p-3 md:p-4">
                <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">• Phone number</p>
              </div>
              <div className="bg-surface-subtle rounded-lg p-2 xs:p-2.5 sm:p-3 md:p-4">
                <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-bases">• Address, State, Province, ZIP/Postal code, City</p>
              </div>
            </div>
            <p className="text-fg-muted leading-relaxed mt-3 xs:mt-3.5 sm:mt-4 md:mt-5 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg">
              <span className="font-semibold text-fg">Usage Data:</span> We may also collect information about how
              you access and use our service to improve functionality and user experience.
            </p>
          </section>

          {/* Sharing of Personal Information */}
          <section className="card">
            <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
              <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-brand/10 flex items-center justify-center">
                <Users className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-brand" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Sharing of Personal Information</h2>
                <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                  We may share your personal information with third-party service providers who help us fulfill orders
                  and provide services, such as payment processors, shipping carriers, and marketing agencies. We may
                  also share your information with law enforcement agencies or other third parties if required by law.
                </p>
              </div>
            </div>
          </section>

          {/* Security of Personal Information */}
          <section className="card">
            <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
              <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Lock className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-success" />
              </div>  
              <div className="flex-1">
                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Security of Personal Information</h2>
                <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                  We take the security of your personal information seriously and take reasonable measures to protect
                  it from unauthorized access, use, or disclosure. We use industry-standard encryption technologies to
                  protect sensitive information, such as credit card numbers.
                </p>
                <div className="bg-surface-subtle border border-border-subtle rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5">
                  <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">
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
            <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">Third-party Links</h2>
            <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
              Our website may contain links to third-party websites or services. We are not responsible for the privacy
              practices or content of these websites or services. We encourage you to review the privacy policies of
              these websites or services before using them.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="card bg-surface-subtle">
            <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">Children's Privacy</h2>
            <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg">
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
            <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Changes to this Policy</h2>
            <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
              We may update this privacy policy from time to time. The revised policy will be posted on our website,
              and we encourage you to review it periodically.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section className="card">
            <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">Dispute Resolution Statement</h2>
            <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg">
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
            <div className="bg-surface-subtle rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-border-subtle">
              <h3 className="text-fg font-semibold mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">Other Legal Requirements</h3>
              <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base leading-relaxed mb-1 xs:mb-1.5 sm:mb-2">
                The Company may disclose your personal data in the good faith belief that such action is necessary to:
              </p>
              <ul className="space-y-0.5 xs:space-y-1 sm:space-y-1 text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">
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
              <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold mb-2 xs:mb-2.5 sm:mb-3">Contact Us</h2>
              <p className="mb-4 xs:mb-5 sm:mb-6 opacity-90 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg">
                If you have any questions or concerns about this privacy statement, the practices of this site,
                or your dealings with Kiddos Intallcat, please contact our Customer Support for accurate and
                precise clarification.
              </p>
              <div className="flex flex-col xs:flex-col sm:flex-row gap-3 xs:gap-3.5 sm:gap-4 md:gap-5 justify-center items-center">
                <a
                  href="mailto:kiddosintellect@gmail.com"
                  className="btn-secondary bg-brand-foreground text-brand hover:bg-brand-foreground/90 flex items-center gap-2 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base"
                >
                  <Mail className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  Email Us
                </a>
                <a
                  href="tel:+9198798 57529"
                  className="btn-secondary bg-brand-foreground/10 text-brand-foreground hover:bg-brand-foreground/20 flex items-center gap-2 border border-brand-foreground/20 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base"
                >
                  <Phone className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
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
