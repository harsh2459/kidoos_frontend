import React, { useState, useEffect } from 'react';
import { 
    HelpCircle, ChevronDown, Package, CreditCard, Truck, 
    ShieldCheck, Mail, Phone, FileText, RefreshCw, Shield, 
    ChevronRight, ArrowRight 
} from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { Link } from 'react-router-dom';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    // Scroll to top on component mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Consistent background texture
    const bgImage = "url('/images/terms-bg.png')";

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
        <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34]">
            
            {/* --- HERO SECTION --- */}
            <div className="relative w-full pt-20 md:pt-24 pb-16 px-6 border-b border-[#E3E8E5] overflow-hidden bg-[#F4F7F5]">
                
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

                {/* Content Layer */}
                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 mb-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm ring-1 ring-[#DCE4E0]">
                        <HelpCircle className="w-8 h-8 md:w-10 md:h-10 text-[#1A3C34]" />
                    </div>
                    
                    <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-[#1A3C34] mb-6 tracking-tight leading-tight drop-shadow-sm">
                        Frequently Asked Questions
                    </h1>
                    
                    <p className="text-lg md:text-xl text-[#5C756D] font-light max-w-2xl mx-auto leading-relaxed">
                        Find answers to common questions about our products, ordering, shipping, and more.
                        Can't find what you're looking for? Contact our support team!
                    </p>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="space-y-12">
                    
                    {/* FAQ Categories Loop */}
                    {faqData.map((category, categoryIndex) => {
                        const IconComponent = category.icon;
                        return (
                            <section key={categoryIndex} className="bg-white rounded-2xl border border-[#E3E8E5] shadow-sm overflow-hidden">
                                
                                {/* Category Header */}
                                <div className="flex items-center gap-3 p-6 md:p-8 border-b border-[#E3E8E5] bg-[#FAFBF9]">
                                    <div className="w-10 h-10 rounded-xl bg-[#E8F0EB] flex items-center justify-center text-[#1A3C34]">
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#1A3C34]">
                                        {category.category}
                                    </h2>
                                </div>

                                {/* Accordion Items */}
                                <div className="divide-y divide-[#E3E8E5]">
                                    {category.questions.map((faq, faqIndex) => {
                                        const globalIndex = `${categoryIndex}-${faqIndex}`;
                                        const isOpen = openIndex === globalIndex;

                                        return (
                                            <div key={faqIndex} className="transition-all duration-200">
                                                <button
                                                    onClick={() => toggleAccordion(globalIndex)}
                                                    className={`w-full px-6 md:px-8 py-5 flex items-center justify-between text-left hover:bg-[#F4F7F5] transition-colors duration-200 ${isOpen ? 'bg-[#F4F7F5]' : ''}`}
                                                >
                                                    <span className={`font-semibold pr-4 text-base md:text-lg transition-colors ${isOpen ? 'text-[#1A3C34]' : 'text-[#4A5D56]'}`}>
                                                        {faq.question}
                                                    </span>
                                                    <ChevronDown
                                                        className={`w-5 h-5 text-[#4A7C59] flex-shrink-0 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
                                                    />
                                                </button>

                                                <div
                                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                                >
                                                    <div className="px-6 md:px-8 pb-6 pt-0">
                                                        <p className="text-[#5C756D] leading-relaxed text-sm md:text-base border-t border-[#E3E8E5]/50 pt-4">
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

                    {/* Still Have Questions Section */}
                    <div className="bg-[#1A3C34] text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                        {/* Decorative Circle */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4A7C59]/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-2xl md:text-4xl font-serif font-bold mb-4">Still Have Questions?</h2>
                            <p className="text-[#8BA699] mb-8 text-lg font-light leading-relaxed">
                                Can't find the answer you're looking for? Our friendly customer support team is here to help!
                                Reach out to us and we'll get back to you as soon as possible.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <a
                                    href="mailto:kiddosintellect@gmail.com"
                                    className="bg-white text-[#1A3C34] hover:bg-[#E8F0EB] px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
                                >
                                    <Mail className="w-4 h-4" />
                                    Email Us
                                </a>
                                <a
                                    href="tel:+919879857529"
                                    className="bg-transparent border border-[#8BA699] text-white hover:bg-white/10 px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                                >
                                    <Phone className="w-4 h-4" />
                                    Call Us
                                </a>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#8BA699]">
                                <p>Business Hours: Mon - Sat, 9:00 AM - 6:00 PM IST</p>
                                <p>Email Response: Within 24 hours</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links / Related Resources */}
                    <section>
                        <h2 className="text-2xl font-serif font-bold text-[#1A3C34] mb-6 text-center">
                            Related Resources
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { title: "Privacy Policy", link: "/privacy", icon: Shield, desc: "Data protection" },
                                { title: "Shipping Policy", link: "/shipping", icon: Truck, desc: "Delivery info" },
                                { title: "Refund Policy", link: "/refund", icon: RefreshCw, desc: "Returns info" },
                                { title: "Terms & Conditions", link: "/terms", icon: FileText, desc: "Legal terms" },
                            ].map((item, idx) => (
                                <Link
                                    key={idx}
                                    to={item.link}
                                    className="group p-6 bg-white rounded-xl border border-[#E3E8E5] hover:border-[#4A7C59] hover:shadow-md transition-all duration-300 text-center"
                                >
                                    <div className="w-12 h-12 mx-auto rounded-full bg-[#E8F0EB] group-hover:bg-[#1A3C34] flex items-center justify-center transition-colors duration-300 mb-4">
                                        <item.icon className="w-6 h-6 text-[#1A3C34] group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="font-bold text-[#1A3C34] mb-1 group-hover:text-[#4A7C59] transition-colors">{item.title}</h3>
                                    <p className="text-xs text-[#5C756D] uppercase tracking-wide">{item.desc}</p>
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