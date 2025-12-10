import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../contexts/CartStore";
import { assetUrl } from "../api/asset";
import { deal as dealFn } from "../lib/Price";
import { useCustomer } from "../contexts/CustomerAuth";
import { CustomerAPI } from "../api/customer";
import { t } from "../lib/toast";
import { 
  ShoppingCart, Check, ChevronRight, Star, Info, 
  Truck, Sparkles, BookOpen, Heart, Brain, Globe, ShieldCheck, Feather,
  Eye, Ear, Hand, Smile, Zap, PlayCircle, School
} from "lucide-react";

/* --- ICON MAPPER --- */
const ICON_MAP = {
  brain: Brain, heart: Heart, globe: Globe, book: BookOpen, star: Star, 
  check: Check, shield: ShieldCheck, feather: Feather, eye: Eye, 
  ear: Ear, hand: Hand, smile: Smile, truck: Truck, zap: Zap
};

export default function BookDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  // Cart Logic
  const items = useCart((s) => s.items);
  const add = useCart((s) => s.add);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const replaceAll = useCart((s) => s.replaceAll);
  const { isCustomer, token } = useCustomer();

  // Scroll Animation Observer
  const revealRefs = useRef([]);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 }); // Trigger when 15% visible
    
    revealRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [book]);

  const addToRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  // --- FETCH DATA ---
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        const { data } = await api.get(`/books/${slug}/suggestions?limit=8`);
        if (!data?.book) {
          t.err("Book not found");
          return;
        }
        setBook(data.book);
        setSuggestions(data.suggestions || []);
      } catch (e) {
        console.error("Fetch error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const images = useMemo(() => {
    if (!book) return [];
    let urls = [];
    if (Array.isArray(book.assets?.coverUrl)) urls = book.assets.coverUrl;
    else if (typeof book.assets?.coverUrl === 'string') urls = [book.assets.coverUrl];
    return urls.filter(Boolean).map(url => assetUrl(url));
  }, [book]);

  const mainSrc = images.length > 0 ? images[activeImg] : "/images/placeholder-book.png";
  const d = book ? dealFn(book) : { price: 0, mrp: 0, off: 0 };
  const inCart = book ? items.find(i => (i.bookId || i.book?._id || i.id) === book._id) : null;

  async function handleAddToCart() {
    if (!isCustomer) {
      t.info("Please login to add to cart");
      navigate("/login", { state: { next: "/cart" } });
      return;
    }
    try {
      const res = await CustomerAPI.addToCart(token, { bookId: book._id, qty: 1 });
      replaceAll(res?.data?.cart?.items || []);
      t.ok("Added to cart");
    } catch (e) {
      add({ ...book, price: d.price, qty: 1 }, 1);
      t.ok("Added to cart (Local)");
    }
  }

  async function handleBuyNow() {
    if (!inCart) await handleAddToCart();
    navigate("/checkout");
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin w-12 h-12 border-4 border-[#1A3C34] rounded-full border-t-transparent"></div></div>;
  if (!book) return null;

  const config = book.layoutConfig || {};
  const specs = config.specs?.length > 0 ? config.specs : [
    { label: "Page Count", value: (book.pages || "N/A") + " Pages", icon: "book" },
    { label: "Age Group", value: "3-10 Years", icon: "smile" },
    { label: "Language", value: book.language || "English", icon: "globe" },
    { label: "Binding", value: book.printType === "hardcover" ? "Hardbound" : "Paperback", icon: "shield" },
  ];

  const faqs = config.faqs?.length > 0 ? config.faqs : [
    { q: "What age is this suitable for?", a: "This book is designed for ages 3-10, with simple language and engaging visuals." },
    { q: "Do you ship pan-India?", a: "Yes! We deliver to all pin codes in India within 3-7 business days." },
    { q: "Is the paper durable?", a: "Absolutely. We use 100 GSM high-quality paper that is tear-resistant and toddler-friendly." }
  ];

  return (
    <div className="min-h-screen font-sans text-[#2C3E38] bg-white overflow-x-hidden">
      
      <style>{`
        /* --- ANIMATIONS --- */
        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
        .reveal.active { opacity: 1; transform: translateY(0); }
        
        .slide-in-left { opacity: 0; transform: translateX(-50px); transition: all 1s ease-out; }
        .slide-in-left.active { opacity: 1; transform: translateX(0); }
        
        .slide-in-right { opacity: 0; transform: translateX(50px); transition: all 1s ease-out; }
        .slide-in-right.active { opacity: 1; transform: translateX(0); }

        /* 3D BOOK STYLES */
        .perspective-2000 { perspective: 2000px; }
        .book-3d-wrapper { 
           transform-style: preserve-3d; 
           transform: rotateY(-20deg) rotateX(5deg); 
           transition: transform 0.5s ease-out;
        }
        .book-3d-wrapper:hover { transform: rotateY(-10deg) rotateX(2deg) scale(1.02); }
        
        .book-spine {
           background: linear-gradient(90deg, #e0e0e0 0%, #ffffff 40%, #cccccc 100%);
           transform: rotateY(-90deg) translateX(-16px);
           transform-origin: left;
           box-shadow: inset 3px 0 5px rgba(0,0,0,0.15);
        }
        
        .float-anim { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-12px); } 100% { transform: translateY(0px); } }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>

      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-16 lg:py-24 overflow-hidden bg-gradient-to-br from-[#F9FBFA] to-[#F0F4F2]">
        <div className="max-w-[1500px] mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* LEFT: TEXT CONTENT */}
            <div className="order-2 lg:order-1 reveal" ref={addToRefs}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E3E8E5] text-[#1A3C34] text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" fill="#D4AF37" />
                    Best Seller for Ages 3-10
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-[#1A3C34] leading-[1.1] mb-4">
                    {book.title}
                </h1>
                {book.subtitle && <p className="text-xl text-[#5C756D] font-light mb-8">{book.subtitle}</p>}

                <div className="flex items-baseline gap-4 mb-8">
                    <span className="text-5xl font-bold text-[#1A3C34]">₹{d.price}</span>
                    {d.mrp > d.price && (
                        <>
                            <span className="text-2xl text-[#8BA699] line-through">₹{d.mrp}</span>
                            <span className="px-3 py-1 bg-[#E8F0EB] text-[#4A7C59] font-bold rounded-lg text-sm">
                                {d.off}% OFF
                            </span>
                        </>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-md">
                    {!inCart ? (
                        <>
                            <button 
                                onClick={handleAddToCart}
                                className="flex-1 h-14 bg-white border border-[#1A3C34] text-[#1A3C34] rounded-xl font-bold text-lg hover:bg-[#F4F7F5] transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <ShoppingCart className="w-5 h-5" /> Add to Cart
                            </button>
                            <button 
                                onClick={handleBuyNow} 
                                className="flex-1 h-14 bg-[#1A3C34] text-white rounded-xl font-bold text-lg hover:bg-[#234b41] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 active:scale-95"
                            >
                                Buy Now <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-[#E3E8E5] shadow-sm w-full">
                            <button onClick={dec} className="w-12 h-10 rounded-lg bg-[#F4F7F5] font-bold text-xl hover:bg-[#E3E8E5] text-[#1A3C34]">-</button>
                            <span className="font-bold text-xl flex-1 text-center text-[#1A3C34]">{inCart.qty}</span>
                            <button onClick={inc} className="w-12 h-10 rounded-lg bg-[#F4F7F5] font-bold text-xl hover:bg-[#E3E8E5] text-[#1A3C34]">+</button>
                            <button onClick={() => navigate("/checkout")} className="px-6 h-10 bg-[#1A3C34] text-white rounded-lg font-bold ml-2 hover:bg-[#2F523F]">Checkout</button>
                        </div>
                    )}
                </div>

                {/* "Why Choose This Book" Checklist */}
                {book.whyChooseThis && book.whyChooseThis.length > 0 && (
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#E3E8E5]">
                        <h3 className="font-bold text-[#1A3C34] mb-4 text-sm uppercase tracking-wider">Why Parents Love This</h3>
                        <ul className="space-y-3">
                            {book.whyChooseThis.map((point, i) => (
                                <li key={i} className="flex items-start gap-3 text-[#4A5D56]">
                                    <Check className="w-5 h-5 text-[#4A7C59] flex-shrink-0" />
                                    <span className="leading-snug">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            {/* RIGHT: 3D BOOK */}
            <div className="order-1 lg:order-2 flex flex-col items-center justify-center reveal" ref={addToRefs}>
                <div className="relative w-full max-w-[420px] lg:max-w-[500px] perspective-2000 z-20 mb-16 cursor-pointer group">
                    <div className="book-3d-wrapper relative w-full">
                        <div className="book-spine absolute top-[2px] bottom-[2px] left-0 w-[26px] rounded-l-sm z-0"></div>
                        <img 
                            src={mainSrc} 
                            className="w-full h-auto rounded-r-xl rounded-l-sm shadow-[20px_25px_50px_rgba(0,0,0,0.25)] border border-white/20 bg-white relative z-10 block"
                            alt={book.title}
                            onError={(e) => { e.currentTarget.src = "/images/placeholder-book.png"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rounded-r-xl z-20"></div>
                    </div>

                    {/* Floating Badges */}
                    <div className="absolute top-[8%] right-[-20px] bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 z-30 float-anim border border-[#E3E8E5]">
                        <div className="w-8 h-8 rounded-full bg-[#E8F0EB] flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-[#4A7C59]" /></div>
                        <div><div className="font-bold text-[#1A3C34] text-xs">Non-Toxic</div><div className="text-[9px] text-[#8BA699] uppercase font-bold tracking-wide">Safe Ink</div></div>
                    </div>
                    <div className="absolute bottom-[12%] left-[-20px] bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 z-30 float-anim border border-[#E3E8E5]" style={{ animationDelay: "1s" }}>
                        <div className="w-8 h-8 rounded-full bg-[#E8F0EB] flex items-center justify-center"><Feather className="w-4 h-4 text-[#4A7C59]" /></div>
                        <div><div className="font-bold text-[#1A3C34] text-xs">Tear Proof</div><div className="text-[9px] text-[#8BA699] uppercase font-bold tracking-wide">Durable</div></div>
                    </div>

                    {/* DOCK GALLERY */}
                    {images.length > 1 && (
                        <div className="absolute -bottom-24 left-0 right-0 flex justify-center gap-3">
                            {images.map((img, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setActiveImg(i)}
                                    className={`relative transition-all duration-300 ease-out flex-shrink-0 ${i === activeImg ? "-translate-y-2 scale-110 z-10" : "hover:-translate-y-1 hover:scale-105 opacity-70 hover:opacity-100"}`}
                                >
                                    <div className={`w-[60px] h-[85px] sm:w-[80px] sm:h-[110px] rounded-lg overflow-hidden bg-white shadow-md border-[2px] ${i === activeImg ? "border-[#1A3C34] shadow-xl" : "border-transparent"}`}>
                                        <img src={img} className="w-full h-full object-cover" alt={`View ${i}`} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </section>

      {/* 2. MARQUEE */}
      <div className="bg-[#1A3C34] py-3 overflow-hidden whitespace-nowrap text-white">
        <div className="inline-block" style={{ animation: "scroll 40s linear infinite" }}>
            {[1,2,3,4,5,6,7,8].map(i => (
                <span key={i} className="text-white/80 font-bold uppercase tracking-widest text-xs sm:text-sm mx-8 inline-flex items-center gap-3">
                    <Star className="w-4 h-4 text-[#D4AF37]" fill="#D4AF37" /> Hand-Picked Collection
                    <span className="text-white/20">|</span>
                    <Globe className="w-4 h-4" /> English, Hindi & Gujarati
                    <span className="text-white/20">|</span>
                    <ShieldCheck className="w-4 h-4" /> 100% Child Safe
                </span>
            ))}
        </div>
      </div>

      {/* 3. PRODUCT DETAILS */}
      <section className="py-20 bg-white border-b border-[#E3E8E5]">
        <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12 reveal" ref={addToRefs}>
                <h2 className="text-3xl font-serif font-bold text-[#1A3C34] mb-2">Product Details</h2>
                <div className="w-16 h-1 bg-[#4A7C59] mx-auto rounded-full"></div>
            </div>
            <div className="bg-[#F9FBFA] rounded-2xl p-8 border border-[#E3E8E5] reveal" ref={addToRefs}>
                <div className="divide-y divide-[#E3E8E5]">
                    {specs.map((spec, i) => {
                        const Icon = ICON_MAP[spec.icon] || Info;
                        return (
                            <div key={i} className="flex justify-between items-center py-4">
                                <div className="flex items-center gap-4 font-bold text-[#1A3C34]">
                                    <Icon className="w-5 h-5 text-[#4A7C59]" /> {spec.label}
                                </div>
                                <div className="text-[#5C756D] font-medium">{spec.value}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
      </section>

      {/* 4. MISSION SECTION (CLEAN, FULL IMAGE UI) */}
      {config.story?.text && (
      <section className="py-24 bg-white overflow-hidden border-t border-[#E3E8E5]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            
            {/* Text: Slide In Left */}
            <div className="slide-in-left" ref={addToRefs}>
                <span className="text-[#4A7C59] font-bold tracking-widest uppercase text-xs mb-4 block">Our Mission</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1A3C34] mb-6 leading-tight">
                    {config.story.heading}
                </h2>
                <p className="text-lg text-[#4A5D56] leading-relaxed mb-8">
                    {config.story.text}
                </p>
                {config.story.quote && (
                    <div className="border-l-4 border-[#1A3C34] pl-6 py-4 italic text-[#1A3C34] font-medium text-lg bg-[#F9FBFA] rounded-r-lg">
                        "{config.story.quote}"
                    </div>
                )}
            </div>

            {/* Image: Slide In Right (CLEAN, FULL VIEW) */}
            <div className="slide-in-right" ref={addToRefs}>
                <div className="rounded-2xl overflow-hidden shadow-xl bg-[#F4F7F5] border border-[#E3E8E5]">
                    <img 
                        src={config.story.imageUrl || mainSrc}
                        alt="Our Story" 
                        // w-full h-auto ensures the full image is shown without cropping
                        className="w-full h-auto block"
                        onError={(e) => { e.currentTarget.src = mainSrc; }}
                    />
                </div>
            </div>
        </div>
      </section>
      )}

      {/* 5. CURRICULUM */}
      {config.curriculum?.length > 0 && (
      <section className="py-20 bg-[#F9FBFA]">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 reveal" ref={addToRefs}>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1A3C34] mb-4">What Your Child Learns</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {config.curriculum.map((item, i) => {
                    const Icon = ICON_MAP[item.icon] || Star;
                    return (
                        <div key={i} className="p-8 bg-white rounded-2xl border border-[#E3E8E5] hover:border-[#4A7C59] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center reveal" ref={addToRefs}>
                            <div className="w-16 h-16 mx-auto bg-[#F4F7F5] rounded-full flex items-center justify-center mb-6 text-[#1A3C34]">
                                <Icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-[#1A3C34] mb-3">{item.title}</h3>
                            <p className="text-[#5C756D] leading-relaxed">{item.description}</p>
                        </div>
                    )
                })}
            </div>
        </div>
      </section>
      )}

      {/* 6. TESTIMONIALS */}
      {config.testimonials?.length > 0 && (
      <section className="py-24 bg-[#1A3C34] text-white">
        <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-serif font-bold text-center mb-16 reveal" ref={addToRefs}>What Parents Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {config.testimonials.map((review, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:bg-white/15 transition-all reveal" ref={addToRefs}>
                        <div className="flex gap-1 mb-6">
                            {[...Array(review.rating || 5)].map((_, r) => <Star key={r} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />)}
                        </div>
                        <p className="text-lg italic text-[#E8F0EB] mb-8 leading-relaxed">"{review.text}"</p>
                        <div>
                            <div className="font-bold text-white">{review.name}</div>
                            <div className="text-sm text-[#8BA699]">{review.role}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>
      )}

      
      {/* 8. YOU MIGHT ALSO LIKE (Complete Your Collection) */}
      {suggestions.length > 0 && (
        <section className="py-24 bg-[#F9FBFA] border-t border-[#E3E8E5]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-end justify-between mb-12 reveal" ref={addToRefs}>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1A3C34] mb-2">Complete Your Collection</h2>
                        <p className="text-[#5C756D]">Other books parents are buying right now.</p>
                    </div>
                    <button onClick={() => navigate('/catalog')} className="hidden sm:flex items-center gap-2 text-[#1A3C34] font-bold hover:text-[#4A7C59]">
                        View All <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 reveal" ref={addToRefs}>
                    {suggestions.map((s) => {
                        const sDeal = dealFn(s);
                        return (
                            <div 
                                key={s._id} 
                                onClick={() => { navigate(`/book/${s.slug}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="group bg-white rounded-2xl border border-[#E3E8E5] overflow-hidden hover:border-[#4A7C59] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                            >
                                <div className="aspect-[3/4] bg-[#F4F7F5] p-6 relative overflow-hidden">
                                    <img 
                                        src={assetUrl(s.assets?.coverUrl?.[0])} 
                                        alt={s.title}
                                        className="w-full h-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-110" 
                                    />
                                    {sDeal.off > 0 && (
                                        <span className="absolute top-3 left-3 bg-[#E8F0EB] text-[#1A3C34] text-[10px] font-bold px-2 py-1 rounded border border-[#DCE4E0]">
                                            -{sDeal.off}%
                                        </span>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-serif font-bold text-[#1A3C34] leading-tight line-clamp-2 mb-1 group-hover:text-[#4A7C59] transition-colors">
                                        {s.title}
                                    </h3>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#1A3C34]">₹{sDeal.price}</span>
                                            {sDeal.mrp > sDeal.price && <span className="text-xs text-[#8BA699] line-through">₹{sDeal.mrp}</span>}
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-[#F4F7F5] flex items-center justify-center text-[#1A3C34] group-hover:bg-[#1A3C34] group-hover:text-white transition-colors">
                                            <ShoppingCart className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
      )}

      {/* Sticky Mobile Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#E3E8E5] p-4 px-6 flex items-center justify-between sm:hidden z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
        <div>
            <div className="text-[10px] text-[#8BA699] uppercase font-bold tracking-wider">Total</div>
            <div className="text-xl font-bold text-[#1A3C34]">₹{d.price}</div>
        </div>
        <button onClick={handleAddToCart} className="px-8 py-3 bg-[#1A3C34] text-white rounded-lg font-bold shadow-md">
            Buy Now
        </button>
      </div>

    </div>
  );
}