import React, { useEffect, useState } from 'react';
import {
    RefreshCw, XCircle, CheckCircle, AlertTriangle, CreditCard,
    Package, Mail, Phone, Shield, FileText, Clock, Ban, Info, ChevronRight
} from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';
import SEO from '../components/SEO';

const RefundPolicy = () => {
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
        { id: 'eligibility', label: '2. Return Eligibility' },
        { id: 'timeline', label: '3. Return Timeline' },
        { id: 'conditions', label: '4. Return Conditions' },
        { id: 'non-returnable', label: '5. Non-Returnable Items' },
        { id: 'process', label: '6. Return Process' },
        { id: 'refund-methods', label: '7. Refund Methods' },
        { id: 'refund-timeline', label: '8. Refund Timeline' },
        { id: 'cancellation', label: '9. Order Cancellation' },
        { id: 'damaged', label: '10. Damaged/Defective' },
        { id: 'exchange', label: '11. Exchanges' },
        { id: 'exceptions', label: '12. Special Cases' },
        { id: 'contact', label: '13. Contact Support' },
    ];

    // VRINDAVAN THEME ASSETS
    const parchmentBg = "url('/images-webp/homepage/parchment-bg.webp')";
    const heroBg = "url('/images-webp/refund-scales-bg.webp')";
    const mandalaBg = "url('/images-webp/homepage/mandala-bg.webp')";

    return (
        <div className="bg-[#FAF7F2] min-h-screen font-['Lato'] text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723]">
            <SEO
                title="Refund & Return Policy | Kiddos Intellect"
                description="Understand our refund and return policy for children's books and educational materials. Easy returns, quick refunds, and excellent customer service."
                keywords="refund policy, return policy, book returns, money back guarantee, customer satisfaction"
                breadcrumbs={[
                    { name: "Home", url: "/" },
                    { name: "Refund Policy", url: "/refund" }
                ]}
            />

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
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FAF7F2]/90 via-[#FAF7F2]/70 to-[#FAF7F2] pointer-events-none"></div>

                {/* Content Layer */}
                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-4 mb-6 bg-white/60 backdrop-blur-sm rounded-full shadow-[0_4px_20px_rgba(212,175,55,0.2)] ring-1 ring-[#D4AF37]/40">
                        <RefreshCw className="w-8 h-8 md:w-10 md:h-10 text-[#D4AF37]" />
                    </div>
                    
                    <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl lg:text-7xl font-bold text-[#3E2723] mb-6 tracking-tight leading-tight drop-shadow-sm">
                        Refund & Returns <span className="text-[#D4AF37] italic">Policy</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-[#5C4A2E] font-light max-w-2xl mx-auto leading-relaxed">
                        Understanding our refund terms helps ensure a transparent and satisfying shopping experience for your little ones.
                    </p>

                    <div className="mt-8 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#FFF9E6] border border-[#D4AF37]/30 text-[#8A7A5E] text-xs font-bold uppercase tracking-widest shadow-sm font-['Cinzel']">
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
                                        className={`group flex items-center justify-between px-4 py-3 rounded-lg border-l-4 transition-all duration-300 ${
                                            activeSection === section.id
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
                                    className={`whitespace-nowrap text-sm px-5 py-2 rounded-full transition-all border font-['Cinzel'] font-bold ${
                                        activeSection === section.id
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
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Shield className="w-6 h-6 text-[#D4AF37]" />
                                    1. Overview
                                </h2>
                                <div className="prose prose-slate max-w-none text-[#5C4A2E] leading-relaxed">
                                    <p className="mb-6 text-lg">
                                        At <strong>Kiddos Intellect</strong>, customer satisfaction is our top priority. We understand that sometimes a book may not meet your expectations, arrive damaged, or you may simply change your mind.
                                    </p>
                                    <div className="bg-[#FFF9E6] border-l-4 border-[#D4AF37] p-6 rounded-r-xl">
                                        <h4 className="font-bold text-[#3E2723] text-sm mb-2 flex items-center gap-2 uppercase tracking-wide font-['Cinzel']">
                                            <Shield className="w-4 h-4 text-[#D4AF37]" />
                                            Our Commitment
                                        </h4>
                                        <p className="text-sm text-[#5C4A2E]">
                                            We stand behind the quality of our books. If you receive a damaged, defective, or incorrect book, we will replace it or provide a full refund at no additional cost to you.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Return Eligibility */}
                        <section id="eligibility" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-8 border-b border-[#D4AF37]/20 pb-4">2. Return Eligibility</h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <p className="text-lg">
                                        You may return books within <span className="font-bold text-[#3E2723] border-b border-[#D4AF37]">7 days from delivery</span> if they meet the criteria below.
                                    </p>
                                    
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#E3DCC8] hover:border-[#D4AF37] transition-colors">
                                            <h4 className="font-bold text-[#3E2723] mb-2 flex items-center gap-2 font-['Cinzel']">
                                                <CheckCircle className="w-5 h-5 text-[#D4AF37]" /> Damaged Book
                                            </h4>
                                            <p className="text-sm text-[#5C4A2E]">Torn pages, broken spine, or water damage.</p>
                                        </div>
                                        <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#E3DCC8] hover:border-[#D4AF37] transition-colors">
                                            <h4 className="font-bold text-[#3E2723] mb-2 flex items-center gap-2 font-['Cinzel']">
                                                <CheckCircle className="w-5 h-5 text-[#D4AF37]" /> Defective Book
                                            </h4>
                                            <p className="text-sm text-[#5C4A2E]">Missing pages, printing errors, or binding issues.</p>
                                        </div>
                                        <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#E3DCC8] hover:border-[#D4AF37] transition-colors">
                                            <h4 className="font-bold text-[#3E2723] mb-2 flex items-center gap-2 font-['Cinzel']">
                                                <CheckCircle className="w-5 h-5 text-[#D4AF37]" /> Wrong Item
                                            </h4>
                                            <p className="text-sm text-[#5C4A2E]">Received a different book than ordered.</p>
                                        </div>
                                        <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#E3DCC8] hover:border-[#D4AF37] transition-colors">
                                            <h4 className="font-bold text-[#3E2723] mb-2 flex items-center gap-2 font-['Cinzel']">
                                                <Info className="w-5 h-5 text-[#D4AF37]" /> Change of Mind
                                            </h4>
                                            <p className="text-sm text-[#5C4A2E]">Accepted if unused/unread. Return shipping charges may apply.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Timeline */}
                        <section id="timeline" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Clock className="w-6 h-6 text-[#D4AF37]" />
                                    3. Return Timeline
                                </h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <div className="p-6 bg-[#FFF9E6] border-l-4 border-[#D4AF37] rounded-r-xl">
                                        <h4 className="font-bold text-[#3E2723] mb-2 font-['Cinzel']">7-Day Window</h4>
                                        <p className="text-sm">Returns must be initiated within 7 days of delivery. The window starts from the day you receive your order.</p>
                                    </div>
                                    <div className="p-5 bg-white border border-[#E3DCC8] rounded-xl flex items-start gap-4 shadow-sm">
                                        <AlertTriangle className="w-6 h-6 text-[#B0894C] mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-[#5C4A2E]">
                                            <strong>Important:</strong> Please inspect your books immediately. Returns initiated after 7 days will not be accepted.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. Conditions */}
                        <section id="conditions" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-8 border-b border-[#D4AF37]/20 pb-4">4. Return Conditions</h2>
                                <div className="grid md:grid-cols-2 gap-6 text-sm text-[#5C4A2E]">
                                    <div className="p-6 border border-[#E3DCC8] rounded-xl bg-white">
                                        <h4 className="font-bold text-[#3E2723] mb-3 font-['Cinzel'] text-lg">Required</h4>
                                        <ul className="space-y-2 list-disc pl-4 marker:text-[#D4AF37]">
                                            <li>Unused & Unread</li>
                                            <li>Original Packaging</li>
                                            <li>Invoice Included</li>
                                            <li>No Markings/Writing</li>
                                        </ul>
                                    </div>
                                    <div className="p-6 bg-[#FFF5F5] border border-red-100 rounded-xl">
                                        <h4 className="font-bold text-[#9B2C2C] mb-3 font-['Cinzel'] text-lg">Rejected If</h4>
                                        <ul className="space-y-2 list-disc pl-4 text-[#742A2A]">
                                            <li>Signs of use/reading</li>
                                            <li>Damaged after delivery</li>
                                            <li>Missing parts/pages</li>
                                            <li>Past 7-day window</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 5. Non-Returnable */}
                        <section id="non-returnable" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Ban className="w-6 h-6 text-[#9B2C2C]" />
                                    5. Non-Returnable Items
                                </h2>
                                <div className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {[
                                            "Personalized Books", "Clearance/Sale Items", 
                                            "Digital Downloads", "Gift Cards", 
                                            "Opened Sealed Books", "Used/Read Books"
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-[#FAF7F2] border border-[#E3DCC8] rounded-lg text-sm text-[#5C4A2E]">
                                                <XCircle className="w-4 h-4 text-[#9B2C2C]" /> {item}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-[#8A7A5E] mt-2 italic pl-1">
                                        *Exception: If a non-returnable item arrives damaged or defective, we will still replace it.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 6. Process */}
                        <section id="process" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-8 border-b border-[#D4AF37]/20 pb-4">6. Return Process</h2>
                                <div className="space-y-6">
                                    {[
                                        { title: "Initiate Request", desc: "Contact us via Email, Phone, or Website within 7 days." },
                                        { title: "Provide Details", desc: "Share Order ID, photos of damage (if any), and reason." },
                                        { title: "Approval", desc: "We review within 24 hours and send shipping instructions." },
                                        { title: "Ship Back", desc: "Free pickup for damaged items. Self-ship for change of mind." },
                                        { title: "Refund", desc: "Processed after quality check (1-2 days after receipt)." }
                                    ].map((step, i) => (
                                        <div key={i} className="flex gap-5">
                                            <div className="w-10 h-10 rounded-full bg-[#3E2723] text-[#F3E5AB] flex items-center justify-center font-bold text-lg flex-shrink-0 border-2 border-[#D4AF37] font-['Cinzel'] shadow-sm">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#3E2723] text-lg font-['Cinzel'] mb-1">{step.title}</h4>
                                                <p className="text-sm text-[#5C4A2E]">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 7. Refund Methods */}
                        <section id="refund-methods" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <CreditCard className="w-6 h-6 text-[#D4AF37]" />
                                    7. Refund Methods
                                </h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="p-6 bg-[#FAF7F2] rounded-xl border border-[#E3DCC8] hover:border-[#D4AF37] transition-all">
                                            <h4 className="font-bold text-[#3E2723] mb-2 font-['Cinzel']">Full Online Payment</h4>
                                            <p className="text-sm">Refunded to original source (Card, UPI, etc.). 100% of order value.</p>
                                        </div>
                                        <div className="p-6 bg-[#FAF7F2] rounded-xl border border-[#E3DCC8] hover:border-[#D4AF37] transition-all">
                                            <h4 className="font-bold text-[#3E2723] mb-2 font-['Cinzel']">COD Orders</h4>
                                            <p className="text-sm">Refunded via Bank Transfer. You must provide bank details.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 8. Refund Timeline (Ledger Style) */}
                        <section id="refund-timeline" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-8 border-b border-[#D4AF37]/20 pb-4">8. Refund Timeline</h2>
                                <div className="overflow-hidden border border-[#D4AF37]/30 rounded-xl bg-[#FFF9E6]">
                                    <table className="w-full text-sm text-[#5C4A2E]">
                                        <thead className="bg-[#3E2723] text-[#F3E5AB] font-bold font-['Cinzel'] uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4 text-left border-r border-[#D4AF37]/30">Method</th>
                                                <th className="px-6 py-4 text-left">Estimated Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#D4AF37]/20">
                                            <tr className="hover:bg-white/50"><td className="px-6 py-4 border-r border-[#D4AF37]/20 font-bold">UPI / Wallets</td><td className="px-6 py-4">3-5 Days</td></tr>
                                            <tr className="hover:bg-white/50"><td className="px-6 py-4 border-r border-[#D4AF37]/20 font-bold">Cards / Net Banking</td><td className="px-6 py-4">5-7 Days</td></tr>
                                            <tr className="hover:bg-white/50"><td className="px-6 py-4 border-r border-[#D4AF37]/20 font-bold">Bank Transfer (COD)</td><td className="px-6 py-4">5-10 Days</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* 9. Cancellation */}
                        <section id="cancellation" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">9. Order Cancellation</h2>
                                <div className="space-y-4 text-[#5C4A2E]">
                                    <div className="p-5 bg-[#E8F0EB] rounded-xl border border-[#C6F6D5]">
                                        <h4 className="font-bold text-[#1A3C34] mb-1 font-['Cinzel']">Before Shipment</h4>
                                        <p className="text-sm">Free cancellation. Full refund processed instantly.</p>
                                    </div>
                                    <div className="p-5 bg-[#FFF5F5] rounded-xl border border-[#FED7D7]">
                                        <h4 className="font-bold text-[#9B2C2C] mb-1 font-['Cinzel']">After Shipment</h4>
                                        <p className="text-sm">Cancellation not possible. Please accept delivery and initiate a return.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 10. Damaged */}
                        <section id="damaged" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <AlertTriangle className="w-6 h-6 text-[#D4AF37]" />
                                    10. Damaged/Defective
                                </h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <p className="text-lg">
                                        If your book arrives damaged, we offer a <strong>Free Replacement</strong> or <strong>Full Refund</strong>.
                                    </p>
                                    <div className="bg-[#FAF7F2] border border-[#E3DCC8] p-6 rounded-xl">
                                        <h4 className="font-bold text-[#3E2723] mb-3 font-['Cinzel']">Report within 48 Hours</h4>
                                        <ul className="list-disc pl-5 text-sm space-y-2 marker:text-[#D4AF37]">
                                            <li>Take clear photos of the damage.</li>
                                            <li>Keep original packaging.</li>
                                            <li>Contact support immediately.</li>
                                            <li>We arrange free pickup.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 11. Exchanges */}
                        <section id="exchange" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">11. Exchanges</h2>
                                <p className="text-[#5C4A2E] leading-relaxed text-lg">
                                    We do not offer direct exchanges. To exchange a book, simply return the unwanted item for a refund and place a new order for the correct item. This ensures faster processing.
                                </p>
                            </div>
                        </section>

                        {/* 12. Exceptions */}
                        <section id="exceptions" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">12. Special Cases</h2>
                                <div className="grid sm:grid-cols-2 gap-6 text-sm text-[#5C4A2E]">
                                    <div className="p-5 border border-[#E3DCC8] rounded-xl bg-white">
                                        <strong className="block text-[#3E2723] font-['Cinzel'] mb-1">Duplicate Payment:</strong> Full refund within 5-7 days upon proof.
                                    </div>
                                    <div className="p-5 border border-[#E3DCC8] rounded-xl bg-white">
                                        <strong className="block text-[#3E2723] font-['Cinzel'] mb-1">Refused Delivery:</strong> Return shipping costs deducted from refund.
                                    </div>
                                </div>
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
                                        <Phone className="w-8 h-8 text-[#D4AF37]" />
                                        13. Contact Support
                                    </h2>
                                    <p className="text-[#D4AF37]/90 mb-10 text-lg">
                                        Need help with a return? We are here for you.
                                    </p>
                                    
                                    <div className="flex flex-col sm:flex-row justify-center gap-6 text-base font-medium">
                                        <span className="flex items-center gap-3 justify-center bg-white/10 px-6 py-3 rounded-full border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 transition-colors">
                                            <Mail className="w-5 h-5 text-[#D4AF37]"/> kiddosintellect@gmail.com
                                        </span>
                                        <span className="flex items-center gap-3 justify-center bg-white/10 px-6 py-3 rounded-full border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 transition-colors">
                                            <Phone className="w-5 h-5 text-[#D4AF37]"/> +91 98798 57529
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

export default RefundPolicy;