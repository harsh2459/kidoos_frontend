import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaThreads, FaInstagram, FaWhatsapp, FaFacebook, FaX, FaTwitter, FaXTwitter } from "react-icons/fa6";

/* ----------------------------------
   WAVE COMPONENT (FROM OLD FOOTER)
----------------------------------- */
function SeaCap() {
  const H = 160;
  return (
    <div className="relative w-full bg-transparent select-none pointer-events-none">
      <svg
        viewBox={`0 0 1440 ${H}`}
        preserveAspectRatio="none"
        className="block w-full"
        style={{ height: H }}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Background above footer */}
        <rect x="0" y="0" width="1440" height={H} fill="#FAF7F2" />

        {/* Inverted wave */}
        <g transform={`scale(1,-1) translate(0, -${H})`}>
          <path
            fill="#FAF7F2"
            d="M0,100 C240,180 480,20 720,100 C960,180 1200,20 1440,100 L1440,160 L0,160 Z"
          >
            <animate
              attributeName="d"
              dur="6s"
              repeatCount="indefinite"
              values="
                M0,100 C240,180 480,20 720,100 C960,180 1200,20 1440,100 L1440,160 L0,160 Z;
                M0,80  C240,40  480,200 720,80  C960,-20 1200,200 1440,80  L1440,160 L0,160 Z;
                M0,100 C240,180 480,20 720,100 C960,180 1200,20 1440,100 L1440,160 L0,160 Z
              "
            />
          </path>
        </g>
      </svg>
    </div>
  );
}

/* ----------------------------------
   LINK HELPERS (UNCHANGED LOGIC)
----------------------------------- */
const FooterLink = ({ to, children }) => (
  <Link
    to={to}
    className="relative inline-block text-base text-[#7B6A4A] hover:text-[#C89B3C] transition-colors duration-300
      after:absolute after:left-0 after:-bottom-0.5 after:h-[1px] after:w-full
      after:bg-current after:scale-x-0 after:origin-left
      after:transition-transform after:duration-300 hover:after:scale-x-100"
  >
    {children}
  </Link>
);

const FooterAnchor = ({ href, children }) => (
  <a
    href={href}
    className="relative inline-block text-base text-[#7B6A4A] hover:text-[#C89B3C] transition-colors duration-300
      after:absolute after:left-0 after:-bottom-0.5 after:h-[1px] after:w-full
      after:bg-current after:scale-x-0 after:origin-left
      after:transition-transform after:duration-300 hover:after:scale-x-100"
  >
    {children}
  </a>
);
/* ----------------------------------
   MAIN FOOTER (FEATURE COMPLETE)
----------------------------------- */
export default function Footer({ contact }) {
  const year = new Date().getFullYear();

  const contactInfo = {
    email: contact?.email || "kiddosintellect.com",
    phone: contact?.phone || "+91 98798 57529",
    address:
      "206 Sunrise Commercial Complex, Near Savjibhai Korat Bridge, Mota Varachha, Surat, Gujarat 394101",
  };

  const socialItems = [
    { id: "threads", icon: <FaThreads size={20} />, href: "https://www.threads.com/@kiddosintellect" },
    { id: "instagram", icon: <FaInstagram size={20} />, href: "https://www.instagram.com/kiddosintellect/" },
    { id: "whatsapp", icon: <FaWhatsapp size={20} />, href: `https://wa.me/${contactInfo.phone.replace(/\s+/g, "")}` },
    { id: "x", icon: <FaXTwitter size={20} />, href: `https://x.com/kiddosintellect` },
    { id: "facebook", icon: <FaFacebook size={20} />, href: `https://www.facebook.com/people/Kiddos-Intellect/61579945910642/` },
  ];

  return (
    <footer className="relative bg-[#FAF7F2] text-[#5C4A2E] flex flex-col">

      {/* WAVE */}
      <SeaCap />

      {/* BACKGROUNDS */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.18]"
        style={{ backgroundImage: "url('/images-webp/homepage/footer-vrindavan-bg.webp')" }}
      />
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-multiply"
        style={{ backgroundImage: "url('/images/homepage/parchment-noise.png')" }}
      />

      {/* CONTENT */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-12 pt-6">
        <div className="grid gap-8 lg:grid-cols-12 md:grid-cols-2 grid-cols-1">

          {/* BRAND */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-[#C89B3C]/20 flex items-center justify-center font-serif font-extrabold text-[#6B532E] text-2xl">
                KI
              </div>
              <span className="text-3xl font-serif font-bold text-[#6B532E]">
                Kiddos Intellect
              </span>
            </div>

            <p className="text-lg italic text-[#8A7A5E]">
              “Reading minds grow beyond screens”
            </p>

            <div className="flex gap-4">
              {socialItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C89B3C]/15 transition-all hover:-translate-y-1"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = item.bg)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(200,155,60,0.15)")}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* EXPLORE */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-serif font-bold mb-6">Explore</h3>
            <ul className="space-y-4">
              <li><FooterLink to="/">Home</FooterLink></li>
              <li><FooterLink to="/catalog">Catalog</FooterLink></li>
              <li><FooterLink to="/cart">Cart</FooterLink></li>
              <li><FooterLink to="/aboutus">About Us</FooterLink></li>
            </ul>
          </div>

          {/* OTHERS */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-serif font-bold mb-6">Others</h3>
            <ul className="space-y-4">
              <li><FooterLink to="/faq">FAQs</FooterLink></li>
              <li><FooterLink to="/contact">Contact Us</FooterLink></li>
            </ul>
          </div>

          {/* POLICY */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-serif font-bold mb-6">Our Policy</h3>
            <ul className="space-y-4">
              <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink to="/shipping">Shipping Policy</FooterLink></li>
              <li><FooterLink to="/terms">Terms & Conditions</FooterLink></li>
              <li><FooterLink to="/refund">Returns & Refunds</FooterLink></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div className="lg:col-span-3">
            <h3 className="text-xl font-serif font-bold mb-6">Get in Touch</h3>
            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <div className="min-w-[24px] h-[24px] flex items-start justify-center pt-[2px]">
                  <MapPin size={24} />
                </div>
                <span className="leading-relaxed">
                  {contactInfo.address}
                </span>
              </li> 
              <li className="flex gap-4">
                <Phone size={20} />
                <FooterAnchor href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</FooterAnchor>
              </li>
              <li className="flex gap-4">
                <Mail size={20} />
                <FooterAnchor href={`mailto:${contactInfo.email}`}>{contactInfo.email}</FooterAnchor>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="w-full border-t border-[#C89B3C]/30 bg-[#F4EFE7]">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-[#8A7A5E]">
          © {year} Kiddos Intellect. All Rights Reserved.
        </div>
      </div>
    </footer>
  );  
}