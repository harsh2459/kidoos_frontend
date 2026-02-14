import React, { useEffect, useState } from 'react';
import {
    Package, Truck, MapPin, Clock, Shield, AlertCircle,
    Search, CreditCard, Banknote, ChevronRight
} from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';
import SEO from '../components/SEO';

const ShippingPolicy = () => {
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
        { id: 'processing', label: '2. Order Processing' },
        { id: 'payment', label: '3. Payment Options' },
        { id: 'delivery', label: '4. Delivery Timeline' },
        { id: 'coverage', label: '5. Delivery Coverage' },
        { id: 'tracking', label: '6. Order Tracking' },
        { id: 'process', label: '7. Delivery Process' },
        { id: 'packaging', label: '8. Packaging Standards' },
        { id: 'delays', label: '9. Delays & Issues' },
        { id: 'damaged', label: '10. Lost or Damaged' },
        { id: 'address', label: '11. Address Requirements' },
        { id: 'contact', label: '12. Contact Support' },
    ];

    // VRINDAVAN THEME ASSETS
    const parchmentBg = "url('/images-webp/homepage/parchment-bg.webp')";
    const heroBg = "url('/images-webp/shipping-map-bg.webp')"; // New Hero Image
    const mandalaBg = "url('/images-webp/homepage/mandala-bg.webp')";

    return (
        <div className="bg-[#FAF7F2] min-h-screen font-['Lato'] text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723]">
            <SEO
                title="Shipping Policy | Kiddos Intellect"
                description="Learn about our shipping policy, delivery times, shipping charges, and order tracking. We deliver premium children's books across India with care."
                keywords="shipping policy, delivery information, book delivery, India shipping, order tracking"
                breadcrumbs={[
                    { name: "Home", url: "/" },
                    { name: "Shipping Policy", url: "/shipping" }
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
                        <Truck className="w-8 h-8 md:w-10 md:h-10 text-[#D4AF37]" />
                    </div>
                    
                    <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl lg:text-7xl font-bold text-[#3E2723] mb-6 tracking-tight leading-tight drop-shadow-sm">
                        Shipping <span className="text-[#D4AF37] italic">Policy</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-[#5C4A2E] font-light max-w-2xl mx-auto leading-relaxed">
                        Fast, reliable, and FREE shipping across India. Learn about our delivery process and timelines.
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
                                    <Package className="w-6 h-6 text-[#D4AF37]" />
                                    1. Overview
                                </h2>
                                <div className="prose prose-slate max-w-none text-[#5C4A2E] leading-relaxed">
                                    <p className="mb-6 text-lg">
                                        At <strong>Kiddos Intellect</strong>, we believe that quality educational books should reach every child across India. We offer <span className="font-bold text-[#D4AF37]">FREE shipping on all orders</span> with fast and reliable delivery through our trusted courier partner, BlueDart.
                                    </p>
                                    <div className="bg-[#FFF9E6] border-l-4 border-[#D4AF37] p-6 rounded-r-xl">
                                        <h4 className="font-bold text-[#3E2723] text-sm mb-2 flex items-center gap-2 font-['Cinzel']">
                                            <Package className="w-4 h-4 text-[#D4AF37]" />
                                            FREE Shipping Across India
                                        </h4>
                                        <p className="text-sm text-[#5C4A2E]">
                                            Enjoy absolutely FREE shipping on every order, no minimum purchase required. We deliver fun and knowledge-filled books for children to every corner of India!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Order Processing */}
                        <section id="processing" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Clock className="w-6 h-6 text-[#D4AF37]" />
                                    2. Order Processing
                                </h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <p className="text-lg">
                                        All orders are processed within <span className="font-bold text-[#3E2723]">1-2 business days</span> (Monday to Saturday, excluding public holidays and Sundays). Orders placed after 5:00 PM IST will be processed the next business day.
                                    </p>
                                    
                                    <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#E3DCC8]">
                                        <h3 className="font-['Cinzel'] font-bold text-[#3E2723] mb-6 text-lg">Processing Timeline</h3>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {[
                                                { step: "1", title: "Order Confirmation", desc: "Instant email confirmation sent." },
                                                { step: "2", title: "Payment Verification", desc: "Online payments verified in 1-2 hours." },
                                                { step: "3", title: "Order Packing", desc: "Books quality-checked & packed." },
                                                { step: "4", title: "Shipment Dispatch", desc: "Tracking number sent via SMS/Email." }
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-start gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-[#3E2723] text-[#F3E5AB] flex items-center justify-center text-sm font-bold flex-shrink-0 border border-[#D4AF37]">
                                                        {item.step}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-[#3E2723] text-sm font-['Cinzel']">{item.title}</h4>
                                                        <p className="text-xs text-[#5C4A2E]">{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-5 bg-[#FFF9E6] border border-[#D4AF37]/30 rounded-xl">
                                        <h4 className="font-bold text-[#B0894C] text-sm mb-1 font-['Cinzel']">Stock Availability</h4>
                                        <p className="text-sm text-[#5C4A2E]">
                                            If an item is out of stock, we will notify you within 24 hours with options to wait for restock or receive a full refund.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Payment Options */}
                        <section id="payment" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <CreditCard className="w-6 h-6 text-[#D4AF37]" />
                                    3. Payment Options
                                </h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <p className="text-lg">
                                        We offer flexible payment options to make your shopping experience convenient and secure.
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Half COD */}
                                        <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#D4AF37] shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 bg-[#D4AF37] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">Popular</div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-[#FFF9E6] rounded-full flex items-center justify-center border border-[#D4AF37]/30">
                                                    <Banknote className="w-5 h-5 text-[#D4AF37]" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#3E2723] font-['Cinzel']">Half COD + Half Online</h4>
                                                </div>
                                            </div>
                                            <ul className="text-sm space-y-2 list-disc pl-4 text-[#5C4A2E] marker:text-[#D4AF37]">
                                                <li>Pay <strong>50%</strong> during online checkout.</li>
                                                <li>Pay remaining <strong>50%</strong> in cash on delivery.</li>
                                                <li>No additional fees.</li>
                                            </ul>
                                        </div>

                                        {/* Full Online */}
                                        <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#E3DCC8] shadow-sm">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-[#FFF9E6] rounded-full flex items-center justify-center border border-[#D4AF37]/30">
                                                    <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#3E2723] font-['Cinzel']">Full Online Payment</h4>
                                                </div>
                                            </div>
                                            <ul className="text-sm space-y-2 list-disc pl-4 text-[#5C4A2E] marker:text-[#D4AF37]">
                                                <li>UPI, Credit/Debit Cards, Net Banking.</li>
                                                <li>Faster order processing.</li>
                                                <li>Secure encryption via trusted gateways.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. Delivery Timeline */}
                        <section id="delivery" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Truck className="w-6 h-6 text-[#D4AF37]" />
                                    4. Delivery Timeline
                                </h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <p className="text-lg">
                                        We partner with <strong className="text-[#3E2723]">BlueDart</strong> to ensure your books reach you safely.
                                    </p>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        {[
                                            { zone: "Metro Cities", days: "3-5", color: "#3E2723" },
                                            { zone: "Other Areas", days: "5-7", color: "#B0894C" },
                                            { zone: "Remote Areas", days: "7-10", color: "#8A7A5E" }
                                        ].map((item, idx) => (
                                            <div key={idx} className="p-6 bg-[#FAF7F2] rounded-xl border border-[#E3DCC8] text-center hover:border-[#D4AF37] transition-all">
                                                <MapPin className="w-6 h-6 mx-auto mb-3 text-[#D4AF37]" />
                                                <h5 className="font-bold text-[#3E2723] mb-1 font-['Cinzel']">{item.zone}</h5>
                                                <p className="text-3xl font-['Playfair_Display'] font-bold mb-1" style={{ color: item.color }}>{item.days}</p>
                                                <p className="text-xs uppercase tracking-wider text-[#8A7A5E]">Business Days</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 5. Delivery Coverage */}
                        <section id="coverage" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">5. Delivery Coverage</h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <div className="bg-[#FFF9E6] p-6 rounded-xl border border-[#D4AF37]/30">
                                        <h4 className="font-bold text-[#3E2723] mb-2 flex items-center gap-2 font-['Cinzel']">
                                            <MapPin className="w-4 h-4 text-[#D4AF37]" />
                                            Pan-India Delivery
                                        </h4>
                                        <p className="text-sm">
                                            We deliver to <strong>all serviceable PIN codes across India</strong> via BlueDart. From metros to remote villages, we bring knowledge to every child.
                                        </p>
                                    </div>
                                    <p>
                                        You can check delivery availability by entering your PIN code on the product page. If your location is unserviceable, we will notify you before payment.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 6. Order Tracking */}
                        <section id="tracking" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Search className="w-6 h-6 text-[#D4AF37]" />
                                    6. Order Tracking
                                </h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <p className="text-lg">
                                        Once dispatched, you will receive an <strong>AWB (Air Waybill)</strong> number via SMS/Email.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="p-6 bg-[#FAF7F2] border border-[#E3DCC8] rounded-xl">
                                            <h4 className="font-bold text-[#3E2723] mb-3 font-['Cinzel']">Via BlueDart Website</h4>
                                            <ol className="list-decimal pl-5 text-sm space-y-2 marker:text-[#D4AF37]">
                                                <li>Visit <a href="#" className="text-[#B0894C] underline font-bold">bluedart.com</a></li>
                                                <li>Click 'TrackDart'</li>
                                                <li>Enter your AWB number</li>
                                            </ol>
                                        </div>
                                        <div className="p-6 bg-[#FAF7F2] border border-[#E3DCC8] rounded-xl">
                                            <h4 className="font-bold text-[#3E2723] mb-3 font-['Cinzel']">Via Your Account</h4>
                                            <ol className="list-decimal pl-5 text-sm space-y-2 marker:text-[#D4AF37]">
                                                <li>Login to Kiddos Intellect</li>
                                                <li>Go to 'My Orders'</li>
                                                <li>Select 'Track Order'</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 7. Delivery Process */}
                        <section id="process" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">7. Delivery Process</h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <ul className="space-y-4">
                                        {[
                                            { num: "1", text: "Attempt 1: Delivery agent calls before arriving during business hours." },
                                            { num: "2", text: "Attempt 2: If missed, a second attempt is made the next business day." },
                                            { num: "3", text: "Return: After 3 failed attempts, the package returns to us. Re-shipping fees apply." }
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex gap-4 items-start">
                                                <div className="w-6 h-6 rounded-full bg-[#3E2723] text-[#F3E5AB] flex items-center justify-center font-bold text-xs flex-shrink-0 border border-[#D4AF37] mt-1">{item.num}</div>
                                                <span className="text-lg">{item.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="p-5 bg-[#FAF7F2] rounded-xl text-sm border border-[#E3DCC8]">
                                        <strong>Note:</strong> Open and inspect the package immediately upon delivery. For COD, please have exact cash ready.
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 8. Packaging */}
                        <section id="packaging" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <Package className="w-6 h-6 text-[#D4AF37]" />
                                    8. Packaging Standards
                                </h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <p className="text-lg">
                                        We ensure your books arrive in pristine condition.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-[#FAF7F2] p-5 rounded-xl border border-[#E3DCC8]">
                                            <h4 className="font-bold text-[#3E2723] text-sm mb-2 font-['Cinzel']">Single Books</h4>
                                            <ul className="list-disc pl-5 text-sm space-y-2 marker:text-[#D4AF37]">
                                                <li>Bubble wrapped</li>
                                                <li>Sturdy cardboard envelope</li>
                                                <li>Water-resistant layer</li>
                                            </ul>
                                        </div>
                                        <div className="bg-[#FAF7F2] p-5 rounded-xl border border-[#E3DCC8]">
                                            <h4 className="font-bold text-[#3E2723] text-sm mb-2 font-['Cinzel']">Bulk Orders</h4>
                                            <ul className="list-disc pl-5 text-sm space-y-2 marker:text-[#D4AF37]">
                                                <li>5-ply corrugated box</li>
                                                <li>Eco-friendly cushioning</li>
                                                <li>"Fragile" labeling</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-[#3E2723] font-bold bg-[#FFF9E6] p-4 rounded-xl inline-block border border-[#D4AF37]/30">
                                        <Shield className="w-5 h-5 text-[#D4AF37]" />
                                        100% Eco-Friendly & Recyclable Materials
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 9. Delays */}
                        <section id="delays" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">9. Delays & Issues</h2>
                                <div className="space-y-4 text-[#5C4A2E] leading-relaxed">
                                    <p className="text-lg">
                                        While rare, delays can occur due to weather, festivals, or strikes.
                                    </p>
                                    <div className="p-5 bg-[#FAF7F2] border border-[#E3DCC8] rounded-xl">
                                        <h4 className="font-bold text-[#B0894C] text-sm mb-2 font-['Cinzel']">What to do?</h4>
                                        <ol className="list-decimal pl-5 text-sm space-y-2 text-[#5C4A2E] marker:text-[#D4AF37]">
                                            <li>Check tracking status.</li>
                                            <li>Allow 1-2 extra days for updates.</li>
                                            <li>Contact our support with your Order ID.</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 10. Damaged */}
                        <section id="damaged" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
                                    <AlertCircle className="w-6 h-6 text-[#D4AF37]" />
                                    10. Lost or Damaged
                                </h2>
                                <div className="space-y-6 text-[#5C4A2E] leading-relaxed">
                                    <div className="bg-[#FAF7F2] border border-[#E3DCC8] p-6 rounded-xl">
                                        <h4 className="font-bold text-[#3E2723] mb-3 font-['Cinzel']">Damaged on Arrival?</h4>
                                        <p className="text-sm mb-3">
                                            <strong>Report within 48 hours.</strong> Take photos of the damage and the outer box.
                                        </p>
                                        <ul className="text-sm space-y-2 list-disc pl-5 marker:text-[#D4AF37]">
                                            <li>Do NOT accept if outer box is crushed.</li>
                                            <li>Note damage on delivery receipt.</li>
                                            <li>We will ship a free replacement immediately.</li>
                                        </ul>
                                    </div>
                                    <div className="bg-[#FAF7F2] border border-[#E3DCC8] p-6 rounded-xl">
                                        <h4 className="font-bold text-[#3E2723] mb-3 font-['Cinzel']">Lost Package?</h4>
                                        <p className="text-sm">
                                            If tracking shows "No Movement" for 7 days, we will file a claim and issue a full refund or replacement.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 11. Address */}
                        <section id="address" className="scroll-mt-32">
                            <div className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)]">
                                <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold text-[#3E2723] mb-6 border-b border-[#D4AF37]/20 pb-4">11. Address Requirements</h2>
                                <div className="space-y-4 text-[#5C4A2E] leading-relaxed">
                                    <p className="text-lg">
                                        Ensure your address is complete to avoid returns.
                                    </p>
                                    <ul className="list-disc pl-5 text-sm space-y-2 marker:text-[#D4AF37]">
                                        <li>Full Name & Valid Mobile Number</li>
                                        <li>House No, Building Name, Street</li>
                                        <li>Landmark (e.g., Near School)</li>
                                        <li>Correct 6-digit PIN Code</li>
                                    </ul>
                                    <p className="text-sm text-[#B0894C] font-bold mt-2 font-['Cinzel']">
                                        ⚠ Address cannot be changed once shipped.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 12. Contact (Dark Wood Theme) */}
                        <section id="contact" className="scroll-mt-32">
                            <div className="bg-gradient-to-br from-[#3E2723] to-[#2C1810] text-[#F3E5AB] p-10 md:p-14 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                                {/* Mandala Watermark */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                                     style={{ backgroundImage: mandalaBg, backgroundSize: '300px', backgroundRepeat: 'repeat' }}></div>
                                
                                <div className="relative z-10 text-center">
                                    <h2 className="font-['Cinzel'] text-2xl md:text-4xl font-bold mb-6 flex items-center justify-center gap-3">
                                        <Truck className="w-8 h-8 text-[#D4AF37]" />
                                        12. Contact Support
                                    </h2>
                                    <p className="text-[#D4AF37]/90 mb-10 text-lg">
                                        Need help with your shipment? We are here to assist.
                                    </p>
                                    
                                    <div className="flex flex-col sm:flex-row justify-center gap-6 text-base font-medium">
                                        <span className="flex items-center gap-3 justify-center bg-white/10 px-6 py-3 rounded-full border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 transition-colors">
                                            kiddosintellect@gmail.com
                                        </span>
                                        <span className="flex items-center gap-3 justify-center bg-white/10 px-6 py-3 rounded-full border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 transition-colors">
                                            +91 98798 57529
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

export default ShippingPolicy;