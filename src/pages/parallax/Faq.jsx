import React, { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);

  // DATA: From your uploaded GitaFAQ.jsx
  const faqs = [
    {
        question: "What age group is this book suitable for?",
        answer: "The kiddos intellect book is specifically designed for children aged 5-12 years. The content, illustrations, and language complexity are carefully calibrated. Younger children (5-7) will enjoy the colorful illustrations and simple stories, while older children (8-12) will grasp deeper meanings."
    },
    {
        question: "How long does delivery take?",
        answer: "We offer lightning-fast delivery! Most orders within India are delivered within 2-4 business days. Metro cities typically receive orders in 2-3 days. We'll provide you with a tracking number as soon as your order ships."
    },
    {
        question: "Is the content appropriate and safe for children?",
        answer: "Absolutely! Every page has been reviewed by child psychologists, educators, and parents. The content focuses on universal values like empathy, courage, resilience, and kindness."
    },
    {
        question: "What language editions are available?",
        answer: "Currently, we offer English, Hindi, and Gujarati editions. Each edition maintains the same high-quality illustrations and carefully adapted content."
    },
    {
        question: "Can I preview some pages before buying?",
        answer: "Yes! You can view sample pages by scrolling up to our 'Visual Storytelling' section on this page or contacting support for a PDF preview."
    },
    {
        question: "Do you offer bulk discounts for schools?",
        answer: "Yes! We offer special pricing for bulk orders of 50 or more books. This is perfect for schools, reading clubs, or communities. Contact us for a quote."
    },
    {
        question: "Is this a religious book?",
        answer: "No, this is a book of universal life lessons. While it draws wisdom from the Bhagavad Gita, we've adapted the teachings into secular, universal principles that benefit all children regardless of their background."
    }
  ];

  return (
    <section className="py-32 px-6 bg-white border-t border-gray-100">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-4">
            Common Questions
          </h2>
          <p className="text-xl text-gray-500">Everything you need to know.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border-b border-gray-100 transition-all duration-300 ${openIndex === index ? 'pb-6' : 'pb-0'}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-6 flex items-center justify-between text-left group"
              >
                <span className={`text-xl font-medium transition-colors duration-300 ${openIndex === index ? 'text-orange-600' : 'text-[#1d1d1f] group-hover:text-orange-600'}`}>
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-orange-600' : ''}`} 
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-lg text-gray-500 leading-relaxed pb-4">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-[#F5F5F7] text-center">
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">Still have questions?</h3>
            <p className="text-gray-500 mb-6">Our team is just a message away.</p>
            <Link to="/contact">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full font-semibold text-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-white transition-all shadow-sm">
                <MessageCircle className="w-4 h-4" />
                Contact Support
              </button>
            </Link>
        </div>

      </div>
    </section>
  );
};

export default Faq;