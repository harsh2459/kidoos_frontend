import React, { useEffect, useState } from 'react';
import { 
    BookOpen, Scale, Shield, Users, CreditCard, 
    Truck, RefreshCw, AlertCircle, Globe, Gavel, 
    Lock, Menu, ChevronRight, CheckCircle, XCircle 
} from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';

const TermsAndConditions = () => {
    const [activeSection, setActiveSection] = useState('agreement');

    useEffect(() => {
        window.scrollTo(0, 0);

        const handleScroll = () => {
            const sectionElements = sections.map(sec => document.getElementById(sec.id));
            let current = '';
            
            sectionElements.forEach(section => {
                if (section) {
                    const sectionTop = section.offsetTop;
                    // Trigger active state when section is near top of viewport (adjusted for sticky headers)
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
        { id: 'agreement', label: '1. Agreement to Terms' },
        { id: 'eligibility', label: '2. Eligibility' },
        { id: 'account', label: '3. User Accounts' },
        { id: 'purchasing', label: '4. Purchasing & Payment' },
        { id: 'cancellation', label: '5. Order Cancellation' },
        { id: 'shipping', label: '6. Shipping & Delivery' },
        { id: 'returns', label: '7. Returns & Refunds' },
        { id: 'product', label: '8. Product Information' },
        { id: 'pricing', label: '9. Pricing & Availability' },
        { id: 'conduct', label: '10. User Conduct' },
        { id: 'intellectual', label: '11. Intellectual Property' },
        { id: 'privacy', label: '12. Privacy & Data' },
        { id: 'liability', label: '13. Limitation of Liability' },
        { id: 'indemnification', label: '14. Indemnification' },
        { id: 'disputes', label: '15. Dispute Resolution' },
        { id: 'general', label: '16. General Provisions' },
    ];

    // VRINDAVAN THEME ASSETS
    const parchmentBg = "url('/images/homepage/parchment-bg.png')";
    const heroBg = "url('/images/terms-decree-bg.png')"; // New Hero Image
    const mandalaBg = "url('/images/homepage/mandala-bg.png')";

    return (
        <div className="bg-[#FAF7F2] min-h-screen font-['Lato'] text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723]">
            
            {/* --- HERO SECTION --- */}
            <div className="relative w-full pt-28 md:pt-36 pb-20 px-6 border-b border-[#D4AF37]/30 overflow-hidden">
                
                {/* 1. Background Image Layer */}
                <div 
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: heroBg,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 1 
                    }}
                />
                
                {/* 2. Gradient Overlay for Readability */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FAF7F2]/90 via-[#FAF7F2]/80 to-[#FAF7F2] pointer-events-none"></div>

                {/* 3. Content Layer */}
                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    {/* Icon Container */}
                    <div className="inline-flex items-center justify-center p-4 mb-6 bg-white/60 backdrop-blur-sm rounded-full shadow-[0_4px_20px_rgba(212,175,55,0.2)] ring-1 ring-[#D4AF37]/40">
                        <Scale className="w-8 h-8 md:w-10 md:h-10 text-[#D4AF37]" />
                    </div>
                    
                    {/* Main Title */}
                    <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl lg:text-7xl font-bold text-[#3E2723] mb-6 tracking-tight leading-tight drop-shadow-sm">
                        Terms & <span className="text-[#D4AF37] italic">Conditions</span>
                    </h1>
                    
                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-[#5C4A2E] font-light max-w-2xl mx-auto leading-relaxed">
                        Establishing a foundation of trust and transparency for your journey with Kiddos Intellect.
                    </p>

                    {/* Metadata Badge */}
                    <div className="mt-8 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#FFF9E6] border border-[#D4AF37]/30 text-[#8A7A5E] text-xs font-bold uppercase tracking-widest shadow-sm font-['Cinzel']">
                        Last Updated: December 03, 2025
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT CONTAINER --- */}
            <div className="relative max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                
                {/* Parchment Background for Content */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-100 z-0 mix-blend-multiply" 
                    style={{ backgroundImage: parchmentBg, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}
                />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 2xl:gap-16">

                    {/* --- LEFT SIDEBAR (Desktop Navigation) --- */}
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

                    {/* --- MOBILE/TABLET NAVIGATION (Horizontal Scroll) --- */}
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

                        {/* 1. Agreement */}
                        <section id="agreement" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)] relative overflow-hidden">
                                {/* Subtle decorative circle */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                                
                                <h2 className="relative z-10 font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3">
                                    <BookOpen className="w-6 h-6 text-[#D4AF37]" />
                                    1. Agreement to Terms
                                </h2>
                                <div className="relative z-10 prose prose-slate max-w-none text-[#5C4A2E] leading-relaxed">
                                    <p className="mb-4 text-lg">
                                        These Terms and Conditions ("Terms") constitute a legally binding agreement between you and <strong>Kiddos Intellect</strong> ("we," "us," or "our") regarding your use of our website, mobile applications, and e-commerce services (collectively, the "Platform").
                                    </p>
                                    <p className="mb-6">
                                        By accessing, browsing, or making a purchase through our Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy, Return Policy, and Shipping Policy.
                                    </p>
                                    <div className="p-6 bg-[#FFF9E6] border-l-4 border-[#D4AF37] rounded-r-xl shadow-sm">
                                        <h4 className="font-bold text-[#3E2723] text-sm mb-2 font-['Cinzel'] uppercase tracking-wide">Important Notice</h4>
                                        <p className="text-sm text-[#5C4A2E] m-0">
                                            If you do not agree to these Terms, you must immediately discontinue use of the Platform. Continued use constitutes acceptance of any modifications we may make to these Terms from time to time.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Eligibility */}
                        <section id="eligibility" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">2. Eligibility</h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <p className="text-lg">
                                        Use of this Platform is available only to persons who can form legally binding contracts under the Indian Contract Act, 1872. Persons who are "incompetent to contract" (including minors, undischarged insolvents, and persons of unsound mind) are not eligible.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#E3DCC8] hover:border-[#D4AF37] transition-all">
                                            <h4 className="font-['Cinzel'] font-bold text-[#3E2723] mb-2">For Minors</h4>
                                            <p className="text-sm">
                                                If you are under 18, you may use the Platform only under the supervision of a parent or guardian who agrees to be bound by these Terms.
                                            </p>
                                        </div>
                                        <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#E3DCC8] hover:border-[#D4AF37] transition-all">
                                            <h4 className="font-['Cinzel'] font-bold text-[#3E2723] mb-2">Accuracy</h4>
                                            <p className="text-sm">
                                                By using this Platform, you represent and warrant that you meet eligibility requirements and all submitted information is truthful.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. User Accounts */}
                         <section id="account" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Users className="w-6 h-6 text-[#D4AF37]" />
                                    3. User Accounts
                                </h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <p className="text-lg">
                                        To access certain features, you may be required to create an account. You agree to provide accurate, current, and complete information during registration.
                                    </p>
                                    <ul className="space-y-4 list-none pl-0">
                                        <li className="flex gap-4 items-start">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] flex-shrink-0"></div>
                                            <span>Maintain the confidentiality of your password and account credentials.</span>
                                        </li>
                                        <li className="flex gap-4 items-start">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] flex-shrink-0"></div>
                                            <span>Notify us immediately of any unauthorized access or security breach.</span>
                                        </li>
                                        <li className="flex gap-4 items-start">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] flex-shrink-0"></div>
                                            <span>Accept responsibility for all activity under your account.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 4. Purchasing */}
                        <section id="purchasing" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <CreditCard className="w-6 h-6 text-[#D4AF37]" />
                                    4. Purchasing & Payment
                                </h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <p className="text-lg">
                                        When you place an order, you are making an offer to purchase products subject to these Terms. All orders are subject to acceptance and availability.
                                    </p>
                                    
                                    <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#E3DCC8]">
                                        <h3 className="font-['Cinzel'] text-xl font-bold text-[#3E2723] mb-4">Accepted Payment Methods</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {["Visa", "Mastercard", "RuPay", "UPI", "Net Banking", "Wallets"].map(method => (
                                                <span key={method} className="px-4 py-2 bg-white border border-[#D4AF37]/30 rounded-lg text-sm font-bold text-[#3E2723] shadow-sm">
                                                    {method}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm bg-[#FFF9E6] p-5 rounded-xl border border-[#D4AF37]/20 italic">
                                        All prices displayed include applicable Goods and Services Tax (GST). Additional customs duties or local taxes (if applicable) are the customer's responsibility.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 5. Cancellation */}
                        <section id="cancellation" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">5. Order Cancellation</h2>
                                <div className="space-y-4 text-[#5C4A2E] leading-relaxed">
                                    <div className="p-6 bg-[#FAF7F2] rounded-xl border border-[#E3DCC8] hover:border-[#D4AF37] transition-all">
                                        <h4 className="font-bold text-[#3E2723] mb-2 flex items-center gap-2 font-['Cinzel']">
                                            <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                                            Customer-Initiated
                                        </h4>
                                        <p className="text-sm">
                                            You may cancel your order before it is shipped. Once shipped, cancellation is not possible, but you may initiate a return. Refunds for cancelled orders are processed within 5-10 business days.
                                        </p>
                                    </div>
                                    <div className="p-6 bg-[#FAF7F2] rounded-xl border border-[#E3DCC8] hover:border-[#D4AF37] transition-all">
                                        <h4 className="font-bold text-[#3E2723] mb-2 flex items-center gap-2 font-['Cinzel']">
                                            <span className="w-2 h-2 rounded-full bg-[#3E2723]"></span>
                                            Company-Initiated
                                        </h4>
                                        <p className="text-sm">
                                            We reserve the right to cancel orders due to unavailability, pricing errors, or fraud. You will receive a full refund in such cases.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 6. Shipping */}
                        <section id="shipping" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Truck className="w-6 h-6 text-[#D4AF37]" />
                                    6. Shipping & Delivery
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                                    <div className="p-6 bg-[#FAF7F2] rounded-xl text-center border border-[#E3DCC8]">
                                        <div className="text-3xl font-['Playfair_Display'] text-[#3E2723] font-bold">1-2 Days</div>
                                        <div className="text-xs font-bold text-[#B0894C] uppercase tracking-wider mt-1 font-['Cinzel']">Processing Time</div>
                                    </div>
                                    <div className="p-6 bg-[#FAF7F2] rounded-xl text-center border border-[#E3DCC8]">
                                        <div className="text-3xl font-['Playfair_Display'] text-[#3E2723] font-bold">3-7 Days</div>
                                        <div className="text-xs font-bold text-[#B0894C] uppercase tracking-wider mt-1 font-['Cinzel']">Standard Delivery</div>
                                    </div>
                                </div>
                                <ul className="list-disc pl-5 space-y-2 text-[#5C4A2E] marker:text-[#D4AF37]">
                                    <li>Risk of loss passes to you upon delivery to the carrier.</li>
                                    <li>We are not responsible for delays caused by weather or customs.</li>
                                    <li>Tracking information will be sent via email/SMS upon dispatch.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 7. Returns */}
                        <section id="returns" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <RefreshCw className="w-6 h-6 text-[#D4AF37]" />
                                    7. Returns & Refunds
                                </h2>
                                <p className="text-[#5C4A2E] leading-relaxed mb-6 text-lg">
                                    We offer a <strong>7-day return window</strong> for damaged, defective, or incorrect items. Products must be unused and in original packaging.
                                </p>
                                
                                <div className="bg-[#FAF7F2] rounded-xl p-6 border border-[#E3DCC8]">
                                    <h3 className="font-['Cinzel'] font-bold text-[#3E2723] mb-4 text-lg">Non-Returnable Items</h3>
                                    <div className="grid sm:grid-cols-2 gap-4 text-sm text-[#5C4A2E]">
                                        <div className="flex items-center gap-3">
                                            <XCircle className="w-4 h-4 text-[#C53030]" /> Personalized Books
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <XCircle className="w-4 h-4 text-[#C53030]" /> Digital Downloads
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <XCircle className="w-4 h-4 text-[#C53030]" /> Clearance Items
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <XCircle className="w-4 h-4 text-[#C53030]" /> Used/Read Books
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 8. Product Info */}
                        <section id="product" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">8. Product Information</h2>
                                <p className="text-[#5C4A2E] leading-relaxed mb-6">
                                    We strive for accuracy in our product descriptions and images. However, we do not warrant that descriptions are error-free.
                                </p>
                                <div className="flex gap-4 items-start p-5 bg-[#FFF9E6] border border-[#D4AF37]/30 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-[#B0894C] mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-[#5C4A2E]">
                                        <strong>Note:</strong> Book cover colors and designs may vary slightly based on monitor settings or edition updates. Dimensions are approximate.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 9. Pricing */}
                        <section id="pricing" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">9. Pricing & Availability</h2>
                                <div className="space-y-4 text-[#5C4A2E] leading-relaxed">
                                    <p>
                                        Prices are in INR and subject to change without notice. We reserve the right to modify or discontinue products at any time.
                                    </p>
                                    <p>
                                        In the rare event of a pricing error, we reserve the right to cancel orders placed at the incorrect price, even if confirmed. A full refund will be issued immediately.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 10. User Conduct */}
                        <section id="conduct" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Shield className="w-6 h-6 text-[#D4AF37]" />
                                    10. User Conduct
                                </h2>
                                <p className="text-[#5C4A2E] mb-4 text-lg">
                                    You agree to use the Platform for lawful purposes only. Prohibited activities include:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-[#5C4A2E] marker:text-[#D4AF37]">
                                    <li>Violating any laws or regulations.</li>
                                    <li>Infringing on intellectual property rights.</li>
                                    <li>Transmitting viruses or malware.</li>
                                    <li>Engaging in fraudulent activities.</li>
                                    <li>Posting false or malicious reviews.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 11. Intellectual Property */}
                        <section id="intellectual" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">11. Intellectual Property</h2>
                                <p className="text-[#5C4A2E] leading-relaxed mb-6">
                                    All content on the Platform (text, graphics, logos, images) is the property of Kiddos Intellect and protected by copyright laws.
                                </p>
                                <p className="text-sm text-[#5C4A2E] bg-[#FAF7F2] p-5 rounded-xl border border-[#D4AF37]/20">
                                    You are granted a limited license for personal, non-commercial use only. You may not reproduce, distribute, or create derivative works without written permission.
                                </p>
                            </div>
                        </section>

                        {/* 12. Privacy */}
                        <section id="privacy" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Lock className="w-6 h-6 text-[#D4AF37]" />
                                    12. Privacy & Data
                                </h2>
                                <p className="text-[#5C4A2E] leading-relaxed mb-6">
                                    Your privacy is paramount. By using the Platform, you consent to the collection and use of your information as described in our Privacy Policy.
                                </p>
                                <a href="/privacy-policy" className="text-[#B0894C] font-bold border-b border-[#B0894C] pb-0.5 hover:text-[#3E2723] hover:border-[#3E2723] transition-colors font-['Cinzel']">
                                    Read Full Privacy Policy →
                                </a>
                            </div>
                        </section>

                        {/* 13. Liability */}
                        <section id="liability" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">13. Limitation of Liability</h2>
                                <p className="text-[#5C4A2E] leading-relaxed mb-6">
                                    To the fullest extent permitted by law, Kiddos Intellect shall not be liable for any indirect, incidental, punitive, or consequential damages (including lost profits or data) arising from your use of the Platform.
                                </p>
                                <div className="p-5 bg-[#FFF9E6] border border-[#D4AF37]/30 rounded-xl">
                                    <p className="text-sm text-[#5C4A2E]">
                                        Our total liability to you for any claim shall not exceed the amount you paid to us for products purchased in the 12 months preceding the claim.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 14. Indemnification */}
                        <section id="indemnification" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">14. Indemnification</h2>
                                <p className="text-[#5C4A2E] leading-relaxed">
                                    You agree to indemnify and hold harmless Kiddos Intellect from any claims, damages, losses, or expenses (including legal fees) arising from your violation of these Terms, your use of the Platform, or your violation of any third-party rights.
                                </p>
                            </div>
                        </section>

                        {/* 15. Disputes */}
                        <section id="disputes" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Gavel className="w-6 h-6 text-[#D4AF37]" />
                                    15. Dispute Resolution
                                </h2>
                                <div className="space-y-4 text-[#5C4A2E] leading-relaxed">
                                    <p>
                                        These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in [Your City], India.
                                    </p>
                                    <p>
                                        We encourage informal resolution first. Please contact our support team to resolve issues amicably before resorting to formal legal action or arbitration.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 16. General */}
                        <section id="general" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Globe className="w-6 h-6 text-[#D4AF37]" />
                                    16. General Provisions
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6 mb-10">
                                    <div>
                                        <h4 className="font-bold text-[#3E2723] mb-2 font-['Cinzel']">Modifications</h4>
                                        <p className="text-sm text-[#5C4A2E]">We may update these terms at any time. Continued use implies acceptance.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#3E2723] mb-2 font-['Cinzel']">Severability</h4>
                                        <p className="text-sm text-[#5C4A2E]">If one part is invalid, the rest of the terms remain enforceable.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#3E2723] mb-2 font-['Cinzel']">Force Majeure</h4>
                                        <p className="text-sm text-[#5C4A2E]">We are not liable for delays caused by events beyond our control.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#3E2723] mb-2 font-['Cinzel']">Entire Agreement</h4>
                                        <p className="text-sm text-[#5C4A2E]">These terms supersede all prior agreements regarding the Platform.</p>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-[#3E2723] to-[#2C1810] text-[#F3E5AB] p-10 rounded-2xl text-center shadow-lg relative overflow-hidden">
                                    {/* Mandala Watermark */}
                                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                                         style={{ backgroundImage: mandalaBg, backgroundSize: '200px', backgroundRepeat: 'repeat' }}></div>
                                    
                                    <h3 className="font-['Cinzel'] text-2xl mb-4 font-bold relative z-10">Questions?</h3>
                                    <p className="text-[#D4AF37]/80 mb-6 relative z-10">
                                        If you have any questions about these Terms, please contact us.
                                    </p>
                                    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-sm font-medium relative z-10">
                                        <span className="bg-white/10 px-4 py-2 rounded-lg">kiddosintellect@gmail.com</span>
                                        <span className="bg-white/10 px-4 py-2 rounded-lg">+91 98798 57529</span>
                                    </div>
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

export default TermsAndConditions;