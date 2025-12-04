import React, { useEffect, useState } from 'react';
import { 
    Package, Truck, MapPin, Clock, Shield, AlertCircle, 
    Search, CreditCard, Banknote, ChevronRight 
} from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';

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

    // Using the same background texture as Terms & Conditions for consistency
    const bgImage = "url('/images/terms-bg.png')"; 

    return (
        <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34]">
            
            {/* --- HERO SECTION WITH BACKGROUND IMAGE --- */}
            <div className="relative w-full pt-20 md:pt-24 pb-16 px-6 border-b border-[#E3E8E5] overflow-hidden bg-[#F4F7F5]">
                
                {/* 1. BACKGROUND IMAGE LAYER */}
                <div 
                    className="absolute inset-0 z-0 pointer-events-none opacity-50 mix-blend-multiply" 
                    style={{
                        backgroundImage: bgImage,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                        // CSS Filters to match the Sage/Green theme
                        filter: 'sepia(1) hue-rotate(70deg) saturate(0.5)' 
                    }}
                />
                
                {/* 2. GRADIENT OVERLAY */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#F4F7F5]/60 to-[#F4F7F5] pointer-events-none"></div>

                {/* 3. TEXT CONTENT */}
                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 mb-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm ring-1 ring-[#DCE4E0]">
                        <Truck className="w-8 h-8 md:w-10 md:h-10 text-[#1A3C34]" />
                    </div>
                    
                    <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-[#1A3C34] mb-6 tracking-tight leading-tight drop-shadow-sm">
                        Shipping Policy
                    </h1>
                    
                    <p className="text-lg md:text-xl text-[#5C756D] font-light max-w-2xl mx-auto leading-relaxed">
                        Fast, reliable, and FREE shipping across India. Learn about our delivery process and timelines.
                    </p>

                    <div className="mt-8 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur-md text-[#2F523F] text-xs font-bold uppercase tracking-widest border border-[#DCE4E0] shadow-sm">
                        Last Updated: December 03, 2025
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT CONTAINER --- */}
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
                                    <Package className="w-6 h-6 text-[#4A7C59]" />
                                    1. Overview
                                </h2>
                                <div className="prose prose-slate max-w-none text-[#4A5D56] leading-relaxed">
                                    <p className="mb-4">
                                        At <strong>Kiddos Intellect</strong>, we believe that quality educational books should reach every child across India. We offer <span className="font-medium text-[#4A7C59]">FREE shipping on all orders</span> with fast and reliable delivery through our trusted courier partner, BlueDart.
                                    </p>
                                    <p className="mb-6">
                                        This Shipping Policy outlines the terms and conditions under which we process and deliver your orders. By placing an order with us, you acknowledge that you have read, understood, and agree to the terms of this policy.
                                    </p>
                                    <div className="bg-[#E8F0EB] border-l-4 border-[#4A7C59] p-5 rounded-r-lg">
                                        <h4 className="font-bold text-[#1A3C34] text-sm mb-1 flex items-center gap-2">
                                            <Package className="w-4 h-4 text-[#4A7C59]" />
                                            FREE Shipping Across India
                                        </h4>
                                        <p className="text-sm text-[#4A5D56]">
                                            Enjoy absolutely FREE shipping on every order, no minimum purchase required. We deliver fun and knowledge-filled books for children to every corner of India!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Order Processing */}
                        <section id="processing" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Clock className="w-6 h-6 text-[#4A7C59]" />
                                    2. Order Processing
                                </h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <p>
                                        All orders are processed within <span className="font-bold text-[#1A3C34]">1-2 business days</span> (Monday to Saturday, excluding public holidays and Sundays). Orders placed after 5:00 PM IST will be processed the next business day.
                                    </p>
                                    
                                    <div className="bg-[#FAFBF9] p-5 rounded-xl border border-[#EBEFEA]">
                                        <h3 className="font-serif font-bold text-[#1A3C34] mb-4">Processing Timeline</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-[#1A3C34] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <h4 className="font-bold text-[#1A3C34] text-sm">Order Confirmation</h4>
                                                    <p className="text-xs">Instant email confirmation sent.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-[#1A3C34] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <h4 className="font-bold text-[#1A3C34] text-sm">Payment Verification</h4>
                                                    <p className="text-xs">Online payments verified in 1-2 hours.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-[#1A3C34] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <h4 className="font-bold text-[#1A3C34] text-sm">Order Packing</h4>
                                                    <p className="text-xs">Books quality-checked & packed.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-[#4A7C59] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                                                <div>
                                                    <h4 className="font-bold text-[#1A3C34] text-sm">Shipment Dispatch</h4>
                                                    <p className="text-xs">Tracking number sent via SMS/Email.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-[#FFF9F0] border border-[#F5E6D3] rounded-lg">
                                        <h4 className="font-bold text-[#8A6A4B] text-sm mb-1">Stock Availability</h4>
                                        <p className="text-sm text-[#5C4D40]">
                                            If an item is out of stock, we will notify you within 24 hours with options to wait for restock or receive a full refund.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Payment Options */}
                        <section id="payment" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <CreditCard className="w-6 h-6 text-[#4A7C59]" />
                                    3. Payment Options
                                </h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <p>
                                        We offer flexible payment options to make your shopping experience convenient and secure.
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Half COD */}
                                        <div className="bg-[#FAFBF9] p-6 rounded-xl border-2 border-[#4A7C59]/30">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-[#E8F0EB] rounded-full flex items-center justify-center">
                                                    <Banknote className="w-5 h-5 text-[#4A7C59]" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#1A3C34]">Half COD + Half Online</h4>
                                                    <span className="text-xs font-bold text-[#4A7C59] uppercase tracking-wider">Most Popular</span>
                                                </div>
                                            </div>
                                            <ul className="text-sm space-y-2 list-disc pl-4 text-[#5C756D]">
                                                <li>Pay <strong>50%</strong> during online checkout.</li>
                                                <li>Pay remaining <strong>50%</strong> in cash on delivery.</li>
                                                <li>No additional fees.</li>
                                            </ul>
                                        </div>

                                        {/* Full Online */}
                                        <div className="bg-[#FAFBF9] p-6 rounded-xl border border-[#EBEFEA]">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-[#E8F0EB] rounded-full flex items-center justify-center">
                                                    <CreditCard className="w-5 h-5 text-[#4A7C59]" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#1A3C34]">Full Online Payment</h4>
                                                    <span className="text-xs font-bold text-[#4A7C59] uppercase tracking-wider">100% Prepaid</span>
                                                </div>
                                            </div>
                                            <ul className="text-sm space-y-2 list-disc pl-4 text-[#5C756D]">
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
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Truck className="w-6 h-6 text-[#4A7C59]" />
                                    4. Delivery Timeline
                                </h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <p>
                                        We partner with <strong className="text-[#1A3C34]">BlueDart</strong> to ensure your books reach you safely.
                                    </p>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-[#F4F7F5] rounded-xl border border-[#DCE4E0] text-center">
                                            <MapPin className="w-6 h-6 text-[#4A7C59] mx-auto mb-2" />
                                            <h5 className="font-bold text-[#1A3C34] mb-1">Metro Cities</h5>
                                            <p className="text-2xl font-serif font-bold text-[#4A7C59]">3-5</p>
                                            <p className="text-xs uppercase tracking-wider">Business Days</p>
                                        </div>
                                        <div className="p-4 bg-[#F4F7F5] rounded-xl border border-[#DCE4E0] text-center">
                                            <MapPin className="w-6 h-6 text-[#8A6A4B] mx-auto mb-2" />
                                            <h5 className="font-bold text-[#1A3C34] mb-1">Other Areas</h5>
                                            <p className="text-2xl font-serif font-bold text-[#8A6A4B]">5-7</p>
                                            <p className="text-xs uppercase tracking-wider">Business Days</p>
                                        </div>
                                        <div className="p-4 bg-[#F4F7F5] rounded-xl border border-[#DCE4E0] text-center">
                                            <MapPin className="w-6 h-6 text-[#5C756D] mx-auto mb-2" />
                                            <h5 className="font-bold text-[#1A3C34] mb-1">Remote Areas</h5>
                                            <p className="text-2xl font-serif font-bold text-[#5C756D]">7-10</p>
                                            <p className="text-xs uppercase tracking-wider">Business Days</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 5. Delivery Coverage */}
                        <section id="coverage" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">5. Delivery Coverage</h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <div className="bg-[#E8F0EB] p-5 rounded-xl border border-[#DCE4E0]">
                                        <h4 className="font-bold text-[#1A3C34] mb-2 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-[#4A7C59]" />
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
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Search className="w-6 h-6 text-[#4A7C59]" />
                                    6. Order Tracking
                                </h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <p>
                                        Once dispatched, you will receive an <strong>AWB (Air Waybill)</strong> number via SMS/Email.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-5 bg-[#FAFBF9] border border-[#EBEFEA] rounded-xl">
                                            <h4 className="font-bold text-[#1A3C34] mb-2">Via BlueDart Website</h4>
                                            <ol className="list-decimal pl-5 text-sm space-y-1">
                                                <li>Visit <a href="#" className="text-[#4A7C59] underline">bluedart.com</a></li>
                                                <li>Click 'TrackDart'</li>
                                                <li>Enter your AWB number</li>
                                            </ol>
                                        </div>
                                        <div className="p-5 bg-[#FAFBF9] border border-[#EBEFEA] rounded-xl">
                                            <h4 className="font-bold text-[#1A3C34] mb-2">Via Your Account</h4>
                                            <ol className="list-decimal pl-5 text-sm space-y-1">
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
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">7. Delivery Process</h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <ul className="space-y-3">
                                        <li className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-[#E8F0EB] text-[#1A3C34] flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                                            <span><strong>Attempt 1:</strong> Delivery agent calls before arriving during business hours.</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-[#E8F0EB] text-[#1A3C34] flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                                            <span><strong>Attempt 2:</strong> If missed, a second attempt is made the next business day.</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-[#E8F0EB] text-[#1A3C34] flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
                                            <span><strong>Return:</strong> After 3 failed attempts, the package returns to us. Re-shipping fees apply.</span>
                                        </li>
                                    </ul>
                                    <div className="p-4 bg-[#F4F7F5] rounded-lg text-sm">
                                        <strong>Note:</strong> Open and inspect the package immediately upon delivery. For COD, please have exact cash ready.
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 8. Packaging */}
                        <section id="packaging" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <Package className="w-6 h-6 text-[#4A7C59]" />
                                    8. Packaging Standards
                                </h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <p>
                                        We ensure your books arrive in pristine condition.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-[#FAFBF9] p-4 rounded-xl border border-[#EBEFEA]">
                                            <h4 className="font-bold text-[#1A3C34] text-sm mb-2">Single Books</h4>
                                            <ul className="list-disc pl-5 text-sm space-y-1">
                                                <li>Bubble wrapped</li>
                                                <li>Sturdy cardboard envelope</li>
                                                <li>Water-resistant layer</li>
                                            </ul>
                                        </div>
                                        <div className="bg-[#FAFBF9] p-4 rounded-xl border border-[#EBEFEA]">
                                            <h4 className="font-bold text-[#1A3C34] text-sm mb-2">Bulk Orders</h4>
                                            <ul className="list-disc pl-5 text-sm space-y-1">
                                                <li>5-ply corrugated box</li>
                                                <li>Eco-friendly cushioning</li>
                                                <li>"Fragile" labeling</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-[#4A7C59] font-bold bg-[#E8F0EB] p-3 rounded-lg inline-block">
                                        <Shield className="w-4 h-4" />
                                        100% Eco-Friendly & Recyclable Materials
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 9. Delays */}
                        <section id="delays" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">9. Delays & Issues</h2>
                                <div className="space-y-4 text-[#4A5D56] leading-relaxed">
                                    <p>
                                        While rare, delays can occur due to weather, festivals, or strikes.
                                    </p>
                                    <div className="p-4 bg-[#FFF9F0] border border-[#F5E6D3] rounded-lg">
                                        <h4 className="font-bold text-[#8A6A4B] text-sm mb-1">What to do?</h4>
                                        <ol className="list-decimal pl-5 text-sm space-y-1 text-[#5C4D40]">
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
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6 flex items-center gap-3">
                                    <AlertCircle className="w-6 h-6 text-[#4A7C59]" />
                                    10. Lost or Damaged
                                </h2>
                                <div className="space-y-6 text-[#4A5D56] leading-relaxed">
                                    <div className="bg-[#FAFBF9] border border-[#EBEFEA] p-5 rounded-xl">
                                        <h4 className="font-bold text-[#1A3C34] mb-2">Damaged on Arrival?</h4>
                                        <p className="text-sm mb-3">
                                            <strong>Report within 48 hours.</strong> Take photos of the damage and the outer box.
                                        </p>
                                        <ul className="text-sm space-y-1 list-disc pl-5">
                                            <li>Do NOT accept if outer box is crushed.</li>
                                            <li>Note damage on delivery receipt.</li>
                                            <li>We will ship a free replacement immediately.</li>
                                        </ul>
                                    </div>
                                    <div className="bg-[#FAFBF9] border border-[#EBEFEA] p-5 rounded-xl">
                                        <h4 className="font-bold text-[#1A3C34] mb-2">Lost Package?</h4>
                                        <p className="text-sm">
                                            If tracking shows "No Movement" for 7 days, we will file a claim and issue a full refund or replacement.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 11. Address */}
                        <section id="address" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">11. Address Requirements</h2>
                                <div className="space-y-4 text-[#4A5D56] leading-relaxed">
                                    <p>
                                        Ensure your address is complete to avoid returns.
                                    </p>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>Full Name & Valid Mobile Number</li>
                                        <li>House No, Building Name, Street</li>
                                        <li>Landmark (e.g., Near School)</li>
                                        <li>Correct 6-digit PIN Code</li>
                                    </ul>
                                    <p className="text-sm text-[#8A6A4B] font-medium mt-2">
                                        ⚠ Address cannot be changed once shipped.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 12. Contact */}
                        <section id="contact" className="scroll-mt-32">
                            <div className="bg-white p-6 md:p-8 lg:p-10 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C34] mb-6">12. Contact Support</h2>
                                <p className="text-[#4A5D56] mb-6">
                                    Need help with your shipment?
                                </p>
                                <div className="bg-[#1A3C34] text-white p-8 rounded-xl text-center">
                                    <div className="flex flex-col sm:flex-row justify-center gap-8 text-sm font-medium">
                                        <span>kiddosintellect@gmail.com</span>
                                        <span>+91 98798 57529</span>
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

export default ShippingPolicy;