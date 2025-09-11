// WhiteThemeDemo.jsx
import React from "react";

const products = [
    { id: 1, title: "IGNOU Exam Capsule: MPA-011", price: 299, img: "https://via.placeholder.com/300x400" },
    { id: 2, title: "Public Administration Guide", price: 349, img: "https://via.placeholder.com/300x400" },
    { id: 3, title: "Social Work Essentials", price: 249, img: "https://via.placeholder.com/300x400" },
    { id: 4, title: "MBA Quick Notes", price: 399, img: "https://via.placeholder.com/300x400" },
];

export default function WhiteThemeDemo() {
    return (
        <div className="min-h-screen bg-surface-subtle text-fg">
            {/* Header */}
            <header className="bg-surface border-b border-border-subtle sticky top-0 z-20">
                <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-brand"></div>
                        <span className="font-semibold">BookMyStudyGuide</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6 text-sm">
                        <a href="#features" className="text-fg-muted hover:text-fg">Features</a>
                        <a href="#catalog" className="text-fg-muted hover:text-fg">Catalog</a>
                        <a href="#contact" className="text-fg-muted hover:text-fg">Contact</a>
                        <a href="#cart" className="btn">Cart</a>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-surface">
                <div className="max-w-screen-xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                            Clean, Minimal, Reliable Study Material
                        </h1>
                        <p className="mt-3 text-fg-muted">
                            Crisp summaries, predicted questions, and quick revision guides—crafted for exam excellence.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <a href="#catalog" className="btn-tonal">Browse Catalog</a>
                            <a href="#features" className="btn">See Features</a>
                        </div>
                    </div>
                    <div className="bg-surface border border-border-subtle rounded-xl p-4 shadow-sm">
                        <div className="aspect-[3/2] bg-surface-subtle rounded-lg" />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="bg-surface-subtle">
                <div className="max-w-screen-xl mx-auto px-4 py-12">
                    <h2 className="text-xl font-semibold">Why students love us</h2>
                    <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { t: "Focused Summaries", d: "Only what matters for exams, nothing extra." },
                            { t: "Predicted Questions", d: "High-yield Q&As with clear solutions." },
                            { t: "Clean Layouts", d: "Readable typography and simple structure." },
                            { t: "Fast Delivery", d: "Get physical copies quickly across India." },
                        ].map((f, i) => (
                            <div key={i} className="bg-surface border border-border-subtle rounded-xl p-4 shadow-sm">
                                <div className="h-10 w-10 rounded-lg bg-brand mb-3" />
                                <div className="font-medium">{f.t}</div>
                                <p className="text-sm text-fg-muted mt-1">{f.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Catalog preview */}
            <section id="catalog" className="bg-surface border-t border-border-subtle">
                <div className="max-w-screen-xl mx-auto px-4 py-12">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Popular Titles</h2>
                        <a href="/catalog" className="text-fg-muted hover:text-fg hover:underline text-sm">View all</a>
                    </div>
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {products.map(p => (
                            <article key={p.id} className="bg-surface border border-border-subtle rounded-xl p-3 shadow-sm">
                                <div className="relative aspect-[3/4] bg-surface-subtle rounded-lg overflow-hidden">
                                    <img src={p.img} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
                                </div>
                                <h3 className="mt-3 font-medium line-clamp-2">{p.title}</h3>
                                <div className="mt-1 text-fg font-semibold">₹{p.price}</div>
                                <button className="mt-3 w-full btn-tonal">Add to Cart</button>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter / contact */}
            <section id="contact" className="bg-surface-subtle border-t border-border-subtle">
                <div className="max-w-screen-xl mx-auto px-4 py-12">
                    <div className="bg-surface border border-border-subtle rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold">Stay in the loop</h3>
                        <p className="text-sm text-fg-muted mt-1">Get new releases and exam tips in your inbox.</p>
                        <form className="mt-4 grid sm:grid-cols-[1fr_auto] gap-3">
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="bg-surface border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30"
                            />
                            <button className="btn-tonal">Subscribe</button>
                        </form>
                    </div>
                </div>
            </section>
            <section className="hero mx-auto max-w-container px-6 py-10 mt-6">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <span className="eyebrow">IGNOU • Exam Capsule</span>
                        <h1 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">
                            Clean, Minimal, Reliable Study Material
                        </h1>
                        <p className="mt-3 text-gray-600">
                            Crisp summaries, predicted questions, and quick revision guides—crafted for exam excellence.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <a href="/catalog" className="btn-primary">
                                Browse Catalog
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </a>
                            <a href="#features" className="btn-secondary">See Features</a>
                        </div>
                    </div>

                    {/* Right side visual */}
                    <div className="card p-6">
                        <div className="aspect-[3/2] rounded-lg bg-surface-subtle" />
                    </div>
                </div>
            </section>
            <article className="card card-hover">



                <button className="mt-3 w-full btn-secondary">Add to Cart</button>
            </article>
            <div className="field">
                <label className="field-label">Search</label>
                <div className="with-icon">
                    {/* icon */}
                    <svg viewBox="0 0 24 24"><path d="M21 21l-4.2-4.2m0 0A7 7 0 105.6 5.6a7 7 0 0011.2 11.2z" stroke="currentColor" fill="none" strokeWidth="2" /></svg>
                    <input placeholder="Title, author, tag…" />
                </div>
                <div className="field-hint">Press Enter to search</div>
            </div>
            <div className="card overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>Cover</th><th>Title</th><th>Authors</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* your existing rows */}
                    </tbody>
                </table>
            </div>
            {/* empty state */}
            <div className="empty">
                <div className="text-lg font-semibold">Nothing here yet</div>
                <p className="text-sm mt-1">Add your first book to see it in the catalog.</p>
            </div>

            {/* skeleton card */}
            <div className="card">
                <div className="skeleton h-40 rounded-lg" />
                <div className="skeleton h-4 w-3/4 mt-3" />
                <div className="skeleton h-4 w-1/2 mt-2" />
            </div>
            {/* Footer */}
            <footer className="bg-surface border-t border-border-subtle">
                <div className="max-w-screen-xl mx-auto px-4 py-8 text-sm text-fg-muted">
                    © {new Date().getFullYear()} BookMyStudyGuide. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
