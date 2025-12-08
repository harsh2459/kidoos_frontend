import React, { useEffect } from 'react';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { Link } from 'react-router-dom';
import {
    BookOpen, Heart, Users, Truck, ShieldCheck,
    Sparkles, Target, Lightbulb, TrendingUp,
    Award, Mail, Phone, ArrowRight, Star
} from 'lucide-react';

export default function AboutUs() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const bgImage = "url('/images/terms-bg.png')";

    return (
        <div className="bg-[#F4F7F5] font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34] min-h-screen">

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
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-2 mb-8 bg-white/80 backdrop-blur-sm rounded-full text-[#1A3C34] font-medium text-sm shadow-sm ring-1 ring-[#DCE4E0]">
                        <BookOpen className="w-4 h-4 text-[#4A7C59]" />
                        <span>About Kiddos Intellect</span>
                    </div>

                    <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-[#1A3C34] mb-8 tracking-tight leading-tight drop-shadow-sm">
                        Nurturing Young Minds<br />
                        <span className="text-[#4A7C59] italic">
                            One Book at a Time
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-[#5C756D] max-w-3xl mx-auto leading-relaxed font-light">
                        At Kiddos Intellect, we believe every child deserves access to quality books that spark curiosity, foster imagination, and build a lifelong love for reading.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-20">

                {/* --- STORY SECTION --- */}
                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1A3C34] mb-6">Our Story</h2>
                        <div className="space-y-6 text-[#4A5D56] text-lg leading-relaxed font-light">
                            <p>
                                In today's digital age, children are increasingly disconnected from their spiritual roots and cultural values. Founded with a mission to counter screen addiction and restore meaningful learning, Kiddos Intellect brings you carefully curated books that teach timeless religious wisdom, moral values, and life lessons from sacred texts like the Bhagavad Gita, Ramayana, and other spiritual classics.
                            </p>
                            <p>
                                We understand the challenges parents face—children glued to smartphones, tablets, and video games, missing out on the profound teachings that shaped generations. Our collection bridges this gap by making ancient wisdom accessible, engaging, and age-appropriate through beautifully illustrated storybooks that capture young minds.
                            </p>
                            <p>
                                From stories of Lord Krishna's divine teachings to tales of courage, compassion, and dharma from Indian mythology, each book is designed to instill strong moral foundations, cultural pride, and spiritual awareness—helping children grow into thoughtful, value-driven individuals rooted in their heritage.
                            </p>
                            <div className="bg-[#E8F0EB] border-l-4 border-[#4A7C59] p-5 rounded-r-lg">
                                <p className="font-medium text-[#1A3C34]">
                                    What started as a humble effort to preserve our rich spiritual legacy has grown into a trusted destination for parents, educators, and grandparents who believe in raising children with strong character.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500 bg-[#DCE4E0]">
                            {/* Replace with your actual About Us image path */}
                            <img src="/images/About-us.png" alt="Our Story" className="w-full h-full object-cover" />
                        </div>
                        {/* Decorative elements matching theme */}
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#4A7C59]/20 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#1A3C34]/10 rounded-full blur-3xl -z-10"></div>
                    </div>
                </div>

                {/* --- MISSION & VISION --- */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#E3E8E5] shadow-sm hover:shadow-md transition-shadow group">
                        <div className="w-14 h-14 rounded-2xl bg-[#E8F0EB] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Target className="w-7 h-7 text-[#4A7C59]" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-[#1A3C34] mb-4">Our Mission</h3>
                        <p className="text-[#4A5D56] leading-relaxed text-lg">
                            To make quality children's literature accessible and affordable to every family, fostering a culture of reading that empowers young minds to explore, learn, and grow beyond screens.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#E3E8E5] shadow-sm hover:shadow-md transition-shadow group">
                        <div className="w-14 h-14 rounded-2xl bg-[#FAFBF9] border border-[#E3E8E5] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Lightbulb className="w-7 h-7 text-[#1A3C34]" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-[#1A3C34] mb-4">Our Vision</h3>
                        <p className="text-[#4A5D56] leading-relaxed text-lg">
                            A future where every child in India has access to books that inspire them to dream bigger, think deeper, and become lifelong learners who contribute positively to society.
                        </p>
                    </div>
                </div>

                {/* --- WHAT MAKES US DIFFERENT --- */}
                <div>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#1A3C34] mb-6">What Makes Us Different</h2>
                        <div className="w-24 h-1 bg-[#4A7C59] mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Star,
                                title: "Hand-Picked Selection",
                                description: "Every book is carefully reviewed and selected by our team of educators and parents to ensure quality content."
                            },
                            {
                                icon: TrendingUp,
                                title: "Affordable Pricing",
                                description: "Quality books shouldn't break the bank. We offer competitive prices and regular discounts to make reading accessible."
                            },
                            {
                                icon: Truck,
                                title: "Fast Delivery",
                                description: "Quick and reliable shipping across India, so your little ones can start their reading adventure without delay."
                            },
                            {
                                icon: BookOpen,
                                title: "Age-Appropriate",
                                description: "Books organized by age groups and reading levels, making it easy to find the perfect match for your child."
                            },
                            {
                                icon: ShieldCheck,
                                title: "Trusted by Parents",
                                description: "Join thousands of satisfied parents who trust us to deliver quality books that their children love."
                            },
                            {
                                icon: Users,
                                title: "Customer Support",
                                description: "Have questions? Our friendly team is always ready to help you find the perfect books for your children."
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-8 border border-[#E3E8E5] hover:border-[#4A7C59] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                                <div className="w-12 h-12 rounded-xl bg-[#FAFBF9] group-hover:bg-[#E8F0EB] flex items-center justify-center mb-6 transition-colors border border-[#E3E8E5] group-hover:border-[#DCE4E0]">
                                    <item.icon className="w-6 h-6 text-[#5C756D] group-hover:text-[#1A3C34] transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-[#1A3C34] mb-3 group-hover:text-[#4A7C59] transition-colors">{item.title}</h3>
                                <p className="text-[#4A5D56] leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- VALUES SECTION (Dark Wisdom Theme) --- */}
                <div className="bg-[#1A3C34] text-white rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#4A7C59]/20 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-16">Our Core Values</h2>
                        <div className="grid md:grid-cols-4 gap-12 text-center">
                            {[
                                { icon: Award, title: "Quality First", desc: "Every book meets our high standards" },
                                { icon: Heart, title: "Child-Centric", desc: "Children's development is our priority" },
                                { icon: Sparkles, title: "Innovation", desc: "Always evolving our collection" },
                                { icon: ShieldCheck, title: "Trust", desc: "Building lasting relationships" }
                            ].map((value, idx) => (
                                <div key={idx} className="group">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-[#4A7C59]/20 group-hover:border-[#4A7C59]/50 transition-all duration-300">
                                        <value.icon className="w-8 h-8 text-[#8BA699] group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-white">{value.title}</h3>
                                    <p className="text-[#8BA699] text-sm">{value.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- STATS SECTION --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-[#E3E8E5]">
                    {[
                        { number: "10K+", label: "Happy Families" },
                        { number: "200+", label: "Books Available" },
                        { number: "100%", label: "Quality Assured" },
                        { number: "Pan India", label: "Delivery" }
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center">
                            <div className="text-4xl md:text-5xl font-serif font-bold text-[#1A3C34] mb-2">
                                {stat.number}
                            </div>
                            <div className="text-[#5C756D] font-medium tracking-wide uppercase text-sm">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* --- CTA SECTION --- */}
                <div className="bg-[#E8F0EB] rounded-3xl p-12 md:p-16 text-center border border-[#DCE4E0]">
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#1A3C34] mb-6">Start Your Child's Reading Journey</h2>
                    <p className="text-[#4A5D56] text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                        Explore our carefully curated collection of children's books and give your child the gift of knowledge and imagination.
                    </p>
                    <Link
                        to="/catalog"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#1A3C34] text-white rounded-xl font-bold hover:bg-[#2F523F] hover:-translate-y-1 transition-all shadow-xl shadow-[#1A3C34]/10"
                    >
                        Browse Our Catalog
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* --- CONTACT FOOTER --- */}
                <div className="text-center pb-8">
                    <h2 className="text-2xl font-serif font-bold text-[#1A3C34] mb-4">Get in Touch</h2>
                    <p className="text-[#4A5D56] mb-8">
                        Have questions or suggestions? We'd love to hear from you!
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <a href="mailto:kiddosintellect@gmail.com" className="flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-[#E3E8E5] text-[#2C3E38] hover:border-[#4A7C59] hover:text-[#1A3C34] transition-all shadow-sm">
                            <Mail className="w-4 h-4" />
                            <span className="font-medium">kiddosintellect@gmail.com</span>
                        </a>
                        <a href="tel:+919879857529" className="flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-[#E3E8E5] text-[#2C3E38] hover:border-[#4A7C59] hover:text-[#1A3C34] transition-all shadow-sm">
                            <Phone className="w-4 h-4" />
                            <span className="font-medium">+91 9879857529</span>
                        </a>
                    </div>
                </div>

            </div>
            <ScrollToTopButton />
        </div>
    );
}