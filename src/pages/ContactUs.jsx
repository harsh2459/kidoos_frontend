import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Mail, Phone, MapPin, Clock, HelpCircle, Package, CheckCircle, MessageSquare, Sparkles, ArrowRight
} from 'lucide-react';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FaThreads } from 'react-icons/fa6';
import ScrollToTopButton from '../components/ScrollToTopButton';

const ContactUs = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // VRINDAVAN THEME ASSETS
    const parchmentBg = "url('/images/contact/contant_bg.png')"; 
    const mandalaBg = "url('/images/flower_contant.png')";

    const contactInfo = {
        email: 'kiddosintellect@gmail.com',
        phone: '+91 98798 57529',
        whatsapp: '919879857529',
        address: {
            full: '206, Sunrise Commercial Complex, Near Savaji Korat Brg, Lajamani chowk, Shanti Niketan Society, Mota Varachha, Surat, Gujarat 394101',
            city: 'Surat',
            state: 'Gujarat',
            pincode: '394101'
        },
        hours: {
            days: 'Monday - Saturday',
            time: '9:00 AM - 6:00 PM IST',
            closed: 'Sundays and Public Holidays'
        },
        mapUrl: 'https://maps.app.goo.gl/dXqvvVwHXhVyNYb78'
    };

    const socialLinks = [
        {
            id: 'whatsapp',
            name: 'WhatsApp',
            icon: FaWhatsapp,
            link: `https://wa.me/${contactInfo.whatsapp}`,
            color: '#25D366' // Keeping brand color for recognition, but styling will be themed
        },
        {
            id: 'instagram',
            name: 'Instagram',
            icon: FaInstagram,
            link: 'https://www.instagram.com/kiddosintellect/',
            color: '#E4405F'
        },
        {
            id: 'threads',
            name: 'Threads',
            icon: FaThreads,
            link: 'https://www.threads.com/@kiddosintellect',
            color: '#000000'
        }
    ];

    return (
        <div className="bg-[#FAF7F2] font-['Lato'] text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723] min-h-screen">

            {/* --- HERO SECTION --- */}
            <div className="relative w-full pt-28 md:pt-36 pb-24 px-6 border-b border-[#D4AF37]/30 overflow-hidden">
                
                {/* Background Image Layer */}
                <div 
                    className="absolute inset-0 z-0 pointer-events-none" 
                    style={{
                        backgroundImage: parchmentBg,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 1
                    }}
                />
                
                {/* Mandala Overlay */}
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-contain bg-center bg-no-repeat opacity-[0.06] pointer-events-none z-0"
                  
                ></div>

                <div className="relative z-10 max-w-screen-2xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 mb-6 bg-white/70 backdrop-blur-sm rounded-2xl text-[#D4AF37] shadow-[0_4px_20px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/40 animate-fade-in-up">
                        <MessageSquare className="w-8 h-8" />
                    </div>

                    <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl lg:text-7xl font-bold text-[#3E2723] mb-6 tracking-tight leading-tight drop-shadow-sm">
                        Contact <span className="text-[#D4AF37] italic">Us</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-[#5C4A2E] max-w-2xl mx-auto leading-relaxed font-light">
                        We'd love to hear from you! Reach out to us through any of the channels below and we'll respond as soon as possible.
                    </p>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-16 md:py-24 relative z-10">
                
                {/* Background Pattern for Content Area */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                    style={{ backgroundImage: mandalaBg, backgroundSize: '500px' }}
                ></div>

                {/* Top Grid: Primary Contact Methods */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {/* Email Card */}
                    <a href={`mailto:${contactInfo.email}`} className="group bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)] hover:-translate-y-2 transition-all duration-300 text-center">
                        <div className="w-16 h-16 mx-auto bg-[#FFF9E6] rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#3E2723] mb-6 group-hover:bg-[#D4AF37] group-hover:text-white transition-colors duration-300">
                            <Mail className="w-7 h-7" />
                        </div>
                        <h3 className="font-['Cinzel'] font-bold text-xl text-[#3E2723] mb-2">Email Us</h3>
                        <p className="text-[#B0894C] text-sm font-bold mb-2 break-all">{contactInfo.email}</p>
                        <p className="text-[#8A7A5E] text-xs uppercase tracking-wide font-light">Response within 24 hours</p>
                    </a>

                    {/* Phone Card */}
                    <a href={`tel:${contactInfo.phone}`} className="group bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)] hover:-translate-y-2 transition-all duration-300 text-center">
                        <div className="w-16 h-16 mx-auto bg-[#FFF9E6] rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#3E2723] mb-6 group-hover:bg-[#D4AF37] group-hover:text-white transition-colors duration-300">
                            <Phone className="w-7 h-7" />
                        </div>
                        <h3 className="font-['Cinzel'] font-bold text-xl text-[#3E2723] mb-2">Call Us</h3>
                        <p className="text-[#B0894C] text-sm font-bold mb-2">{contactInfo.phone}</p>
                        <p className="text-[#8A7A5E] text-xs uppercase tracking-wide font-light">Mon-Sat, 10 AM - 6 PM IST</p>
                    </a>

                    {/* WhatsApp Card */}
                    <a href={`https://wa.me/${contactInfo.whatsapp}`} target="_blank" rel="noopener noreferrer" className="group bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)] hover:-translate-y-2 transition-all duration-300 text-center">
                        <div className="w-16 h-16 mx-auto bg-[#FFF9E6] rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#3E2723] mb-6 group-hover:bg-[#25D366] group-hover:text-white transition-colors duration-300">
                            <FaWhatsapp className="w-8 h-8" />
                        </div>
                        <h3 className="font-['Cinzel'] font-bold text-xl text-[#3E2723] mb-2">WhatsApp</h3>
                        <p className="text-[#B0894C] text-sm font-bold mb-2">{contactInfo.phone}</p>
                        <p className="text-[#8A7A5E] text-xs uppercase tracking-wide font-light">Quick responses</p>
                    </a>

                    {/* Visit Us Card */}
                    <a href={contactInfo.mapUrl} target="_blank" rel="noopener noreferrer" className="group bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)] hover:-translate-y-2 transition-all duration-300 text-center">
                        <div className="w-16 h-16 mx-auto bg-[#FFF9E6] rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#3E2723] mb-6 group-hover:bg-[#D4AF37] group-hover:text-white transition-colors duration-300">
                            <MapPin className="w-7 h-7" />
                        </div>
                        <h3 className="font-['Cinzel'] font-bold text-xl text-[#3E2723] mb-2">Visit Us</h3>
                        <p className="text-[#B0894C] text-sm font-bold mb-2">{contactInfo.address.city}, {contactInfo.address.state}</p>
                        <p className="text-[#8A7A5E] text-xs uppercase tracking-wide font-light">View on Google Maps</p>
                    </a>
                </div>

                {/* Split Layout: Details & Maps */}
                <div className="relative z-10 grid lg:grid-cols-3 gap-10">
                    
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-1 space-y-8">
                        
                        {/* Get In Touch Detailed */}
                        <div className="bg-white rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_20px_rgba(62,39,35,0.05)] p-6 md:p-8">
                            <h2 className="text-2xl font-['Cinzel'] font-bold text-[#3E2723] mb-8 border-b border-[#D4AF37]/20 pb-4">Get In Touch</h2>
                            
                            <div className="space-y-8">
                                {/* Email Row */}
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-lg bg-[#FFF9E6] flex items-center justify-center flex-shrink-0 text-[#D4AF37] border border-[#D4AF37]/20">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-[#3E2723] mb-1 font-['Cinzel']">Email</div>
                                        <a href={`mailto:${contactInfo.email}`} className="text-[#B0894C] hover:text-[#3E2723] text-sm block break-all transition-colors font-medium">{contactInfo.email}</a>
                                        <p className="text-xs text-[#8A7A5E] mt-1 italic">Response within 24 hours</p>
                                    </div>
                                </div>

                                {/* Phone Row */}
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-lg bg-[#FFF9E6] flex items-center justify-center flex-shrink-0 text-[#D4AF37] border border-[#D4AF37]/20">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-[#3E2723] mb-1 font-['Cinzel']">Phone</div>
                                        <a href={`tel:${contactInfo.phone}`} className="text-[#B0894C] hover:text-[#3E2723] text-sm block transition-colors font-medium">{contactInfo.phone}</a>
                                        <p className="text-xs text-[#8A7A5E] mt-1 italic">Mon-Sat, 10 AM - 6 PM IST</p>
                                    </div>
                                </div>

                                {/* Address Row */}
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-lg bg-[#FFF9E6] flex items-center justify-center flex-shrink-0 text-[#D4AF37] border border-[#D4AF37]/20">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-[#3E2723] mb-1 font-['Cinzel']">Address</div>
                                        <p className="text-[#5C4A2E] text-sm leading-relaxed mb-3">{contactInfo.address.full}</p>
                                        <a href={contactInfo.mapUrl} target="_blank" rel="noopener noreferrer" className="text-[#B0894C] hover:text-[#3E2723] text-sm font-bold inline-flex items-center gap-1 group">
                                            View on Google Maps <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Business Hours (Dark Wood Theme) */}
                        <div className="rounded-2xl p-8 relative overflow-hidden shadow-lg"
                             style={{ background: 'linear-gradient(135deg, #3E2723 0%, #251613 100%)' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/20 rounded-full translate-x-10 -translate-y-10 blur-2xl"></div>
                            
                            <div className="flex items-start gap-5 relative z-10">
                                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-[#F3E5AB] border border-[#D4AF37]/20">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-['Cinzel'] font-bold text-lg mb-3 text-[#F3E5AB]">Business Hours</h3>
                                    <div className="space-y-2 text-sm text-[#F4F7F5]/90">
                                        <div className="flex justify-between gap-6 pb-2 border-b border-white/10">
                                            <span>{contactInfo.hours.days}</span>
                                            <span className="text-[#D4AF37] font-bold">{contactInfo.hours.time}</span>
                                        </div>
                                        <div className="text-xs opacity-70 italic pt-1">
                                            Closed on {contactInfo.hours.closed}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media & Quick Links Group */}
                        <div className="grid grid-cols-1 gap-6">
                            {/* Social Media */}
                            <div className="bg-white rounded-2xl border border-[#D4AF37]/20 shadow-sm p-6">
                                <h3 className="font-['Cinzel'] font-bold text-lg text-[#3E2723] mb-4">Follow Us</h3>
                                <div className="flex gap-4">
                                    {socialLinks.map(social => {
                                        const IconComponent = social.icon;
                                        return (
                                            <a
                                                key={social.id}
                                                href={social.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 rounded-xl bg-[#FFF9E6] border border-[#D4AF37]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 group relative overflow-hidden"
                                                title={social.name}
                                            >
                                                {/* Background Overlay */}
                                                <div
                                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                    style={{ backgroundColor: social.color }}
                                                />
                                                {/* Icon */}
                                                <IconComponent
                                                    className="w-5 h-5 transition-colors duration-200 relative z-10 text-[#3E2723] group-hover:!text-white"
                                                />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-white rounded-2xl border border-[#D4AF37]/20 shadow-sm p-6">
                                <h3 className="font-['Cinzel'] font-bold text-lg text-[#3E2723] mb-4">Quick Links</h3>
                                <div className="space-y-3">
                                    <Link to="/faq" className="flex items-center gap-3 text-[#5C4A2E] hover:text-[#3E2723] transition-colors p-3 hover:bg-[#FFF9E6] rounded-lg group">
                                        <HelpCircle className="w-5 h-5 text-[#B0894C] group-hover:text-[#D4AF37]" />
                                        <span className="text-sm font-bold">FAQ</span>
                                    </Link>
                                    <Link to="/shipping" className="flex items-center gap-3 text-[#5C4A2E] hover:text-[#3E2723] transition-colors p-3 hover:bg-[#FFF9E6] rounded-lg group">
                                        <Package className="w-5 h-5 text-[#B0894C] group-hover:text-[#D4AF37]" />
                                        <span className="text-sm font-bold">Shipping Policy</span>
                                    </Link>
                                    <Link to="/refund" className="flex items-center gap-3 text-[#5C4A2E] hover:text-[#3E2723] transition-colors p-3 hover:bg-[#FFF9E6] rounded-lg group">
                                        <CheckCircle className="w-5 h-5 text-[#B0894C] group-hover:text-[#D4AF37]" />
                                        <span className="text-sm font-bold">Refund Policy</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Map Section (Framed in Gold) */}
                        <div className="bg-white rounded-2xl border border-[#D4AF37] p-2 shadow-lg">
                            <div className="rounded-xl overflow-hidden border border-[#D4AF37]/20 relative">
                                <div className="w-full h-80 lg:h-[32rem]">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.682747484767!2d72.8698188751532!3d21.167890780517495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f116d96b6e9%3A0x7c5b5e5e5e5e5e5e!2sSunrise%20Commercial%20Complex%2C%20Mota%20Varachha%2C%20Surat%2C%20Gujarat%20394101!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Kiddos Intellect Location"
                                        className="filter sepia-[0.3] contrast-[0.9]"
                                    ></iframe>
                                </div>
                                
                                {/* Overlay Card */}
                                <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-[#D4AF37]/30 shadow-2xl">
                                    <h3 className="font-['Cinzel'] font-bold text-lg text-[#3E2723] mb-1">Visit Our Store</h3>
                                    <p className="text-[#5C4A2E] text-xs mb-3">{contactInfo.address.city}, {contactInfo.address.state}</p>
                                    <a
                                        href={contactInfo.mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-[#3E2723] text-[#F3E5AB] hover:bg-[#5D4037] py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        Open in Google Maps
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* How Can We Help Grid */}
                        <div>
                            <h3 className="text-2xl font-['Cinzel'] font-bold text-[#3E2723] mb-6 flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                                How Can We Help?
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Product Inquiries */}
                                <div className="group bg-white p-6 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-[0_10px_30px_rgba(212,175,55,0.1)] transition-all duration-300">
                                    <div className="w-12 h-12 rounded-lg bg-[#FFF9E6] flex items-center justify-center mb-4 group-hover:bg-[#D4AF37] transition-colors">
                                        <svg className="w-6 h-6 text-[#D4AF37] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div className="font-['Cinzel'] font-bold text-[#3E2723] mb-2 text-lg">Product Inquiries</div>
                                    <p className="text-sm text-[#5C4A2E] leading-relaxed">
                                        Questions about our products, sizing, materials, or recommendations for your little one.
                                    </p>
                                </div>

                                {/* Order Support */}
                                <div className="group bg-white p-6 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-[0_10px_30px_rgba(212,175,55,0.1)] transition-all duration-300">
                                    <div className="w-12 h-12 rounded-lg bg-[#FFF9E6] flex items-center justify-center mb-4 group-hover:bg-[#D4AF37] transition-colors">
                                        <svg className="w-6 h-6 text-[#D4AF37] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <div className="font-['Cinzel'] font-bold text-[#3E2723] mb-2 text-lg">Order Support</div>
                                    <p className="text-sm text-[#5C4A2E] leading-relaxed">
                                        Track your order, modify shipping address, or inquire about delivery status.
                                    </p>
                                </div>

                                {/* Returns */}
                                <div className="group bg-white p-6 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-[0_10px_30px_rgba(212,175,55,0.1)] transition-all duration-300">
                                    <div className="w-12 h-12 rounded-lg bg-[#FFF9E6] flex items-center justify-center mb-4 group-hover:bg-[#D4AF37] transition-colors">
                                        <svg className="w-6 h-6 text-[#D4AF37] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                        </svg>
                                    </div>
                                    <div className="font-['Cinzel'] font-bold text-[#3E2723] mb-2 text-lg">Returns & Refunds</div>
                                    <p className="text-sm text-[#5C4A2E] leading-relaxed">
                                        Need help with a return, exchange, or refund? We're here to assist you.
                                    </p>
                                </div>

                                {/* Bulk Orders */}
                                <div className="group bg-white p-6 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-[0_10px_30px_rgba(212,175,55,0.1)] transition-all duration-300">
                                    <div className="w-12 h-12 rounded-lg bg-[#FFF9E6] flex items-center justify-center mb-4 group-hover:bg-[#D4AF37] transition-colors">
                                        <svg className="w-6 h-6 text-[#D4AF37] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="font-['Cinzel'] font-bold text-[#3E2723] mb-2 text-lg">Bulk Orders</div>
                                    <p className="text-sm text-[#5C4A2E] leading-relaxed">
                                        Special pricing available for schools, daycare centers, and party planners.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Banner (Dark Wood Theme) */}
                <div className="mt-24 relative overflow-hidden rounded-[2.5rem] p-10 md:p-14 text-center shadow-2xl"
                     style={{ background: 'linear-gradient(135deg, #2C1810 0%, #3E2723 100%)' }}>
                    
                    {/* Decorative Elements */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                         style={{ backgroundImage: mandalaBg, backgroundSize: '400px', backgroundRepeat: 'repeat' }}></div>
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
                    <div className="absolute inset-0 border border-[#D4AF37]/30 rounded-[2.5rem] pointer-events-none"></div>

                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h3 className="text-3xl md:text-5xl font-['Cinzel'] font-bold mb-6 text-[#F3E5AB]">We're Here to Help!</h3>
                        <p className="text-[#D4AF37]/80 mb-10 text-lg md:text-xl font-light leading-relaxed font-['Lato']">
                            Our customer support team typically responds within 24 hours on business days.
                            For urgent matters, please call us or message us on WhatsApp.
                        </p>
                        
                        <div className="flex flex-wrap gap-5 justify-center">
                            <a
                                href={`tel:${contactInfo.phone}`}
                                className="bg-white text-[#3E2723] hover:bg-[#FFF9E6] px-10 py-4 rounded-full font-bold transition-all duration-300 flex items-center gap-3 shadow-lg hover:-translate-y-1"
                            >
                                <Phone className="w-5 h-5" />
                                Call Now
                            </a>
                            <a
                                href={`https://wa.me/${contactInfo.whatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#25D366] text-white hover:bg-[#20b857] px-10 py-4 rounded-full font-bold transition-all duration-300 flex items-center gap-3 shadow-lg hover:-translate-y-1"
                            >
                                <FaWhatsapp className="w-5 h-5" />
                                WhatsApp Us
                            </a>
                            <a
                                href={`mailto:${contactInfo.email}`}
                                className="bg-transparent border border-[#D4AF37] text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-[#3E2723] px-10 py-4 rounded-full font-bold transition-all duration-300 flex items-center gap-3 hover:-translate-y-1"
                            >
                                <Mail className="w-5 h-5" />
                                Email Us
                            </a>
                        </div>
                    </div>
                </div>

            </div>

            {/* Scroll to Top Button */}
            <ScrollToTopButton />
        </div>
    );
};

export default ContactUs;