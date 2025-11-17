import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, Phone, MapPin, Clock, HelpCircle, Package, CheckCircle, MessageSquare
} from 'lucide-react';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FaThreads } from 'react-icons/fa6';
import ScrollToTopButton from '../components/ScrollToTopButton';

const ContactUs = () => {
  // Scroll to top on component mount
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
      <div className="hero py-16 mb-12">
        <div className="max-w-container mx-auto px-6">
          <div className="flex items-center justify-center mb-4">
            <MessageSquare className="w-12 h-12 text-brand" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center text-fg mb-4">
            Contact Us
          </h1>
          <p className="text-center text-fg-muted text-lg max-w-2xl mx-auto">
            We'd love to hear from you! Reach out to us through any of the channels below and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-container mx-auto px-6 pb-16">
        
        {/* Contact Methods Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Email Card */}
          <a 
            href={`mailto:${contactInfo.email}`}
            className="card hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                <Mail className="w-8 h-8 text-brand" />
              </div>
              <h3 className="font-bold text-fg mb-2">Email Us</h3>
              <p className="text-brand text-sm mb-2 break-all">{contactInfo.email}</p>
              <p className="text-fg-subtle text-xs">Response within 24 hours</p>
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
              <p className="text-fg-subtle text-xs">Mon-Sat, 9 AM - 6 PM IST</p>
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
              <h2 className="text-xl font-bold text-fg mb-4">Get In Touch</h2>
              
              {/* Email */}
              <div className="mb-4 pb-4 border-b border-border-subtle">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-fg mb-1">Email</div>
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className="text-brand hover:text-brand/80 text-sm break-all"
                    >
                      {contactInfo.email}
                    </a>
                    <p className="text-fg-subtle text-xs mt-1">Response within 24 hours</p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="mb-4 pb-4 border-b border-border-subtle">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-fg mb-1">Phone</div>
                    <a 
                      href={`tel:${contactInfo.phone}`}
                      className="text-brand hover:text-brand/80 text-sm"
                    >
                      {contactInfo.phone}
                    </a>
                    <p className="text-fg-subtle text-xs mt-1">Mon-Sat, 9 AM - 6 PM IST</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="mb-4 pb-4 border-b border-border-subtle">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                    <FaWhatsapp className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-fg mb-1">WhatsApp</div>
                    <a 
                      href={`https://wa.me/${contactInfo.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:text-brand/80 text-sm"
                    >
                      {contactInfo.phone}
                    </a>
                    <p className="text-fg-subtle text-xs mt-1">Quick responses</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-fg mb-1">Address</div>
                    <p className="text-fg-muted text-sm leading-relaxed mb-2">
                      {contactInfo.address.full}
                    </p>
                    <a
                      href={contactInfo.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:text-brand/80 text-sm inline-block"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="card bg-brand/5 border-brand/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-fg mb-2">Business Hours</div>
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
              <h3 className="font-bold text-fg mb-4">Follow Us</h3>
              <div className="flex gap-3">
                {socialLinks.map(social => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.id}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-lg bg-surface-subtle hover:bg-surface border border-border-subtle flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                      title={social.name}
                    >
                      <IconComponent 
                        className="w-6 h-6 transition-colors duration-200" 
                        style={{ color: social.color }}
                      />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="card">
              <h3 className="font-bold text-fg mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link 
                  to="/faq" 
                  className="flex items-center gap-2 text-fg-muted hover:text-brand transition-colors text-sm"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>FAQ</span>
                </Link>
                <Link 
                  to="/shipping" 
                  className="flex items-center gap-2 text-fg-muted hover:text-brand transition-colors text-sm"
                >
                  <Package className="w-4 h-4" />
                  <span>Shipping Policy</span>
                </Link>
                <Link 
                  to="/refund" 
                  className="flex items-center gap-2 text-fg-muted hover:text-brand transition-colors text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Refund Policy</span>
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column - Google Maps */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Google Maps */}
            <div className="card p-0 overflow-hidden">
              <div className="p-4 border-b border-border-subtle">
                <h3 className="font-bold text-fg">Visit Our Store</h3>
                <p className="text-fg-muted text-sm mt-1">
                  {contactInfo.address.city}, {contactInfo.address.state} - {contactInfo.address.pincode}
                </p>
              </div>
              <div className="w-full h-96">
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
              <div className="p-4 bg-surface-subtle">
                <a
                  href={contactInfo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>

            {/* Why Contact Us Section */}
            <div className="card">
              <h3 className="text-xl font-bold text-fg mb-4">How Can We Help?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-surface-subtle rounded-lg p-4">
                  <div className="font-semibold text-fg mb-2">Product Inquiries</div>
                  <p className="text-fg-muted text-sm">
                    Questions about our products, sizing, materials, or recommendations for your little one.
                  </p>
                </div>
                <div className="bg-surface-subtle rounded-lg p-4">
                  <div className="font-semibold text-fg mb-2">Order Support</div>
                  <p className="text-fg-muted text-sm">
                    Track your order, modify shipping address, or inquire about delivery status.
                  </p>
                </div>
                <div className="bg-surface-subtle rounded-lg p-4">
                  <div className="font-semibold text-fg mb-2">Returns & Refunds</div>
                  <p className="text-fg-muted text-sm">
                    Need help with a return, exchange, or refund? We're here to assist you.
                  </p>
                </div>
                <div className="bg-surface-subtle rounded-lg p-4">
                  <div className="font-semibold text-fg mb-2">Bulk Orders</div>
                  <p className="text-fg-muted text-sm">
                    Special pricing available for schools, daycare centers, and party planners.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Response Time Banner */}
        <div className="card bg-brand text-brand-foreground mt-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">We're Here to Help!</h3>
            <p className="opacity-90 mb-6">
              Our customer support team typically responds within 24 hours on business days. 
              For urgent matters, please call us or message us on WhatsApp.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={`tel:${contactInfo.phone}`}
                className="btn-secondary bg-brand-foreground text-brand hover:bg-brand-foreground/90 flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
              <a
                href={`https://wa.me/${contactInfo.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary bg-[#25D366] text-white hover:bg-[#25D366]/90 flex items-center gap-2"
              >
                <FaWhatsapp className="w-4 h-4" />
                WhatsApp Us
              </a>
              <a
                href={`mailto:${contactInfo.email}`}
                className="btn-secondary bg-brand-foreground/10 text-brand-foreground hover:bg-brand-foreground/20 border border-brand-foreground/20 flex items-center gap-2"
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
