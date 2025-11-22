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
            <div className="hero py-8 xs:py-10 sm:py-12 md:py-14 lg:py-16 xl:py-18 2xl:py-20 mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12">
                <div className="max-w-container mx-auto px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12">
                    <div className="flex items-center justify-center mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">
                        <Scale className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14 text-brand" />
                    </div>
                    <h1 className="text-3xl xs:text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-6xl font-bold text-center text-fg mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">
                        Terms and Conditions
                    </h1>
                    <p className="text-center text-fg-muted text-base xs:text-base sm:text-lg md:text-lg lg:text-xl xl:text-xl 2xl:text-2xl max-w-xl xs:max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
                        Please read these terms and conditions carefully before using Kiddos Intallcat services.
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
                    <section className="card bg-brand/5 border-brand/20">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-brand/10 flex items-center justify-center">
                                <FileText className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-brand" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Agreement to Terms</h2>
                                <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    The following terms and conditions outline the use of <span className="font-semibold text-fg">Kiddos Intallcat</span>
                                    (" the website"), owned and operated by Kiddos Intallcat. By accessing or using the website, you agree to
                                    comply with these terms and conditions.
                                </p>
                                <div className="bg-surface rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-border">
                                    <p className="text-fg text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base font-semibold">
                                        ⚠️ By using the website, you agree to comply with these terms and conditions. If you do not agree,
                                        please discontinue use of our services immediately.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Intellectual Property */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Shield className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-accent" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Intellectual Property</h2>
                                <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    All contents on the website, including but not limited to, text, graphics, images, videos, logos,
                                    trademarks, and software, are the property of <span className="font-semibold text-fg">Kiddos Intallcat</span> or their respective owners.
                                </p>
                                <div className="bg-danger-soft rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-danger/20">
                                    <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                                        <Lock className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-danger flex-shrink-0 mt-0.5" />
                                        <p className="text-danger text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base font-semibold">
                                            Users are prohibited from copying or distributing any content without prior written consent from Kiddos Intallcat.
                                        </p>
                                    </div>
                                </div>
                                <p className="text-fg-muted leading-relaxed mt-2 xs:mt-2.5 sm:mt-3 md:mt-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    By using the website, the user acknowledges that any content they submit, including but not limited to,
                                    comments, images, reviews, or feedback, becomes the property of Kiddos Intallcat.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* User Conduct */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-success/10 flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-success" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">User Conduct</h2>
                                <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    Users agree to use the website for lawful purposes only. Any use of the website that violates local,
                                    state, national, or international law is strictly prohibited.
                                </p>
                                <div className="space-y-2 xs:space-y-2.5 sm:space-y-3 md:space-y-4">
                                    <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                                        <span className="text-brand font-bold text-sm xs:text-sm sm:text-base md:text-lg">•</span>
                                        <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base">
                                            Harassing, threatening, or defaming others through the use of the website
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                                        <span className="text-brand font-bold text-sm xs:text-sm sm:text-base md:text-lg">•</span>
                                        <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base">
                                            Uploading or transmitting viruses or any other type of malicious code
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                                        <span className="text-brand font-bold text-sm xs:text-sm sm:text-base md:text-lg">•</span>
                                        <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base">
                                            Attempting to gain unauthorized access to any portion of the website
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                                        <span className="text-brand font-bold text-sm xs:text-sm sm:text-base md:text-lg">•</span>
                                        <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base">
                                            Interfering with or disrupting the website's functionality
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Third-Party Links */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Globe className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-accent" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Third-Party Links</h2>
                                <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    The website may contain links to other websites or resources. <span className="font-semibold text-fg">Kiddos Intallcat</span> is
                                    not responsible for the content or availability of these websites or resources.
                                </p>
                                <div className="bg-surface-subtle rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-border">
                                    <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base">
                                        The user acknowledges that any access to these third-party websites is at their own risk. We recommend
                                        reviewing the terms and conditions and privacy policies of any third-party websites you visit.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Disclaimer */}
                    <section className="card bg-danger-soft/30 border-danger/20">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-danger/10 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-danger" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Disclaimer</h2>
                                <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    <span className="font-semibold text-fg">Kiddos Intallcat</span> makes no representations or warranties of any
                                    kind, express or implied, regarding the accuracy or completeness of the information contained on the website.
                                </p>
                                <div className="bg-surface rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-danger/30">
                                    <p className="text-danger text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base font-semibold mb-1 xs:mb-1.5 sm:mb-2">
                                        Important:
                                    </p>
                                    <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base">
                                        The information provided on the website is for general information purposes only and should not be relied
                                        upon without further verification. Product descriptions, availability, and pricing are subject to change
                                        without notice.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-brand/10 flex items-center justify-center">
                                <Shield className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-brand" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Limitation of Liability</h2>
                                <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    <span className="font-semibold text-fg">Kiddos Intallcat</span> will not be liable for any direct, indirect,
                                    incidental, consequential, or punitive damages arising out of the use or inability to use the website or its
                                    contents, even if Kiddos Intallcat has been advised of the possibility of such damages.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Indemnification */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-success/10 flex items-center justify-center">
                                <Scale className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-success" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Indemnification</h2>
                                <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    The user agrees to indemnify and hold harmless <span className="font-semibold text-fg">Kiddos Intallcat</span> and
                                    its affiliates, officers, directors, agents, and employees from any claim or demand, including reasonable
                                    attorneys' fees, made by any third-party due to or arising out of:
                                </p>
                                <div className="space-y-2 xs:space-y-2.5 sm:space-y-3 md:space-y-4">
                                    <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                                        <CheckCircle className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-success flex-shrink-0 mt-0.5" />
                                        <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base">
                                            Your use or misuse of the website
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                                        <CheckCircle className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-success flex-shrink-0 mt-0.5" />
                                        <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base">
                                            Your breach of these terms and conditions
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                                        <CheckCircle className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-success flex-shrink-0 mt-0.5" />
                                        <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base">
                                            Your violation of any law or rights of a third party
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Privacy Policy */}
                    <section className="card bg-brand/5 border-brand/20">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-brand/10 flex items-center justify-center">
                                <Lock className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-brand" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Privacy Policy</h2>
                                <p className="text-fg-muted leading-relaxed mb-3 xs:mb-3.5 sm:mb-4 md:mb-5 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    <span className="font-semibold text-fg">Kiddos Intallcat</span> respects the privacy of its users. The
                                    website's privacy policy outlines the collection, use, and protection of users' personal information.
                                </p>
                                <Link
                                    to="/privacy"
                                    className="btn-primary text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base"
                                >
                                    View Our Privacy Policy →
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Changes to Terms */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Edit className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-accent" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Changes to Terms</h2>
                                <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    <span className="font-semibold text-fg">Kiddos Intallcat</span> reserves the right to modify these terms and
                                    conditions at any time without notice. By using the website, the user agrees to comply with the latest version
                                    of the terms and conditions.
                                </p>
                                <div className="bg-surface-subtle rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-border">
                                    <p className="text-fg text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base font-semibold mb-1 xs:mb-1.5 sm:mb-2">
                                        Stay Informed:
                                    </p>
                                    <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base">
                                        We encourage you to review these terms periodically for any changes. Continued use of the website following
                                        the posting of changes constitutes your acceptance of such changes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Governing Law */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-brand/10 flex items-center justify-center">
                                <MapPin className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-brand" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Governing Law</h2>
                                <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    These terms and conditions shall be governed by and construed in accordance with the laws of [Your Country/State].
                                    The user agrees to submit to the exclusive jurisdiction of the courts in [Your City/Region] for any dispute or
                                    claim arising out of or relating to the use of the website or these terms and conditions.
                                </p>
                                <div className="bg-surface-subtle rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-border">
                                    <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base">
                                        In the event of any disputes arising from these terms, both parties agree to first attempt to resolve the
                                        matter through good faith negotiation before pursuing legal action. All legal proceedings must be conducted
                                        in the jurisdiction specified above.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Severability */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-success/10 flex items-center justify-center">
                                <Scale className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-success" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Severability</h2>
                                <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    If any provision of these terms and conditions is found to be invalid or unenforceable, the remaining provisions
                                    will continue to be valid and enforceable to the fullest extent permitted by law.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Waiver */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                                <FileText className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-accent" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Waiver</h2>
                                <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    The failure of <span className="font-semibold text-fg">Kiddos Intallcat</span> to enforce any right or provision
                                    of these terms and conditions will not constitute a waiver of such right or provision unless acknowledged and
                                    agreed to in writing by the company.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Entire Agreement */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-brand/10 flex items-center justify-center">
                                <FileText className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-brand" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Entire Agreement</h2>
                                <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    These terms and conditions, along with the privacy policy and any other legal notices published by
                                    <span className="font-semibold text-fg"> Kiddos Intallcat</span> on the website, constitute the entire agreement
                                    between you and the company concerning your use of the website.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Assignment */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-success/10 flex items-center justify-center">
                                <Edit className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-success" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Assignment</h2>
                                <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    <span className="font-semibold text-fg">Kiddos Intallcat</span> may assign or delegate these terms and conditions
                                    and/or the company's privacy policy, in whole or in part, to any person or entity at any time with or without
                                    your consent. You may not assign or delegate any rights or obligations under the terms and conditions or privacy
                                    policy without our prior written consent.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Contact Information */}
                    <section className="card bg-brand text-brand-foreground">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">
                                <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-brand-foreground/10 flex items-center justify-center">
                                    <FileText className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-brand-foreground" />
                                </div>
                            </div>
                            <h2 className="text-2xl xs:text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-4xl font-bold mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Questions About Our Terms?</h2>
                            <p className="text-brand-foreground/80 mb-4 xs:mb-5 sm:mb-6 md:mb-7 max-w-2xl mx-auto text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                If you have any questions or concerns about these Terms and Conditions, please contact our support team.
                                We're here to help clarify any aspects of our agreement.
                            </p>
                            <Link
                                to="/contact"
                                className="btn-primary bg-brand-foreground text-brand hover:bg-brand-foreground/90 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base"
                            >
                                Contact Legal Team →
                            </Link>
                        </div>
                    </section>

                    {/* Acceptance */}
                    <section className="card bg-success-soft border-success/20">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-success/10 flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-success" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Acceptance of Terms</h2>
                                <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    By using <span className="font-semibold text-fg">Kiddos Intallcat</span>, you acknowledge that you have read,
                                    understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do
                                    not use our website or services.
                                </p>
                            </div>
                        </div>
                    </section>

                </div>
            </div>

            <ScrollToTopButton />
        </div>
    );
};

export default TermsAndConditions;
