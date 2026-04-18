import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import Features from './components/Features';
import ProductGallery from './components/ProductGallery';
import CheckoutForm from './components/CheckoutForm';
import Footer from './components/Footer';
import FloatingCallButton from './components/FloatingCallButton';
import AnnouncementBar from './components/AnnouncementBar';
import PopupOffer from './components/PopupOffer';
function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">
        <Hero />
        <ProblemSolution />
        <Features />
        <ProductGallery />
        <CheckoutForm />
      </main>
      <Footer />
      <PopupOffer />
      <FloatingCallButton />
    </div>
  );
}

export default App;
