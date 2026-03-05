import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
// Inline SVGs replace react-icons to keep this out of the main bundle
const IconThreads = () => <svg width="20" height="20" viewBox="0 0 192 192" fill="currentColor" aria-hidden="true"><path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-43.246-41.457-43.398h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.928.195 47.4 9.6 32.899 27.95 19.945 44.442 13.241 67.315 13.01 96v.04c.231 28.685 6.935 51.558 19.89 68.05 14.502 18.35 36.029 27.755 64.058 27.95h.112c24.96-.173 42.554-6.708 57.048-21.19 18.963-18.949 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.592ZM97.32 138.073c-10.44.574-21.315-4.097-21.87-14.165-.426-7.988 5.669-16.894 23.916-17.932a128.17 128.17 0 0 1 7.278-.214c5.53 0 10.883.538 15.94 1.582-1.815 22.6-14.163 29.945-25.264 30.729Z"/></svg>;
const IconInstagram = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
const IconWhatsApp = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>;
const IconXTwitter = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.833L1.205 2.25H8.28l4.259 5.634 5.705-5.634Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const IconFacebook = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;

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
      "206 Sunrise Commercial Complex, Near Savjibhai okra Bridge, Mota Varachha, Surat, Gujarat 394101",
  };

    const socialItems = [
      { id: "threads", icon: <IconThreads />, href: "https://www.threads.com/@kiddosintellect" },
      { id: "instagram", icon: <IconInstagram />, href: "https://www.instagram.com/kiddosintellect/" },
      { id: "whatsapp", icon: <IconWhatsApp />, href: `https://wa.me/${contactInfo.phone.replace(/\s+/g, "")}` },
      { id: "x", icon: <IconXTwitter />, href: `https://x.com/kiddosintellect` },
      { id: "facebook", icon: <IconFacebook />, href: `https://www.facebook.com/people/Kiddos-Intellect/61579945910642/` },
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
              <li><FooterLink to="/PreSchool">PreSchool</FooterLink></li>
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