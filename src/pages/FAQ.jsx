import React, { useState, useEffect } from 'react';
import {
    HelpCircle, ChevronDown, Package, CreditCard, Truck,
    ShieldCheck, Mail, Phone, FileText, RefreshCw, Shield,
    ChevronRight, ArrowRight
} from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    // Scroll to top on component mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // VRINDAVAN THEME ASSETS
    const parchmentBg = "url('/images-webp/homepage/parchment-bg.webp')";
    // Use the NEW Library Image you generated here:
    const heroBg = "url('/images-webp/faq-library-bg.webp')";

    const faqData = [
        {
            category: "Product Information",
            icon: Package,
            questions: [
                {
                    question: "What age range are your products suitable for?",
                    answer: "Our products are carefully curated for children aged 0-12 years. Each product listing includes specific age recommendations to help you choose the right items for your child's developmental stage. We categorize our products by age groups: Infants (0-12 months), Toddlers (1-3 years), Preschoolers (3-5 years), and Kids (6-12 years)."
                },
                {
                    question: "Are your products safe for children?",
                    answer: "Absolutely! Safety is our top priority. All our products meet international safety standards and are made from non-toxic, child-safe materials. We carefully vet each supplier and conduct quality checks. Products undergo testing for harmful chemicals, sharp edges, and small parts that could pose choking hazards. Look for safety certifications in the product description."
                },
                {
                    question: "Do you offer eco-friendly or sustainable products?",
                    answer: "Yes! We have a dedicated collection of eco-friendly and sustainable products made from organic materials, recycled components, and biodegradable packaging. These items are clearly marked with an 'Eco-Friendly' badge on product pages. We're committed to expanding our sustainable product range."
                },
                {
                    question: "How do I know what size to order?",
                    answer: "Each product page includes a detailed size guide with measurements. We recommend measuring your child and comparing with our size charts. For clothing, we provide age-based recommendations, but every child grows differently. When in doubt, we suggest ordering one size up for longer use. If you need help, our customer support team is happy to assist!"
                },
                {
                    question: "Can I see product reviews before purchasing?",
                    answer: "Yes! We display verified customer reviews and ratings on each product page. These include written reviews, star ratings, and sometimes photos from other parents. We believe in transparency and encourage all customers to share their honest feedback to help other families make informed decisions."
                }
            ]
        },
        {
            category: "Ordering & Payment",
            icon: CreditCard,
            questions: [
                {
                    question: "What payment methods do you accept?",
                    answer: "We accept all major payment methods including Credit/Debit Cards (Visa, Mastercard, American Express), UPI (Google Pay, PhonePe, Paytm), Net Banking, and Digital Wallets. All transactions are secured with SSL encryption and processed through trusted payment gateways. Your financial information is never stored on our servers."
                },
                {
                    question: "Is it safe to use my credit card on your website?",
                    answer: "Absolutely! We use industry-standard SSL encryption and PCI-DSS compliant payment gateways to ensure your payment information is completely secure. We never store your full credit card details. You'll see a padlock icon in your browser's address bar confirming the secure connection."
                },
                {
                    question: "Can I modify or cancel my order after placing it?",
                    answer: "You can modify or cancel your order within 1 hour of placement by contacting our customer support immediately. Once the order is processed and packed, cancellation may not be possible. However, we'll do our best to accommodate your request. Please refer to our Refund Policy for more details."
                },
                {
                    question: "Do you offer Cash on Delivery (COD)?",
                    answer: "Currently, we only accept online payments for faster order processing and enhanced security. This allows us to verify orders quickly and ship your products without delays. We're working on introducing COD for select locations soon."
                },
                {
                    question: "Will I receive an order confirmation?",
                    answer: "Yes! You'll receive an order confirmation email immediately after placing your order, along with an SMS notification. This will include your order number, items ordered, delivery address, and expected delivery date. You can track your order status anytime using the order number."
                }
            ]
        },
        {
            category: "Shipping & Delivery",
            icon: Truck,
            questions: [
                {
                    question: "How long does delivery take?",
                    answer: "Standard delivery typically takes 3-7 business days depending on your location. Metro cities usually receive orders within 3-4 days, while remote areas may take up to 7 days. You'll receive a tracking number once your order ships, and you can monitor real-time delivery status."
                },
                {
                    question: "Do you ship internationally?",
                    answer: "Currently, we only ship within India. We're working on expanding our shipping capabilities to international destinations. If you're interested in international shipping, please contact us at support@kiddosintallcat.com, and we'll notify you when it becomes available."
                },
                {
                    question: "What are the shipping charges?",
                    answer: "Shipping charges vary based on your location, order weight, and delivery speed. The exact amount will be calculated and displayed at checkout before you complete your purchase. We frequently offer free shipping promotions on orders above a certain value - watch for these deals!"
                },
                {
                    question: "What if I'm not home when the delivery arrives?",
                    answer: "Our delivery partners will attempt delivery 2-3 times. If you're unavailable, they'll leave a notification with delivery instructions. You can also coordinate with the delivery person directly through the phone number provided in your tracking updates. Some locations offer alternative pickup points as well."
                },
                {
                    question: "Do you offer express or same-day delivery?",
                    answer: "We're currently working on express delivery options for select metro cities. Same-day delivery is not available yet, but we're exploring this feature. Standard delivery (3-7 days) ensures your products reach you safely and in perfect condition."
                }
            ]
        },
        {
            category: "Returns & Exchanges",
            icon: ShieldCheck,
            questions: [
                {
                    question: "What is your return policy?",
                    answer: "Due to the nature of our products (children's items with hygiene considerations), we have a strict no-return policy on most items once opened or used. However, if you receive a damaged, defective, or incorrect product, please contact us within 48 hours of delivery with photos. We'll arrange a replacement or refund as per our Refund Policy."
                },
                {
                    question: "What if I receive a damaged product?",
                    answer: "We're sorry if that happens! Please contact us immediately at support@kiddosintallcat.com with your order number and clear photos of the damaged item and packaging. We'll arrange a replacement or full refund within 3-5 business days after verification. Your satisfaction is our priority."
                },
                {
                    question: "How long does the refund process take?",
                    answer: "Once we receive and verify the returned item (for eligible returns), refunds are processed within 7-10 business days. The amount will be credited to your original payment method. You'll receive a confirmation email once the refund is initiated. Bank processing times may vary."
                },
                {
                    question: "Are there any items that cannot be returned?",
                    answer: "Yes, certain items are non-returnable for hygiene and safety reasons: personalized/custom products, underwear, swimwear, opened personal care items, and digital products. Sale or clearance items are also final sale. Please check the product page for specific return eligibility before purchasing."
                }
            ]
        },
        {
            category: "Account & Support",
            icon: HelpCircle,
            questions: [
                {
                    question: "Do I need to create an account to place an order?",
                    answer: "While you can browse our catalog without an account, we recommend creating one for a smoother checkout experience. With an account, you can track orders, save your favorite items, manage addresses, view order history, and receive exclusive offers. Account creation is quick and free!"
                },
                {
                    question: "How can I contact customer support?",
                    answer: "We're here to help! You can reach us via Email: kiddosintellect@gmail.com, Phone: +91-98798 57529 (Mon-Sat, 10 AM - 6 PM IST), or through our Contact Us page. We typically respond to emails within 24 hours on business days. For urgent matters, please call us directly."
                },
                {
                    question: "How do I reset my password?",
                    answer: "Click on 'Login' in the top navigation, then select 'Forgot Password'. Enter your registered email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password. If you don't receive the email within 5 minutes, check your spam folder or contact support."
                },
                {
                    question: "Can I save items for later?",
                    answer: "Yes! We're currently developing a wishlist feature where you can save your favorite products. In the meantime, you can add items to your cart and they'll remain there for 7 days. We'll also send you reminder notifications if you have items waiting in your cart."
                },
                {
                    question: "Do you have a loyalty or rewards program?",
                    answer: "We're excited to announce that we're launching a rewards program soon! Members will earn points on every purchase, receive birthday discounts, early access to sales, and exclusive offers. Sign up for our newsletter to be notified when the program launches."
                },
            ]
        }
    ];

    return (
        <div className="bg-[#FAF7F2] min-h-screen font-['Lato'] text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723]">
            <SEO
                title="Frequently Asked Questions | Kiddos Intellect"
                description="Find answers to common questions about our premium children's books, ordering, shipping, payments, returns, and customer support. Get help with your queries."
                image="/favicon.jpg"
                type="website"
                keywords="FAQ, children's books FAQ, kids books questions, shipping policy, return policy, customer support, payment methods, book ordering"
                breadcrumbs={[
                    { name: "Home", url: "/" },
                    { name: "FAQ", url: "/faq" }
                ]}
                faq={{
                    questions: faqData.flatMap(cat =>
                        cat.questions.map(q => ({
                            question: q.question,
                            answer: q.answer
                        }))
                    )
                }}
            />

            {/* --- HERO SECTION --- */}
            <div className="relative w-full pt-28 md:pt-36 pb-20 px-6 border-b border-[#D4AF37]/30 overflow-hidden">

                {/* Background Image Layer */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: heroBg,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 1 // Full opacity since it's an image
                    }}
                />

                {/* Gradient Overlay to make text readable */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FAF7F2]/80 via-[#FAF7F2]/70 to-[#FAF7F2] pointer-events-none"></div>

                {/* Content Layer */}
                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 mb-6 bg-white/70 backdrop-blur-sm rounded-full shadow-[0_4px_15px_rgba(212,175,55,0.2)] ring-1 ring-[#D4AF37]/40">
                        <HelpCircle className="w-8 h-8 text-[#D4AF37]" />
                    </div>

                    <h1 className="font-['Playfair_Display'] text-5xl md:text-6xl lg:text-7xl font-bold text-[#3E2723] mb-6 tracking-tight leading-tight drop-shadow-sm">
                        Frequently Asked <span className="text-[#D4AF37] italic">Questions</span>
                    </h1>

                    <p className="text-lg md:text-xl text-[#5C4A2E] font-light max-w-2xl mx-auto leading-relaxed">
                        Find answers to common questions about our products, ordering, shipping, and more.
                        Can't find what you're looking for? Contact our support team!
                    </p>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative">

                {/* Parchment Background for Content Area */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-40 z-0"
                    style={{ backgroundImage: parchmentBg, backgroundSize: 'cover' }}
                ></div>

                <div className="relative z-10 space-y-16">

                    {/* FAQ Categories Loop */}
                    {faqData.map((category, categoryIndex) => {
                        const IconComponent = category.icon;
                        return (
                            <section key={categoryIndex} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#D4AF37]/20 shadow-[0_5px_25px_rgba(62,39,35,0.05)] overflow-hidden">

                                {/* Category Header */}
                                <div className="flex items-center gap-4 p-6 md:p-8 border-b border-[#D4AF37]/20 bg-gradient-to-r from-[#FFF9E6] to-white">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/30 shadow-sm">
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-['Cinzel'] font-bold text-[#3E2723]">
                                        {category.category}
                                    </h2>
                                </div>

                                {/* Accordion Items */}
                                <div className="divide-y divide-[#D4AF37]/20">
                                    {category.questions.map((faq, faqIndex) => {
                                        const globalIndex = `${categoryIndex}-${faqIndex}`;
                                        const isOpen = openIndex === globalIndex;

                                        return (
                                            <div key={faqIndex} className="transition-all duration-300">
                                                <button
                                                    onClick={() => toggleAccordion(globalIndex)}
                                                    className={`w-full px-6 md:px-8 py-6 flex items-center justify-between text-left hover:bg-[#FFF9E6]/50 transition-colors duration-200 ${isOpen ? 'bg-[#FFF9E6]' : ''}`}
                                                >
                                                    <span className={`font-semibold pr-4 text-base md:text-lg transition-colors font-['Lato'] ${isOpen ? 'text-[#3E2723]' : 'text-[#5C4A2E]'}`}>
                                                        {faq.question}
                                                    </span>
                                                    <ChevronDown
                                                        className={`w-5 h-5 text-[#D4AF37] flex-shrink-0 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
                                                    />
                                                </button>

                                                <div
                                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                                >
                                                    <div className="px-6 md:px-8 pb-8 pt-0">
                                                        <p className="text-[#5C4A2E] leading-relaxed text-sm md:text-base border-t border-[#D4AF37]/20 pt-4">
                                                            {faq.answer}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}

                    {/* Still Have Questions Section (Dark Wood Theme) */}
                    <div className="rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl"
                        style={{ background: 'linear-gradient(135deg, #3E2723 0%, #251613 100%)' }}>

                        {/* Decorative Circle */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
                        <div className="absolute inset-0 border border-[#D4AF37]/30 rounded-[2.5rem] pointer-events-none"></div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-['Cinzel'] font-bold mb-4 text-[#F3E5AB]">Still Have Questions?</h2>
                            <p className="text-[#D4AF37]/80 mb-10 text-lg font-light leading-relaxed">
                                Can't find the answer you're looking for? Our friendly customer support team is here to help!
                                Reach out to us and we'll get back to you as soon as possible.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                                <a
                                    href="mailto:kiddosintellect@gmail.com"
                                    className="bg-white text-[#3E2723] hover:bg-[#FFF9E6] px-10 py-4 rounded-full font-bold transition-all shadow-lg flex items-center gap-3 w-full sm:w-auto justify-center hover:-translate-y-1"
                                >
                                    <Mail className="w-5 h-5 text-[#D4AF37]" />
                                    Email Us
                                </a>
                                <a
                                    href="tel:+919879857529"
                                    className="bg-transparent border border-[#D4AF37] text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-[#3E2723] px-10 py-4 rounded-full font-bold transition-all flex items-center gap-3 w-full sm:w-auto justify-center hover:-translate-y-1"
                                >
                                    <Phone className="w-5 h-5" />
                                    Call Us
                                </a>
                            </div>

                            <div className="mt-10 pt-6 border-t border-[#D4AF37]/20 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#8A7A5E]">
                                <p className="text-[#F3E5AB]/70">Business Hours: Mon - Sat, 9:00 AM - 6:00 PM IST</p>
                                <p className="text-[#F3E5AB]/70">Email Response: Within 24 hours</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links / Related Resources */}
                    <section>
                        <h2 className="text-2xl font-['Cinzel'] font-bold text-[#3E2723] mb-8 text-center flex items-center justify-center gap-4">
                            <span className="h-[1px] w-12 bg-[#D4AF37]"></span>
                            Related Resources
                            <span className="h-[1px] w-12 bg-[#D4AF37]"></span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: "Privacy Policy", link: "/privacy", icon: Shield, desc: "Data protection" },
                                { title: "Shipping Policy", link: "/shipping", icon: Truck, desc: "Delivery info" },
                                { title: "Refund Policy", link: "/refund", icon: RefreshCw, desc: "Returns info" },
                                { title: "Terms & Conditions", link: "/terms", icon: FileText, desc: "Legal terms" },
                            ].map((item, idx) => (
                                <Link
                                    key={idx}
                                    to={item.link}
                                    className="group p-8 bg-white/90 backdrop-blur-sm rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-[0_10px_30px_rgba(212,175,55,0.15)] transition-all duration-300 text-center hover:-translate-y-2"
                                >
                                    <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF9E6] group-hover:bg-[#3E2723] flex items-center justify-center transition-colors duration-300 mb-4 border border-[#D4AF37]/30">
                                        <item.icon className="w-6 h-6 text-[#D4AF37] group-hover:text-[#F3E5AB] transition-colors" />
                                    </div>
                                    <h3 className="font-bold font-['Cinzel'] text-[#3E2723] mb-2 group-hover:text-[#B0894C] transition-colors">{item.title}</h3>
                                    <p className="text-xs text-[#8A7A5E] uppercase tracking-wide font-bold">{item.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </section>

                </div>
            </div>

            {/* Scroll to Top Button */}
            <ScrollToTopButton />
        </div>
    );
};

export default FAQ;