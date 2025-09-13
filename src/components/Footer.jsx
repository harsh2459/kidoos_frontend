import React from "react";

function SeaCap({ tagline = "Reading minds grow beyond screens™" }) {
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

      {/* centered tagline just below the wave */}
      <div className="absolute inset-x-0 -bottom-10 px-4">
        <p className="mx-auto max-w-4xl text-center text-white text-lg sm:text-xl font-semibold tracking-wide">
          {tagline}
        </p>
      </div>
    </div>
  );
}

export default function Footer({ contact, links }) {
  const safeLinks =
    links && links.length
      ? links
      : [
          { label: "Privacy", href: "/privacy" },
          { label: "Returns", href: "/returns" },
          { label: "Shipping", href: "/shipping" },
        ];

  return (
    <footer className="relative bg-black text-white mt-[50px] pb-[25px]">
      {/* Wave + centered tagline */}
      <SeaCap />

      {/* Extra top padding so content sits comfortably below the tagline */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-20 pb-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
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
              <div className="font-semibold text-white">Shop</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href="/catalog"
                    className="text-white hover:text-white hover:underline"
                  >
                    Catalog
                  </a>
                </li>
                <li>
                  <a
                    href="/cart"
                    className="text-white hover:text-white hover:underline"
                  >
                    Cart
                  </a>
                </li>
                <li>
                  <a
                    href="/#featured"
                    className="text-white hover:text-white hover:underline"
                  >
                    Featured
                  </a>
                </li>
                <li>
                  <a
                    href="/#new"
                    className="text-white hover:text-white hover:underline"
                  >
                    New Arrivals
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white">Company</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href="/about"
                    className="text-white hover:text-white hover:underline"
                  >
                    About us
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="text-white hover:text-white hover:underline"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="text-white hover:text-white hover:underline"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/careers"
                    className="text-white hover:text-white hover:underline"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white">Support</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href="/help"
                    className="text-white hover:text-white hover:underline"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="/shipping"
                    className="text-white hover:text-white hover:underline"
                  >
                    Shipping
                  </a>
                </li>
                <li>
                  <a
                    href="/returns"
                    className="text-white hover:text-white hover:underline"
                  >
                    Returns &amp; Refunds
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-white hover:text-white hover:underline"
                  >
                    Terms &amp; Privacy
                  </a>
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
                    className="text-white hover:text-white hover:underline"
                  >
                    {contact.email}
                  </a>
                </li>
              )}
              {contact?.phone && (
                <li>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-white hover:text-white hover:underline"
                  >
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact?.hours && (
                <li className="text-white">{contact.hours}</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom links */}
      <div className="border-t border-white/20">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-wrap items-center justify-center gap-3 text-xs text-white">
          {safeLinks.map((l, i) => (
            <React.Fragment key={l.href}>
              <a
                href={l.href}
                className="text-white hover:text-white hover:underline"
              >
                {l.label}
              </a>
              {i < safeLinks.length - 1 && <span aria-hidden="true">•</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </footer>
  );
}

Footer.defaultProps = {
  contact: {
    email: "hello@kiddosintellect.com",
    phone: "+91 98796 20138",
    hours: "Mon–Sat, 10am–6pm IST",
  },
  links: [
    { label: "Privacy", href: "/privacy" },
    { label: "Returns", href: "/returns" },
    { label: "Shipping", href: "/shipping" },
  ],
};
