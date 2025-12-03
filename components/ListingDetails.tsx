import React, { useState } from 'react';
import { Listing } from '../types';
import { saveReservation } from '../services/mockDb';
import TenantAuth from './tenant/Auth';
import { supabase } from '../services/supabase';
import { 
  X, 
  Share, 
  Heart, 
  Star, 
  Wifi, 
  Car, 
  Utensils, 
  Tv, 
  Wind, 
  MapPin, 
  Calendar, 
  User, 
  CheckCircle,
  ShieldCheck,
  Award
} from 'lucide-react';

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
  const [guests, setGuests] = useState(1);

  // Mock data for missing fields
  const rating = 4.92;
  const reviewCount = 332;
  const hostName = "Madame G.";
  const hostYears = 9;
  const isSuperhost = true;

  // Ensure we have 5 images for the grid (fill with existing or placeholders if needed)
  const displayImages = [...listing.imageUrls];
  while (displayImages.length < 5) {
      displayImages.push(listing.imageUrls[0] || 'https://via.placeholder.com/800x600?text=No+Image');
  }

  const handleBookingClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setShowBookingForm(true);
    } else {
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
      setTimeout(() => {
          saveReservation(listing, formData);
          setReserved(true);
          setIsReserving(false);
          setTimeout(() => {
            onClose();
          }, 2000);
      }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-in-up">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-10 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold font-mono">H</div>
             <span className="font-bold text-xl text-rose-500 hidden sm:block">Eburon Estate</span>
          </div>
          
          <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-full text-sm font-semibold transition-colors">
                  <Share className="w-4 h-4" />
                  Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-full text-sm font-semibold transition-colors" title="Save to favorites" aria-label="Save to favorites">
                  <Heart className="w-4 h-4" />
                  Save
              </button>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors ml-2" title="Close" aria-label="Close">
                  <X className="w-5 h-5" />
              </button>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-10 py-6">
          {/* Title Section */}
          <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{listing.name}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base text-slate-700">
                  <div className="flex items-center gap-1 font-semibold">
                      <Star className="w-4 h-4 fill-black" />
                      <span>{rating}</span>
                  </div>
                  <span className="hidden sm:inline">·</span>
                  <span className="underline font-semibold cursor-pointer">{reviewCount} reviews</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="underline font-semibold cursor-pointer">{listing.address}</span>
              </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[300px] sm:h-[500px] relative mb-10">
              {/* Main Image */}
              <div className="sm:col-span-2 h-full relative group cursor-pointer">
                  <img src={displayImages[0]} alt="Main" className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
              </div>
              
              {/* Side Images */}
              <div className="hidden sm:grid grid-cols-1 gap-2 h-full">
                  <div className="h-full relative group cursor-pointer">
                      <img src={displayImages[1]} alt="View 2" className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
                  </div>
                  <div className="h-full relative group cursor-pointer">
                      <img src={displayImages[2]} alt="View 3" className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
                  </div>
              </div>
              <div className="hidden sm:grid grid-cols-1 gap-2 h-full">
                  <div className="h-full relative group cursor-pointer">
                      <img src={displayImages[3]} alt="View 4" className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
                  </div>
                  <div className="h-full relative group cursor-pointer">
                      <img src={displayImages[4]} alt="View 5" className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
                  </div>
              </div>

              <button className="absolute bottom-4 right-4 bg-white border border-slate-900 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                  <div className="grid grid-cols-3 gap-0.5 w-4 h-4">
                      {[...Array(9)].map((_, i) => <div key={i} className="bg-black rounded-[1px]"></div>)}
                  </div>
                  Show all photos
              </button>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              
              {/* Left Column: Details */}
              <div className="md:col-span-2 space-y-8">
                  
                  {/* Host & Stats */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-8">
                      <div>
                          <h2 className="text-xl sm:text-2xl font-semibold mb-1">Entire {listing.type} hosted by {hostName}</h2>
                          <p className="text-slate-600">
                              {listing.bedrooms * 2} guests · {listing.bedrooms} bedrooms · {listing.bedrooms} beds · {Math.max(1, Math.floor(listing.bedrooms / 2))} baths
                          </p>
                      </div>
                      <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden border border-slate-300 relative">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${hostName}`} 
                            alt={hostName} 
                            className="w-full h-full object-cover"
                          />
                          {isSuperhost && (
                              <div className="absolute bottom-0 right-0 bg-rose-500 text-white p-1 rounded-full border-2 border-white">
                                  <ShieldCheck className="w-3 h-3" />
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Highlights */}
                  <div className="border-b border-slate-200 pb-8 space-y-6">
                      <div className="flex gap-4">
                          <Utensils className="w-6 h-6 text-slate-700 shrink-0" />
                          <div>
                              <h3 className="font-semibold text-slate-900">Dive right in</h3>
                              <p className="text-slate-500 text-sm">This is one of the few places in the area with a pool.</p>
                          </div>
                      </div>
                      <div className="flex gap-4">
                          <Award className="w-6 h-6 text-slate-700 shrink-0" />
                          <div>
                              <h3 className="font-semibold text-slate-900">{hostName} is a Superhost</h3>
                              <p className="text-slate-500 text-sm">Superhosts are experienced, highly rated hosts.</p>
                          </div>
                      </div>
                      <div className="flex gap-4">
                          <MapPin className="w-6 h-6 text-slate-700 shrink-0" />
                          <div>
                              <h3 className="font-semibold text-slate-900">Great location</h3>
                              <p className="text-slate-500 text-sm">95% of recent guests gave the location a 5-star rating.</p>
                          </div>
                      </div>
                  </div>

                  {/* Description */}
                  <div className="border-b border-slate-200 pb-8">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {listing.description}
                          <br /><br />
                          This is the part of Makati you want to stay! Salcedo Village offers a concealed, intimate flair with quaint cafes & Saturday Market. In the heart of Makati CBD & a walking distance to Greenbelt malls & a hop from Ayala & Salcedo Parks.
                      </p>
                      <button className="mt-4 font-semibold underline flex items-center gap-1">
                          Show more <span className="text-lg">›</span>
                      </button>
                  </div>

                  {/* Amenities */}
                  <div className="border-b border-slate-200 pb-8">
                      <h3 className="text-xl font-semibold mb-6">What this place offers</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 text-slate-700">
                              <Wifi className="w-5 h-5" /> <span>Fast Wifi - 286 Mbps</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-700">
                              <Utensils className="w-5 h-5" /> <span>Kitchen</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-700">
                              <Car className="w-5 h-5" /> <span>Free parking on premises</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-700">
                              <Tv className="w-5 h-5" /> <span>HDTV with Netflix</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-700">
                              <Wind className="w-5 h-5" /> <span>Air conditioning</span>
                          </div>
                          {listing.petsAllowed && (
                              <div className="flex items-center gap-3 text-slate-700">
                                  <CheckCircle className="w-5 h-5" /> <span>Pets allowed</span>
                              </div>
                          )}
                      </div>
                      <button className="mt-6 border border-slate-900 rounded-lg px-6 py-3 font-semibold hover:bg-slate-50 transition-colors">
                          Show all 32 amenities
                      </button>
                  </div>
              </div>

              {/* Right Column: Sticky Booking Card */}
              <div className="relative hidden md:block">
                  <div className="sticky top-28 border border-slate-200 rounded-xl shadow-xl p-6 bg-white">
                      <div className="flex justify-between items-baseline mb-4">
                          <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold">€{listing.price}</span>
                              <span className="text-slate-600"> night</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-semibold underline">
                              <Star className="w-3 h-3 fill-black" />
                              <span>{rating}</span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-500">{reviewCount} reviews</span>
                          </div>
                      </div>

                      {/* Date/Guest Picker Mock */}
                      <div className="border border-slate-300 rounded-lg mb-4 overflow-hidden">
                          <div className="grid grid-cols-2 border-b border-slate-300">
                              <div className="p-3 border-r border-slate-300 cursor-pointer hover:bg-slate-50">
                                  <div className="text-[10px] font-bold uppercase text-slate-800">Check-in</div>
                                  <div className="text-sm text-slate-600">Add date</div>
                              </div>
                              <div className="p-3 cursor-pointer hover:bg-slate-50">
                                  <div className="text-[10px] font-bold uppercase text-slate-800">Checkout</div>
                                  <div className="text-sm text-slate-600">Add date</div>
                              </div>
                          </div>
                          <div className="p-3 cursor-pointer hover:bg-slate-50">
                              <div className="text-[10px] font-bold uppercase text-slate-800">Guests</div>
                              <div className="text-sm text-slate-600">1 guest</div>
                          </div>
                      </div>

                      <button 
                          onClick={handleBookingClick}
                          disabled={reserved}
                          className={`
                            w-full py-3.5 rounded-lg font-bold text-white text-lg mb-4 transition-transform active:scale-95
                            ${reserved 
                                ? 'bg-green-600 cursor-default' 
                                : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:shadow-lg'
                            }
                          `}
                      >
                          {reserved ? 'Request Sent' : 'Reserve'}
                      </button>

                      <p className="text-center text-sm text-slate-500 mb-6">You won't be charged yet</p>

                      <div className="space-y-3 text-slate-600">
                          <div className="flex justify-between">
                              <span className="underline">€{listing.price} x 5 nights</span>
                              <span>€{listing.price * 5}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="underline">Cleaning fee</span>
                              <span>€45</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="underline">Service fee</span>
                              <span>€80</span>
                          </div>
                      </div>
                      
                      <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between font-bold text-lg text-slate-900">
                          <span>Total before taxes</span>
                          <span>€{(listing.price * 5) + 45 + 80}</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Mobile Sticky Footer (only visible on mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 flex justify-between items-center z-50">
          <div>
             <div className="font-bold text-lg">€{listing.price} <span className="font-normal text-sm text-slate-600">night</span></div>
             <div className="text-xs font-semibold underline">Nov 28 - 30</div>
          </div>
          <button 
              onClick={handleBookingClick}
              disabled={reserved}
              className="bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-2.5 px-6 rounded-lg"
          >
              Reserve
          </button>
      </div>

      {/* Reservation Form Modal (Overlay) */}
      {showBookingForm && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Confirm Booking</h2>
                    <button onClick={() => setShowBookingForm(false)} className="p-2 hover:bg-slate-100 rounded-full" title="Close" aria-label="Close">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {!reserved ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-200">
                            <h3 className="font-semibold mb-1">{listing.name}</h3>
                            <p className="text-sm text-slate-600">{listing.address}</p>
                            <div className="mt-2 text-sm font-medium">Total: €{(listing.price * 5) + 45 + 80}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input 
                                type="text" 
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="Enter your full name"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input 
                                type="email" 
                                required
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                placeholder="your@email.com"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Message to Host</label>
                            <textarea 
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                                rows={3}
                                placeholder="Hi, I'm interested in this property..."
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                            />
                        </div>
                        
                        <button 
                            type="submit"
                            disabled={isReserving}
                            className="w-full bg-rose-600 text-white font-bold py-3.5 rounded-lg hover:bg-rose-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2 mt-2"
                        >
                            {isReserving ? 'Processing...' : 'Confirm and Pay'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Booking Confirmed!</h3>
                        <p className="text-slate-600 mt-2">You're all set. Check your email for details.</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Login Prompt */}
      {showLoginPrompt && (
        <TenantAuth 
          onLoginSuccess={() => {
            setShowLoginPrompt(false);
            setShowBookingForm(true);
          }}
          onCancel={() => setShowLoginPrompt(false)}
        />
      )}
    </div>
  );
};

export default ListingDetails;
