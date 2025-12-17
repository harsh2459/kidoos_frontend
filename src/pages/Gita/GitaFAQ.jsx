import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import WaveText from '../../components/WaveText';
import { Link } from 'react-router-dom';

const GitaFAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const faqs = [
        {
            question: "What age group is this book suitable for?",
            answer: "The kiddos intellect book is specifically designed for children aged 5-12 years. The content, illustrations, and language complexity are carefully calibrated to match developmental stages within this age range. Younger children (5-7) will enjoy the colorful illustrations and simple stories, while older children (8-12) will grasp deeper meanings and life lessons."
        },
        {
            question: "How long does delivery take?",
            answer: "We offer lightning-fast delivery! Most orders within India are delivered within 2-4 business days. Metro cities typically receive orders in 2-3 days, while other locations may take 3-4 days. We'll provide you with a tracking number as soon as your order ships so you can follow its journey."
        },
        {
            question: "Is the content appropriate and safe for children?",
            answer: "Absolutely! Every page has been reviewed by child psychologists, educators, and parents. The content focuses on universal values like empathy, courage, resilience, and kindness. We've carefully adapted ancient Gita wisdom into age-appropriate stories that are completely safe, educational, and inspiring for young minds."
        },
        {
            question: "What language editions are available?",
            answer: "Currently, kiddos intellect is available in three languages: English, Hindi, and Gujarati. Each edition maintains the same high-quality illustrations and carefully adapted content. We're working on adding more regional languages based on demand from our community."
        },
        {
            question: "Can I preview some pages before buying?",
            answer: "Yes! We understand you'd like to see what's inside. You can view sample pages by clicking on the book preview section above, or contact our support team and we'll send you a detailed PDF preview of selected pages showcasing the illustration style, content quality, and educational approach."
        },
        {
            question: "What is your return/refund policy?",
            answer: "We offer a 7-day return policy. If you're not completely satisfied with your purchase, you can return the book in its original condition within 7 days of delivery for a full refund. We want every family to be thrilled with their kiddos intellect experience, and we stand behind our product quality."
        },
        {
            question: "Do you offer bulk discounts for schools or groups?",
            answer: "Yes! We offer special pricing for bulk orders of 10 or more books. This is perfect for schools, reading clubs, community centers, or gifting to multiple children. Contact our team at support@kiddos intellect.com with your requirements, and we'll provide you with a customized quote."
        },
        {
            question: "How is this different from other children's books?",
            answer: "kiddos intellect isn't just entertainment—it's a carefully curated curriculum for life. Each story is designed to build specific character traits like focus, empathy, resilience, and decision-making skills. Unlike generic storybooks, every page serves a purpose in your child's emotional and intellectual development. Plus, it connects them with their cultural roots in an accessible, modern way."
        },
        {
            question: "My child doesn't like reading. Will this book help?",
            answer: "That's exactly why we created kiddos intellect! Our book uses captivating illustrations, short engaging stories, and relatable characters that hold children's attention. Many parents report that their screen-addicted kids voluntarily put down devices to read this book. The visual storytelling approach makes reading feel less like a chore and more like an adventure."
        },
        {
            question: "Is this a religious book?",
            answer: "No, kiddos intellect is a book of universal life lessons and values, not a religious text. While it draws wisdom from the Bhagavad Gita, we've adapted the teachings into secular, universal principles that benefit all children regardless of their family's religious background. It's about building character, empathy, and wisdom—values that transcend any single belief system."
        },
        {
            question: "Can I gift this book? Do you offer gift wrapping?",
            answer: "Absolutely! kiddos intellect makes a meaningful gift for birthdays, festivals, or any special occasion. We offer complimentary gift wrapping with a personalized message card. Just select the gift option during checkout and add your custom message. We'll make sure it arrives beautifully packaged and ready to delight!"
        },
        {
            question: "How can I contact customer support?",
            answer: "We're here to help! You can reach our passionate support team via email at support@kiddos intellect.com, or use the contact form on our website. We typically respond within 24 hours on business days. For urgent queries, you can also reach us through our social media channels—we're very responsive!"
        }
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section
            ref={sectionRef}
            className="py-24 px-6 bg-[#FFFEF5] overflow-hidden"
        >
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div
                    className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                >
                    <div className="inline-flex items-center gap-2 bg-[#FDE68A] text-[#92400E] px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                        <HelpCircle size={16} />
                        <span>Got Questions?</span>
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#051A12] mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Everything you need to know about kiddos intellect. Can't find what you're looking for?
                        <a href="/contact" className="text-[#F59E0B] hover:underline ml-1">
                            <WaveText text="Contact our team" />
                        </a>.
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`bg-white border-2 border-gray-100 rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#F59E0B]/30 hover:shadow-md ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                }`}
                            style={{
                                transitionDelay: isVisible ? `${index * 50}ms` : '0ms'
                            }}
                        >
                            {/* Question Button */}
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 md:px-8 py-6 flex justify-between items-start gap-4 text-left group transition-colors duration-300 hover:bg-gray-50"
                            >
                                <span className={`font-serif text-lg md:text-xl transition-colors duration-300 ${openIndex === index ? 'text-[#F59E0B]' : 'text-[#051A12] group-hover:text-[#F59E0B]'
                                    }`}>
                                    <WaveText text={faq.question} />
                                </span>
                                <ChevronDown
                                    className={`flex-shrink-0 w-6 h-6 transition-all duration-300 ${openIndex === index
                                        ? 'rotate-180 text-[#F59E0B]'
                                        : 'text-gray-400 group-hover:text-[#F59E0B]'
                                        }`}
                                />
                            </button>

                            {/* Answer Panel */}
                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="px-6 md:px-8 pb-6 pt-2">
                                    <div className="w-12 h-1 bg-[#F59E0B] rounded-full mb-4"></div>
                                    <p className="text-gray-700 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Still Have Questions CTA */}
                <div
                    className={`mt-16 text-center bg-gradient-to-br from-[#F59E0B]/10 to-[#FDE68A]/20 rounded-3xl p-8 md:p-12 border border-[#F59E0B]/20 transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                >
                    <h3 className="font-serif text-2xl md:text-3xl text-[#051A12] mb-3">
                        Still have questions?
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                        Our passionate team is here to help you find the perfect book for your child.
                        We're just a message away!
                    </p>
                    <Link to="/contact">
                    <button className="bg-[#F59E0B] text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-[#DC7609] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                        Contact Support
                    </button>
                    </Link>
                </div>

            </div>
        </section>
    );
};

export default GitaFAQ;