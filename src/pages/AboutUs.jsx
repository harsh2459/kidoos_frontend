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

    // --- NEW ASSETS FOR ABOUT US PAGE ---
    // Replace these with the new filenames you generate from the prompts above
    const heroBg = "url('/images/about/ancient-scripture-bg.png')"; 
    const patternBg = "url('/images/about/sacred-garden-pattern.png')"; 

    return (
        <div className="bg-[#FAF7F2] font-['Lato'] text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723] min-h-screen">

            {/* --- HERO SECTION (Legacy Theme) --- */}
            <div className="relative w-full pt-28 md:pt-36 pb-24 px-6 border-b border-[#D4AF37]/30 overflow-hidden">

                {/* New Ancient Scripture Background */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: heroBg,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 1
                    }}
                />

                {/* Soft Gold Overlay to ensure text pops */}
                <div className="absolute inset-0 bg-[#FAF7F2]/60 z-0 pointer-events-none"></div>

                {/* Content Layer */}
                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center gap-2 px-6 py-2 mb-8 bg-white/70 backdrop-blur-sm rounded-full text-[#3E2723] font-['Cinzel'] font-bold text-sm shadow-[0_2px_10px_rgba(212,175,55,0.2)] ring-1 ring-[#D4AF37]/40">
                        <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                        <span>About Kiddos Intellect</span>
                    </div>

                    <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl lg:text-7xl font-bold text-[#3E2723] mb-8 tracking-tight leading-tight drop-shadow-sm">
                        Nurturing Young Minds<br />
                        <span className="text-[#D4AF37] italic relative">
                            One Book at a Time
                            {/* Decorative underline */}
                            <svg className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-3 text-[#D4AF37] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-[#5C4A2E] max-w-3xl mx-auto leading-relaxed font-light">
                        At Kiddos Intellect, we believe every child deserves access to quality books that spark curiosity, foster imagination, and build a lifelong love for reading.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-24 relative">

                {/* Global Pattern Background for the content area */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.04] z-0"
                    style={{ backgroundImage: patternBg, backgroundSize: '400px' }}
                ></div>

                {/* --- STORY SECTION --- */}
                <div className="relative z-10 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-['Cinzel'] font-bold text-[#3E2723] mb-8 flex items-center gap-4">
                            <span className="w-12 h-[2px] bg-[#D4AF37]"></span>
                            Our Story
                        </h2>
                        <div className="space-y-6 text-[#5C4A2E] text-lg leading-relaxed font-light text-justify">
                            <p>
                                In today's digital age, children are increasingly disconnected from their spiritual roots and cultural values. Founded with a mission to counter screen addiction and restore meaningful learning, Kiddos Intellect brings you carefully curated books that teach timeless religious wisdom, moral values, and life lessons from sacred texts like the Bhagavad Gita, Ramayana, and other spiritual classics.
                            </p>
                            <p>
                                We understand the challenges parents face—children glued to smartphones, tablets, and video games, missing out on the profound teachings that shaped generations. Our collection bridges this gap by making ancient wisdom accessible, engaging, and age-appropriate through beautifully illustrated storybooks that capture young minds.
                            </p>
                            <p>
                                From stories of Lord Krishna's divine teachings to tales of courage, compassion, and dharma from Indian mythology, each book is designed to instill strong moral foundations, cultural pride, and spiritual awareness—helping children grow into thoughtful, value-driven individuals rooted in their heritage.
                            </p>
                            
                            {/* Quote Box with Gold Styling */}
                            <div className="relative mt-8 p-8 bg-gradient-to-br from-[#FFF9E6] to-[#FFFFFF] rounded-xl border border-[#D4AF37]/30 shadow-sm">
                                <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/50 rounded-t-xl"></div>
                                <p className="font-medium text-[#3E2723] italic font-['Playfair_Display'] text-xl relative z-10">
                                    "What started as a humble effort to preserve our rich spiritual legacy has grown into a trusted destination for parents, educators, and grandparents who believe in raising children with strong character."
                                </p>
                                <Sparkles className="absolute bottom-4 right-4 w-6 h-6 text-[#D4AF37]/40" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Image Side with "Photo Album" Effect */}
                    <div className="relative p-6 group">
                        {/* Back Photo */}
                        <div className="absolute inset-0 bg-[#3E2723] rounded-[2rem] rotate-6 opacity-10 group-hover:rotate-4 transition-transform duration-500"></div>
                        {/* Middle Photo */}
                        <div className="absolute inset-0 bg-[#D4AF37] rounded-[2rem] -rotate-3 opacity-20 group-hover:-rotate-2 transition-transform duration-500"></div>
                        
                        {/* Main Photo */}
                        <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(62,39,35,0.2)] border-4 border-white z-10">
                            {/* Replace with your actual About Us image path */}
                            <img src="/images/About-us.png" alt="Our Story" className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105" />
                        </div>
                    </div>
                </div>

                {/* --- MISSION & VISION (Cards) --- */}
                <div className="relative z-10 grid md:grid-cols-2 gap-8">
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 border border-[#D4AF37]/20 shadow-[0_10px_30px_rgba(62,39,35,0.05)] hover:shadow-[0_20px_40px_rgba(212,175,55,0.15)] hover:-translate-y-1 transition-all duration-300">
                        <div className="w-16 h-16 rounded-2xl bg-[#FFF9E6] border border-[#D4AF37] flex items-center justify-center mb-6">
                            <Target className="w-8 h-8 text-[#D4AF37]" />
                        </div>
                        <h3 className="text-2xl font-['Cinzel'] font-bold text-[#3E2723] mb-4">Our Mission</h3>
                        <p className="text-[#5C4A2E] leading-relaxed text-lg">
                            To make quality children's literature accessible and affordable to every family, fostering a culture of reading that empowers young minds to explore, learn, and grow beyond screens.
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 border border-[#D4AF37]/20 shadow-[0_10px_30px_rgba(62,39,35,0.05)] hover:shadow-[0_20px_40px_rgba(212,175,55,0.15)] hover:-translate-y-1 transition-all duration-300">
                        <div className="w-16 h-16 rounded-2xl bg-[#3E2723] border border-[#5C4A2E] flex items-center justify-center mb-6">
                            <Lightbulb className="w-8 h-8 text-[#D4AF37]" />
                        </div>
                        <h3 className="text-2xl font-['Cinzel'] font-bold text-[#3E2723] mb-4">Our Vision</h3>
                        <p className="text-[#5C4A2E] leading-relaxed text-lg">
                            A future where every child in India has access to books that inspire them to dream bigger, think deeper, and become lifelong learners who contribute positively to society.
                        </p>
                    </div>
                </div>

                {/* --- WHAT MAKES US DIFFERENT --- */}
                <div className="relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-['Cinzel'] font-bold text-[#3E2723] mb-4">What Makes Us Different</h2>
                        <div className="flex items-center justify-center gap-4">
                            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
                            <div className="w-3 h-3 rotate-45 bg-[#D4AF37]"></div>
                            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                            <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#D4AF37]/10 hover:border-[#D4AF37] hover:bg-white transition-all duration-300 group shadow-sm hover:shadow-lg">
                                <div className="w-12 h-12 rounded-lg bg-[#FAF7F2] group-hover:bg-[#3E2723] flex items-center justify-center mb-5 transition-colors border border-[#D4AF37]/20">
                                    <item.icon className="w-6 h-6 text-[#8A7A5E] group-hover:text-[#D4AF37] transition-colors" />
                                </div>
                                <h3 className="text-xl font-['Cinzel'] font-bold text-[#3E2723] mb-3">{item.title}</h3>
                                <p className="text-[#5C4A2E] leading-relaxed font-light">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- VALUES SECTION (Royal Dark Theme) --- */}
                <div className="relative z-10 rounded-[3rem] p-12 md:p-20 overflow-hidden text-center shadow-2xl"
                     style={{ background: 'linear-gradient(135deg, #2C1810 0%, #3E2723 100%)' }}>
                    
                    {/* Values Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                         style={{ backgroundImage: patternBg, backgroundSize: '300px' }}></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-['Cinzel'] font-bold mb-16 text-[#F3E5AB]">Our Core Values</h2>
                        <div className="grid md:grid-cols-4 gap-12">
                            {[
                                { icon: Award, title: "Quality First", desc: "Every book meets our high standards" },
                                { icon: Heart, title: "Child-Centric", desc: "Children's development is our priority" },
                                { icon: Sparkles, title: "Innovation", desc: "Always evolving our collection" },
                                { icon: ShieldCheck, title: "Trust", desc: "Building lasting relationships" }
                            ].map((value, idx) => (
                                <div key={idx} className="group flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37]/30 flex items-center justify-center mb-6 group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-all duration-300 relative">
                                        <value.icon className="w-9 h-9 text-[#F3E5AB] group-hover:text-white transition-colors" />
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 rounded-full bg-[#D4AF37] opacity-0 group-hover:opacity-20 blur-lg transition-opacity"></div>
                                    </div>
                                    <h3 className="text-xl font-['Cinzel'] font-bold mb-3 text-white">{value.title}</h3>
                                    <p className="text-[#D4AF37]/80 text-sm">{value.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- STATS SECTION --- */}
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-[#D4AF37]/20 bg-[#FFF9E6]/30 rounded-xl">
                    {[
                        { number: "10K+", label: "Happy Families" },
                        { number: "200+", label: "Books Available" },
                        { number: "100%", label: "Quality Assured" },
                        { number: "Pan India", label: "Delivery" }
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center">
                            <div className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-[#3E2723] mb-2 drop-shadow-sm">
                                {stat.number}
                            </div>
                            <div className="text-[#B0894C] font-bold tracking-widest uppercase text-xs font-['Lato']">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* --- CTA SECTION --- */}
                <div className="relative z-10 bg-gradient-to-br from-[#FFF9E6] to-white rounded-[2rem] p-12 md:p-16 text-center border border-[#D4AF37]/30 shadow-lg">
                    <h2 className="text-3xl md:text-5xl font-['Cinzel'] font-bold text-[#3E2723] mb-6">Start Your Child's Reading Journey</h2>
                    <p className="text-[#5C4A2E] text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                        Explore our carefully curated collection of children's books and give your child the gift of knowledge and imagination.
                    </p>
                    <Link
                        to="/catalog"
                        className="inline-flex items-center gap-3 px-10 py-4 bg-[#3E2723] text-[#F3E5AB] rounded-full font-bold hover:bg-[#5D4037] hover:-translate-y-1 transition-all shadow-xl border border-[#D4AF37]"
                    >
                        Browse Our Catalog
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* --- CONTACT FOOTER --- */}
                <div className="text-center pb-8 relative z-10">
                    <h2 className="text-2xl font-['Cinzel'] font-bold text-[#3E2723] mb-4">Get in Touch</h2>
                    <p className="text-[#5C4A2E] mb-8">
                        Have questions or suggestions? We'd love to hear from you!
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <a href="mailto:kiddosintellect@gmail.com" className="flex items-center gap-3 px-8 py-4 bg-white rounded-full border border-[#D4AF37]/30 text-[#3E2723] hover:border-[#D4AF37] hover:shadow-md transition-all">
                            <Mail className="w-5 h-5 text-[#D4AF37]" />
                            <span className="font-medium">kiddosintellect@gmail.com</span>
                        </a>
                        <a href="tel:+919879857529" className="flex items-center gap-3 px-8 py-4 bg-white rounded-full border border-[#D4AF37]/30 text-[#3E2723] hover:border-[#D4AF37] hover:shadow-md transition-all">
                            <Phone className="w-5 h-5 text-[#D4AF37]" />
                            <span className="font-medium">+91 9879857529</span>
                        </a>
                    </div>
                </div>

            </div>
            <ScrollToTopButton />
        </div>
    );
}