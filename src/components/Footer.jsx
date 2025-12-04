import React from "react";
import { Link } from "react-router-dom";
// Icons for Contact Info
import { MapPin, Phone, Mail } from "lucide-react";
// Icons for Social Media
import { FaThreads, FaInstagram, FaWhatsapp } from "react-icons/fa6";

/**
 * WAVE COMPONENT
 */
function SeaCap() {
    const H = 160; 
    return (
        <div className="relative w-full bg-[#1A3C34] select-none pointer-events-none">
            <svg
                viewBox={`0 0 1440 ${H}`}
                preserveAspectRatio="none"
                className="block w-full"
                style={{ height: H }}
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <rect x="0" y="0" width="1440" height={H} fill="#1A3C34" />
                <g transform={`scale(1,-1) translate(0, -${H})`}>
                    <path
                        fill="#F4F7F5" 
                        d="M0,100 C240,180 480,20 720,100 C960,180 1200,20 1440,100 L1440,160 L0,160 Z"
                    >
                        <animate
                            attributeName="d"
                            dur="6s"
                            repeatCount="indefinite"
                            values="
                M0,100 C240,180 480,20 720,100 C960,180 1200,20 1440,100 L1440,160 L0,160 Z;
                M0,80 C240,40 480,200 720,80 C960,-20 1200,200 1440,80 L1440,160 L0,160 Z;
                M0,100 C240,180 480,20 720,100 C960,180 1200,20 1440,100 L1440,160 L0,160 Z
              "
                        />
                    </path>
                </g>
            </svg>
        </div>
    );
}

/**
 * Helper Component for Links with Left-to-Right Underline Animation
 */
const FooterLink = ({ to, children, className = "" }) => (
    <Link
        to={to}
        className={`relative inline-block text-base text-[#8BA699] hover:text-white transition-colors duration-300
        after:content-[''] after:absolute after:left-0 after:-bottom-0.5
        after:block after:h-[1px] after:w-full after:bg-current
        after:origin-left after:scale-x-0 after:transition-transform after:duration-300
        hover:after:scale-x-100 ${className}`}
    >
        {children}
    </Link>
);

/**
 * Helper for External Links (Phone/Email) with same animation
 */
const FooterAnchor = ({ href, children }) => (
    <a
        href={href}
        className="relative inline-block text-base text-[#8BA699] hover:text-white transition-colors duration-300
        after:content-[''] after:absolute after:left-0 after:-bottom-0.5
        after:block after:h-[1px] after:w-full after:bg-current
        after:origin-left after:scale-x-0 after:transition-transform after:duration-300
        hover:after:scale-x-100"
    >
        {children}
    </a>
);

export default function Footer({ contact }) {
    const currentYear = new Date().getFullYear();

    const contactInfo = {
        email: contact?.email || "kiddosintellect.com",
        phone: contact?.phone || "+91 98798 57529",
        address: "206 Sunrise Commercial Complex, Near Savjibhai Korat Bridge, Lajamani Chowk, Shanti Niketan Society, Mota Varachha, Surat, Gujarat 394101"
    };

    const socialItems = [
        {
            id: "threads",
            icon: <FaThreads size={20} />,
            href: "https://www.threads.com/@kiddosintellect",
            title: "Threads",
            bg: "#000000",
            color: "#fff",
        },
        {
            id: "instagram",
            icon: <FaInstagram size={20} />,
            href: "https://www.instagram.com/kiddosintellect/",
            title: "Instagram",
            bg: "#E4405F",
            color: "#fff",
        },
        {
            id: "whatsapp",
            icon: <FaWhatsapp size={20} />,
            href: `https://wa.me/${contactInfo.phone.replace(/\s+/g, '')}`,
            title: "WhatsApp",
            bg: "#25D366",
            color: "#fff",
        },
        {
            id: "X",
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
            href: 'https://x.com/KiddosIntellect',
            title: "X",
            bg: "#000000",
            color: "#fff",
        },
        {
            id: "Facebook",
            icon: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.962.925-1.962 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>),
            href: 'https://www.facebook.com/people/Kiddos-Intellect/61579945910642/',
            title: "Facebook",
            bg: "#1877F2",
            color: "#fff",
        },
    ];

    return (
        <footer className="footer-scope relative bg-[#1A3C34] text-[#E8F0EB] mt-[50px] flex flex-col">
            {/* Wave Effect */}
            <SeaCap />

            {/* Main Content */}
            <div className="mx-auto w-full max-w-7xl px-6 pb-12 pt-4">
                <div className="grid gap-8 lg:grid-cols-12 md:grid-cols-2 grid-cols-1">
                    
                    {/* --- 1. BRAND & SOCIALS (3 Columns) --- */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center font-serif font-extrabold text-white text-2xl border border-white/10 shadow-lg">
                                KI
                            </div>
                            <span className="text-3xl font-serif font-bold tracking-tight text-white">
                                Kiddos Intellect
                            </span>
                        </div>
                        <p className="text-lg text-[#8BA699] italic leading-relaxed">
                            "Reading minds grow beyond screens"
                        </p>
                        
                        {/* Social Icons */}
                        <div className="flex flex-wrap gap-4 mt-2">
                            {socialItems.map((item) => (
                                <a
                                    key={item.id}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                    style={{ '--hover-bg': item.bg }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = item.bg;
                                        e.currentTarget.style.color = item.color;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                >
                                    <span className="text-white transition-colors duration-300">
                                        {item.icon}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* --- 2. EXPLORE (2 Columns) --- */}
                    <div className="lg:col-span-2">
                        <h3 className="text-xl font-serif font-bold text-white mb-6 border-b border-[#4A7C59] pb-2 inline-block">Explore</h3>
                        <ul className="space-y-4">
                            <li><FooterLink to="/">Home</FooterLink></li>
                            <li><FooterLink to="/catalog">Catalog</FooterLink></li>
                            <li><FooterLink to="/cart">Cart</FooterLink></li>
                            <li><FooterLink to="/aboutus">About us</FooterLink></li>
                        </ul>
                    </div>

                    {/* --- 3. OTHERS (2 Columns) --- */}
                    <div className="lg:col-span-2">
                        <h3 className="text-xl font-serif font-bold text-white mb-6 border-b border-[#4A7C59] pb-2 inline-block">Others</h3>
                        <ul className="space-y-4">
                            <li><FooterLink to="/faq">FAQs</FooterLink></li>
                            <li><FooterLink to="/contact">Contact Us</FooterLink></li>
                        </ul>
                    </div>

                    {/* --- 4. OUR POLICY (2 Columns) --- */}
                    <div className="lg:col-span-2">
                        <h3 className="text-xl font-serif font-bold text-white mb-6 border-b border-[#4A7C59] pb-2 inline-block">Our Policy</h3>
                        <ul className="space-y-4">
                            <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
                            <li><FooterLink to="/shipping">Shipping Policy</FooterLink></li>
                            <li><FooterLink to="/terms">Terms & Conditions</FooterLink></li>
                            <li><FooterLink to="/refund">Returns & Refunds</FooterLink></li>
                        </ul>
                    </div>

                    {/* --- 5. CONTACT INFO (3 Columns) --- */}
                    <div className="lg:col-span-3">
                        <h3 className="text-xl font-serif font-bold text-white mb-6 border-b border-[#4A7C59] pb-2 inline-block">Get in Touch</h3>
                        <ul className="space-y-6">
                            {/* Address */}
                            <li className="flex items-start gap-4 group">
                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#4A7C59] transition-colors shrink-0 mt-1">
                                    <MapPin className="text-white" size={20} />
                                </div>
                                <span className="text-base text-[#8BA699] group-hover:text-white transition-colors leading-relaxed">
                                    {contactInfo.address}
                                </span>
                            </li>
                            {/* Phone */}
                            <li className="flex items-center gap-4 group">
                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#4A7C59] transition-colors shrink-0">
                                    <Phone className="text-white" size={20} />
                                </div>
                                <FooterAnchor href={`tel:${contactInfo.phone}`}>
                                    {contactInfo.phone}
                                </FooterAnchor>
                            </li>
                            {/* Email */}
                            <li className="flex items-center gap-4 group">
                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#4A7C59] transition-colors shrink-0">
                                    <Mail className="text-white" size={20} />
                                </div>
                                <FooterAnchor href={`mailto:${contactInfo.email}`}>
                                    {contactInfo.email}
                                </FooterAnchor>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* Copyright Section */}
            <div className="w-full border-t border-[#4A7C59]/30 bg-[#142E28]">
                <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row justify-center items-center gap-4 d-flex">
                    <p className="text-[#8BA699] text-base text-center md:text-left">
                        © {currentYear} Kiddos Intellect. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}