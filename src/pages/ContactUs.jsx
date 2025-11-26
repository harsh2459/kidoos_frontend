import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Mail, Phone, MapPin, Clock, HelpCircle, Package, CheckCircle, MessageSquare
} from 'lucide-react';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FaThreads } from 'react-icons/fa6';
import ScrollToTopButton from '../components/ScrollToTopButton';

const ContactUs = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
        <div className="min-h-screen bg-surface-subtle">
            {/* Hero Section */}
            <div className="hero py-8 xs:py-10 sm:py-12 md:py-14 lg:py-16 xl:py-18 2xl:py-20 mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12">
                <div className="max-w-container mx-auto px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12">
                    <div className="flex items-center justify-center mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">
                        <MessageSquare className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14 text-brand" />
                    </div>
                    <h1 className="text-3xl xs:text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-6xl font-bold text-center text-fg mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">
                        Contact Us
                    </h1>
                    <p className="text-center text-fg-muted text-base xs:text-base sm:text-lg md:text-lg lg:text-xl xl:text-xl 2xl:text-2xl max-w-xl xs:max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
                        We'd love to hear from you! Reach out to us through any of the channels below and we'll respond as soon as possible.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-container mx-auto px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 pb-8 xs:pb-10 sm:pb-12 md:pb-14 lg:pb-16 xl:pb-20">

                {/* Contact Methods Grid */}
                <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-5 sm:gap-6 md:gap-7 mb-8 xs:mb-9 sm:mb-10 md:mb-12">

                    {/* Email Card */}
                    <a
                        href={`mailto:${contactInfo.email}`}
                        className="card hover:shadow-lg transition-all duration-200 group"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-brand/10 flex items-center justify-center mb-3 xs:mb-3.5 sm:mb-4 group-hover:bg-brand/20 transition-colors">
                                <Mail className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-brand" />
                            </div>
                            <h3 className="font-bold text-fg mb-1 xs:mb-1.5 sm:mb-2 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg">Email Us</h3>
                            <p className="text-brand text-xs xs:text-xs sm:text-sm md:text-sm mb-1 xs:mb-1.5 sm:mb-2 break-all">{contactInfo.email}</p>
                            <p className="text-fg-subtle text-[10px] xs:text-xs sm:text-xs">Response within 24 hours</p>
                        </div>
                    </a>

                    {/* Phone Card */}
                    <a
                        href={`tel:${contactInfo.phone}`}
                        className="card hover:shadow-lg transition-all duration-200 group"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                                <Phone className="w-8 h-8 text-success" />
                            </div>
                            <h3 className="font-bold text-fg mb-2">Call Us</h3>
                            <p className="text-brand text-sm mb-2">{contactInfo.phone}</p>
                            <p className="text-fg-subtle text-xs">Mon-Sat, 10 AM - 6 PM IST</p>
                        </div>
                    </a>

                    {/* WhatsApp Card */}
                    <a
                        href={`https://wa.me/${contactInfo.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card hover:shadow-lg transition-all duration-200 group"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-4 group-hover:bg-[#25D366]/20 transition-colors">
                                <FaWhatsapp className="w-8 h-8 text-[#25D366]" />
                            </div>
                            <h3 className="font-bold text-fg mb-2">WhatsApp</h3>
                            <p className="text-brand text-sm mb-2">{contactInfo.phone}</p>
                            <p className="text-fg-subtle text-xs">Quick responses</p>
                        </div>
                    </a>

                    {/* Visit Us Card */}
                    <a
                        href={contactInfo.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card hover:shadow-lg transition-all duration-200 group"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                                <MapPin className="w-8 h-8 text-accent" />
                            </div>
                            <h3 className="font-bold text-fg mb-2">Visit Us</h3>
                            <p className="text-brand text-sm mb-2">{contactInfo.address.city}, {contactInfo.address.state}</p>
                            <p className="text-fg-subtle text-xs">View on Google Maps</p>
                        </div>
                    </a>
                </div>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Column - Detailed Contact Info */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Detailed Contact Card */}
                        <div className="card">
                            <h2 className="text-xl font-bold text-fg mb-3 xs:mb-3.5 sm:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg">Get In Touch</h2>

                            {/* Email */}
                            <div className="mb-3 xs:mb-3.5 sm:mb-4 pb-3 xs:pb-3.5 sm:pb-4 border-b border-border-subtle">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-brand" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-fg mb-0.5 xs:mb-1 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">Email</div>
                                        <a
                                            href={`mailto:${contactInfo.email}`}
                                            className="text-brand hover:text-brand/80 text-xs xs:text-xs sm:text-sm md:text-sm break-all"
                                        >
                                            {contactInfo.email}
                                        </a>
                                        <p className="text-fg-subtle text-[10px] xs:text-xs sm:text-xs mt-0.5 xs:mt-1">Response within 24 hours</p>
                                    </div>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="mb-3 xs:mb-3.5 sm:mb-4 pb-3 xs:pb-3.5 sm:pb-4 border-b border-border-subtle">
                                <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3 md:gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 text-success" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-fg mb-0.5 xs:mb-1 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">Phone</div>
                                        <a
                                            href={`tel:${contactInfo.phone}`}
                                            className="text-brand hover:text-brand/80 text-sm"
                                        >
                                            {contactInfo.phone}
                                        </a>
                                        <p className="text-fg-subtle text-[10px] xs:text-xs sm:text-xs mt-0.5 xs:mt-1">Mon-Sat, 10 AM - 6 PM IST</p>
                                    </div>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="mb-3 xs:mb-3.5 sm:mb-4 pb-3 xs:pb-3.5 sm:pb-4 border-b border-border-subtle">
                                <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3 md:gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                                        <FaWhatsapp className="w-5 h-5 text-[#25D366]" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-fg mb-0.5 xs:mb-1 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">WhatsApp</div>
                                        <a
                                            href={`https://wa.me/${contactInfo.whatsapp}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-brand hover:text-brand/80 text-sm"
                                        >
                                            {contactInfo.phone}
                                        </a>
                                        <p className="text-fg-subtle text-[10px] xs:text-xs sm:text-xs mt-0.5 xs:mt-1">Quick responses</p>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3 md:gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-fg mb-0.5 xs:mb-1 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">Address</div>
                                        <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm leading-relaxed mb-1.5 xs:mb-2text-fg-muted text-sm leading-relaxed mb-2">
                                            {contactInfo.address.full}
                                        </p>
                                        <a
                                            href={contactInfo.mapUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-brand hover:text-brand/80 text-xs xs:text-xs sm:text-sm md:text-sm inline-block"
                                        >
                                            View on Google Maps →
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Business Hours */}
                        <div className="card bg-brand/5 border-brand/20">
                            <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3 md:gap-4">
                                <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-brand" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-fg mb-1.5 xs:mb-2 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">Business Hours</div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-fg-muted">{contactInfo.hours.days}</span>
                                            <span className="text-fg font-medium">{contactInfo.hours.time}</span>
                                        </div>
                                        <div className="text-fg-subtle text-xs">
                                            Closed on {contactInfo.hours.closed}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="card">
                            <h3 className="font-bold text-fg mb-3 xs:mb-3.5 sm:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg">Follow Us</h3>
                            <div className="flex gap-2 xs:gap-2.5 sm:gap-3 md:gap-4">
                                {socialLinks.map(social => {
                                    const IconComponent = social.icon;
                                    return (
                                        <a
                                            key={social.id}
                                            href={social.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-lg bg-surface-subtle hover:bg-surface border border-border-subtle flex items-center justify-center transition-all duration-200 hover:scale-110 group relative overflow-hidden"
                                            title={social.name}
                                        >
                                            <div
                                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                style={{ backgroundColor: social.color }}
                                            />
                                            <IconComponent
                                                className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6 md:w-7 md:h-7 transition-colors duration-200 relative z-10 group-hover:text-white"
                                                style={{ color: social.color }}
                                            />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="card">
                            <h3 className="font-bold text-fg mb-3 xs:mb-3.5 sm:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg">Quick Links</h3>
                            <div className="space-y-1.5 xs:space-y-2 sm:space-y-2 md:space-y-2.5">
                                <Link
                                    to="/faq"
                                    className="flex items-center gap-1.5 xs:gap-2 text-fg-muted hover:text-brand transition-colors text-xs xs:text-xs sm:text-sm md:text-sm"
                                >
                                    <HelpCircle className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4" />
                                    <span>FAQ</span>
                                </Link>
                                <Link
                                    to="/shipping"
                                    className="flex items-center gap-1.5 xs:gap-2 text-fg-muted hover:text-brand transition-colors text-xs xs:text-xs sm:text-sm md:text-sm"
                                >
                                    <Package className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4" />
                                    <span>Shipping Policy</span>
                                </Link>
                                <Link
                                    to="/refund"
                                    className="flex items-center gap-1.5 xs:gap-2 text-fg-muted hover:text-brand transition-colors text-xs xs:text-xs sm:text-sm md:text-sm"
                                >
                                    <CheckCircle className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4" />
                                    <span>Refund Policy</span>
                                </Link>
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Google Maps */}
                    <div className="lg:col-span-2 space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-7">

                        {/* Google Maps */}
                        <div className="card p-0 overflow-hidden">
                            <div className="p-3 xs:p-3.5 sm:p-4 md:p-5 border-b border-border-subtle">
                                <h3 className="font-bold text-fg text-sm xs:text-sm sm:text-base md:text-base lg:text-lg">Visit Our Store</h3>
                                <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm mt-0.5 xs:mt-1">
                                    {contactInfo.address.city}, {contactInfo.address.state} - {contactInfo.address.pincode}
                                </p>
                            </div>
                            <div className="w-full h-64 xs:h-72 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.682747484767!2d72.8698188751532!3d21.167890780517495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f116d96b6e9%3A0x7c5b5e5e5e5e5e5e!2sSunrise%20Commercial%20Complex%2C%20Mota%20Varachha%2C%20Surat%2C%20Gujarat%20394101!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Kiddos Intallcat Location"
                                ></iframe>
                            </div>
                            <div className="p-3 xs:p-3.5 sm:p-4 md:p-5 bg-surface-subtle">
                                <a
                                    href={contactInfo.mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary w-full flex items-center justify-center gap-2 text-xs xs:text-xs sm:text-sm md:text-sm"
                                >
                                    <MapPin className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4" />
                                    <span>Open in Google Maps</span>
                                </a>
                            </div>
                        </div>

                        {/* Why Contact Us Section */}
                        <div className="card">
                            <h3 className="text-xl font-bold text-fg mb-4 xs:mb-5 sm:mb-6 text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl">
                                How Can We Help?
                            </h3>
                            <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
                                <div className="group bg-surface-subtle rounded-xl p-4 xs:p-5 sm:p-6 md:p-6 hover:bg-surface transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer border border-transparent hover:border-blue-200">
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors duration-300">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-fg mb-2 text-sm xs:text-base sm:text-base md:text-base lg:text-lg">
                                                Product Inquiries
                                            </div>
                                            <p className="text-fg-muted text-xs xs:text-sm sm:text-sm md:text-sm leading-relaxed">
                                                Questions about our products, sizing, materials, or recommendations for your little one.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="group bg-surface-subtle rounded-xl p-4 xs:p-5 sm:p-6 md:p-6 hover:bg-surface transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer border border-transparent hover:border-green-200">
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors duration-300">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-fg mb-2 text-sm xs:text-base sm:text-base md:text-base lg:text-lg">
                                                Order Support
                                            </div>
                                            <p className="text-fg-muted text-xs xs:text-sm sm:text-sm md:text-sm leading-relaxed">
                                                Track your order, modify shipping address, or inquire about delivery status.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="group bg-surface-subtle rounded-xl p-4 xs:p-5 sm:p-6 md:p-6 hover:bg-surface transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer border border-transparent hover:border-purple-200">
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors duration-300">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-fg mb-2 text-sm xs:text-base sm:text-base md:text-base lg:text-lg">
                                                Returns & Refunds
                                            </div>
                                            <p className="text-fg-muted text-xs xs:text-sm sm:text-sm md:text-sm leading-relaxed">
                                                Need help with a return, exchange, or refund? We're here to assist you.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="group bg-surface-subtle rounded-xl p-4 xs:p-5 sm:p-6 md:p-6 hover:bg-surface transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer border border-transparent hover:border-orange-200">
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors duration-300">
                                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-fg mb-2 text-sm xs:text-base sm:text-base md:text-base lg:text-lg">
                                                Bulk Orders
                                            </div>
                                            <p className="text-fg-muted text-xs xs:text-sm sm:text-sm md:text-sm leading-relaxed">
                                                Special pricing available for schools, daycare centers, and party planners.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Response Time Banner */}
                <div className="card bg-brand text-brand-foreground mt-6 xs:mt-7 sm:mt-8 md:mt-10">
                    <div className="text-center">
                        <h3 className="text-lg xs:text-lg sm:text-xl md:text-xl lg:text-2xl font-bold mb-1.5 xs:mb-2">We're Here to Help!</h3>
                        <p className="opacity-90 mb-4 xs:mb-5 sm:mb-6 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">
                            Our customer support team typically responds within 24 hours on business days.
                            For urgent matters, please call us or message us on WhatsApp.
                        </p>
                        <div className="flex flex-wrap gap-2 xs:gap-3 sm:gap-4 md:gap-5 justify-center">
                            <a
                                href={`tel:${contactInfo.phone}`}
                                className="btn-secondary bg-brand-foreground text-brand hover:bg-brand-foreground/90 flex items-center gap-2 text-xs xs:text-xs sm:text-sm md:text-sm"
                            >
                                <Phone className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4" />
                                Call Now
                            </a>
                            <a
                                href={`https://wa.me/${contactInfo.whatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary bg-[#25D366] text-white hover:bg-[#25D366]/90 flex items-center gap-2"
                            >
                                <FaWhatsapp className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4" />
                                WhatsApp Us
                            </a>
                            <a
                                href={`mailto:${contactInfo.email}`}
                                className="btn-secondary bg-brand-foreground/10 text-brand-foreground hover:bg-brand-foreground/20 border border-brand-foreground/20 flex items-center gap-2"
                            >
                                <Mail className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4" />
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
