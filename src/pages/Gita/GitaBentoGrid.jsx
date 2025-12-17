import React, { useState, useEffect, useRef } from 'react';
import { Palette, Sprout, Brain, Heart, Shield, HandMetal, Tag, Truck, Baby, ShieldCheck, Headset } from 'lucide-react';
import WaveText from '../../components/WaveText';

const GitaBentoGrid = () => {
  const [visibleSections, setVisibleSections] = useState({});
  const [hoveredTitle, setHoveredTitle] = useState(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    const observers = {};

    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -100px 0px'
    };

    Object.keys(sectionRefs.current).forEach(key => {
      if (sectionRefs.current[key]) {
        observers[key] = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setVisibleSections(prev => ({ ...prev, [key]: true }));
            }
          });
        }, observerOptions);

        observers[key].observe(sectionRefs.current[key]);
      }
    });

    return () => {
      Object.values(observers).forEach(observer => observer.disconnect());
    };
  }, []);


  const curriculumItems = [
    {
      icon: Palette,
      title: 'Creativity',
      desc: 'Unlock imagination and original thinking',
      color: 'purple',
      delay: 0
    },
    {
      icon: Sprout,
      title: 'Growth',
      desc: 'Nurture habits that last a lifetime',
      color: 'green',
      delay: 100
    },
    {
      icon: Brain,
      title: 'Focus',
      desc: 'Master attention in a distracted world',
      color: 'blue',
      delay: 200
    },
    {
      icon: Heart,
      title: 'Empathy',
      desc: 'Build emotional intelligence and kindness',
      color: 'yellow',
      delay: 300
    },
    {
      icon: Shield,
      title: 'Resilience',
      desc: 'Develop inner strength and courage',
      color: 'pink',
      delay: 400
    }
  ];

  const differenceCards = [
    {
      icon: HandMetal,
      title: 'Curated with Love',
      desc: 'Every book passes through our rigorous selection process. We read, evaluate, and handpick titles that truly enrich young minds—no filler, only value.',
      delay: 0
    },
    {
      icon: Tag,
      title: 'Fairly Priced',
      desc: 'Quality shouldn\'t be a luxury. We believe every family deserves access to transformative books without breaking the bank. Great stories at honest prices.',
      delay: 100
    },
    {
      icon: Truck,
      title: 'Lightning Fast',
      desc: 'We remember the thrill of waiting for a new book. That\'s why we\'ve streamlined our delivery—your order reaches you faster than you can say "once upon a time."',
      delay: 200
    },
    {
      icon: Baby,
      title: 'Age-Perfect Fit',
      desc: 'Not all books suit all ages. Our expert curation ensures content matches developmental stages (5-12 years), making every read perfectly timed for growth.',
      delay: 300
    },
    {
      icon: ShieldCheck,
      title: 'Parent Approved',
      desc: 'Join thousands of families who trust us with their children\'s reading journey. Real parents, real results, real transformation—one book at a time.',
      delay: 400
    },
    {
      icon: Headset,
      title: 'Always Here',
      desc: 'Choosing the right book can be overwhelming. Our passionate team is just a message away, ready to guide you to the perfect match for your child\'s interests.',
      delay: 500
    }
  ];

  return (
    <section className="py-24 px-6 bg-[#FFFEF5] text-[#0C120F] overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* --- 1. CURRICULUM SECTION --- */}
        <div
          ref={el => sectionRefs.current['curriculum'] = el}
          className="mb-24"
        >
          <h3
            className={`text-center font-serif text-3xl md:text-4xl mb-12 text-[#051A12] transition-all duration-700 cursor-default ${visibleSections['curriculum']
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
              }`}
            onMouseEnter={() => setHoveredTitle('curriculum')}
            onMouseLeave={() => setHoveredTitle(null)}
          >
            <WaveText text="A Curriculum for Life" isHovered={hoveredTitle === 'curriculum'} />
          </h3>

          <div className="flex flex-wrap justify-center gap-6">
            {curriculumItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`flex-1 min-w-[200px] bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-3 hover:border-${item.color}-200 transition-all duration-500 ${visibleSections['curriculum']
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-12'
                    }`}
                  style={{
                    transitionDelay: visibleSections['curriculum'] ? `${item.delay}ms` : '0ms'
                  }}
                >
                  <div className={`w-12 h-12 bg-${item.color}-100 text-${item.color}-600 rounded-xl flex items-center justify-center mx-auto mb-4 transform transition-all duration-500 hover:scale-125 hover:rotate-12 hover:shadow-lg`}>
                    <Icon size={24} />
                  </div>
                  <h4 className="font-serif text-xl mb-2 transition-colors duration-300">{item.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- 2. OUR STORY SECTION --- */}
        <div
          ref={el => sectionRefs.current['story'] = el}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24"
        >
          {/* Text Side */}
          <div
            className={`bg-white rounded-[32px] p-10 md:p-14 border border-gray-100 shadow-sm flex flex-col justify-center transition-all duration-700 hover:shadow-xl hover:-translate-y-1 ${visibleSections['story']
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-12'
              }`}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold mb-6 w-fit transform transition-all duration-300 hover:scale-105 hover:bg-[#F59E0B] hover:text-white">
              Our Mission
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mb-6 text-[#051A12]">
              Reigniting the <br />
              <span className="italic text-[#575F5B] inline-block transition-all duration-300 hover:text-[#F59E0B]">Magic of Pages.</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6 transition-all duration-300 hover:text-gray-800">
              In an era dominated by glowing screens and endless scrolls, we witnessed children losing touch with the tactile wonder of books—the weight in their hands, the whisper of turning pages, the smell of printed stories waiting to unfold.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed transition-all duration-300 hover:text-gray-800">
              We're here to change that. Every book we offer isn't just entertainment—it's a carefully chosen seed of wisdom, character, and curiosity, planted in fertile young minds.
            </p>
          </div>

          {/* Image Side */}
          <div
            className={`bg-[#E0F2FE] rounded-[32px] overflow-hidden min-h-[400px] relative group transition-all duration-700 hover:shadow-2xl ${visibleSections['story']
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-12'
              }`}
            style={{ transitionDelay: visibleSections['story'] ? '200ms' : '0ms' }}
          >
            <img
              src="/images/gita-english/Bento_grid_right.jpg"
              alt="Child reading book"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
            />
            <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/60 to-transparent text-white transition-all duration-500 group-hover:from-black/70">
              <p className="font-serif text-2xl transform transition-all duration-500 group-hover:translate-x-2">"Stories that shape souls."</p>
            </div>
          </div>
        </div>

        {/* --- 3. WHAT MAKES US DIFFERENT --- */}
        <div
          ref={el => sectionRefs.current['difference'] = el}
          className="bg-[#F9FAFB] rounded-[40px] p-8 md:p-16 transition-all duration-700 hover:bg-[#F3F4F6]"
        >
          <h2
            className={`font-serif text-4xl md:text-5xl text-center mb-16 text-[#051A12] transition-all duration-700 cursor-default ${visibleSections['difference']
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-95'
              }`}
            onMouseEnter={() => setHoveredTitle('difference')}
            onMouseLeave={() => setHoveredTitle(null)}
          >
            <WaveText text="What Makes Us Different" isHovered={hoveredTitle === 'difference'} />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differenceCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className={`bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group ${visibleSections['difference']
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-12'
                    }`}
                  style={{
                    transitionDelay: visibleSections['difference'] ? `${card.delay}ms` : '0ms'
                  }}
                >
                  <div className="relative mb-4">
                    <Icon className="w-10 h-10 text-[#051A12] transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-[#F59E0B]" />
                    <div className="absolute -inset-2 bg-[#F59E0B]/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                  </div>
                  <h4 className="font-serif text-2xl mb-3 transition-colors duration-300 group-hover:text-[#F59E0B]">{card.title}</h4>
                  <p className="text-gray-600 leading-relaxed transition-colors duration-300 group-hover:text-gray-800">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default GitaBentoGrid;