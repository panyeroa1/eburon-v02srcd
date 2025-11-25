import React, { useState } from 'react';
import { Listing } from '../types';
import { saveReservation } from '../services/mockDb';

interface ListingDetailsProps {
  listing: Listing;
  onClose: () => void;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({ listing, onClose }) => {
  const [isReserving, setIsReserving] = useState(false);
  const [reserved, setReserved] = useState(false);

  const handleReserve = () => {
      setIsReserving(true);
      // Simulate API call
      setTimeout(() => {
          saveReservation(listing);
          setReserved(true);
          setIsReserving(false);
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

          <div className="flex-1 overflow-y-auto">
              {/* Image Grid */}
              <div className="h-64 sm:h-[400px] w-full bg-slate-200 relative">
                  <img src={listing.imageUrls[0]} alt={listing.name} className="w-full h-full object-cover" />
              </div>

              <div className="p-6 sm:p-10 max-w-2xl mx-auto">
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
                  onClick={handleReserve}
                  disabled={isReserving || reserved}
                  className={`
                    font-semibold py-3 px-8 rounded-lg shadow-md transform transition-all 
                    ${reserved 
                        ? 'bg-green-600 text-white cursor-default' 
                        : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-lg active:scale-95'
                    }
                  `}
              >
                  {isReserving ? 'Processing...' : reserved ? 'Request Sent!' : 'Reserve / Contact'}
              </button>
          </div>
      </div>
    </div>
  );
};

export default ListingDetails;