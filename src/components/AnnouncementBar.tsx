import React from 'react';
import { Sparkles } from 'lucide-react';

const AnnouncementBar = () => {
  return (
    <div className="bg-gradient-to-r from-[#cc0000] via-accent to-[#cc0000] text-white py-2 px-4 shadow-md w-full z-[60] relative overflow-hidden">
      {/* Decorative inner glow/shine */}
      <div className="absolute inset-0 bg-white/20 blur-xl translate-x-[-100%] animate-[shimmer_3s_infinite]"></div>
      
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-xs md:text-sm font-bold tracking-wide text-center">
        <Sparkles size={16} className="text-yellow-300 animate-pulse hidden sm:block" />
        <span>🔥 বিশাল ধামাকা অফার: ২,৭০০৳ এর প্রিমিয়াম ট্রাভেল ব্যাগ এখন মাত্র <span className="text-yellow-300 text-base md:text-lg mx-1">১,৩৫০৳</span> (৫০% ছাড়!)</span>
        <Sparkles size={16} className="text-yellow-300 animate-pulse hidden sm:block" />
      </div>
    </div>
  );
};

export default AnnouncementBar;
