// src/pages/PrivacyPolicy.jsx
import React, { useEffect, useState } from 'react';
import { 
    Shield, Lock, Users, FileText, Mail, Phone, Eye, EyeOff, 
    Cookie, Database, AlertCircle, CheckCircle, Scale, Baby, 
    ChevronRight, Globe 
} from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';

const PrivacyPolicy = () => {
    const [activeSection, setActiveSection] = useState('overview');

    useEffect(() => {
        window.scrollTo(0, 0);

        const handleScroll = () => {
            const sectionElements = sections.map(sec => document.getElementById(sec.id));
            let current = '';
            
            sectionElements.forEach(section => {
                if (section) {
                    const sectionTop = section.offsetTop;
                    if (window.scrollY >= sectionTop - 200) {
                        current = section.id;
                    }
                }
            });
            
            if (current) setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const sections = [
        { id: 'overview', label: '1. Overview' },
        { id: 'collection', label: '2. Information We Collect' },
        { id: 'usage', label: '3. Data Usage' },
        { id: 'sharing', label: '4. Information Sharing' },
        { id: 'security', label: '5. Data Security' },
        { id: 'rights', label: '6. Your Rights' },
        { id: 'cookies', label: '7. Cookies & Tracking' },
        { id: 'retention', label: '8. Data Retention' },
        { id: 'children', label: '9. Children\'s Privacy' },
        { id: 'third-party', label: '10. Third-Party Links' },
        { id: 'international', label: '11. Data Transfers' },
        { id: 'updates', label: '12. Policy Updates' },
        { id: 'contact', label: '13. Contact Us' },
    ];

    // Background texture
    const bgImage = "url('/images/terms-bg.png')";

    return (
        <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34]">
            
            {/* --- HERO SECTION --- */}
            <div className="relative w-full pt-20 md:pt-28 pb-16 px-6 border-b border-[#E3E8E5] overflow-hidden bg-[#F4F7F5]">
                {/* Texture Overlay */}
                <div 
                    className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply" 
                    style={{
                        backgroundImage: bgImage,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                        filter: 'sepia(1) hue-rotate(70deg) saturate(0.5)' 
                    }}
                />
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#F4F7F5]/60 to-[#F4F7F5] pointer-events-none"></div>

                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 mb-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm ring-1 ring-[#DCE4E0]">
                        <Shield className="w-8 h-8 md:w-10 md:h-10 text-[#1A3C34]" />
                    </div>
                    
                    <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#1A3C34] mb-6 tracking-tight leading-tight drop-shadow-sm">
                        Privacy Policy
                    </h1>
                    
                    <p className="text-lg md:text-xl text-[#5C756D] font-light max-w-2xl mx-auto leading-relaxed">
                        Your trust is our priority. Learn how Kiddos Intellect protects and manages your personal information.
                    </p>

                    <div className="mt-8 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur-md text-[#2F523F] text-xs font-bold uppercase tracking-widest border border-[#DCE4E0] shadow-sm">
                        Last Updated: December 03, 2025
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 2xl:gap-16">

                    {/* --- LEFT SIDEBAR (Desktop) --- */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#DCE4E0]">
                            <h3 className="text-xs font-bold text-[#8BA699] uppercase tracking-wider mb-4 px-3">
                                Table of Contents
                            </h3>
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById(section.id).scrollIntoView({ behavior: 'smooth' });
                                            setActiveSection(section.id);
                                        }}
                                        className={`group flex items-center justify-between px-3 py-2.5 rounded-r-lg border-l-4 transition-all duration-200 ${
                                            activeSection === section.id
                                                ? 'bg-white border-[#1A3C34] text-[#1A3C34] font-semibold shadow-sm'
                                                : 'border-transparent text-[#5C756D] hover:bg-[#EAF0ED] hover:text-[#2C3E38]'
                                        }`}
                                    >
                                        <span className="text-sm truncate">{section.label}</span>
                                        {activeSection === section.id && <ChevronRight className="w-4 h-4 text-[#4A7C59]" />}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* --- MOBILE/TABLET NAV --- */}
                    <div className="lg:hidden col-span-1 sticky top-0 z-50 bg-[#F4F7F5]/95 backdrop-blur-md border-b border-[#E3E8E5] -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 overflow-x-auto scrollbar-hide">
                        <div className="flex gap-3">
                            {sections.map((section) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById(section.id).scrollIntoView({ behavior: 'smooth' });
                                        setActiveSection(section.id);
                                    }}
                                    className={`whitespace-nowrap text-sm px-4 py-2 rounded-full transition-all border ${
                                        activeSection === section.id
                                            ? 'bg-[#1A3C34] text-white border-[#1A3C34] shadow-md'
                                            : 'bg-white text-[#5C756D] border-[#DCE4E0]'
                                    }`}
                                >
                                    {section.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* --- RIGHT CONTENT BODY --- */}
                    <div className="lg:col-span-9 space-y-12 lg:space-y-16 pb-24">

                        {/* 1. Overview */}
                        <section id="overview" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">1. Overview</h2>
                                <div className="prose prose-slate max-w-none text-[#4A5D56] leading-relaxed">
                                    <p className="mb-4">
                                        <strong>Kiddos Intellect</strong> ("we," "us," or "our") is committed to protecting the privacy and security of your personal information. This Privacy Policy describes how we collect, use, store, share, and protect your personal data.
                                    </p>
                                    <div className="bg-[#E8F0EB] border-l-4 border-[#4A7C59] p-5 rounded-r-lg">
                                        <h4 className="font-bold text-[#1A3C34] text-sm mb-2 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-[#4A7C59]" /> Our Commitment
                                        </h4>
                                        <ul className="text-sm text-[#4A5D56] space-y-1 list-disc pl-5">
                                            <li>We collect only essential information.</li>
                                            <li>Your data is secured with industry-standard encryption.</li>
                                            <li>We never sell your personal information.</li>
                                            <li>You have full control over your data.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Information Collection */}
                        <section id="collection" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">2. Information We Collect</h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-[#FAFBF9] p-5 rounded-xl border border-[#EBEFEA]">
                                            <h4 className="font-bold text-[#1A3C34] mb-2 flex items-center gap-2">
                                                <Users className="w-4 h-4 text-[#4A7C59]" /> Account Info
                                            </h4>
                                            <ul className="text-sm space-y-1">
                                                <li>Full name, Email address</li>
                                                <li>Phone number, Password</li>
                                            </ul>
                                        </div>
                                        <div className="bg-[#FAFBF9] p-5 rounded-xl border border-[#EBEFEA]">
                                            <h4 className="font-bold text-[#1A3C34] mb-2 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-[#4A7C59]" /> Order Details
                                            </h4>
                                            <ul className="text-sm space-y-1">
                                                <li>Billing/Shipping address</li>
                                                <li>Order history, Preferences</li>
                                            </ul>
                                        </div>
                                        <div className="bg-[#FAFBF9] p-5 rounded-xl border border-[#EBEFEA]">
                                            <h4 className="font-bold text-[#1A3C34] mb-2 flex items-center gap-2">
                                                <Lock className="w-4 h-4 text-[#4A7C59]" /> Payment Data
                                            </h4>
                                            <ul className="text-sm space-y-1">
                                                <li>Transaction history</li>
                                                <li>Payment method (we do NOT store card details)</li>
                                            </ul>
                                        </div>
                                        <div className="bg-[#FAFBF9] p-5 rounded-xl border border-[#EBEFEA]">
                                            <h4 className="font-bold text-[#1A3C34] mb-2 flex items-center gap-2">
                                                <Database className="w-4 h-4 text-[#4A7C59]" /> Usage Data
                                            </h4>
                                            <ul className="text-sm space-y-1">
                                                <li>IP address, Device type</li>
                                                <li>Browsing behavior, Cookies</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Usage */}
                        <section id="usage" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">3. How We Use Your Data</h2>
                                <div className="space-y-4 text-[#4A5D56]">
                                    <div className="p-4 border border-[#EBEFEA] rounded-lg">
                                        <h4 className="font-bold text-[#1A3C34]">Order Processing</h4>
                                        <p className="text-sm">Fulfilling orders, shipping, and payments.</p>
                                    </div>
                                    <div className="p-4 border border-[#EBEFEA] rounded-lg">
                                        <h4 className="font-bold text-[#1A3C34]">Support</h4>
                                        <p className="text-sm">Responding to inquiries and resolving issues.</p>
                                    </div>
                                    <div className="p-4 border border-[#EBEFEA] rounded-lg">
                                        <h4 className="font-bold text-[#1A3C34]">Marketing (Optional)</h4>
                                        <p className="text-sm">Sending promotions and updates (you can opt-out anytime).</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. Sharing */}
                        <section id="sharing" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">4. Information Sharing</h2>
                                <p className="text-[#4A5D56] mb-4">
                                    We share data only with trusted partners necessary for service delivery:
                                </p>
                                <ul className="space-y-2 text-sm text-[#4A5D56] list-disc pl-5">
                                    <li><strong>Payment Gateways:</strong> Razorpay, PayU (for processing transactions).</li>
                                    <li><strong>Logistics:</strong> BlueDart (for delivery).</li>
                                    <li><strong>Cloud Services:</strong> AWS/Google Cloud (for secure hosting).</li>
                                    <li><strong>Legal:</strong> When required by law or to prevent fraud.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 5. Security */}
                        <section id="security" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Lock className="w-6 h-6 text-[#4A7C59]" />
                                    5. Data Security
                                </h2>
                                <div className="space-y-6 text-[#4A5D56]">
                                    <p>We use SSL encryption, secure servers, and access controls to protect your data.</p>
                                    <div className="bg-[#FFF9F0] border border-[#F5E6D3] p-4 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-[#8A6A4B] mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-[#5C4D40]">
                                            <strong>Note:</strong> While we implement top-tier security, no online transmission is 100% secure. Please keep your password confidential.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 6. Your Rights */}
                        <section id="rights" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">6. Your Rights</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[
                                        { title: "Access", desc: "Request a copy of your data." },
                                        { title: "Correction", desc: "Update inaccurate information." },
                                        { title: "Deletion", desc: "Request removal of your data." },
                                        { title: "Withdraw Consent", desc: "Opt-out of marketing." }
                                    ].map((right, i) => (
                                        <div key={i} className="p-4 bg-[#FAFBF9] rounded-xl border border-[#E3E8E5]">
                                            <h4 className="font-bold text-[#1A3C34] mb-1">{right.title}</h4>
                                            <p className="text-sm text-[#5C756D]">{right.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 7. Cookies */}
                        <section id="cookies" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Cookie className="w-6 h-6 text-[#4A7C59]" />
                                    7. Cookies
                                </h2>
                                <p className="text-[#4A5D56] leading-relaxed">
                                    We use cookies to improve your experience, remember cart items, and analyze traffic. You can control cookies via your browser settings.
                                </p>
                            </div>
                        </section>

                        {/* 8. Retention */}
                        <section id="retention" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">8. Data Retention</h2>
                                <p className="text-[#4A5D56] mb-4">We retain data as long as necessary for service or legal compliance.</p>
                                <ul className="text-sm text-[#5C756D] list-disc pl-5 space-y-1">
                                    <li><strong>Accounts:</strong> Until deleted or 3 years inactive.</li>
                                    <li><strong>Transactions:</strong> 7 years (for tax laws).</li>
                                </ul>
                            </div>
                        </section>

                        {/* 9. Children */}
                        <section id="children" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Baby className="w-6 h-6 text-[#4A7C59]" />
                                    9. Children's Privacy
                                </h2>
                                <p className="text-[#4A5D56]">
                                    Our services are for adults. We do not knowingly collect data from children under 18 without parental consent. Parents can contact us to delete child data.
                                </p>
                            </div>
                        </section>

                        {/* 10. Third Party */}
                        <section id="third-party" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">10. Third-Party Links</h2>
                                <p className="text-[#4A5D56]">
                                    We may link to external sites. We are not responsible for their privacy practices. Please review their policies.
                                </p>
                            </div>
                        </section>

                        {/* 11. International */}
                        <section id="international" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Globe className="w-6 h-6 text-[#4A7C59]" />
                                    11. Data Transfers
                                </h2>
                                <p className="text-[#4A5D56]">
                                    Data is primarily stored in India. Some service providers may process data globally, ensuring compliance with Indian data laws.
                                </p>
                            </div>
                        </section>

                        {/* 12. Updates */}
                        <section id="updates" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">12. Policy Updates</h2>
                                <p className="text-[#4A5D56]">
                                    We may update this policy. Changes will be posted here with the "Last Updated" date.
                                </p>
                            </div>
                        </section>

                        {/* 13. Contact */}
                        <section id="contact" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Mail className="w-6 h-6 text-[#4A7C59]" />
                                    13. Contact Us
                                </h2>
                                <p className="text-[#4A5D56] mb-6">
                                    Questions about your privacy?
                                </p>
                                <div className="bg-[#1A3C34] text-white p-8 rounded-xl text-center">
                                    <div className="flex flex-col sm:flex-row justify-center gap-8 text-sm font-medium">
                                        <span className="flex items-center gap-2 justify-center"><Mail className="w-4 h-4"/> kiddosintellect@gmail.com</span>
                                        <span className="flex items-center gap-2 justify-center"><Phone className="w-4 h-4"/> +91 98798 57529</span>
                                    </div>
                                    <p className="text-[#8BA699] text-xs mt-4">
                                        Mon-Sat, 10:00 AM - 6:00 PM IST
                                    </p>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>

            <ScrollToTopButton />
        </div>
    );
};

export default PrivacyPolicy;