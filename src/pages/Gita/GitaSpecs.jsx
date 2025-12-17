import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Smartphone, BookOpen, Sparkles, Heart, Users, Lightbulb, BookMarked, Feather } from 'lucide-react';
import { Link } from 'react-router-dom';

const GitaComparisonEnhanced = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSide, setHoveredSide] = useState(null);
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

  const screenChallenges = [
    {
      icon: Smartphone,
      title: "Endless Scrolling",
      detail: "Hours vanish as attention bounces from video to video without real learning"
    },
    {
      icon: BookOpen,
      title: "Passive Watching",
      detail: "Children consume content without engaging their imagination or thinking deeply"
    },
    {
      icon: Lightbulb,
      title: "Lost Focus",
      detail: "Quick cuts and notifications make it hard to concentrate on one thing"
    },
    {
      icon: Heart,
      title: "Missing Connection",
      detail: "Screen time replaces family conversations and shared reading moments"
    }
  ];

  const bookBenefits = [
    {
      icon: Sparkles,
      title: "Active Imagination",
      detail: "Every page invites children to visualize stories and create their own mental worlds"
    },
    {
      icon: BookMarked,
      title: "Deep Engagement",
      detail: "Beautiful illustrations and thoughtful stories hold attention naturally"
    },
    {
      icon: Lightbulb,
      title: "Focused Reading",
      detail: "No distractions—just your child, the story, and their growing mind"
    },
    {
      icon: Users,
      title: "Family Bonding",
      detail: "Shared reading creates precious memories and meaningful conversations"
    }
  ];

  return (
    <section ref={sectionRef} className="relative py-32 px-6 bg-gradient-to-b from-[#FFFEF5] via-[#FFF7ED] to-[#FFFEF5] overflow-hidden">

      {/* Gentle Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <Feather className="absolute top-20 left-10 w-32 h-32 text-[#F59E0B] opacity-20 animate-float" />
        <BookOpen className="absolute top-40 right-20 w-40 h-40 text-[#051A12] opacity-10 animate-float-delayed" />
        <Sparkles className="absolute bottom-32 left-1/4 w-24 h-24 text-[#F59E0B] opacity-20 animate-float" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Warm, Inviting Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
          <div className="inline-flex items-center gap-2 bg-[#FDE68A] text-[#92400E] px-6 py-2 rounded-full text-sm font-semibold mb-6">
            <BookOpen size={18} />
            <span>The Joy of Reading</span>
          </div>
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl text-[#051A12] mb-6 leading-tight">
            Why Books Beat Screens
            <br />
            <span className="italic text-[#F59E0B]">Every Single Time</span>
          </h2>
          <p className="text-gray-600 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            A gentle comparison to help you understand the magic of physical books
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative">

          {/* Center Divider with Book Icon */}
          <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="relative">
              <div className="absolute inset-0 bg-[#F59E0B] rounded-full blur-xl opacity-30"></div>
              <div className="relative w-20 h-20 rounded-full bg-white border-4 border-[#F59E0B] shadow-lg flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-[#F59E0B]" />
              </div>
            </div>
          </div>

          {/* LEFT: Screen Time Challenges */}
          <div
            className={`relative bg-gradient-to-br from-gray-50 to-white rounded-[2.5rem] p-10 md:p-12 overflow-hidden group transition-all duration-700 border border-gray-200 shadow-sm hover:shadow-lg ${isVisible ? 'opacity-100 -translate-x-0' : 'opacity-0 -translate-x-16'
              }`}
            onMouseEnter={() => setHoveredSide('screens')}
            onMouseLeave={() => setHoveredSide(null)}
          >
            {/* Soft Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
              <Smartphone size={200} className="text-gray-400" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold uppercase tracking-wide mb-8">
                <Smartphone size={14} />
                Screen Time
              </div>

              <h3 className="font-serif text-4xl md:text-5xl text-[#051A12] mb-3 leading-tight">
                The Digital Dilemma
              </h3>
              <p className="text-gray-600 text-base mb-10">Common challenges parents notice</p>

              <ul className="space-y-5">
                {screenChallenges.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.title}
                      className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                        }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Icon size={20} className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[#051A12] font-semibold text-lg mb-1">{item.title}</p>
                          <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Understanding Note */}
              <div className="mt-8 p-5 bg-gray-50 border border-gray-200 rounded-2xl">
                <p className="text-gray-700 text-sm leading-relaxed">
                  <span className="font-semibold text-[#051A12]">We understand:</span> Screens aren't going away. But balancing them with books creates healthier, happier children.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Book Benefits */}
          <div
            className={`relative bg-gradient-to-br from-[#051A12] to-[#0A2820] rounded-[2.5rem] p-10 md:p-12 overflow-hidden text-[#FFFEF5] transition-all duration-700 shadow-xl ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
              } ${hoveredSide === 'books' ? 'scale-[1.02]' : ''}`}
            style={{ transitionDelay: '200ms' }}
            onMouseEnter={() => setHoveredSide('books')}
            onMouseLeave={() => setHoveredSide(null)}
          >
            {/* Warm Glows */}
            <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-[#F59E0B] opacity-15 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] bg-[#FDE68A] opacity-10 blur-[80px] rounded-full"></div>

            {/* Decorative Elements */}
            <Sparkles className="absolute top-10 right-10 w-12 h-12 text-[#F59E0B] opacity-30" />
            <Heart className="absolute bottom-10 left-10 w-10 h-10 text-[#F59E0B] opacity-20" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F59E0B] text-[#051A12] text-xs font-semibold uppercase tracking-wide mb-8 shadow-lg">
                <BookOpen size={14} />
                kiddos intellect Books
              </div>

              <h3 className="font-serif text-4xl md:text-5xl text-white mb-3 leading-tight">
                The Reading Experience
              </h3>
              <p className="text-gray-300 text-base mb-10">What makes physical books special</p>

              <ul className="space-y-5">
                {bookBenefits.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.title}
                      className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                        }`}
                      style={{ transitionDelay: `${400 + index * 100}ms` }}
                    >
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 border border-white/10">
                        <div className="w-12 h-12 rounded-xl bg-[#F59E0B] flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Icon size={20} className="text-[#051A12]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold text-lg mb-1">{item.title}</p>
                          <p className="text-gray-300 text-sm leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Community Note */}
              <div className="mt-8 p-5 bg-[#F59E0B]/20 border border-[#F59E0B]/30 rounded-2xl backdrop-blur-sm">
                <p className="text-[#FDE68A] text-sm leading-relaxed">
                  <span className="font-semibold text-white">2,500+ families</span> have discovered the joy of reading together with kiddos intellect books.
                </p>
              </div>
            </div>

            {/* Decorative Book */}
            <div className="absolute bottom-8 right-8 opacity-10">
              <BookOpen size={100} strokeWidth={1} />
            </div>
          </div>

        </div>

        {/* Gentle CTA */}
        <div className={`mt-20 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`} style={{ transitionDelay: '800ms' }}>
          <div className="relative inline-block max-w-3xl">
            <div className="bg-white border-2 border-[#F59E0B]/20 rounded-3xl p-10 shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart className="text-[#F59E0B]" size={32} />
                <h3 className="font-serif text-3xl md:text-4xl text-[#051A12]">
                  Start Your Reading Journey
                </h3>
              </div>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                Give your child the gift of imagination, focus, and meaningful stories.
                Experience the difference a beautiful book can make.
              </p>
              <Link to="/catalog">
                <button className="group relative bg-gradient-to-r from-[#F59E0B] to-[#DC7609] text-white px-10 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <span className="flex items-center gap-2">
                    Explore Our Books
                    <BookOpen size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Link>
              <p className="text-sm text-gray-500 mt-6">
                📚 Beautifully crafted • 🚚 Fast delivery • 💝 Gift wrapping available
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Gentle Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0) rotate(0deg);
            opacity: 0.2;
          }
          50% { 
            transform: translateY(-20px) rotate(5deg);
            opacity: 0.4;
          }
        }

        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0) rotate(0deg);
            opacity: 0.1;
          }
          50% { 
            transform: translateY(-15px) rotate(-5deg);
            opacity: 0.3;
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite 2s;
        }
      `}</style>
    </section>
  );
};

export default GitaComparisonEnhanced;