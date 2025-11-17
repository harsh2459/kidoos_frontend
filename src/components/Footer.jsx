import React from "react";
import { Link } from "react-router-dom";

function SeaCap() {
    const H = 160; // wave canvas height
    return (
        <div className="relative w-full bg-black">
            <svg
                viewBox={`0 0 1440 ${H}`}
                preserveAspectRatio="none"
                className="block w-full"
                style={{ height: H }}
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <rect x="0" y="0" width="1440" height={H} fill="#000" />
                {/* flip vertically so it faces upward */}
                <g transform={`scale(1,-1) translate(0, -${H})`}>
                    <path
                        fill="#fff"
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

export default function Footer({ contact, links }) {
    <style>
        a:hover
    </style>

    return (
        // no bottom padding so the bottom links touch the edge
        <footer className="footer-scope relative bg-black text-white mt-[50px] pb-[1rem]">
            {/* Wave */}
            <SeaCap />

            {/* Content */}
            <div className="mx-auto w-full max-w-7xl px-4">
                <div className="grid gap-10 md:grid-cols-4">
                    {/* Brand + Tagline moved here (under brand) */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/10 grid place-items-center font-extrabold text-white">
                                KI
                            </div>
                            <div>
                                <div className="text-lg font-bold text-white">
                                    Kiddos Intellect
                                </div>
                            </div>
                        </div>

                        {/* Tagline directly under brand */}
                        <p className="mt-2 text-sm text-white italic">
                            Reading minds grow beyond screens
                        </p>

                        <p className="mt-4 text-sm leading-6 text-white">
                            Hand-picked children’s books and learning materials for curious
                            minds. Fast shipping across India.
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav
                        aria-label="Footer"
                        className="grid grid-cols-2 gap-6 md:col-span-2 md:grid-cols-3"
                    >
                        <div>
                            <div className="font-semibold text-white">Explore</div>
                            <ul className="mt-3 space-y-2 text-sm ">
                                <li>
                                    <Link to="/" className="text-white hover:opacity-80 hover:underline">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/catalog" className="text-white hover:opacity-80 hover:underline">
                                        Catalog
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/cart" className="text-white hover:opacity-80 hover:underline">
                                        Cart
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/aboutus" className="text-white hover:opacity-80 hover:underline">
                                        About us
                                    </Link>
                                </li>

                            </ul>
                        </div>

                        <div>
                            <div className="font-semibold text-white">Others</div>
                            <ul className="mt-3 space-y-2 text-sm">
                                <li>
                                    <Link to="/faq" className="text-white hover:opacity-80 hover:underline">
                                        FAQs
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" className="text-white hover:opacity-80 hover:underline">
                                        Contact Us
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <div className="font-semibold text-white">Our Policy</div>
                            <ul className="mt-3 space-y-2 text-sm">
                                <li>
                                    <Link to="/privacy" className="text-white hover:opacity-80 hover:underline">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/shipping" className="text-white hover:opacity-80 hover:underline">
                                        Shipping Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="text-white hover:opacity-80 hover:underline">
                                        Terms &amp; Privacy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/refund" className="text-white hover:opacity-80 hover:underline">
                                        Returns &amp; Refunds
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    {/* Contact */}
                    <div className="md:col-span-1">
                        <div className="font-semibold text-white">Contact</div>
                        <ul className="mt-3 space-y-2 text-sm">
                            {contact?.email && (
                                <li>
                                    <a
                                        href={`mailto:${contact.email}`}
                                        className="text-white hover:opacity-80 hover:underline"
                                    >
                                        {contact.email}
                                    </a>
                                </li>
                            )}
                            {contact?.phone && (
                                <li>
                                    <a
                                        href={`tel:${contact.phone}`}
                                        className="text-white hover:opacity-80 hover:underline"
                                    >
                                        {contact.phone}
                                    </a>
                                </li>
                            )}
                            {contact?.hours && <li className="text-white">{contact.hours}</li>}
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}
