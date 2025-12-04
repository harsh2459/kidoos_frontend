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

    // NOTE: Replace this with the correct path to your uploaded image
    const bgImage = "url('/images/terms-bg.png')"; 

    return (
        <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34]">
            
            {/* --- HERO SECTION WITH BACKGROUND IMAGE --- */}
            {/* The 'relative' class is crucial here to contain the absolute positioned image */}
            <div className="relative w-full pt-20 md:pt-24 pb-16 px-6 border-b border-[#E3E8E5] overflow-hidden bg-[#F4F7F5]">
                
                {/* 1. Background Image Layer */}
                <div 
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: bgImage,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        // CSS Filters to blend the cool tech image into the warm/green theme
                        filter: 'sepia(0.5) hue-rotate(90deg) contrast(1.2)' 
                    }}
                />
                
                {/* 2. Gradient Overlay for Readability (Fades to page color at bottom) */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#F4F7F5]/80 via-[#F4F7F5]/90 to-[#F4F7F5] pointer-events-none"></div>

                {/* 3. Content Layer (z-10 puts it above image) */}
                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    {/* Icon Container */}
                    <div className="inline-flex items-center justify-center p-3 mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm ring-1 ring-[#DCE4E0]">
                        <Scale className="w-8 h-8 md:w-10 md:h-10 text-[#1A3C34]" />
                    </div>
                    
                    {/* Main Title */}
                    <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-[#1A3C34] mb-6 tracking-tight leading-tight drop-shadow-sm">
                        Terms & Conditions
                    </h1>
                    
                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-[#5C756D] font-light max-w-2xl mx-auto leading-relaxed">
                        Establishing a foundation of trust and transparency for your journey with Kiddos Intellect.
                    </p>

                    {/* Metadata Badge */}
                    <div className="mt-8 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 backdrop-blur-md text-[#2F523F] text-xs font-bold uppercase tracking-widest border border-[#DCE4E0] shadow-sm">
                        Last Updated: December 03, 2025
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT CONTAINER --- */}
            <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 2xl:gap-16">

                    {/* --- LEFT SIDEBAR (Desktop Navigation) --- */}
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

                    {/* --- MOBILE/TABLET NAVIGATION (Horizontal Scroll) --- */}
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

                        {/* 1. Agreement */}
                        <section id="agreement" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm relative overflow-hidden">
                                {/* Subtle decorative circle */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4F7F5] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                                
                                <h2 className="relative z-10 font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <BookOpen className="w-6 h-6 text-[#4A7C59]" />
                                    1. Agreement to Terms
                                </h2>
                                <div className="relative z-10 prose prose-slate max-w-none text-[#4A5D56] leading-relaxed">
                                    <p className="mb-4">
                                        These Terms and Conditions ("Terms") constitute a legally binding agreement between you and <strong>Kiddos Intellect</strong> ("we," "us," or "our") regarding your use of our website, mobile applications, and e-commerce services (collectively, the "Platform").
                                    </p>
                                    <p className="mb-6">
                                        By accessing, browsing, or making a purchase through our Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy, Return Policy, and Shipping Policy.
                                    </p>
                                    <div className="p-5 bg-[#F0F5F2] border-l-4 border-[#4A7C59] rounded-r-lg">
                                        <h4 className="font-bold text-[#1A3C34] text-sm mb-1">Important Notice</h4>
                                        <p className="text-sm text-[#4A5D56] m-0">
                                            If you do not agree to these Terms, you must immediately discontinue use of the Platform. Continued use constitutes acceptance of any modifications we may make to these Terms from time to time.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Eligibility */}
                        <section id="eligibility" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">2. Eligibility</h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <p>
                                        Use of this Platform is available only to persons who can form legally binding contracts under the Indian Contract Act, 1872. Persons who are "incompetent to contract" (including minors, undischarged insolvents, and persons of unsound mind) are not eligible.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-[#FAFBF9] p-5 rounded-xl border border-[#EBEFEA]">
                                            <h4 className="font-serif font-bold text-[#1A3C34] mb-2">For Minors</h4>
                                            <p className="text-sm">
                                                If you are under 18, you may use the Platform only under the supervision of a parent or guardian who agrees to be bound by these Terms.
                                            </p>
                                        </div>
                                        <div className="bg-[#FAFBF9] p-5 rounded-xl border border-[#EBEFEA]">
                                            <h4 className="font-serif font-bold text-[#1A3C34] mb-2">Accuracy</h4>
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
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Users className="w-6 h-6 text-[#4A7C59]" />
                                    3. User Accounts
                                </h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <p>
                                        To access certain features, you may be required to create an account. You agree to provide accurate, current, and complete information during registration.
                                    </p>
                                    <ul className="space-y-3 list-none pl-0">
                                        <li className="flex gap-3 items-start">
                                            <div className="w-1.5 h-1.5 mt-2 rounded-full bg-[#4A7C59] flex-shrink-0"></div>
                                            <span>Maintain the confidentiality of your password and account credentials.</span>
                                        </li>
                                        <li className="flex gap-3 items-start">
                                            <div className="w-1.5 h-1.5 mt-2 rounded-full bg-[#4A7C59] flex-shrink-0"></div>
                                            <span>Notify us immediately of any unauthorized access or security breach.</span>
                                        </li>
                                        <li className="flex gap-3 items-start">
                                            <div className="w-1.5 h-1.5 mt-2 rounded-full bg-[#4A7C59] flex-shrink-0"></div>
                                            <span>Accept responsibility for all activity under your account.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 4. Purchasing */}
                        <section id="purchasing" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <CreditCard className="w-6 h-6 text-[#4A7C59]" />
                                    4. Purchasing & Payment
                                </h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <p>
                                        When you place an order, you are making an offer to purchase products subject to these Terms. All orders are subject to acceptance and availability.
                                    </p>
                                    
                                    <div className="border-t border-[#E3E8E5] pt-6">
                                        <h3 className="font-serif text-xl text-[#1A3C34] mb-4">Accepted Payment Methods</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {["Visa", "Mastercard", "RuPay", "UPI", "Net Banking", "Wallets"].map(method => (
                                                <span key={method} className="px-3 py-1 bg-[#F4F7F5] border border-[#DCE4E0] rounded text-sm font-medium text-[#5C756D]">
                                                    {method}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm bg-[#F4F7F5] p-4 rounded-lg">
                                        All prices displayed include applicable Goods and Services Tax (GST). Additional customs duties or local taxes (if applicable) are the customer's responsibility.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 5. Cancellation */}
                        <section id="cancellation" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">5. Order Cancellation</h2>
                                <div className="space-y-4 text-[#4A5D56] leading-relaxed">
                                    <div className="p-5 bg-[#FAFBF9] rounded-xl border border-[#EBEFEA]">
                                        <h4 className="font-bold text-[#1A3C34] mb-2 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#4A7C59]"></span>
                                            Customer-Initiated
                                        </h4>
                                        <p className="text-sm">
                                            You may cancel your order before it is shipped. Once shipped, cancellation is not possible, but you may initiate a return. Refunds for cancelled orders are processed within 5-10 business days.
                                        </p>
                                    </div>
                                    <div className="p-5 bg-[#FAFBF9] rounded-xl border border-[#EBEFEA]">
                                        <h4 className="font-bold text-[#1A3C34] mb-2 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#1A3C34]"></span>
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
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Truck className="w-6 h-6 text-[#4A7C59]" />
                                    6. Shipping & Delivery
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                                    <div className="p-5 bg-[#FAFBF9] rounded-xl text-center border border-[#EBEFEA]">
                                        <div className="text-2xl font-serif text-[#1A3C34] font-bold">1-2 Days</div>
                                        <div className="text-xs font-bold text-[#8BA699] uppercase tracking-wider mt-1">Processing Time</div>
                                    </div>
                                    <div className="p-5 bg-[#FAFBF9] rounded-xl text-center border border-[#EBEFEA]">
                                        <div className="text-2xl font-serif text-[#1A3C34] font-bold">3-7 Days</div>
                                        <div className="text-xs font-bold text-[#8BA699] uppercase tracking-wider mt-1">Standard Delivery</div>
                                    </div>
                                </div>
                                <ul className="list-disc pl-5 space-y-2 text-[#4A5D56]">
                                    <li>Risk of loss passes to you upon delivery to the carrier.</li>
                                    <li>We are not responsible for delays caused by weather or customs.</li>
                                    <li>Tracking information will be sent via email/SMS upon dispatch.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 7. Returns */}
                        <section id="returns" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <RefreshCw className="w-6 h-6 text-[#4A7C59]" />
                                    7. Returns & Refunds
                                </h2>
                                <p className="text-[#4A5D56] leading-relaxed mb-6">
                                    We offer a <strong>7-day return window</strong> for damaged, defective, or incorrect items. Products must be unused and in original packaging.
                                </p>
                                
                                <div className="bg-[#FAFBF9] rounded-xl p-6 border border-[#EBEFEA]">
                                    <h3 className="font-serif font-bold text-[#1A3C34] mb-4">Non-Returnable Items</h3>
                                    <div className="grid sm:grid-cols-2 gap-3 text-sm text-[#5C756D]">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="w-4 h-4 text-red-400" /> Personalized Books
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <XCircle className="w-4 h-4 text-red-400" /> Digital Downloads
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <XCircle className="w-4 h-4 text-red-400" /> Clearance Items
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <XCircle className="w-4 h-4 text-red-400" /> Used/Read Books
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 8. Product Info */}
                        <section id="product" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">8. Product Information</h2>
                                <p className="text-[#4A5D56] leading-relaxed mb-4">
                                    We strive for accuracy in our product descriptions and images. However, we do not warrant that descriptions are error-free.
                                </p>
                                <div className="flex gap-4 items-start p-4 bg-[#FFFDF9] border border-[#F5E6D3] rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-[#BFA15F] mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-[#5C4D40]">
                                        <strong>Note:</strong> Book cover colors and designs may vary slightly based on monitor settings or edition updates. Dimensions are approximate.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 9. Pricing */}
                        <section id="pricing" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">9. Pricing & Availability</h2>
                                <div className="space-y-4 text-[#4A5D56] leading-relaxed">
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
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-[#4A7C59]" />
                                    10. User Conduct
                                </h2>
                                <p className="text-[#4A5D56] mb-4">
                                    You agree to use the Platform for lawful purposes only. Prohibited activities include:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-[#4A5D56]">
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
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">11. Intellectual Property</h2>
                                <p className="text-[#4A5D56] leading-relaxed mb-4">
                                    All content on the Platform (text, graphics, logos, images) is the property of Kiddos Intellect and protected by copyright laws.
                                </p>
                                <p className="text-sm text-[#5C756D] bg-[#F4F7F5] p-4 rounded-lg">
                                    You are granted a limited license for personal, non-commercial use only. You may not reproduce, distribute, or create derivative works without written permission.
                                </p>
                            </div>
                        </section>

                        {/* 12. Privacy */}
                        <section id="privacy" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Lock className="w-6 h-6 text-[#4A7C59]" />
                                    12. Privacy & Data
                                </h2>
                                <p className="text-[#4A5D56] leading-relaxed mb-4">
                                    Your privacy is paramount. By using the Platform, you consent to the collection and use of your information as described in our Privacy Policy.
                                </p>
                                <a href="/privacy-policy" className="text-[#1A3C34] font-semibold border-b border-[#4A7C59] pb-0.5 hover:text-[#4A7C59]">
                                    Read Full Privacy Policy →
                                </a>
                            </div>
                        </section>

                        {/* 13. Liability */}
                        <section id="liability" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">13. Limitation of Liability</h2>
                                <p className="text-[#4A5D56] leading-relaxed mb-6">
                                    To the fullest extent permitted by law, Kiddos Intellect shall not be liable for any indirect, incidental, punitive, or consequential damages (including lost profits or data) arising from your use of the Platform.
                                </p>
                                <div className="p-4 bg-[#FFF9F0] border border-[#F5E6D3] rounded-lg">
                                    <p className="text-sm text-[#5C4D40]">
                                        Our total liability to you for any claim shall not exceed the amount you paid to us for products purchased in the 12 months preceding the claim.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 14. Indemnification */}
                        <section id="indemnification" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">14. Indemnification</h2>
                                <p className="text-[#4A5D56] leading-relaxed">
                                    You agree to indemnify and hold harmless Kiddos Intellect from any claims, damages, losses, or expenses (including legal fees) arising from your violation of these Terms, your use of the Platform, or your violation of any third-party rights.
                                </p>
                            </div>
                        </section>

                        {/* 15. Disputes */}
                        <section id="disputes" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Gavel className="w-6 h-6 text-[#4A7C59]" />
                                    15. Dispute Resolution
                                </h2>
                                <div className="space-y-4 text-[#4A5D56] leading-relaxed">
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
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Globe className="w-6 h-6 text-[#4A7C59]" />
                                    16. General Provisions
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <h4 className="font-bold text-[#1A3C34] mb-2">Modifications</h4>
                                        <p className="text-sm text-[#4A5D56]">We may update these terms at any time. Continued use implies acceptance.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1A3C34] mb-2">Severability</h4>
                                        <p className="text-sm text-[#4A5D56]">If one part is invalid, the rest of the terms remain enforceable.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1A3C34] mb-2">Force Majeure</h4>
                                        <p className="text-sm text-[#4A5D56]">We are not liable for delays caused by events beyond our control.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1A3C34] mb-2">Entire Agreement</h4>
                                        <p className="text-sm text-[#4A5D56]">These terms supersede all prior agreements regarding the Platform.</p>
                                    </div>
                                </div>

                                <div className="bg-[#1A3C34] text-white p-8 rounded-xl text-center">
                                    <h3 className="font-serif text-2xl mb-4">Questions?</h3>
                                    <p className="text-[#8BA699] mb-6">
                                        If you have any questions about these Terms, please contact us.
                                    </p>
                                    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-sm font-medium">
                                        <span>kiddosintellect@gmail.com</span>
                                        <span>+91 98798 57529</span>
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