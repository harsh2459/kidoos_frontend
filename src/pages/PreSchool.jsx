import React, { useState, useEffect } from 'react';
import {
  BookOpen, ChevronDown, ChevronUp, Check, Star, Sparkles, Scroll,
  Brain, Heart, Globe2, ShieldCheck, Truck, IndianRupee, Feather,
  ArrowRight, Menu, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- DATA ---
const ageGroups = [
  {
    age: "3-4 Years",
    title: "Little Explorers",
    description: "Picture-rich books with vibrant illustrations that introduce basic concepts, colors, shapes, and simple moral values through engaging stories.",
    skills: "Vocabulary Building, Listening Skills, Visual Recognition, Basic Values, Color & Shape Learning"
  },
  {
    age: "5-6 Years",
    title: "Story Learners",
    description: "Engaging storybooks with moral lessons, interactive activity books, and colorful pages that boost creativity and cultural awareness.",
    skills: "Language Development, Reading Comprehension, Creativity, Cultural Values, Fine Motor Skills, Moral Understanding"
  },
  {
    age: "7-8 Years",
    title: "Reading Champions",
    description: "Chapter books with deeper meanings, advanced stories teaching life lessons, and educational activity books for complete school readiness.",
    skills: "Reading Fluency, Critical Thinking, Problem Solving, Cultural Knowledge, Writing Practice, Independent Learning"
  },
  {
    age: "9-10 Years",
    title: "Smart Thinkers",
    description: "Complete mythology series, comprehensive religious texts simplified for children, knowledge-building books, and critical thinking exercises.",
    skills: "Independent Reading, Deep Understanding, Religious Knowledge, General Knowledge, Analytical Thinking, Life Wisdom"
  }
];

const benefits = [
  {
    title: "Hand-Picked Collection",
    description: "Every book is carefully selected and created by us to ensure quality content that truly educates and inspires.",
    icon: <Star />
  },
  {
    title: "Original Content",
    description: "We don't just sell books—we create original, culturally-rich content rooted in Indian values and wisdom.",
    icon: <Feather />
  },
  {
    title: "Budget-Friendly",
    description: "Premium quality books at prices every Indian family can afford. Knowledge shouldn't be expensive.",
    icon: <IndianRupee />
  },
  {
    title: "Tri-Lingual Options",
    description: "Books available in Hindi, Gujarati, and English—learn in your child's comfort language.",
    icon: <Globe2 />
  },
  {
    title: "Values-Based Learning",
    description: "From Gita to Bible, Ramayana to moral tales—teach timeless values through engaging stories.",
    icon: <Heart />
  },
  {
    title: "Physical Books Only",
    description: "Real books, real reading experience. No screens—just the joy of turning pages and building memories.",
    icon: <BookOpen />
  }
];

const learningOutcomes = [
  {
    title: "Language & Communication",
    description: "Build vocabulary, pronunciation, and storytelling skills through rich narratives in 3 languages"
  },
  {
    title: "Cultural & Religious Knowledge",
    description: "Connect with Indian heritage through mythology, religious texts, and traditional stories"
  },
  {
    title: "Moral Values & Character",
    description: "Learn courage, honesty, compassion, duty, and respect from timeless tales"
  },
  {
    title: "Cognitive Development",
    description: "Enhance problem-solving, critical thinking, and logical reasoning through activity books"
  },
  {
    title: "Creativity & Imagination",
    description: "Express artistic abilities through coloring books, craft activities, and creative exercises"
  },
  {
    title: "School Readiness",
    description: "Prepare for formal education with age-appropriate learning books and knowledge builders"
  }
];

// UPDATED CATEGORIES WITH IMAGE PATHS (Generate these images!)
const categories = [
  { name: "Mythology Books", img: "/images-webp/pre_school/cat-mythology.webp", desc: "Epics & Legends" },
  { name: "Religious Books", img: "/images-webp/pre_school/cat-religious.webp", desc: "Spiritual Roots" },
  { name: "Moral Stories", img: "/images-webp/pre_school/cat-moral.webp", desc: "Character Building" },
  { name: "Activity Books", img: "/images-webp/pre_school/cat-activity.webp", desc: "Creative Skills" },
  { name: "Knowledge Builders", img: "/images-webp/pre_school/cat-knowledge.webp", desc: "General IQ" },
  { name: "Bilingual Books", img: "/images-webp/pre_school/cat-bilingual.webp", desc: "Language Mastery" }
];

const whyMythologyMatters = [
  {
    title: "Stories Teach Better Than Lectures",
    description: "Research shows children remember stories 22x better than facts. Moral lessons stick when woven into engaging narratives that capture imagination."
  },
  {
    title: "Critical Age for Character Building",
    description: "Ages 3-10 are crucial for value formation. Gita, Ramayana, and moral tales teach timeless principles of courage, duty, and compassion."
  },
  {
    title: "Cultural Identity & Heritage",
    description: "Connect children to their roots and traditions. Understanding heritage while growing in a modern world creates balanced, confident individuals."
  },
  {
    title: "Parent-Child Bonding",
    description: "Bedtime stories create lasting memories. Shared reading improves communication, emotional connection, and family values."
  }
];

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Surat, Gujarat",
    child: "Mother of Aaradhya (5 years)",
    text: "My daughter absolutely loves the Krishna stories! She asks me to read them every night and now talks about kindness and sharing. The Gujarati version helps her connect with our culture."
  },
  {
    name: "Rajesh Patel",
    location: "Ahmedabad, Gujarat",
    child: "Father of Arjun (7 years)",
    text: "The Bhagavad Gita book for kids is phenomenal! My son understands complex concepts like duty and righteousness in simple language. Highly recommend to all parents."
  },
  {
    name: "Anjali Mehta",
    location: "Mumbai, Maharashtra",
    child: "Mother of twins (4 years)",
    text: "The activity books are perfect for keeping my twins engaged and learning. They have fun while developing motor skills. The quality is excellent and prices are very reasonable."
  }
];

const faqs = [
  {
    question: "What age groups are your books suitable for?",
    answer: "We offer books for ages 3-10, carefully organized by developmental stages: Little Explorers (3-4 years), Story Learners (5-6 years), Reading Champions (7-8 years), and Smart Thinkers (9-10 years). Each book is hand-picked to match the reading level and comprehension ability of different age groups."
  },
  {
    question: "Do you sell digital/eBooks or only physical books?",
    answer: "We sell only physical books. We believe in the real reading experience—the joy of holding a book, turning pages, and creating lasting memories without screens. Physical books also help develop fine motor skills and reduce screen time for young children."
  },
  {
    question: "Are books available in languages other than English?",
    answer: "Yes! Many of our books are available in Hindi, Gujarati, and English. Check individual product pages for language options. We believe children should learn in their comfort language to build strong foundations."
  },
  {
    question: "What types of books do you sell?",
    answer: "We sell mythology books (Ramayana, Mahabharata, Krishna stories), religious books (Bhagavad Gita, Bible, Quran for kids), moral story collections, activity books, coloring books, and general knowledge builders—all created with care for children's holistic education."
  },
  {
    question: "Are your religious books appropriate for children?",
    answer: "Absolutely! Our religious and mythology books are simplified with child-friendly language and beautiful illustrations. They focus on moral values, cultural knowledge, and life lessons rather than complex theology, making them perfect for young minds."
  },
  {
    question: "Do you deliver across India?",
    answer: "Yes, we deliver to all states across India. Whether you're in a metro city or a small town, quality education reaches your doorstep within 3-7 business days."
  },
  {
    question: "Why are your books budget-friendly?",
    answer: "We believe knowledge and quality education shouldn't be expensive. Every family deserves access to good books that teach values and build character. Our mission is to make premium content accessible to all Indian families."
  },
  {
    question: "What makes Kiddos Intellect different from other bookstores?",
    answer: "We don't just sell books—we create original content. Every book is either self-created or hand-picked by educators and parents to ensure your child gets not just a book, but knowledge, values, and a genuine love for reading. We focus exclusively on value-based learning for ages 3-10."
  }
];

// --- MAIN COMPONENT ---

export default function PreSchool() {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeAge, setActiveAge] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAgeChange = (index) => {
    if (activeAge === index) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveAge(index);
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // VRINDAVAN THEME ASSETS (Multiple Images)
  const parchmentBg = "url('/images-webp/homepage/parchment-bg.webp')";
  const heroBg = "url('/images-webp/pre_school/preschool-hero-bg.webp')"; 
  const mandalaBg = "url('/images-webp/pre_school/mandala-bg.webp')";
  const cosmicBg = "url('/images-webp/pre_school/cosmic-wisdom-bg.webp')";
  // New Section Backgrounds
  const benefitsBg = "url('/images-webp/pre_school/benefits-cows-bg.webp')"; // Generate this!
  const testimonialsBg = "url('/images-webp/pre_school/testimonials-flowers-bg.webp')"; // Generate this!

  return (
    <div className="bg-[#FAF7F2] font-['Lato'] text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723] overflow-x-hidden relative">

      {/* GLOBAL PARCHMENT BACKGROUND */}
      <div 
          className="fixed inset-0 pointer-events-none opacity-100 z-0" 
          style={{
              backgroundImage: parchmentBg,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed'
          }}
      />

      {/* --- HERO SECTION --- */}
      <div className="relative w-full pt-32 md:pt-40 pb-24 px-6 overflow-hidden">
        
        {/* Hero Background Image */}
        <div 
            className="absolute inset-0 z-0 pointer-events-none" 
            style={{
                backgroundImage: heroBg,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 1 
            }}
        />
        
        {/* Soft Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FAF7F2]/80 via-[#FAF7F2]/60 to-[#FAF7F2] pointer-events-none"></div>

        {/* Content Layer */}
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/70 backdrop-blur-sm border border-[#D4AF37]/40 text-[#3E2723] text-sm md:text-base font-bold tracking-widest uppercase mb-10 shadow-sm animate-fade-in-up font-['Cinzel']">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            Curated for Ages 3-10
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-8xl font-['Playfair_Display'] font-bold text-[#3E2723] mb-8 md:mb-10 tracking-tight leading-[1.1] drop-shadow-sm">
            Books That Build <br />
            <span className="text-[#D4AF37] italic pr-2">
              Knowledge & Character
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-[#5C4A2E] mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Hand-picked and self-created books. From mythology to moral tales, religious texts to activity books—we don't just sell books, we sell knowledge that shapes young minds.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 w-full sm:w-auto px-4 sm:px-0">
            <Link to="/catalog">
                <button className="w-full sm:w-auto bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white px-10 py-5 rounded-full text-lg font-bold shadow-[0_10px_20px_rgba(176,137,76,0.3)] hover:from-[#D4AF37] hover:to-[#C59D5F] hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group font-['Cinzel'] border border-[#D4AF37]">
                Browse Collection
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </Link>
          </div>

          <div className="mt-20 md:mt-28 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 pt-12 border-t border-[#D4AF37]/20 max-w-6xl mx-auto">
            {[
              { value: "Physical Books", label: "Real Reading Experience" },
              { value: "3 Languages", label: "Hindi, Gujarati, English" },
              { value: "Pan-India", label: "Delivery to All States" },
              { value: "Affordable", label: "Premium Quality, Fair Price" }
            ].map((metric, index) => (
              <div key={index} className="text-center group p-4 rounded-xl hover:bg-white/40 transition-colors duration-300">
                <div className="text-xl md:text-3xl font-bold text-[#3E2723] mb-2 group-hover:text-[#D4AF37] transition-colors font-['Cinzel']">{metric.value}</div>
                <div className="text-xs md:text-sm font-semibold text-[#8A7A5E] uppercase tracking-wider">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- ABOUT SECTION --- */}
      <div className="py-20 md:py-32 px-6 md:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-['Cinzel'] font-bold mb-8 md:mb-10 text-[#3E2723]">The Kiddos Intellect Promise</h2>
          <div className="space-y-6 md:space-y-8 text-lg md:text-xl lg:text-2xl text-[#5C4A2E] leading-relaxed font-light">
            <p>
              At <span className="font-bold text-[#3E2723]">Kiddos Intellect</span>, we believe that we don't just sell books—we sell knowledge, values, and character. Every book in our collection is carefully hand-picked or originally created by educators and parents who understand the transformative power of early childhood learning.
            </p>
            <p>
              Our mission is to make <span className="text-[#D4AF37] font-medium border-b-2 border-[#D4AF37]/30">quality education accessible</span> to every Indian family. Through timeless stories from mythology, Bhagavad Gita, Ramayana, Bible, and engaging activity books, we help children develop not just academic skills, but also moral values.
            </p>
          </div>
          <div className="mt-12 md:mt-16 flex justify-center">
            <div className="p-5 bg-white rounded-full shadow-[0_5px_15px_rgba(212,175,55,0.2)] border border-[#D4AF37]/30">
              <Feather className="w-10 h-10 md:w-12 md:h-12 text-[#D4AF37]" />
            </div>
          </div>
        </div>
      </div>

      {/* --- AGE / CURRICULUM SECTION --- */}
      <div className="py-20 md:py-32 px-4 md:px-12 bg-white/60 backdrop-blur-sm relative z-10 border-y border-[#D4AF37]/10">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-['Cinzel'] font-bold text-[#3E2723] mb-4 md:mb-6">Developmental Stages</h2>
            <p className="text-lg md:text-xl text-[#5C4A2E] max-w-2xl mx-auto">
              Every child learns differently. We have structured our curriculum to match the cognitive growth of your child.
            </p>
          </div>

          {/* Age Selector Tabs */}
          <div className="flex justify-center mb-12 md:mb-16">
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-2 p-2 bg-[#FFF9E6] rounded-full w-full sm:w-auto border border-[#D4AF37]/20 shadow-sm">
              {ageGroups.map((group, index) => (
                <button
                  key={index}
                  onClick={() => handleAgeChange(index)}
                  className={`w-full sm:w-auto px-8 md:px-10 py-4 md:py-3 rounded-full font-bold transition-all duration-300 text-base md:text-lg font-['Cinzel'] ${activeAge === index
                    ? 'bg-[#3E2723] text-[#F3E5AB] shadow-md scale-[1.02]'
                    : 'text-[#8A7A5E] hover:text-[#3E2723] hover:bg-[#F3E5AB]/50'
                    }`}
                >
                  {group.age}
                </button>
              ))}
            </div>
          </div>

          {/* Active Age Content Box */}
          <div className="bg-white rounded-[2rem] p-6 md:p-16 border border-[#D4AF37]/20 shadow-[0_20px_50px_rgba(62,39,35,0.08)] relative overflow-hidden">
            {/* Watermark */}
            <div className="hidden lg:block absolute -top-20 -right-20 opacity-[0.05] pointer-events-none transition-transform duration-700 hover:scale-105">
              <Brain className="w-[600px] h-[600px] text-[#3E2723]" />
            </div>

            <div className={`relative z-10 max-w-5xl mx-auto text-center transition-opacity duration-300 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <span className="inline-block text-[#B0894C] font-bold tracking-widest uppercase text-xs md:text-sm mb-4 bg-[#FFF9E6] px-4 py-1.5 rounded-full border border-[#D4AF37]/30">
                Stage Focus: {ageGroups[activeAge].title}
              </span>

              <h3 className="text-3xl md:text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#3E2723] mb-6 md:mb-8">
                Curriculum for {ageGroups[activeAge].age}
              </h3>

              <p className="text-lg md:text-2xl text-[#5C4A2E] mb-10 md:mb-14 leading-relaxed font-light max-w-4xl mx-auto">
                {ageGroups[activeAge].description}
              </p>

              <div className="bg-[#FAF7F2] rounded-2xl p-6 md:p-10 shadow-inner border border-[#E3E8E5] mb-4">
                <h4 className="text-sm md:text-base font-bold text-[#8A7A5E] uppercase tracking-widest mb-6 md:mb-8 border-b border-[#D4AF37]/20 pb-4 inline-block px-4 font-['Cinzel']">
                  Key Skills & Values
                </h4>
                <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                  {ageGroups[activeAge].skills.split(', ').map((skill, i) => (
                    <span key={i} className="px-5 md:px-6 py-2.5 md:py-3 bg-white text-[#3E2723] text-sm md:text-lg font-medium rounded-full border border-[#D4AF37]/20 flex items-center shadow-sm hover:border-[#D4AF37] hover:bg-[#FFF9E6] transition-colors cursor-default">
                      <Check className="w-4 h-4 md:w-5 md:h-5 mr-2 text-[#D4AF37]" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BENEFITS SECTION (With New Background) --- */}
      <div className="relative py-20 md:py-32 px-6 md:px-12 z-10 overflow-hidden">
        {/* New Cows/Pasture Background */}
        <div 
            className="absolute inset-0 z-0 pointer-events-none" 
            style={{
                backgroundImage: benefitsBg,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.15 
            }}
        />
        
        <div className="max-w-screen-2xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-['Cinzel'] font-bold text-center mb-12 md:mb-20 text-[#3E2723]">Why Parents Trust Us</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-[#D4AF37]/10 hover:border-[#D4AF37] hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)] hover:-translate-y-1 transition-all duration-300 group h-full">
                <div className="w-16 h-16 bg-[#FFF9E6] rounded-full flex items-center justify-center text-[#D4AF37] mb-6 md:mb-8 group-hover:bg-[#D4AF37] group-hover:text-white transition-colors duration-300 shadow-sm border border-[#D4AF37]/20">
                  {React.cloneElement(benefit.icon, { className: "w-7 h-7 md:w-9 md:h-9" })}
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-[#3E2723] font-['Cinzel']">{benefit.title}</h3>
                <p className="text-base md:text-lg text-[#5C4A2E] leading-relaxed font-normal">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CATEGORIES SECTION (With New Image Thumbnails) --- */}
      <div className="py-20 md:py-32 px-6 md:px-12 bg-white/50 backdrop-blur-sm relative z-10 border-y border-[#D4AF37]/10">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-['Cinzel'] font-bold text-center mb-6 text-[#3E2723]">Our Collections</h2>
          <p className="text-lg md:text-xl text-center text-[#8A7A5E] mb-16 md:mb-24 font-['Playfair_Display'] italic">Explore our library by genre</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {categories.map((category, index) => (
              <div key={index} className="text-center group cursor-pointer">
                {/* Image Container */}
                <div className="aspect-square rounded-[2rem] bg-[#FFF9E6] border-2 border-transparent group-hover:border-[#D4AF37] flex flex-col items-center justify-center mb-6 group-hover:bg-white transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 overflow-hidden relative">
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem] -z-10"></div>
                  
                  {/* Category Image */}
                  <img 
                    src={category.img} 
                    alt={category.name}
                    className="w-2/3 h-2/3 object-contain transform group-hover:scale-110 transition-transform duration-500 filter drop-shadow-sm"
                    loading="lazy"
                  />
                </div>
                
                <h3 className="font-bold text-lg md:text-xl text-[#3E2723] group-hover:text-[#B0894C] transition-colors mb-1 font-['Cinzel']">{category.name}</h3>
                <p className="text-sm md:text-base text-[#8A7A5E] font-medium">{category.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- WHY MYTHOLOGY MATTERS (Dark Cosmic Theme) --- */}
      <div className="py-20 md:py-32 px-6 md:px-12 text-[#E8F0EB] relative overflow-hidden">
        
        {/* Background Image */}
        <div 
            className="absolute inset-0 z-0 pointer-events-none" 
            style={{
                backgroundImage: cosmicBg,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 1 
            }}
        />
        {/* Dark Blue Overlay */}
        <div className="absolute inset-0 bg-[#0F172A]/40 mix-blend-multiply z-0 pointer-events-none"></div>

        <div className="max-w-screen-2xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-16 md:mb-24 lg:items-end border-b border-[#F3E5AB]/30 pb-16">
            <div className="lg:w-1/2">
              <span className="text-[#F3E5AB] font-bold tracking-widest uppercase text-sm mb-4 block font-['Cinzel']">Pedagogy</span>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-white leading-tight">Why Books Matter<br /> for Ages 3-10</h2>
            </div>
            <div className="lg:w-1/2">
              <p className="text-xl md:text-2xl text-[#F3E5AB]/90 font-light leading-relaxed">
                Critical brain development happens in this window. We combine ancient wisdom with modern pedagogy to create well-rounded individuals.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {whyMythologyMatters.map((item, index) => (
              <div key={index} className="bg-white/5 border border-[#F3E5AB]/20 p-8 rounded-2xl hover:bg-[#F3E5AB]/10 hover:border-[#F3E5AB]/40 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
                <h3 className="text-xl md:text-2xl font-bold text-[#F3E5AB] mb-4 font-['Cinzel']">{item.title}</h3>
                <p className="text-base md:text-lg text-white/80 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- OUTCOMES --- */}
      <div className="py-20 md:py-32 px-6 md:px-12 relative z-10">
        <div className="max-w-screen-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-['Cinzel'] font-bold text-center mb-16 md:mb-24 text-[#3E2723]">Holistic Growth</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {learningOutcomes.map((outcome, index) => (
              <div key={index} className="flex gap-6 p-6 rounded-2xl hover:bg-white hover:shadow-[0_10px_30px_rgba(62,39,35,0.08)] transition-all duration-300 border border-transparent hover:border-[#D4AF37]/20">
                <div className="mt-1 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#FFF9E6] flex items-center justify-center text-[#D4AF37] shadow-sm border border-[#D4AF37]/30">
                    <Check className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[#3E2723] text-xl md:text-2xl mb-3 font-['Cinzel']">{outcome.title}</h3>
                  <p className="text-base md:text-lg text-[#5C4A2E] leading-relaxed">{outcome.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- TESTIMONIALS (With New Flower Background) --- */}
      <div className="relative py-20 md:py-32 px-6 md:px-12 z-10 border-t border-[#D4AF37]/10">
        
        {/* Background Image */}
        <div 
            className="absolute inset-0 z-0 pointer-events-none" 
            style={{
                backgroundImage: testimonialsBg,
                backgroundSize: 'cover',
                backgroundPosition: 'top center',
                opacity: 0.12
            }}
        />

        <div className="max-w-screen-2xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-['Cinzel'] font-bold text-center mb-16 md:mb-24 text-[#3E2723]">What Parents Say</h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-[2rem] relative h-full flex flex-col shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-[#D4AF37]/10 hover:border-[#D4AF37]/40">
                <div className="text-8xl text-[#D4AF37]/20 absolute top-4 left-6 font-serif opacity-50 select-none">"</div>
                <p className="text-lg md:text-xl text-[#5C4A2E] mb-8 leading-relaxed relative z-10 pt-8 flex-grow font-medium italic font-['Playfair_Display']">
                  {testimonial.text}
                </p>
                <div className="border-t border-[#D4AF37]/20 pt-6 mt-auto flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FFF9E6] flex items-center justify-center font-bold text-[#D4AF37] border border-[#D4AF37]/30 font-['Cinzel'] text-xl">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-[#3E2723] text-lg leading-tight font-['Cinzel']">{testimonial.name}</p>
                    <p className="text-xs text-[#B0894C] uppercase tracking-wide font-semibold">{testimonial.child}</p>
                    <p className="text-xs text-[#8A7A5E]">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FAQ SECTION --- */}
      <div className="py-20 md:py-32 px-6 md:px-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-['Cinzel'] font-bold text-center mb-12 md:mb-16 text-[#3E2723]">Frequently Asked Questions</h2>
          <div className="space-y-4 md:space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 md:px-8 py-6 flex justify-between items-center hover:bg-[#FFF9E6]/50 transition-colors"
                >
                  <span className={`font-bold text-lg md:text-xl pr-8 font-['Cinzel'] ${openFaq === index ? 'text-[#B0894C]' : 'text-[#3E2723]'}`}>
                    {faq.question}
                  </span>
                  <div className={`transition-transform duration-300 ${openFaq === index ? 'rotate-180' : 'rotate-0'}`}>
                    {openFaq === index ? (
                      <ChevronUp className="w-6 h-6 text-[#B0894C] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-[#8A7A5E] flex-shrink-0" />
                    )}
                  </div>
                </button>
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-6 md:px-8 pb-8 pt-0 text-base md:text-lg text-[#5C4A2E] leading-relaxed border-t border-[#D4AF37]/10 mt-2">
                    <div className="pt-4">{faq.answer}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FOOTER CTA (Dark Wood Theme) --- */}
      <div className="py-24 md:py-40 px-6 md:px-12 text-center relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #2C1810 0%, #3E2723 100%)' }}>
        
        {/* Mandala Watermark */}
        <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: mandalaBg, backgroundSize: '500px', backgroundRepeat: 'repeat' }}
        ></div>
        
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4AF37]/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-block p-5 rounded-full bg-white/5 mb-8 md:mb-10 border border-[#D4AF37]/30">
            <Scroll className="w-12 h-12 text-[#F3E5AB] mx-auto" />
          </div>
          <h2 className="text-4xl md:text-6xl font-['Cinzel'] font-bold mb-8 md:mb-10 tracking-tight text-[#F3E5AB]">Start Your Child's Journey</h2>
          <p className="text-xl md:text-2xl text-[#D4AF37]/80 mb-12 md:mb-16 max-w-3xl mx-auto font-light leading-relaxed">
            Give your child the gift of knowledge, values, and a lifelong love for reading through our carefully curated books.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 w-full sm:w-auto">
            <Link to="/catalog">
              <button className="w-full sm:w-auto bg-[#F3E5AB] text-[#3E2723] px-10 py-5 rounded-full text-lg font-bold shadow-[0_10px_30px_rgba(243,229,171,0.2)] hover:bg-white hover:-translate-y-1 active:scale-95 transition-all duration-300 font-['Cinzel']">
                Shop All Books
              </button>
            </Link>
            <Link to="/contact">
              <button className="w-full sm:w-auto bg-transparent border-2 border-[#D4AF37] text-[#F3E5AB] px-10 py-5 rounded-full text-lg font-bold hover:bg-[#D4AF37] hover:text-[#3E2723] hover:border-[#D4AF37] active:scale-95 transition-all duration-300 font-['Cinzel']">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}