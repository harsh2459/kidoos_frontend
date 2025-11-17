import React, { useEffect } from 'react';
import { FileText, Shield, Globe, AlertTriangle, Scale, Lock, Edit, MapPin, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollToTopButton from '../components/ScrollToTopButton';

const TermsAndConditions = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-surface-subtle">
            {/* Hero Section */}
            <div className="hero py-16 mb-12">
                <div className="max-w-container mx-auto px-6">
                    <div className="flex items-center justify-center mb-4">
                        <Scale className="w-12 h-12 text-brand" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-center text-fg mb-4">
                        Terms and Conditions
                    </h1>
                    <p className="text-center text-fg-muted text-lg max-w-2xl mx-auto">
                        Please read these terms and conditions carefully before using Kiddos Intallcat services.
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
                    <section className="card bg-brand/5 border-brand/20">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-brand" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-fg mb-3">Agreement to Terms</h2>
                                <p className="text-fg-muted leading-relaxed mb-3">
                                    The following terms and conditions outline the use of <span className="font-semibold text-fg">Kiddos Intallcat</span>
                                    ("the website"), owned and operated by Kiddos Intallcat. By accessing or using the website, you agree to
                                    comply with these terms and conditions.
                                </p>
                                <div className="bg-surface rounded-lg p-4 border border-border">
                                    <p className="text-fg text-sm font-semibold">
                                        By using the website, you agree to comply with these terms and conditions. If you do not agree,
                                        please discontinue use of our services immediately.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 1. Intellectual Property */}
                    <section className="card">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-success" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-fg mb-3">1. Intellectual Property</h2>
                                <p className="text-fg-muted leading-relaxed mb-4">
                                    All contents on the website, including but not limited to, text, graphics, images, videos, logos,
                                    trademarks, and software, are the property of Kiddos Intallcat or their respective owners.
                                </p>
                                <div className="bg-danger-soft rounded-lg p-4 border border-danger/20">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                                        <p className="text-danger text-sm font-semibold">
                                            Users are prohibited from copying or distributing any content without prior written consent
                                            from Kiddos Intallcat.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. User Content */}
                    <section className="card">
                        <h2 className="text-2xl font-bold text-fg mb-4">2. User Content</h2>
                        <p className="text-fg-muted leading-relaxed mb-4">
                            By using the website, the user acknowledges that any content they submit, including but not limited to,
                            comments, images, reviews, or feedback, becomes the property of Kiddos Intallcat.
                        </p>
                        <div className="bg-surface-subtle rounded-lg p-4 border border-border-subtle">
                            <h3 className="text-fg font-semibold mb-3 text-sm">User Content Rights:</h3>
                            <ul className="space-y-2 text-fg-muted text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-brand mt-1">•</span>
                                    <span>The user grants Kiddos Intallcat the irrevocable right to use, modify, or publish the content</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand mt-1">•</span>
                                    <span>Content may be used for commercial or non-commercial purposes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand mt-1">•</span>
                                    <span>Users must ensure they have the right to submit any content shared on the platform</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand mt-1">•</span>
                                    <span>Kiddos Intallcat reserves the right to remove any content that violates these terms</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* 3. Third-Party Websites */}
                    <section className="card">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Globe className="w-5 h-5 text-accent" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-fg mb-3">3. Third-Party Websites</h2>
                                <p className="text-fg-muted leading-relaxed mb-4">
                                    The website may contain links to other websites or resources. Kiddos Intallcat is not responsible
                                    for the content or availability of these websites or resources.
                                </p>
                                <div className="bg-surface-subtle rounded-lg p-4 border border-border-subtle">
                                    <p className="text-fg-muted text-sm">
                                        The user acknowledges that any access to these third-party websites is at their own risk. We
                                        recommend reviewing the terms and conditions and privacy policies of any third-party websites
                                        you visit.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. Disclaimer */}
                    <section className="card bg-surface-subtle">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-danger" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-fg mb-3">4. Disclaimer</h2>
                                <p className="text-fg-muted leading-relaxed mb-4">
                                    Kiddos Intallcat makes no representations or warranties of any kind, express or implied, regarding
                                    the accuracy or completeness of the information contained on the website.
                                </p>
                                <div className="bg-danger-soft rounded-lg p-4 border border-danger/20">
                                    <p className="text-danger text-sm">
                                        <span className="font-semibold">Important:</span> The information provided on the website is for
                                        general information purposes only and should not be relied upon without further verification.
                                        Product descriptions, availability, and pricing are subject to change without notice.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 5. Limitation of Liability */}
                    <section className="card">
                        <h2 className="text-2xl font-bold text-fg mb-4">5. Limitation of Liability</h2>
                        <p className="text-fg-muted leading-relaxed mb-4">
                            Kiddos Intallcat will not be liable for any direct, indirect, incidental, consequential, or punitive
                            damages arising out of the use or inability to use the website or its contents, even if Kiddos Intallcat
                            has been advised of the possibility of such damages.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-surface-subtle rounded-lg p-4 border border-border-subtle">
                                <h3 className="text-fg font-semibold mb-2 text-sm">We Are Not Liable For:</h3>
                                <ul className="space-y-1 text-fg-muted text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand mt-1">•</span>
                                        <span>Product performance or suitability</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand mt-1">•</span>
                                        <span>Website downtime or technical issues</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand mt-1">•</span>
                                        <span>Loss of data or business interruption</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-surface-subtle rounded-lg p-4 border border-border-subtle">
                                <h3 className="text-fg font-semibold mb-2 text-sm">User Responsibility:</h3>
                                <ul className="space-y-1 text-fg-muted text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand mt-1">•</span>
                                        <span>Verify product information independently</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand mt-1">•</span>
                                        <span>Use the website at your own risk</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand mt-1">•</span>
                                        <span>Maintain secure account credentials</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 6. Indemnification */}
                    <section className="card">
                        <h2 className="text-2xl font-bold text-fg mb-3">6. Indemnification</h2>
                        <p className="text-fg-muted leading-relaxed">
                            The user agrees to indemnify and hold harmless Kiddos Intallcat and its affiliates, officers, directors,
                            agents, and employees from any claim or demand, including reasonable attorneys' fees, made by any
                            third-party due to or arising out of:
                        </p>
                        <ul className="mt-4 space-y-2 text-fg-muted">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                                <span>The user's use of the website</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                                <span>Violation of these terms and conditions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                                <span>Violation of any rights of another person or entity</span>
                            </li>
                        </ul>
                    </section>

                    {/* 7. Privacy */}
                    <section className="card">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-brand" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-fg mb-3">7. Privacy</h2>
                                <p className="text-fg-muted leading-relaxed mb-4">
                                    Kiddos Intallcat respects the privacy of its users. The website's privacy policy outlines the
                                    collection, use, and protection of users' personal information.
                                </p>
                                <Link
                                    to="/privacy"
                                    className="inline-flex items-center gap-2 text-brand hover:text-brand/80 font-semibold"
                                >
                                    View Our Privacy Policy
                                    <span>→</span>
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* 8. Modification of Terms and Conditions */}
                    <section className="card">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Edit className="w-5 h-5 text-accent" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-fg mb-3">8. Modification of Terms and Conditions</h2>
                                <p className="text-fg-muted leading-relaxed mb-4">
                                    Kiddos Intallcat reserves the right to modify these terms and conditions at any time without notice.
                                    By using the website, the user agrees to comply with the latest version of the terms and conditions.
                                </p>
                                <div className="bg-brand/5 rounded-lg p-4 border border-brand/20">
                                    <p className="text-fg text-sm">
                                        <span className="font-semibold">Stay Informed:</span> We encourage you to review these terms
                                        periodically for any changes. Continued use of the website following the posting of changes
                                        constitutes your acceptance of such changes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 9. Governing Law and Jurisdiction */}
                    <section className="card">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-success" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-fg mb-3">9. Governing Law and Jurisdiction</h2>
                                <p className="text-fg-muted leading-relaxed mb-4">
                                    These terms and conditions shall be governed by and construed in accordance with the laws of [Your Country/State].
                                    The user agrees to submit to the exclusive jurisdiction of the courts in [Your City/Region] for any
                                    dispute or claim arising out of or relating to the use of the website or these terms and conditions.
                                </p>
                                <div className="bg-surface-subtle rounded-lg p-4 border border-border-subtle">
                                    <h3 className="text-fg font-semibold mb-2 text-sm">Dispute Resolution:</h3>
                                    <p className="text-fg-muted text-sm leading-relaxed">
                                        In the event of any disputes arising from these terms, both parties agree to first attempt to
                                        resolve the matter through good faith negotiation before pursuing legal action. All legal
                                        proceedings must be conducted in the jurisdiction specified above.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Acceptance Section */}
                    <section className="card bg-brand text-brand-foreground">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-brand-foreground/10 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Acceptance of Terms</h2>
                            <p className="mb-6 opacity-90 max-w-2xl mx-auto">
                                By using Kiddos Intallcat, you acknowledge that you have read, understood, and agree to be bound
                                by these Terms and Conditions. If you do not agree to these terms, please do not use our website
                                or services.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link
                                    to="/privacy"
                                    className="btn-secondary bg-brand-foreground text-brand hover:bg-brand-foreground/90"
                                >
                                    Privacy Policy
                                </Link>
                                <Link
                                    to="/shipping"
                                    className="btn-secondary bg-brand-foreground/10 text-brand-foreground hover:bg-brand-foreground/20 border border-brand-foreground/20"
                                >
                                    Shipping Policy
                                </Link>
                                <Link
                                    to="/aboutus"
                                    className="btn-secondary bg-brand-foreground/10 text-brand-foreground hover:bg-brand-foreground/20 border border-brand-foreground/20"
                                >
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Contact for Questions */}
                    <section className="card">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-fg mb-3">Questions About Our Terms?</h2>
                            <p className="text-fg-muted mb-6 max-w-2xl mx-auto">
                                If you have any questions or concerns about these Terms and Conditions, please contact our support team.
                                We're here to help clarify any aspects of our agreement.
                            </p>
                            <a
                                href="mailto:kiddosintellect@gmail.com"
                                className="btn-primary"
                            >
                                Contact Legal Team
                            </a>
                        </div>
                    </section>

                </div>
            </div>
            <ScrollToTopButton />
        </div>
    );
};

export default TermsAndConditions;
