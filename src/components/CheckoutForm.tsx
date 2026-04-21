import React, { useState } from 'react';
import { Lock, Plus, Minus, Check } from 'lucide-react';
import heroImg from '../../assets/hero-desktop.webp';
import blackImg from '../../assets/black-color.webp';
import beigeImg from '../../assets/beige-color.webp';
import blueImg from '../../assets/blue-color.webp';
import { supabase } from '../lib/supabase';

type ProductVariant = {
  id: string;
  name: string;
  colorCode: string;
  image: string;
  price: number;
};

const productVariants: ProductVariant[] = [
  { id: 'black', name: 'Canvas Travel Bag - Black', colorCode: '#111827', image: blackImg, price: 1350 },
  { id: 'blue', name: 'Canvas Travel Bag - Blue', colorCode: '#3b82f6', image: blueImg, price: 1350 },
  { id: 'beige', name: 'Canvas Travel Bag - Beige', colorCode: '#e8dbce', image: beigeImg, price: 1350 },
];

const CheckoutForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [shippingCost, setShippingCost] = useState<number>(60);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  // State for cart: variant id -> quantity
  const [cart, setCart] = useState<Record<string, number>>({
    'black': 1 // Default select black
  });

  const handleToggleVariant = (id: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id]) {
        delete newCart[id]; // Uncheck
      } else {
        newCart[id] = 1; // Check with default qty 1
      }
      return newCart;
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const currentQty = prev[id] || 0;
      const newQty = currentQty + delta;
      if (newQty < 1) return prev; // Don't drop below 1 via buttons if checked
      return { ...prev, [id]: newQty };
    });
  };

  const selectedItems = productVariants.filter(v => cart[v.id]);
  const productSubtotal = selectedItems.reduce((sum, item) => sum + (item.price * cart[item.id]), 0);
  const total = productSubtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert("Please select at least one product.");
      return;
    }
    
    // Validate BD Phone Number
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(phone)) {
      alert("দয়া করে সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নাম্বার দিন (যেমন: 017XXXXXXXX)।");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Rate Limit Check
      if (phone !== '01315183993') {
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
        
        // Check DB for recent orders with the same phone
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('id')
          .eq('phone', phone)
          .gte('created_at', threeHoursAgo)
          .limit(1);

        // Check local storage for recent orders from the same device
        const lastOrderTime = localStorage.getItem('last_order_time');
        const isRateLimitedByStorage = lastOrderTime && (Date.now() - parseInt(lastOrderTime)) < 3 * 60 * 60 * 1000;

        if ((recentOrders && recentOrders.length > 0) || isRateLimitedByStorage) {
           setShowLimitModal(true);
           setIsSubmitting(false);
           return;
        }
      }

      const totalItems = selectedItems.reduce((sum, item) => sum + cart[item.id], 0);
      const orderedItemsJson = selectedItems.map(item => ({
        name: item.name,
        quantity: cart[item.id],
        price: item.price
      }));
      
      const orderId = `STB-${Math.floor(100000 + Math.random() * 900000)}`;

      const { error } = await supabase.from('orders').insert([
        {
          id: orderId,
          customer_name: name,
          phone: phone,
          address: address,
          product_name: "Canvas Travel Bag",
          ordered_items: orderedItemsJson,
          amount: total,
          items: totalItems,
          shipping_zone: shippingCost === 130 ? 'Outside dhaka' : 'Inside dhaka',
          source: 'stb-landing',
          status: 'New'
        }
      ]);

      if (error) throw error;
      
      // Push GA4 ecommerce purchase event
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({
        event: "purchase",
        ecommerce: {
          transaction_id: orderId,
          value: total,
          currency: "BDT",
          items: orderedItemsJson.map(item => ({
            item_name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        },
        customer_name: name,
        customer_phone: phone,
        customer_address: address
      });

      localStorage.setItem('last_order_time', Date.now().toString());
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("অর্ডার সাবমিট করতে সমস্যা হচ্ছে। দয়া করে আবার চেষ্টা করুন বা আমাদের কল করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="checkout-form" className="py-16 bg-white border-t border-gray-100 relative">
      
      {/* Rate Limit Warning Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">অর্ডার লিমিট অতিক্রম করেছে!</h3>
            <p className="text-gray-600 mb-6 text-sm">
              আপনি ইতিমধ্যেই একটি অর্ডার প্লেস করেছেন। স্প্যাম রোধ করতে, দয়া করে ৩ ঘণ্টা পর আবার চেষ্টা করুন।
            </p>
            <button 
              onClick={() => setShowLimitModal(false)}
              className="bg-gray-900 text-white font-bold py-3 px-8 rounded-md w-full hover:bg-gray-800 transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4">
        <form onSubmit={handleSubmit}>
          
          {/* Top Section: Your Products */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Your Products</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {productVariants.map(variant => {
                const isSelected = !!cart[variant.id];
                const qty = cart[variant.id] || 0;

                return (
                  <div 
                    key={variant.id}
                    className={`flex items-center p-4 rounded-xl border transition-all ${isSelected ? 'border-red-400 bg-red-50/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    {/* Checkbox */}
                    <div 
                      onClick={() => handleToggleVariant(variant.id)}
                      className="cursor-pointer mr-4"
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center border ${isSelected ? 'bg-blue-800 border-blue-800 text-white' : 'border-gray-300 bg-white'}`}>
                        {isSelected && <Check size={16} strokeWidth={3} />}
                      </div>
                    </div>

                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-md shadow-sm mr-4 flex-shrink-0 border border-gray-100 overflow-hidden bg-gray-50">
                      <img src={variant.image} alt={variant.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h4 className="text-sm text-gray-800 font-medium mb-2">{variant.name}</h4>
                      <div className="flex items-center gap-4">
                        {/* Qty Controls */}
                        <div className="flex items-center border border-gray-200 rounded-md bg-white">
                          <button 
                            type="button"
                            onClick={() => handleUpdateQuantity(variant.id, -1)}
                            disabled={!isSelected}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{isSelected ? qty : 1}</span>
                          <button 
                            type="button"
                            onClick={() => handleUpdateQuantity(variant.id, 1)}
                            disabled={!isSelected}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        {/* Item Price */}
                        <span className="font-bold text-gray-900">{variant.price}৳</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
            
            {/* Left Column: Billing & Shipping */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Billing & Shipping</h3>

              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-800">
                    আপনার নাম লিখুন <span className="text-red-600">*</span>
                  </label>
                  <input 
                    required 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Hasan Mahmud" 
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors" 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-800">
                    আপনার ঠিকানা এলাকা, থানা, জেলা লিখুন <span className="text-red-600">*</span>
                  </label>
                  <input 
                    required 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. House 12, Road 4, Dhanmondi, Dhaka" 
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors" 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-800">
                    মোবাইল নাম্বার <span className="text-red-600">*</span>
                  </label>
                  <input 
                    required 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX" 
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors" 
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Your Order */}
            <div className="w-full md:w-[45%]">
               <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Your order</h3>

               <div className="flex justify-between items-center text-sm font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                 <span>Product</span>
                 <span>Subtotal</span>
               </div>

               {/* Selected Products List */}
               <div className="mb-6 pb-6 border-b border-gray-100 space-y-4">
                 {selectedItems.length === 0 ? (
                   <p className="text-sm text-red-500 italic">No products selected.</p>
                 ) : (
                   selectedItems.map(item => (
                     <div key={item.id} className="flex justify-between items-center">
                       <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded shadow-sm flex-shrink-0 border border-gray-100 overflow-hidden bg-gray-50">
                           <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex flex-col text-sm text-gray-600">
                           <span>{item.name}</span>
                           <span className="font-bold">× {cart[item.id]}</span>
                         </div>
                       </div>
                       <span className="font-bold text-gray-900">{item.price * cart[item.id]}৳</span>
                     </div>
                   ))
                 )}
               </div>

               {/* Subtotal */}
               <div className="flex justify-between items-center mb-4 text-sm">
                 <span className="font-bold text-gray-800">Subtotal</span>
                 <span className="font-bold text-gray-900">{productSubtotal}৳</span>
               </div>

               {/* Shipping Options */}
               <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                 <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-gray-800">ঢাকার বাইরে ডেলিভারি চার্জ: <span className="font-bold text-teal-600">130.00৳</span></span>
                   <input 
                     type="radio" 
                     name="shipping" 
                     value={130}
                     checked={shippingCost === 130}
                     onChange={() => setShippingCost(130)}
                     className="w-4 h-4 ml-2 text-accent border-gray-300 focus:ring-accent accent-purple-600 cursor-pointer"
                   />
                 </label>
                 <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-gray-800">ঢাকার ভিতরে ডেলিভারি চার্জ: <span className="font-bold text-teal-600">60.00৳</span></span>
                   <input 
                     type="radio" 
                     name="shipping" 
                     value={60}
                     checked={shippingCost === 60}
                     onChange={() => setShippingCost(60)}
                     className="w-4 h-4 text-accent border-gray-300 focus:ring-accent accent-purple-600 cursor-pointer"
                   />
                 </label>
               </div>

               {/* Total */}
               <div className="flex justify-between items-center mb-8">
                 <span className="font-extrabold text-lg text-gray-900">Total</span>
                 <span className="font-black text-2xl text-red-600">{total}৳</span>
               </div>

               {/* Submit Button */}
               <button 
                 type="submit" 
                 disabled={selectedItems.length === 0 || isSubmitting}
                 className="w-full bg-[#cc0000] hover:bg-[#a30000] disabled:bg-gray-400 text-white font-bold py-4 rounded-md shadow transition-colors flex justify-center items-center gap-2 mb-4"
               >
                 <Lock size={18} />
                 <span className="text-lg">{isSubmitting ? 'প্রসেসিং...' : 'অর্ডার কনফার্ম করুন'}</span>
               </button>

               {/* Contact Info Footer */}
               <div className="text-center text-xs text-gray-500 font-medium">
                 অর্ডার করতে কোনো সমস্যা হলে কল করুন: +8801942-212267
               </div>

            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CheckoutForm;
