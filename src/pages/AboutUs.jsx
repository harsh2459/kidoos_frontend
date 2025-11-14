import React from 'react';

export default function AboutUs() {
    const navigateToCatalog = () => {
        // In your actual app, use: navigate('/catalog')
        window.location.href = '/catalog';
    };

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <div className="mx-auto max-w-screen-xl px-4 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                        About Us
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        Nurturing Young Minds<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            One Book at a Time
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        At Kiddos Intellect, we believe every child deserves access to quality books that spark curiosity, foster imagination, and build a lifelong love for reading.
                    </p>
                </div>

                {/* Story Section */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>
                                Founded with a passion for children's education and development, Kiddos Intellect began as a small initiative to make quality children's books accessible to every family across India.
                            </p>
                            <p>
                                We carefully curate each book in our collection, ensuring they not only entertain but also educate, inspire creativity, and help children develop essential life skills. From colorful picture books for toddlers to engaging chapter books for young readers, we have something for every age and interest.
                            </p>
                            <p>
                                What started as a modest collection has grown into a trusted destination for parents, teachers, and gift-givers who understand the transformative power of a good book.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                            <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-8">
                                <img src="/images/About-us.png" alt="Our Story"
                                    className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-400 rounded-full opacity-50 blur-3xl"></div>
                        <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-400 rounded-full opacity-50 blur-3xl"></div>
                    </div>
                </div>

                {/* Mission & Vision */}
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                        <p className="text-gray-700 leading-relaxed">
                            To make quality children's literature accessible and affordable to every family, fostering a culture of reading that empowers young minds to explore, learn, and grow beyond screens.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                        <p className="text-gray-700 leading-relaxed">
                            A future where every child in India has access to books that inspire them to dream bigger, think deeper, and become lifelong learners who contribute positively to society.
                        </p>
                    </div>
                </div>

                {/* What Makes Us Different */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        What Makes Us Different
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ),
                                title: "Hand-Picked Selection",
                                description: "Every book is carefully reviewed and selected by our team of educators and parents to ensure quality content."
                            },
                            {
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ),
                                title: "Affordable Pricing",
                                description: "Quality books shouldn't break the bank. We offer competitive prices and regular discounts to make reading accessible."
                            },
                            {
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                ),
                                title: "Fast Delivery",
                                description: "Quick and reliable shipping across India, so your little ones can start their reading adventure without delay."
                            },
                            {
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                ),
                                title: "Age-Appropriate",
                                description: "Books organized by age groups and reading levels, making it easy to find the perfect match for your child."
                            },
                            {
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ),
                                title: "Trusted by Parents",
                                description: "Join thousands of satisfied parents who trust us to deliver quality books that their children love."
                            },
                            {
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                ),
                                title: "Customer Support",
                                description: "Have questions? Our friendly team is always ready to help you find the perfect books for your children."
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 text-blue-600 flex items-center justify-center mb-4">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Values Section */}
                <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-12 mb-20">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Core Values</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { emoji: "🎯", title: "Quality First", desc: "Every book meets our high standards" },
                            { emoji: "❤️", title: "Child-Centric", desc: "Children's development is our priority" },
                            { emoji: "🌟", title: "Innovation", desc: "Always evolving our collection" },
                            { emoji: "🤝", title: "Trust", desc: "Building lasting relationships" }
                        ].map((value, idx) => (
                            <div key={idx} className="text-center">
                                <div className="text-5xl mb-4">{value.emoji}</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                                <p className="text-sm text-gray-600">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid md:grid-cols-4 gap-8 mb-20">
                    {[
                        { number: "10,000+", label: "Happy Families" },
                        { number: "200+", label: "Books Available" },
                        { number: "100%", label: "Quality Assured" },
                        { number: "Pan India", label: "Delivery" }
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center">
                            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                                {stat.number}
                            </div>
                            <div className="text-gray-600 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-gray-900 to-black rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Start Your Child's Reading Journey Today</h2>
                    <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                        Explore our carefully curated collection of children's books and give your child the gift of knowledge and imagination.
                    </p>
                    <button
                        onClick={navigateToCatalog}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
                    >
                        Browse Our Catalog
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </button>
                </div>

                {/* Contact Section */}
                <div className="mt-20 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                    <p className="text-gray-600 mb-6">
                        Have questions or suggestions? We'd love to hear from you!
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <a href="mailto:kiddosintellect@gmail.com" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            kiddosintellect@gmail.com
                        </a>
                        <a href="tel:+919879857529" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            +91 9879857529
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}