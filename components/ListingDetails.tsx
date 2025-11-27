import React, { useState } from 'react';
import { Listing } from '../types';
import { saveReservation } from '../services/mockDb';
import TenantLogin from './tenant/Login';
import { supabase } from '../services/supabase';

interface ListingDetailsProps {
  listing: Listing;
  onClose: () => void;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({ listing, onClose }) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isReserving, setIsReserving] = useState(false);
  const [reserved, setReserved] = useState(false);

  const handleBookingClick = async () => {
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // User is logged in, show booking form
      setShowBookingForm(true);
    } else {
      // User not logged in, show login prompt
      setShowLoginPrompt(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name || !formData.email) {
          alert("Please fill in at least your Name and Email.");
          return;
      }

      setIsReserving(true);
      // Simulate API call
      setTimeout(() => {
          saveReservation(listing, formData);
          setReserved(true);
          setIsReserving(false);
          // Close after short delay
          setTimeout(() => {
            onClose();
          }, 2000);
      }, 1000);
  };

  const handleUnderDev = (name: string) => {
      alert(`${name} feature is currently under development.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white sm:flex sm:items-center sm:justify-center overflow-y-auto animate-fade-in-up">
      <div 
         className="absolute inset-0 bg-black/50 hidden sm:block" 
         onClick={onClose}
      ></div>

      <div className="bg-white w-full sm:max-w-4xl sm:rounded-2xl sm:shadow-2xl relative sm:h-[90vh] sm:overflow-hidden flex flex-col">
          
          {/* Header Mobile */}
          <div className="absolute top-4 left-4 z-10 sm:hidden">
            <button onClick={onClose} className="p-2 bg-white rounded-full shadow-md hover:scale-105 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
               </svg>
            </button>
          </div>
           {/* Header Desktop */}
           <div className="absolute top-4 right-4 z-10 hidden sm:block">
            <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto relative">
              {/* Image Grid */}
              <div className="h-64 sm:h-[400px] w-full bg-slate-200 relative">
                  <img src={listing.imageUrls[0]} alt={listing.name} className="w-full h-full object-cover" />
              </div>

              <div className="p-6 sm:p-10 max-w-2xl mx-auto pb-32">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{listing.name}</h1>
                  <p className="text-slate-900 mt-2 font-medium underline decoration-slate-300 underline-offset-4">{listing.address}</p>
                  
                  <div className="flex gap-4 py-6 border-b border-slate-200 text-sm text-slate-600">
                      <span>{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} bedrooms`}</span>
                      <span>•</span>
                      <span>{listing.size} m²</span>
                      <span>•</span>
                      <span>Energy {listing.energyClass}</span>
                  </div>

                  <div className="py-8 border-b border-slate-200 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg cursor-pointer" onClick={() => handleUnderDev('Host Profile')}>
                          H
                      </div>
                      <div onClick={() => handleUnderDev('Host Profile')} className="cursor-pointer hover:opacity-80">
                          <p className="font-semibold text-slate-900">Hosted by Homie</p>
                          <p className="text-slate-500 text-sm">Superhost • 3 years hosting</p>
                      </div>
                  </div>

                  <div className="py-8 border-b border-slate-200">
                      <p className="leading-relaxed text-slate-700 whitespace-pre-wrap">{listing.description}</p>
                  </div>

                  <div className="py-8">
                      <h3 className="font-semibold text-xl mb-4">What this place offers</h3>
                      <div className="grid grid-cols-2 gap-y-3">
                          <div className="flex items-center gap-3 text-slate-700">
                             <span>Kitchen</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-700">
                             <span>Wifi</span>
                          </div>
                          {listing.petsAllowed && (
                            <div className="flex items-center gap-3 text-slate-700">
                                <span>Pets allowed</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-slate-700">
                                <span>Washer</span>
                            </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-4 sm:px-10 border-t border-slate-200 bg-white flex justify-between items-center shrink-0 safe-bottom">
              <div>
                  <div className="flex items-baseline gap-1">
                     <span className="font-bold text-lg">€{listing.price}</span>
                     <span className="text-slate-600"> month</span>
                  </div>
                  <div className="text-xs font-semibold underline mt-1">Available now</div>
              </div>
              <button 
                  onClick={handleBookingClick}
                  disabled={reserved}
                  className={`
                    font-semibold py-3 px-8 rounded-lg shadow-md transform transition-all 
                    ${reserved 
                        ? 'bg-green-600 text-white cursor-default' 
                        : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-lg active:scale-95'
                    }
                  `}
              >
                  {reserved ? 'Request Sent' : 'Reserve / Contact'}
              </button>
          </div>

          {/* Reservation Form Overlay */}
          {showBookingForm && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
                <div className="bg-white w-full h-[90%] sm:h-auto sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl p-6 overflow-y-auto animate-fade-in-up flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Contact Host</h2>
                        <button 
                            onClick={() => setShowBookingForm(false)}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="Jane Doe"
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    placeholder="jane@example.com"
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone (Optional)</label>
                                <input 
                                    type="tel" 
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    placeholder="+32 400 00 00 00"
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                <textarea 
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                    placeholder="Hi, I'm interested in viewing this property..."
                                    rows={4}
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                                />
                            </div>
                            
                            <div className="pt-4">
                                <button 
                                    type="submit"
                                    disabled={isReserving}
                                    className="w-full bg-rose-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-rose-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {isReserving && (
                                       <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {isReserving ? 'Sending Request...' : 'Send Request'}
                                </button>
                                <p className="text-xs text-slate-500 text-center mt-3">
                                    You won't be charged yet.
                                </p>
                            </div>
                        </form>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Request Sent!</h3>
                            <p className="text-slate-600 mt-2">Homie has notified the host. Check your email for confirmation.</p>
                        </div>
                    )}
                </div>
            </div>
          )}

          {/* Login Prompt Modal */}
          {showLoginPrompt && (
            <TenantLogin 
              onLoginSuccess={() => {
                setShowLoginPrompt(false);
                setShowBookingForm(true);
              }}
              onCancel={() => setShowLoginPrompt(false)}
            />
          )}
      </div>
    </div>
  );
};

export default ListingDetails;
