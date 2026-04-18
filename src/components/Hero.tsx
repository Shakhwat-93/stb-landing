import React from 'react';
import { motion } from 'framer-motion';
import heroImg from '../../assets/hero-desktop.webp';
import heroMobileImg from '../../assets/hero-mobile.webp';
import { ArrowRight, PlaneTakeoff, ShieldCheck } from 'lucide-react';

const Hero = () => {
  const scrollToForm = () => {
    document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Full Width Banner Container */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full"
      >
        <picture>
          <source media="(max-width: 767px)" srcSet={heroMobileImg} />
          <source media="(min-width: 768px)" srcSet={heroImg} />
          <img 
            src={heroImg} 
            alt="Canvas Travel Bag" 
            className="w-full h-auto object-cover min-h-[300px] md:min-h-[500px] lg:min-h-screen"
          />
        </picture>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center py-12">
        {/* Content Below Image */}
        <div className="w-full max-w-3xl text-center flex flex-col items-center space-y-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-semibold tracking-wide"
          >
            <PlaneTakeoff size={16} />
            <span>Premium Travel Series</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight"
          >
            Canvas Travel Bag – <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500">
              এক ব্যাগেই ভ্রমণের সব সমাধান ✈️
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-lg md:text-xl text-gray-600 max-w-2xl font-medium"
          >
            হালকা, টেকসই, আর এয়ারলাইন-অ্যাপ্রুভড — এক ব্যাগেই প্যাক করুন পুরো ট্রিপের নিশ্চিন্ততা।
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={scrollToForm}
              className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 transform hover:-translate-y-1"
            >
              <span>অর্ডার করতে চাই</span>
              <ArrowRight size={20} />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <ShieldCheck size={18} className="text-green-500" />
              <span>100% Quality Guaranteed</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
