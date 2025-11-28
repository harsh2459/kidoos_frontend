import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Check,
  Star,
  Sparkles,
  Scroll,
  Brain,
  Heart,
  Globe2,
  ShieldCheck,
  Truck,
  IndianRupee,
  Feather,
  ArrowRight,
  Menu
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- DATA (Unchanged) ---

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

const categories = [
  { name: "Mythology Books", emoji: "🕉️", desc: "Epics & Legends" },
  { name: "Religious Books", emoji: "📿", desc: "Spiritual Roots" },
  { name: "Moral Stories", emoji: "📖", desc: "Character Building" },
  { name: "Activity Books", emoji: "🎨", desc: "Creative Skills" },
  { name: "Knowledge Builders", emoji: "🧠", desc: "General IQ" },
  { name: "Bilingual Books", emoji: "🗣️", desc: "Language Mastery" }
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

  // Smooth transition handler for tabs
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

  return (
    <div className="bg-stone-50 font-sans text-stone-800 selection:bg-amber-200 selection:text-amber-900 overflow-x-hidden">

      {/* --- HERO SECTION --- */}
      <div className="bg-white relative overflow-hidden">
        {/* Enhanced Decorative Background */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #78350f 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-amber-50 to-transparent opacity-50 rounded-bl-[100px]"></div>

        {/* Content Container */}
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-20 md:py-32 lg:py-40 text-center relative z-10">

          {/* Badge with subtle float animation */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-stone-200 text-stone-700 text-sm md:text-base font-bold tracking-widest uppercase mb-10 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-amber-600 fill-amber-600" />
            Curated for Ages 3-10
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold text-stone-900 mb-8 md:mb-10 tracking-tight leading-[1.1] drop-shadow-sm">
            Books That Build <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 italic pr-2">
              Knowledge & Character
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl lg:text-2xl text-stone-600 mb-12 max-w-3xl mx-auto leading-relaxed font-normal">
            Hand-picked and self-created books. From mythology to moral tales, religious texts to activity books—we don't just sell books, we sell knowledge that shapes young minds.
          </p>

          {/* Buttons with better interaction states */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 w-full sm:w-auto px-4 sm:px-0">
            <button className="w-full sm:w-auto bg-stone-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl text-lg font-bold shadow-xl shadow-stone-900/10 hover:bg-stone-800 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group">
              Browse Collection
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Trust Metrics */}
          <div className="mt-20 md:mt-28 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 pt-12 border-t border-stone-100 max-w-6xl mx-auto">
            {[
              { value: "Physical Books", label: "Real Reading Experience" },
              { value: "3 Languages", label: "Hindi, Gujarati, English" },
              { value: "Pan-India", label: "Delivery to All States" },
              { value: "Affordable", label: "Premium Quality, Fair Price" }
            ].map((metric, index) => (
              <div key={index} className="text-center group p-4 rounded-xl hover:bg-stone-50 transition-colors duration-300">
                <div className="text-xl md:text-3xl font-bold text-stone-900 mb-2 group-hover:text-amber-700 transition-colors font-serif">{metric.value}</div>
                <div className="text-xs md:text-sm font-semibold text-stone-400 uppercase tracking-wider">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- ABOUT SECTION --- */}
      <div className="py-20 md:py-32 px-6 md:px-12 bg-stone-50 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8 md:mb-10 text-stone-900">The Kiddos Intellect Promise</h2>
          <div className="space-y-6 md:space-y-8 text-lg md:text-xl lg:text-2xl text-stone-600 leading-relaxed font-light">
            <p>
              At <span className="font-bold text-stone-900">Kiddos Intellect</span>, we believe that we don't just sell books—we sell knowledge, values, and character. Every book in our collection is carefully hand-picked or originally created by educators and parents who understand the transformative power of early childhood learning.
            </p>
            <p>
              Our mission is to make <span className="text-amber-700 font-medium border-b-2 border-amber-200">quality education accessible</span> to every Indian family. Through timeless stories from mythology, Bhagavad Gita, Ramayana, Bible, and engaging activity books, we help children develop not just academic skills, but also moral values.
            </p>
          </div>
          <div className="mt-12 md:mt-16 flex justify-center">
            <div className="p-4 bg-white rounded-full shadow-md border border-stone-100">
              <Feather className="w-10 h-10 md:w-12 md:h-12 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* --- AGE / CURRICULUM SECTION --- */}
      <div className="py-20 md:py-32 px-4 md:px-12 bg-white border-y border-stone-200">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 mb-4 md:mb-6">Developmental Stages</h2>
            <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto">
              Every child learns differently. We have structured our curriculum to match the cognitive growth of your child.
            </p>
          </div>

          {/* Age Selector Tabs */}
          <div className="flex justify-center mb-12 md:mb-16">
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-2 p-2 bg-stone-100/80 backdrop-blur-sm rounded-2xl w-full sm:w-auto border border-stone-200">
              {ageGroups.map((group, index) => (
                <button
                  key={index}
                  onClick={() => handleAgeChange(index)}
                  className={`w-full sm:w-auto px-6 md:px-8 py-4 md:py-3 rounded-xl font-bold transition-all duration-300 text-base md:text-lg ${activeAge === index
                    ? 'bg-white text-stone-900 shadow-md ring-1 ring-black/5 scale-[1.02]'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'
                    }`}
                >
                  {group.age}
                </button>
              ))}
            </div>
          </div>

          {/* Active Age Content Box - With Fade Transition */}
          <div className="bg-gradient-to-br from-stone-50 to-white rounded-[2rem] p-6 md:p-16 border border-stone-200 shadow-xl shadow-stone-200/50 relative overflow-hidden">
            {/* Watermark */}
            <div className="hidden lg:block absolute -top-10 -right-10 opacity-[0.03] pointer-events-none transition-transform duration-700 hover:scale-105">
              <Brain className="w-[500px] h-[500px] text-stone-900" />
            </div>

            <div className={`relative z-10 max-w-5xl mx-auto text-center transition-opacity duration-300 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <span className="inline-block text-amber-600 font-bold tracking-widest uppercase text-xs md:text-sm mb-4 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                Stage Focus: {ageGroups[activeAge].title}
              </span>

              <h3 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 mb-6 md:mb-8">
                Curriculum for {ageGroups[activeAge].age}
              </h3>

              <p className="text-lg md:text-2xl text-stone-600 mb-10 md:mb-14 leading-relaxed font-light max-w-4xl mx-auto">
                {ageGroups[activeAge].description}
              </p>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-10 shadow-sm border border-stone-100 mb-4">
                <h4 className="text-sm md:text-base font-bold text-stone-400 uppercase tracking-widest mb-6 md:mb-8 border-b border-stone-100 pb-4 inline-block px-4">
                  Key Skills & Values
                </h4>
                <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                  {ageGroups[activeAge].skills.split(', ').map((skill, i) => (
                    <span key={i} className="px-5 md:px-6 py-2.5 md:py-3 bg-stone-50 text-stone-700 text-sm md:text-lg font-medium rounded-full border border-stone-200 flex items-center shadow-sm hover:border-amber-200 hover:bg-amber-50 transition-colors cursor-default">
                      <Check className="w-4 h-4 md:w-5 md:h-5 mr-2 text-green-600" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BENEFITS SECTION --- */}
      <div className="py-20 md:py-32 px-6 md:px-12 bg-stone-50">
        <div className="max-w-screen-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-center mb-12 md:mb-20 text-stone-900">Why Parents Trust Us</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-8 md:p-10 rounded-2xl border border-stone-100 hover:border-amber-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-stone-50 rounded-xl flex items-center justify-center text-stone-900 mb-6 md:mb-8 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors duration-300 shadow-inner">
                  {React.cloneElement(benefit.icon, { className: "w-6 h-6 md:w-8 md:h-8" })}
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-stone-900 group-hover:text-amber-700 transition-colors">{benefit.title}</h3>
                <p className="text-base md:text-lg text-stone-600 leading-relaxed font-normal">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CATEGORIES SECTION --- */}
      <div className="py-20 md:py-32 px-6 md:px-12 bg-white">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-center mb-6 text-stone-900">Our Collections</h2>
          <p className="text-lg md:text-xl text-center text-stone-600 mb-16 md:mb-24">Explore our library by genre</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {categories.map((category, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="aspect-square rounded-3xl bg-stone-50 border-2 border-transparent group-hover:border-amber-100 flex flex-col items-center justify-center mb-6 group-hover:bg-white transition-all duration-300 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 overflow-hidden relative">
                  <div className="absolute inset-0 bg-stone-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl -z-10 transform scale-90 group-hover:scale-100"></div>
                  <div className="text-5xl md:text-6xl mb-2 transform group-hover:scale-110 transition-transform duration-300">{category.emoji}</div>
                </div>
                <h3 className="font-bold text-lg md:text-xl text-stone-900 group-hover:text-amber-700 transition-colors mb-1">{category.name}</h3>
                <p className="text-sm md:text-base text-stone-500 font-medium group-hover:text-stone-700">{category.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- WHY MYTHOLOGY MATTERS --- */}
      <div className="py-20 md:py-32 px-6 md:px-12 bg-stone-900 text-stone-300 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-900/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-screen-2xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-16 md:mb-24 lg:items-end border-b border-white/10 pb-16">
            <div className="lg:w-1/2">
              <span className="text-amber-500 font-bold tracking-widest uppercase text-sm mb-4 block">Pedagogy</span>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight">Why Books Matter<br /> for Ages 3-10</h2>
            </div>
            <div className="lg:w-1/2">
              <p className="text-xl md:text-2xl text-stone-400 font-light leading-relaxed">
                Critical brain development happens in this window. We combine ancient wisdom with modern pedagogy to create well-rounded individuals.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {whyMythologyMatters.map((item, index) => (
              <div key={index} className="bg-white/5 border border-white/5 p-8 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-base md:text-lg text-stone-400 leading-relaxed opacity-90">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- OUTCOMES --- */}
      <div className="py-20 md:py-32 px-6 md:px-12 bg-stone-50">
        <div className="max-w-screen-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-center mb-16 md:mb-24 text-stone-900">Holistic Growth</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {learningOutcomes.map((outcome, index) => (
              <div key={index} className="flex gap-6 p-6 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-stone-100">
                <div className="mt-1 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shadow-sm">
                    <Check className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-xl md:text-2xl mb-3">{outcome.title}</h3>
                  <p className="text-base md:text-lg text-stone-600 leading-relaxed">{outcome.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- TESTIMONIALS --- */}
      <div className="py-20 md:py-32 px-6 md:px-12 bg-white border-t border-stone-200">
        <div className="max-w-screen-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-center mb-16 md:mb-24 text-stone-900">What Parents Say</h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-stone-50 p-8 md:p-12 rounded-[2rem] relative h-full flex flex-col shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-stone-100">
                <div className="text-8xl text-amber-100 absolute top-4 left-6 font-serif opacity-50 select-none">"</div>
                <p className="text-lg md:text-xl text-stone-700 mb-8 leading-relaxed relative z-10 pt-8 flex-grow font-medium italic">
                  {testimonial.text}
                </p>
                <div className="border-t border-stone-200 pt-6 mt-auto flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-500">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 text-lg leading-tight">{testimonial.name}</p>
                    <p className="text-xs text-stone-500 uppercase tracking-wide font-semibold">{testimonial.child}</p>
                    <p className="text-xs text-stone-400">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FAQ SECTION --- */}
      <div className="py-20 md:py-32 px-6 md:px-12 bg-stone-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-center mb-12 md:mb-16 text-stone-900">Frequently Asked Questions</h2>
          <div className="space-y-4 md:space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 md:px-8 py-6 flex justify-between items-center hover:bg-stone-50 transition-colors"
                >
                  <span className={`font-bold text-lg md:text-xl pr-8 ${openFaq === index ? 'text-amber-700' : 'text-stone-800'}`}>
                    {faq.question}
                  </span>
                  <div className={`transition-transform duration-300 ${openFaq === index ? 'rotate-180' : 'rotate-0'}`}>
                    {openFaq === index ? (
                      <ChevronUp className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-stone-400 flex-shrink-0" />
                    )}
                  </div>
                </button>
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-6 md:px-8 pb-8 pt-0 text-base md:text-lg text-stone-600 leading-relaxed border-t border-stone-100 mt-2">
                    <div className="pt-4">{faq.answer}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FOOTER CTA --- */}
      <div className="py-24 md:py-40 px-6 md:px-12 bg-stone-900 text-stone-100 text-center relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-block p-4 rounded-full bg-white/5 mb-8 md:mb-10">
            <Scroll className="w-12 h-12 text-amber-500 mx-auto" />
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8 md:mb-10 tracking-tight">Start Your Child's Journey</h2>
          <p className="text-xl md:text-2xl text-stone-400 mb-12 md:mb-16 max-w-3xl mx-auto font-light leading-relaxed">
            Give your child the gift of knowledge, values, and a lifelong love for reading through our carefully curated books.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 w-full sm:w-auto">
            <Link to="/catalog">
              <button className="w-full sm:w-auto bg-amber-600 text-white px-10 py-5 rounded-xl text-lg font-bold shadow-lg shadow-amber-900/20 hover:bg-amber-700 hover:-translate-y-1 active:scale-95 transition-all duration-300">
                Shop All Books
              </button>
            </Link>
            <Link to="/contact">
              <button className="w-full sm:w-auto bg-transparent border-2 border-stone-700 text-white px-10 py-5 rounded-xl text-lg font-bold hover:bg-white hover:text-stone-900 hover:border-white active:scale-95 transition-all duration-300">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}