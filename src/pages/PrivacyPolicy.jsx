// src/pages/PrivacyPolicy.jsx
import React, { useEffect, useState } from 'react';
import {
    Shield, Lock, Users, FileText, Mail, Phone, Eye, EyeOff,
    Cookie, Database, AlertCircle, CheckCircle, Scale, Baby,
    ChevronRight, Globe, Scroll as ScrollIcon
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

    // VRINDAVAN THEME ASSETS
    const parchmentBg = "url('/images/homepage/parchment-bg.png')";
    const heroBg = "url('/images/privacy-scroll-bg.png')"; // Use the new generated image here
    const mandalaBg = "url('/images/homepage/mandala-bg.png')";

    return (
        <div className="bg-[#FAF7F2] min-h-screen font-['Lato'] text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723]">

            {/* --- HERO SECTION --- */}
            <div className="relative w-full pt-28 md:pt-36 pb-20 px-6 border-b border-[#D4AF37]/30 overflow-hidden">

                {/* Background Image Layer */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: heroBg,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 1
                    }}
                />

                {/* Gradient Overlay for Readability */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FAF7F2]/90 via-[#FAF7F2]/80 to-[#FAF7F2] pointer-events-none"></div>

                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-4 mb-6 bg-white/60 backdrop-blur-sm rounded-full shadow-[0_4px_20px_rgba(212,175,55,0.2)] ring-1 ring-[#D4AF37]/40">
                        <Shield className="w-8 h-8 md:w-10 md:h-10 text-[#D4AF37]" />
                    </div>

                    <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl lg:text-7xl font-bold text-[#3E2723] mb-6 tracking-tight leading-tight drop-shadow-sm">
                        Privacy Policy
                    </h1>

                    <p className="text-lg md:text-xl text-[#5C4A2E] font-light max-w-2xl mx-auto leading-relaxed">
                        Your trust is our priority. Learn how Kiddos Intellect protects and manages your personal information.
                    </p>

                    <div className="mt-8 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#FFF9E6] border border-[#D4AF37]/30 text-[#8A7A5E] text-xs font-bold uppercase tracking-widest shadow-sm font-['Cinzel']">
                        <ScrollIcon className="w-3 h-3 text-[#D4AF37]" />
                        Last Updated: December 03, 2025
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="relative max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">

                {/* Parchment Background for Content */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-100 z-0 mix-blend-multiply"
                    style={{ backgroundImage: parchmentBg, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}
                />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 2xl:gap-16">

                    {/* --- LEFT SIDEBAR (Desktop) --- */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#D4AF37]/50 scrollbar-track-transparent">
                            <h3 className="text-xs font-bold text-[#8A7A5E] uppercase tracking-wider mb-4 px-3 font-['Cinzel'] border-b border-[#D4AF37]/20 pb-2">
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
                                        className={`group flex items-center justify-between px-4 py-3 rounded-lg border-l-4 transition-all duration-300 ${activeSection === section.id
                                                ? 'bg-white border-[#D4AF37] text-[#3E2723] font-bold shadow-sm translate-x-1'
                                                : 'border-transparent text-[#5C4A2E] hover:bg-[#FFF9E6] hover:text-[#3E2723] hover:border-[#D4AF37]/30'
                                            }`}
                                    >
                                        <span className="text-sm truncate font-['Cinzel']">{section.label}</span>
                                        {activeSection === section.id && <ChevronRight className="w-4 h-4 text-[#D4AF37]" />}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* --- MOBILE/TABLET NAV --- */}
                    <div className="lg:hidden col-span-1 sticky top-20 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D4AF37]/20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 overflow-x-auto scrollbar-hide shadow-sm">
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
                                    className={`whitespace-nowrap text-sm px-5 py-2 rounded-full transition-all border font-['Cinzel'] font-bold ${activeSection === section.id
                                            ? 'bg-[#3E2723] text-[#F3E5AB] border-[#3E2723] shadow-md'
                                            : 'bg-white text-[#5C4A2E] border-[#D4AF37]/30'
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
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">1. Overview</h2>
                                <div className="prose prose-slate max-w-none text-[#5C4A2E] leading-relaxed">
                                    <p className="mb-6 text-lg">
                                        <strong>Kiddos Intellect</strong> ("we," "us," or "our") is committed to protecting the privacy and security of your personal information. This Privacy Policy describes how we collect, use, store, share, and protect your personal data.
                                    </p>
                                    <div className="bg-[#FFF9E6] border-l-4 border-[#D4AF37] p-6 rounded-r-xl">
                                        <h4 className="font-bold text-[#3E2723] text-sm mb-3 flex items-center gap-2 uppercase tracking-wide font-['Cinzel']">
                                            <Shield className="w-4 h-4 text-[#D4AF37]" /> Our Commitment
                                        </h4>
                                        <ul className="text-sm text-[#5C4A2E] space-y-2 list-disc pl-5 marker:text-[#D4AF37]">
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
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-8 border-b border-[#D4AF37]/20 pb-4">2. Information We Collect</h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#E3DCC8] hover:border-[#D4AF37] transition-colors">
                                            <h4 className="font-bold text-[#3E2723] mb-3 flex items-center gap-2 font-['Cinzel']">
                                                <Users className="w-5 h-5 text-[#D4AF37]" /> Account Info
                                            </h4>
                                            <ul className="text-sm space-y-2 list-disc pl-4 marker:text-[#D4AF37]">
                                                <li>Full name, Email address</li>
                                                <li>Phone number, Password</li>
                                            </ul>
                                        </div>
                                        <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#E3DCC8] hover:border-[#D4AF37] transition-colors">
                                            <h4 className="font-bold text-[#3E2723] mb-3 flex items-center gap-2 font-['Cinzel']">
                                                <FileText className="w-5 h-5 text-[#D4AF37]" /> Order Details
                                            </h4>
                                            <ul className="text-sm space-y-2 list-disc pl-4 marker:text-[#D4AF37]">
                                                <li>Billing/Shipping address</li>
                                                <li>Order history, Preferences</li>
                                            </ul>
                                        </div>
                                        <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#E3DCC8] hover:border-[#D4AF37] transition-colors">
                                            <h4 className="font-bold text-[#3E2723] mb-3 flex items-center gap-2 font-['Cinzel']">
                                                <Lock className="w-5 h-5 text-[#D4AF37]" /> Payment Data
                                            </h4>
                                            <ul className="text-sm space-y-2 list-disc pl-4 marker:text-[#D4AF37]">
                                                <li>Transaction history</li>
                                                <li>Payment method (we do NOT store card details)</li>
                                            </ul>
                                        </div>
                                        <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#E3DCC8] hover:border-[#D4AF37] transition-colors">
                                            <h4 className="font-bold text-[#3E2723] mb-3 flex items-center gap-2 font-['Cinzel']">
                                                <Database className="w-5 h-5 text-[#D4AF37]" /> Usage Data
                                            </h4>
                                            <ul className="text-sm space-y-2 list-disc pl-4 marker:text-[#D4AF37]">
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
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">3. How We Use Your Data</h2>
                                <div className="space-y-4 text-[#5C4A2E]">
                                    <div className="p-5 border border-[#E3DCC8] rounded-xl flex gap-4 items-start">
                                        <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-bold text-[#3E2723] font-['Cinzel'] mb-1">Order Processing</h4>
                                            <p className="text-sm">Fulfilling orders, shipping, and payments.</p>
                                        </div>
                                    </div>
                                    <div className="p-5 border border-[#E3DCC8] rounded-xl flex gap-4 items-start">
                                        <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-bold text-[#3E2723] font-['Cinzel'] mb-1">Support</h4>
                                            <p className="text-sm">Responding to inquiries and resolving issues.</p>
                                        </div>
                                    </div>
                                    <div className="p-5 border border-[#E3DCC8] rounded-xl flex gap-4 items-start">
                                        <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-bold text-[#3E2723] font-['Cinzel'] mb-1">Marketing</h4>
                                            <p className="text-sm">Sending promotions and updates (you can opt-out anytime).</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. Sharing */}
                        <section id="sharing" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">4. Information Sharing</h2>
                                <p className="text-[#5C4A2E] mb-6 text-lg">
                                    We share data only with trusted partners necessary for service delivery:
                                </p>
                                <ul className="space-y-4 text-sm text-[#5C4A2E]">
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0"></div>
                                        <span><strong>Payment Gateways:</strong> Razorpay, PayU (for processing transactions).</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0"></div>
                                        <span><strong>Logistics:</strong> BlueDart (for delivery).</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0"></div>
                                        <span><strong>Cloud Services:</strong> AWS/Google Cloud (for secure hosting).</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0"></div>
                                        <span><strong>Legal:</strong> When required by law or to prevent fraud.</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* 5. Security */}
                        <section id="security" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Lock className="w-6 h-6 text-[#D4AF37]" />
                                    5. Data Security
                                </h2>
                                <div className="space-y-6 text-[#5C4A2E]">
                                    <p className="text-lg">We use SSL encryption, secure servers, and access controls to protect your data.</p>
                                    <div className="bg-[#FFF5F5] border border-[#FECACA] p-5 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-[#C53030] mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-[#742A2A]">
                                            <strong>Note:</strong> While we implement top-tier security, no online transmission is 100% secure. Please keep your password confidential.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 6. Your Rights */}
                        <section id="rights" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-8 border-b border-[#D4AF37]/20 pb-4">6. Your Rights</h2>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {[
                                        { title: "Access", desc: "Request a copy of your data." },
                                        { title: "Correction", desc: "Update inaccurate information." },
                                        { title: "Deletion", desc: "Request removal of your data." },
                                        { title: "Withdraw Consent", desc: "Opt-out of marketing." }
                                    ].map((right, i) => (
                                        <div key={i} className="p-5 bg-[#FAF7F2] rounded-xl border border-[#D4AF37]/20 hover:shadow-md transition-all">
                                            <h4 className="font-bold text-[#3E2723] mb-2 font-['Cinzel']">{right.title}</h4>
                                            <p className="text-sm text-[#5C4A2E]">{right.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 7. Cookies */}
                        <section id="cookies" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Cookie className="w-6 h-6 text-[#D4AF37]" />
                                    7. Cookies
                                </h2>
                                <p className="text-[#5C4A2E] leading-relaxed text-lg">
                                    We use cookies to improve your experience, remember cart items, and analyze traffic. You can control cookies via your browser settings.
                                </p>
                            </div>
                        </section>

                        {/* 8. Retention */}
                        <section id="retention" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">8. Data Retention</h2>
                                <p className="text-[#5C4A2E] mb-4 text-lg">We retain data as long as necessary for service or legal compliance.</p>
                                <ul className="text-sm text-[#5C4A2E] list-disc pl-5 space-y-2 marker:text-[#D4AF37]">
                                    <li><strong>Accounts:</strong> Until deleted or 3 years inactive.</li>
                                    <li><strong>Transactions:</strong> 7 years (for tax laws).</li>
                                </ul>
                            </div>
                        </section>

                        {/* 9. Children */}
                        <section id="children" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Baby className="w-6 h-6 text-[#D4AF37]" />
                                    9. Children's Privacy
                                </h2>
                                <p className="text-[#5C4A2E] text-lg">
                                    Our services are for adults. We do not knowingly collect data from children under 18 without parental consent. Parents can contact us to delete child data.
                                </p>
                            </div>
                        </section>

                        {/* 10. Third Party */}
                        <section id="third-party" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">10. Third-Party Links</h2>
                                <p className="text-[#5C4A2E] text-lg">
                                    We may link to external sites. We are not responsible for their privacy practices. Please review their policies.
                                </p>
                            </div>
                        </section>

                        {/* 11. International */}
                        <section id="international" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Globe className="w-6 h-6 text-[#D4AF37]" />
                                    11. Data Transfers
                                </h2>
                                <p className="text-[#5C4A2E] text-lg">
                                    Data is primarily stored in India. Some service providers may process data globally, ensuring compliance with Indian data laws.
                                </p>
                            </div>
                        </section>

                        {/* 12. Updates */}
                        <section id="updates" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">12. Policy Updates</h2>
                                <p className="text-[#5C4A2E] text-lg">
                                    We may update this policy. Changes will be posted here with the "Last Updated" date.
                                </p>
                            </div>
                        </section>

                        {/* 13. Contact (Dark Wood Theme) */}
                        <section id="contact" className="scroll-mt-32">
                            <div className="bg-gradient-to-br from-[#3E2723] to-[#2C1810] text-[#F3E5AB] p-10 md:p-14 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                                {/* Mandala Watermark */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none"
                                    style={{ backgroundImage: mandalaBg, backgroundSize: '300px', backgroundRepeat: 'repeat' }}></div>

                                <div className="relative z-10 text-center">
                                    <h2 className="font-['Cinzel'] text-2xl md:text-4xl font-bold mb-6 flex items-center justify-center gap-3">
                                        <Mail className="w-8 h-8 text-[#D4AF37]" />
                                        13. Contact Us
                                    </h2>
                                    <p className="text-[#D4AF37]/90 mb-10 text-lg">
                                        Questions about your privacy? We are here to listen.
                                    </p>

                                    <div className="flex flex-col sm:flex-row justify-center gap-6 text-base font-medium">
                                        <span className="flex items-center gap-3 justify-center bg-white/10 px-6 py-3 rounded-full border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 transition-colors">
                                            <Mail className="w-5 h-5 text-[#D4AF37]" /> kiddosintellect@gmail.com
                                        </span>
                                        <span className="flex items-center gap-3 justify-center bg-white/10 px-6 py-3 rounded-full border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 transition-colors">
                                            <Phone className="w-5 h-5 text-[#D4AF37]" /> +91 98798 57529
                                        </span>
                                    </div>
                                    <p className="text-[#8A7A5E] text-sm mt-8 border-t border-[#D4AF37]/20 pt-6 inline-block px-10">
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