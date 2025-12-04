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

    // Consistent background texture
    const bgImage = "url('/images/terms-bg.png')";

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
            color: '#25D366'
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
        <div className="bg-[#F4F7F5] font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34] min-h-screen">

            {/* --- HERO SECTION --- */}
            <div className="relative w-full pt-20 md:pt-32 pb-20 px-6 border-b border-[#E3E8E5] overflow-hidden bg-[#F4F7F5]">
                
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

                <div className="relative z-10 max-w-screen-2xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 mb-6 bg-white/80 backdrop-blur-sm rounded-2xl text-[#4A7C59] shadow-sm ring-1 ring-[#DCE4E0] animate-fade-in-up">
                        <MessageSquare className="w-8 h-8" />
                    </div>

                    <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-[#1A3C34] mb-6 tracking-tight leading-tight drop-shadow-sm">
                        Contact <span className="text-[#4A7C59] italic">Us</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-[#5C756D] max-w-2xl mx-auto leading-relaxed font-light">
                        We'd love to hear from you! Reach out to us through any of the channels below and we'll respond as soon as possible.
                    </p>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-12 md:py-20 relative z-10">

                {/* Top Grid: Primary Contact Methods */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {/* Email Card */}
                    <a href={`mailto:${contactInfo.email}`} className="group bg-white p-8 rounded-2xl border border-[#E3E8E5] hover:border-[#4A7C59] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
                        <div className="w-14 h-14 mx-auto bg-[#F4F7F5] rounded-xl flex items-center justify-center text-[#1A3C34] mb-6 group-hover:bg-[#E8F0EB] group-hover:text-[#4A7C59] transition-colors duration-300">
                            <Mail className="w-7 h-7" />
                        </div>
                        <h3 className="font-serif font-bold text-xl text-[#1A3C34] mb-2">Email Us</h3>
                        <p className="text-[#4A7C59] text-sm font-medium mb-2 break-all">{contactInfo.email}</p>
                        <p className="text-[#8BA699] text-xs uppercase tracking-wide">Response within 24 hours</p>
                    </a>

                    {/* Phone Card */}
                    <a href={`tel:${contactInfo.phone}`} className="group bg-white p-8 rounded-2xl border border-[#E3E8E5] hover:border-[#4A7C59] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
                        <div className="w-14 h-14 mx-auto bg-[#F4F7F5] rounded-xl flex items-center justify-center text-[#1A3C34] mb-6 group-hover:bg-green-50 group-hover:text-green-600 transition-colors duration-300">
                            <Phone className="w-7 h-7" />
                        </div>
                        <h3 className="font-serif font-bold text-xl text-[#1A3C34] mb-2">Call Us</h3>
                        <p className="text-[#4A7C59] text-sm font-medium mb-2">{contactInfo.phone}</p>
                        <p className="text-[#8BA699] text-xs uppercase tracking-wide">Mon-Sat, 10 AM - 6 PM IST</p>
                    </a>

                    {/* WhatsApp Card */}
                    <a href={`https://wa.me/${contactInfo.whatsapp}`} target="_blank" rel="noopener noreferrer" className="group bg-white p-8 rounded-2xl border border-[#E3E8E5] hover:border-[#4A7C59] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
                        <div className="w-14 h-14 mx-auto bg-[#F4F7F5] rounded-xl flex items-center justify-center text-[#1A3C34] mb-6 group-hover:bg-[#25D366]/10 group-hover:text-[#25D366] transition-colors duration-300">
                            <FaWhatsapp className="w-7 h-7" />
                        </div>
                        <h3 className="font-serif font-bold text-xl text-[#1A3C34] mb-2">WhatsApp</h3>
                        <p className="text-[#4A7C59] text-sm font-medium mb-2">{contactInfo.phone}</p>
                        <p className="text-[#8BA699] text-xs uppercase tracking-wide">Quick responses</p>
                    </a>

                    {/* Visit Us Card */}
                    <a href={contactInfo.mapUrl} target="_blank" rel="noopener noreferrer" className="group bg-white p-8 rounded-2xl border border-[#E3E8E5] hover:border-[#4A7C59] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
                        <div className="w-14 h-14 mx-auto bg-[#F4F7F5] rounded-xl flex items-center justify-center text-[#1A3C34] mb-6 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
                            <MapPin className="w-7 h-7" />
                        </div>
                        <h3 className="font-serif font-bold text-xl text-[#1A3C34] mb-2">Visit Us</h3>
                        <p className="text-[#4A7C59] text-sm font-medium mb-2">{contactInfo.address.city}, {contactInfo.address.state}</p>
                        <p className="text-[#8BA699] text-xs uppercase tracking-wide">View on Google Maps</p>
                    </a>
                </div>

                {/* Split Layout: Details & Maps */}
                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Get In Touch Detailed */}
                        <div className="bg-white rounded-2xl border border-[#E3E8E5] shadow-sm p-6 md:p-8">
                            <h2 className="text-2xl font-serif font-bold text-[#1A3C34] mb-6">Get In Touch</h2>
                            
                            <div className="space-y-6">
                                {/* Email Row */}
                                <div className="flex items-start gap-4 pb-6 border-b border-[#E3E8E5]">
                                    <div className="w-10 h-10 rounded-lg bg-[#E8F0EB] flex items-center justify-center flex-shrink-0 text-[#4A7C59]">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-[#1A3C34] mb-1">Email</div>
                                        <a href={`mailto:${contactInfo.email}`} className="text-[#4A7C59] hover:text-[#2F523F] text-sm block break-all transition-colors">{contactInfo.email}</a>
                                        <p className="text-xs text-[#8BA699] mt-1">Response within 24 hours</p>
                                    </div>
                                </div>

                                {/* Phone Row */}
                                <div className="flex items-start gap-4 pb-6 border-b border-[#E3E8E5]">
                                    <div className="w-10 h-10 rounded-lg bg-[#E8F0EB] flex items-center justify-center flex-shrink-0 text-[#4A7C59]">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-[#1A3C34] mb-1">Phone</div>
                                        <a href={`tel:${contactInfo.phone}`} className="text-[#4A7C59] hover:text-[#2F523F] text-sm block transition-colors">{contactInfo.phone}</a>
                                        <p className="text-xs text-[#8BA699] mt-1">Mon-Sat, 10 AM - 6 PM IST</p>
                                    </div>
                                </div>

                                {/* Address Row */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#E8F0EB] flex items-center justify-center flex-shrink-0 text-[#4A7C59]">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-[#1A3C34] mb-1">Address</div>
                                        <p className="text-[#4A5D56] text-sm leading-relaxed mb-2">{contactInfo.address.full}</p>
                                        <a href={contactInfo.mapUrl} target="_blank" rel="noopener noreferrer" className="text-[#4A7C59] hover:text-[#2F523F] text-sm font-medium inline-flex items-center gap-1 group">
                                            View on Google Maps <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Business Hours (Dark Green Theme) */}
                        <div className="bg-[#1A3C34] text-white rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-md">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4A7C59]/20 rounded-full translate-x-10 -translate-y-10 blur-2xl"></div>
                            
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-[#8BA699]">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-lg mb-2">Business Hours</h3>
                                    <div className="space-y-1 text-sm text-[#E8F0EB]/90">
                                        <div className="flex justify-between gap-4">
                                            <span>{contactInfo.hours.days}</span>
                                            <span className="text-white font-medium">{contactInfo.hours.time}</span>
                                        </div>
                                        <div className="text-xs opacity-60 pt-2 border-t border-white/10 mt-2">
                                            Closed on {contactInfo.hours.closed}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media & Quick Links Group */}
                        <div className="grid grid-cols-1 gap-6">
                            {/* Social Media */}
                            <div className="bg-white rounded-2xl border border-[#E3E8E5] shadow-sm p-6">
                                <h3 className="font-serif font-bold text-lg text-[#1A3C34] mb-4">Follow Us</h3>
                                <div className="flex gap-3">
                                    {socialLinks.map(social => {
                                        const IconComponent = social.icon;
                                        return (
                                            <a
                                                key={social.id}
                                                href={social.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 rounded-xl bg-[#F4F7F5] border border-[#E3E8E5] flex items-center justify-center transition-all duration-300 hover:scale-110 group relative overflow-hidden"
                                                title={social.name}
                                            >
                                                {/* Background Overlay */}
                                                <div
                                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                    style={{ backgroundColor: social.color }}
                                                />
                                                {/* Icon with Hover Force Fix */}
                                                <IconComponent
                                                    className="w-5 h-5 transition-colors duration-200 relative z-10 group-hover:!text-white"
                                                    style={{ color: social.color }}
                                                />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-white rounded-2xl border border-[#E3E8E5] shadow-sm p-6">
                                <h3 className="font-serif font-bold text-lg text-[#1A3C34] mb-4">Quick Links</h3>
                                <div className="space-y-3">
                                    <Link to="/faq" className="flex items-center gap-3 text-[#4A5D56] hover:text-[#1A3C34] transition-colors p-2 hover:bg-[#E8F0EB] rounded-lg group">
                                        <HelpCircle className="w-4 h-4 text-[#8BA699] group-hover:text-[#4A7C59]" />
                                        <span className="text-sm font-medium">FAQ</span>
                                    </Link>
                                    <Link to="/shipping" className="flex items-center gap-3 text-[#4A5D56] hover:text-[#1A3C34] transition-colors p-2 hover:bg-[#E8F0EB] rounded-lg group">
                                        <Package className="w-4 h-4 text-[#8BA699] group-hover:text-[#4A7C59]" />
                                        <span className="text-sm font-medium">Shipping Policy</span>
                                    </Link>
                                    <Link to="/refund" className="flex items-center gap-3 text-[#4A5D56] hover:text-[#1A3C34] transition-colors p-2 hover:bg-[#E8F0EB] rounded-lg group">
                                        <CheckCircle className="w-4 h-4 text-[#8BA699] group-hover:text-[#4A7C59]" />
                                        <span className="text-sm font-medium">Refund Policy</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Map Section */}
                        <div className="bg-white rounded-2xl border border-[#E3E8E5] shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-[#E3E8E5] flex justify-between items-center">
                                <div>
                                    <h3 className="font-serif font-bold text-lg text-[#1A3C34]">Visit Our Store</h3>
                                    <p className="text-[#8BA699] text-xs mt-1">{contactInfo.address.city}, {contactInfo.address.state}</p>
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0EB] border border-[#DCE4E0] text-[#1A3C34] text-xs font-bold tracking-wide uppercase">
                                    <MapPin className="w-3 h-3 text-[#4A7C59]" />
                                    Locate
                                </div>
                            </div>
                            <div className="w-full h-80 lg:h-[28rem]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.682747484767!2d72.8698188751532!3d21.167890780517495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f116d96b6e9%3A0x7c5b5e5e5e5e5e5e!2sSunrise%20Commercial%20Complex%2C%20Mota%20Varachha%2C%20Surat%2C%20Gujarat%20394101!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Kiddos Intallcat Location"
                                    className="filter grayscale-[0.2] contrast-[1.1]"
                                ></iframe>
                            </div>
                            <div className="p-4 bg-[#F4F7F5] border-t border-[#E3E8E5]">
                                <a
                                    href={contactInfo.mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-white border border-[#E3E8E5] text-[#2C3E38] hover:text-[#4A7C59] hover:border-[#4A7C59] px-4 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md"
                                >
                                    <MapPin className="w-4 h-4" />
                                    Open in Google Maps
                                </a>
                            </div>
                        </div>

                        {/* How Can We Help Grid */}
                        <div>
                            <h3 className="text-2xl font-serif font-bold text-[#1A3C34] mb-6 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#4A7C59]" />
                                How Can We Help?
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Product Inquiries */}
                                <div className="group bg-white p-6 rounded-2xl border border-[#E3E8E5] hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div className="font-serif font-bold text-[#1A3C34] mb-2">Product Inquiries</div>
                                    <p className="text-sm text-[#5C756D] leading-relaxed">
                                        Questions about our products, sizing, materials, or recommendations for your little one.
                                    </p>
                                </div>

                                {/* Order Support */}
                                <div className="group bg-white p-6 rounded-2xl border border-[#E3E8E5] hover:border-green-200 hover:shadow-lg transition-all duration-300">
                                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <div className="font-serif font-bold text-[#1A3C34] mb-2">Order Support</div>
                                    <p className="text-sm text-[#5C756D] leading-relaxed">
                                        Track your order, modify shipping address, or inquire about delivery status.
                                    </p>
                                </div>

                                {/* Returns */}
                                <div className="group bg-white p-6 rounded-2xl border border-[#E3E8E5] hover:border-purple-200 hover:shadow-lg transition-all duration-300">
                                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                        </svg>
                                    </div>
                                    <div className="font-serif font-bold text-[#1A3C34] mb-2">Returns & Refunds</div>
                                    <p className="text-sm text-[#5C756D] leading-relaxed">
                                        Need help with a return, exchange, or refund? We're here to assist you.
                                    </p>
                                </div>

                                {/* Bulk Orders */}
                                <div className="group bg-white p-6 rounded-2xl border border-[#E3E8E5] hover:border-orange-200 hover:shadow-lg transition-all duration-300">
                                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="font-serif font-bold text-[#1A3C34] mb-2">Bulk Orders</div>
                                    <p className="text-sm text-[#5C756D] leading-relaxed">
                                        Special pricing available for schools, daycare centers, and party planners.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Banner (Dark Green Theme) */}
                <div className="mt-20 relative overflow-hidden rounded-3xl bg-[#1A3C34] text-white p-8 md:p-12 text-center shadow-lg">
                    {/* Decorative Blobs */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4A7C59]/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
                    
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h3 className="text-2xl md:text-4xl font-serif font-bold mb-4">We're Here to Help!</h3>
                        <p className="text-[#8BA699] mb-8 text-base md:text-lg font-light leading-relaxed">
                            Our customer support team typically responds within 24 hours on business days.
                            For urgent matters, please call us or message us on WhatsApp.
                        </p>
                        
                        <div className="flex flex-wrap gap-4 justify-center">
                            <a
                                href={`tel:${contactInfo.phone}`}
                                className="bg-white text-[#1A3C34] hover:bg-[#E8F0EB] px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 shadow-lg"
                            >
                                <Phone className="w-4 h-4" />
                                Call Now
                            </a>
                            <a
                                href={`https://wa.me/${contactInfo.whatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#25D366] text-white hover:bg-[#20b857] px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 shadow-lg"
                            >
                                <FaWhatsapp className="w-5 h-5" />
                                WhatsApp Us
                            </a>
                            <a
                                href={`mailto:${contactInfo.email}`}
                                className="bg-transparent border border-[#8BA699] text-white hover:bg-white hover:text-[#1A3C34] hover:border-white px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2"
                            >
                                <Mail className="w-4 h-4" />
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