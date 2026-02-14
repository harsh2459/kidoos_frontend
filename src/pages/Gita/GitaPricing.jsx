import React from 'react';
import { Check, ArrowRight, Star } from 'lucide-react';

const GitaPricing = () => {
  const books = [
    {
      lang: 'English',
      flag: '🇬🇧',
      title: 'Gita for Kids',
      subtitle: 'Global Edition',
      price: '₹499',
      features: ['Simplified English', '120+ Illustrations', 'Vocabulary Builder', 'Hardcover'],
      // We use specific gradients for each card to make them distinct but cohesive
      bgGradient: 'from-blue-50 to-white',
      btnColor: 'bg-[#051A12] hover:bg-[#F59E0B]',
      img: '/images-webp/gita-english-hero.webp' // Use your specific book cover images here
    },
    {
      lang: 'Hindi',
      flag: '🇮🇳',
      title: 'Gita for Kids',
      subtitle: 'Matrubhasha Edition',
      price: '₹499',
      features: ['Shuddh Hindi', 'Cultural Context', 'Moral Stories', 'Hardcover'],
      bgGradient: 'from-orange-50 to-white',
      btnColor: 'bg-[#051A12] hover:bg-[#F59E0B]',
      img: '/images-webp/gita-english-hero.webp'
    },
    {
      lang: 'Gujarati',
      flag: '🕉️',
      title: 'Gita for Kids',
      subtitle: 'Regional Edition',
      price: '₹499',
      features: ['Authentic Gujarati', 'Family Bonding', 'Daily Prayers', 'Hardcover'],
      bgGradient: 'from-green-50 to-white',
      btnColor: 'bg-[#051A12] hover:bg-[#F59E0B]',
      img: '/images-webp/gita-english-hero.webp'
    }
  ];

  return (
    <section id="shop" className="py-32 px-6 bg-[#FFFEF5]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#051A12]/5 text-[#051A12] text-xs font-bold uppercase tracking-widest mb-6">
            <Star size={12} className="text-[#F59E0B]" fill="#F59E0B" />
            Shop The Series
          </div>
          <h2 className="font-serif text-5xl md:text-6xl text-[#051A12] mb-6">
            Choose Your Edition
          </h2>
          <p className="text-[#575F5B] text-lg max-w-2xl mx-auto">
            One timeless wisdom, three languages. Select the perfect version to connect your child with their roots.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {books.map((book, index) => (
            <div 
              key={book.lang}
              className={`group relative bg-gradient-to-b ${book.bgGradient} rounded-[3rem] p-8 border border-black/5 flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-2`}
            >
              
              {/* Image Area */}
              <div className="h-[300px] flex items-center justify-center relative mb-8 group-hover:scale-105 transition-transform duration-500">
                {/* Floating Badge */}
                <div className="absolute top-0 left-0 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold shadow-sm border border-black/5 z-10">
                  {book.flag} {book.lang}
                </div>
                
                {/* Book Shadow */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-40 h-4 bg-black/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <img 
                  src={book.img} 
                  alt={`${book.lang} Edition`}
                  className="h-full object-contain drop-shadow-xl" 
                />
              </div>

              {/* Card Content */}
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-serif text-3xl text-[#051A12]">{book.title}</h3>
                        <p className="text-[#575F5B] text-sm font-medium">{book.subtitle}</p>
                    </div>
                </div>
                
                <div className="flex items-baseline gap-3 my-6">
                  <span className="text-4xl font-serif text-[#051A12]">{book.price}</span>
                  <span className="text-gray-400 line-through text-lg decoration-red-400">₹699</span>
                  <span className="bg-[#F59E0B]/10 text-[#B45309] text-xs font-bold px-2 py-1 rounded-md ml-auto">
                    SAVE 30%
                  </span>
                </div>

                <div className="w-full h-px bg-black/5 mb-6"></div>

                <ul className="space-y-4 mb-8">
                  {book.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-[15px] text-[#575F5B]">
                      <div className="w-5 h-5 rounded-full bg-[#051A12] flex items-center justify-center flex-shrink-0">
                        <Check size={10} className="text-white" strokeWidth={3} />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button className={`w-full py-4 rounded-2xl text-white font-medium flex items-center justify-center gap-2 transition-all duration-300 ${book.btnColor} shadow-lg group-hover:shadow-xl`}>
                Add to Cart <ArrowRight size={18} />
              </button>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default GitaPricing;