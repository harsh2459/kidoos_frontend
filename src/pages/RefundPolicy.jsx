import React, { useEffect, useState } from 'react';
import { 
    RefreshCw, XCircle, CheckCircle, AlertTriangle, CreditCard, 
    Package, Mail, Phone, Shield, FileText, Clock, Ban, Info, ChevronRight 
} from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';

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

    // Consistent background texture
    const bgImage = "url('/images/terms-bg.png')";

    return (
        <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34]">
            
            {/* --- HERO SECTION --- */}
            <div className="relative w-full pt-20 md:pt-24 pb-16 px-6 border-b border-[#E3E8E5] overflow-hidden bg-[#F4F7F5]">
                
                {/* Background Image Layer */}
                <div 
                    className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply" 
                    style={{
                        backgroundImage: bgImage,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                        filter: 'sepia(1) hue-rotate(70deg) saturate(0.5)' 
                    }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#F4F7F5]/60 to-[#F4F7F5] pointer-events-none"></div>

                {/* Content Layer */}
                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 mb-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm ring-1 ring-[#DCE4E0]">
                        <RefreshCw className="w-8 h-8 md:w-10 md:h-10 text-[#1A3C34]" />
                    </div>
                    
                    <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-[#1A3C34] mb-6 tracking-tight leading-tight drop-shadow-sm">
                        Refund & Returns Policy
                    </h1>
                    
                    <p className="text-lg md:text-xl text-[#5C756D] font-light max-w-2xl mx-auto leading-relaxed">
                        Understanding our refund terms helps ensure a transparent and satisfying shopping experience for your little ones.
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
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-[#4A7C59]" />
                                    1. Overview
                                </h2>
                                <div className="prose prose-slate max-w-none text-[#4A5D56] leading-relaxed">
                                    <p className="mb-4">
                                        At <strong>Kiddos Intellect</strong>, customer satisfaction is our top priority. We understand that sometimes a book may not meet your expectations, arrive damaged, or you may simply change your mind.
                                    </p>
                                    <div className="bg-[#E8F0EB] border-l-4 border-[#4A7C59] p-5 rounded-r-lg">
                                        <h4 className="font-bold text-[#1A3C34] text-sm mb-1 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-[#4A7C59]" />
                                            Our Commitment
                                        </h4>
                                        <p className="text-sm text-[#4A5D56]">
                                            We stand behind the quality of our books. If you receive a damaged, defective, or incorrect book, we will replace it or provide a full refund at no additional cost to you.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Return Eligibility */}
                        <section id="eligibility" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">2. Return Eligibility</h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <p>
                                        You may return books within <span className="font-bold text-[#1A3C34]">7 days from delivery</span> if they meet the criteria below.
                                    </p>
                                    
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-[#FAFBF9] p-5 rounded-xl border border-[#EBEFEA]">
                                            <h4 className="font-bold text-[#1A3C34] mb-2 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#4A7C59]" /> Damaged Book
                                            </h4>
                                            <p className="text-sm text-[#5C756D]">Torn pages, broken spine, or water damage.</p>
                                        </div>
                                        <div className="bg-[#FAFBF9] p-5 rounded-xl border border-[#EBEFEA]">
                                            <h4 className="font-bold text-[#1A3C34] mb-2 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#4A7C59]" /> Defective Book
                                            </h4>
                                            <p className="text-sm text-[#5C756D]">Missing pages, printing errors, or binding issues.</p>
                                        </div>
                                        <div className="bg-[#FAFBF9] p-5 rounded-xl border border-[#EBEFEA]">
                                            <h4 className="font-bold text-[#1A3C34] mb-2 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-[#4A7C59]" /> Wrong Item
                                            </h4>
                                            <p className="text-sm text-[#5C756D]">Received a different book than ordered.</p>
                                        </div>
                                        <div className="bg-[#FAFBF9] p-5 rounded-xl border border-[#EBEFEA]">
                                            <h4 className="font-bold text-[#1A3C34] mb-2 flex items-center gap-2">
                                                <Info className="w-4 h-4 text-[#4A7C59]" /> Change of Mind
                                            </h4>
                                            <p className="text-sm text-[#5C756D]">Accepted if unused/unread. Return shipping charges may apply.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Timeline */}
                        <section id="timeline" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Clock className="w-6 h-6 text-[#4A7C59]" />
                                    3. Return Timeline
                                </h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <div className="p-5 bg-[#F0F5F2] border-l-4 border-[#4A7C59] rounded-r-lg">
                                        <h4 className="font-bold text-[#1A3C34] mb-2">7-Day Window</h4>
                                        <p className="text-sm">Returns must be initiated within 7 days of delivery. The window starts from the day you receive your order.</p>
                                    </div>
                                    <div className="p-4 bg-[#FFF9F0] border border-[#F5E6D3] rounded-lg flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-[#8A6A4B] mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-[#5C4D40]">
                                            <strong>Important:</strong> Please inspect your books immediately. Returns initiated after 7 days will not be accepted.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. Conditions */}
                        <section id="conditions" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">4. Return Conditions</h2>
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-[#5C756D]">
                                    <div className="p-4 border border-[#EBEFEA] rounded-lg">
                                        <h4 className="font-bold text-[#1A3C34] mb-2">Required</h4>
                                        <ul className="space-y-1 list-disc pl-4">
                                            <li>Unused & Unread</li>
                                            <li>Original Packaging</li>
                                            <li>Invoice Included</li>
                                            <li>No Markings/Writing</li>
                                        </ul>
                                    </div>
                                    <div className="p-4 bg-[#FFF5F5] border border-red-100 rounded-lg">
                                        <h4 className="font-bold text-red-800 mb-2">Rejected If</h4>
                                        <ul className="space-y-1 list-disc pl-4 text-red-700/80">
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
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Ban className="w-6 h-6 text-red-400" />
                                    5. Non-Returnable Items
                                </h2>
                                <div className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {[
                                            "Personalized Books", "Clearance/Sale Items", 
                                            "Digital Downloads", "Gift Cards", 
                                            "Opened Sealed Books", "Used/Read Books"
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 p-3 bg-[#FAFBF9] border border-[#EBEFEA] rounded-lg text-sm text-[#5C756D]">
                                                <XCircle className="w-4 h-4 text-red-400" /> {item}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-[#5C756D] mt-2 italic">
                                        *Exception: If a non-returnable item arrives damaged or defective, we will still replace it.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 6. Process */}
                        <section id="process" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">6. Return Process</h2>
                                <div className="space-y-4">
                                    {[
                                        { title: "Initiate Request", desc: "Contact us via Email, Phone, or Website within 7 days." },
                                        { title: "Provide Details", desc: "Share Order ID, photos of damage (if any), and reason." },
                                        { title: "Approval", desc: "We review within 24 hours and send shipping instructions." },
                                        { title: "Ship Back", desc: "Free pickup for damaged items. Self-ship for change of mind." },
                                        { title: "Refund", desc: "Processed after quality check (1-2 days after receipt)." }
                                    ].map((step, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-[#1A3C34] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#1A3C34]">{step.title}</h4>
                                                <p className="text-sm text-[#5C756D]">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 7. Refund Methods */}
                        <section id="refund-methods" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <CreditCard className="w-6 h-6 text-[#4A7C59]" />
                                    7. Refund Methods
                                </h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="p-5 bg-[#FAFBF9] rounded-xl border border-[#EBEFEA]">
                                            <h4 className="font-bold text-[#1A3C34] mb-2">Full Online Payment</h4>
                                            <p className="text-sm">Refunded to original source (Card, UPI, etc.). 100% of order value.</p>
                                        </div>
                                        <div className="p-5 bg-[#FAFBF9] rounded-xl border border-[#EBEFEA]">
                                            <h4 className="font-bold text-[#1A3C34] mb-2">COD Orders</h4>
                                            <p className="text-sm">Refunded via Bank Transfer. You must provide bank details.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 8. Refund Timeline */}
                        <section id="refund-timeline" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">8. Refund Timeline</h2>
                                <div className="overflow-hidden border border-[#E3E8E5] rounded-xl">
                                    <table className="w-full text-sm text-[#4A5D56]">
                                        <thead className="bg-[#F4F7F5] text-[#1A3C34] font-bold">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Method</th>
                                                <th className="px-4 py-3 text-left">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E3E8E5]">
                                            <tr><td className="px-4 py-3">UPI / Wallets</td><td className="px-4 py-3">3-5 Days</td></tr>
                                            <tr><td className="px-4 py-3">Cards / Net Banking</td><td className="px-4 py-3">5-7 Days</td></tr>
                                            <tr><td className="px-4 py-3">Bank Transfer (COD)</td><td className="px-4 py-3">5-10 Days</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* 9. Cancellation */}
                        <section id="cancellation" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">9. Order Cancellation</h2>
                                <div className="space-y-4 text-[#4A5D56]">
                                    <div className="p-4 bg-[#E8F0EB] rounded-lg">
                                        <h4 className="font-bold text-[#1A3C34] mb-1">Before Shipment</h4>
                                        <p className="text-sm">Free cancellation. Full refund processed instantly.</p>
                                    </div>
                                    <div className="p-4 bg-[#FFF9F0] rounded-lg">
                                        <h4 className="font-bold text-[#8A6A4B] mb-1">After Shipment</h4>
                                        <p className="text-sm text-[#5C4D40]">Cancellation not possible. Please accept delivery and initiate a return.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 10. Damaged */}
                        <section id="damaged" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <AlertTriangle className="w-6 h-6 text-[#4A7C59]" />
                                    10. Damaged/Defective
                                </h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <p>
                                        If your book arrives damaged, we offer a <strong>Free Replacement</strong> or <strong>Full Refund</strong>.
                                    </p>
                                    <div className="bg-[#FAFBF9] border border-[#EBEFEA] p-5 rounded-xl">
                                        <h4 className="font-bold text-[#1A3C34] mb-3">Report within 48 Hours</h4>
                                        <ul className="list-disc pl-5 text-sm space-y-1">
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
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">11. Exchanges</h2>
                                <p className="text-[#4A5D56] leading-relaxed">
                                    We do not offer direct exchanges. To exchange a book, simply return the unwanted item for a refund and place a new order for the correct item. This ensures faster processing.
                                </p>
                            </div>
                        </section>

                        {/* 12. Exceptions */}
                        <section id="exceptions" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">12. Special Cases</h2>
                                <div className="grid sm:grid-cols-2 gap-4 text-sm text-[#5C756D]">
                                    <div className="p-4 border border-[#EBEFEA] rounded-lg">
                                        <strong>Duplicate Payment:</strong> Full refund within 5-7 days upon proof.
                                    </div>
                                    <div className="p-4 border border-[#EBEFEA] rounded-lg">
                                        <strong>Refused Delivery:</strong> Return shipping costs deducted from refund.
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 13. Contact */}
                        <section id="contact" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Phone className="w-6 h-6 text-[#4A7C59]" />
                                    13. Contact Support
                                </h2>
                                <p className="text-[#4A5D56] mb-6">
                                    Need help with a return?
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

export default RefundPolicy;