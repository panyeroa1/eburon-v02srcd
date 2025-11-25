import React, { useState } from 'react';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  onClick?: (listing: Listing) => void;
  onToggleFavorite?: (e: React.MouseEvent, id: string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick, onToggleFavorite }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div 
      onClick={() => onClick && onClick(listing)}
      className="group flex flex-col gap-2 cursor-pointer w-full sm:w-[300px] flex-shrink-0 snap-start"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full rounded-xl bg-gray-200 overflow-hidden">
        <div className={`absolute inset-0 bg-gray-200 animate-pulse ${isImageLoaded ? 'hidden' : 'block'}`} />
        <img 
          src={listing.imageUrls[0]} 
          alt={listing.name} 
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {/* Favorite Heart */}
        <button 
          onClick={(e) => onToggleFavorite && onToggleFavorite(e, listing.id)}
          className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 transition-transform active:scale-95 z-10"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill={listing.isFavorite ? "#ff385c" : "rgba(0,0,0,0.5)"} 
            stroke={listing.isFavorite ? "#ff385c" : "white"} 
            strokeWidth={2}
            className="w-6 h-6"
          >
            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
          </svg>
        </button>

        {/* Guest Favorite / Badge */}
        {listing.energyClass === 'A' && (
             <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-xs font-semibold shadow-sm text-slate-900">
                 Energy A
             </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex justify-between items-start mt-1">
        <div>
           <h3 className="font-semibold text-slate-900 leading-tight">{listing.address}</h3>
           <p className="text-slate-500 text-sm mt-0.5 capitalize">{listing.type} • {listing.size} m²</p>
           <p className="text-slate-500 text-sm mt-0.5">
             {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} bedrooms`}
           </p>
           <div className="flex items-center gap-1 mt-1.5">
             <span className="font-semibold text-slate-900">€{listing.price}</span>
             <span className="text-slate-900 text-sm"> month</span>
           </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-slate-800">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-900">
             <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
           </svg>
           <span>4.9</span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
