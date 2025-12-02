import React, { useState, useEffect } from 'react';
import { getReservations, addListing, uploadImage } from '../services/mockDb';
import { Reservation, Listing } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

type Tab = 'dashboard' | 'create-listing';

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-2a4d9f912904?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80"
];

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Default to create-listing as requested
  const [activeTab, setActiveTab] = useState<Tab>('create-listing');
  
  // Dashboard State
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingRes, setLoadingRes] = useState(false);
  
  // Create Listing State
  const [newListing, setNewListing] = useState<Partial<Listing>>({
      type: 'apartment',
      imageUrls: [],
      petsAllowed: false,
      coordinates: { lat: 50.8503, lng: 4.3517 } // Default Brussels
  });
  const [createStep, setCreateStep] = useState(1);
  const [uploading, setUploading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'homie@eburon.ai' && password === 'Password25') {
      setIsAuthenticated(true);
      loadData();
    } else {
      alert('Invalid credentials');
    }
  };

  const loadData = async () => {
    setLoadingRes(true);
    try {
        const data = await getReservations();
        setReservations(data);
    } finally {
        setLoadingRes(false);
    }
  };

  const handleSubmitListing = async () => {
      if (!newListing.name || !newListing.address || !newListing.price) {
          alert("Please fill in at least the Name, Address and Price.");
          return;
      }
      
      const listing: Listing = {
          id: 'custom-' + Date.now(),
          name: newListing.name,
          address: newListing.address,
          price: Number(newListing.price),
          imageUrls: newListing.imageUrls && newListing.imageUrls.length > 0 ? newListing.imageUrls : [SAMPLE_IMAGES[0]],
          energyClass: newListing.energyClass || 'C',
          type: newListing.type as any,
          size: Number(newListing.size) || 50,
          description: newListing.description || 'No description provided.',
          bedrooms: Number(newListing.bedrooms) || 1,
          petsAllowed: !!newListing.petsAllowed,
          isFavorite: false,
          coordinates: newListing.coordinates || { lat: 50.8503, lng: 4.3517 }
      };

      await addListing(listing);
      alert('Listing created successfully!');
      setNewListing({ 
          type: 'apartment', 
          imageUrls: [], 
          petsAllowed: false,
          coordinates: { lat: 50.8503, lng: 4.3517 }
      });
      setCreateStep(1);
      setActiveTab('dashboard');
  };

  const toggleImageSelection = (url: string) => {
      const currentImages = newListing.imageUrls || [];
      if (currentImages.includes(url)) {
          setNewListing({ ...newListing, imageUrls: currentImages.filter(i => i !== url) });
      } else {
          setNewListing({ ...newListing, imageUrls: [...currentImages, url] });
      }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setUploading(true);
          const files = Array.from(e.target.files);
          
          try {
              const uploadPromises = files.map(file => uploadImage(file));
              const uploadedUrls = await Promise.all(uploadPromises);
              
              setNewListing(prev => ({
                  ...prev,
                  imageUrls: [...(prev.imageUrls || []), ...uploadedUrls]
              }));
          } catch (error) {
              console.error(error);
              alert("Failed to upload images. Check your Supabase configuration.");
          } finally {
              setUploading(false);
          }
      }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
           <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  E
              </div>
           </div>
           <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Admin Portal</h2>
           <form onSubmit={handleLogin} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="admin@eburon.ai"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="••••••••"
                  />
              </div>
              <button 
                type="submit"
                className="w-full bg-rose-600 text-white py-3 rounded-lg font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
              >
                Login
              </button>
           </form>
           <button onClick={onBack} className="w-full mt-4 text-slate-500 text-sm hover:underline text-center">
               Back to Eburon Estate
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
       {/* Sidebar */}
       <div className="w-64 bg-white border-r border-slate-200 flex-shrink-0 hidden md:block">
           <div className="p-6 flex items-center gap-2">
               <div className="w-8 h-8 bg-rose-500 rounded-md flex items-center justify-center text-white font-bold">E</div>
               <span className="font-bold text-lg text-slate-800">Eburon Admin</span>
           </div>
           <nav className="mt-6 px-4 space-y-1">
               <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50'}`}
               >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                   </svg>
                   Dashboard
               </button>
               <button 
                  onClick={() => setActiveTab('create-listing')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'create-listing' ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50'}`}
               >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                   </svg>
                   Create Listing
               </button>
               <button 
                  onClick={() => setIsAuthenticated(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
               >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                   </svg>
                   Logout
               </button>
           </nav>
       </div>

       {/* Main Content */}
       <div className="flex-1 p-8 overflow-y-auto">
           {/* Top Mobile Nav */}
           <div className="md:hidden flex justify-between items-center mb-6">
                <span className="font-bold text-lg">Eburon Admin</span>
                <button onClick={() => setIsAuthenticated(false)} className="text-rose-500 text-sm font-medium">Logout</button>
           </div>

           {activeTab === 'dashboard' && (
               <div className="animate-fade-in-up">
                   <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back, Homie</h1>
                   <p className="text-slate-500 mb-8">Here is what is happening with your properties today.</p>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                           <div className="text-slate-500 text-xs font-bold uppercase tracking-wide">Total Bookings</div>
                           <div className="text-3xl font-bold text-slate-900 mt-2">{reservations.length}</div>
                       </div>
                       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                           <div className="text-slate-500 text-xs font-bold uppercase tracking-wide">Pending Review</div>
                           <div className="text-3xl font-bold text-rose-500 mt-2">{reservations.filter(r => r.status === 'pending').length}</div>
                       </div>
                       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                           <div className="text-slate-500 text-xs font-bold uppercase tracking-wide">Est. Revenue</div>
                           <div className="text-3xl font-bold text-slate-900 mt-2">€{reservations.length * 850}</div>
                       </div>
                   </div>

                   <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                       <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                           <h3 className="font-bold text-slate-800">Recent Reservations</h3>
                           <button onClick={loadData} className="text-sm text-rose-600 font-medium hover:underline">Refresh</button>
                       </div>
                       <div className="overflow-x-auto">
                           {loadingRes ? (
                               <div className="p-8 text-center text-slate-500">Loading...</div>
                           ) : (
                               <table className="w-full text-sm text-left">
                               <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
                                   <tr>
                                       <th className="px-6 py-3">Property</th>
                                       <th className="px-6 py-3">Customer</th>
                                       <th className="px-6 py-3">Date Requested</th>
                                       <th className="px-6 py-3">Status</th>
                                       <th className="px-6 py-3">Action</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100">
                                   {reservations.map((res) => (
                                       <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                                           <td className="px-6 py-4">
                                               <div className="font-medium text-slate-900">{res.listingName}</div>
                                               <div className="text-xs text-slate-500">{res.listingAddress}</div>
                                           </td>
                                           <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                        {res.customerName.charAt(0)}
                                                    </div>
                                                    {res.customerName}
                                                </div>
                                           </td>
                                           <td className="px-6 py-4 font-mono text-slate-600">{new Date(res.date).toLocaleDateString()}</td>
                                           <td className="px-6 py-4">
                                               <span className={`px-2 py-1 rounded-full text-xs font-semibold ${res.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                   {res.status}
                                               </span>
                                           </td>
                                           <td className="px-6 py-4">
                                               <button className="text-slate-400 hover:text-slate-600">
                                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                     <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                                   </svg>
                                               </button>
                                           </td>
                                       </tr>
                                   ))}
                                   {reservations.length === 0 && (
                                       <tr>
                                           <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                               No reservations yet.
                                           </td>
                                       </tr>
                                   )}
                               </tbody>
                           </table>
                           )}
                       </div>
                   </div>
               </div>
           )}

           {activeTab === 'create-listing' && (
               <div className="max-w-2xl mx-auto animate-fade-in-up">
                   <div className="mb-8">
                       <h1 className="text-2xl font-bold text-slate-900">Create a New Listing</h1>
                       <div className="flex items-center gap-2 mt-2">
                          <div className={`h-1 flex-1 rounded-full ${createStep >= 1 ? 'bg-rose-500' : 'bg-slate-200'}`}></div>
                          <div className={`h-1 flex-1 rounded-full ${createStep >= 2 ? 'bg-rose-500' : 'bg-slate-200'}`}></div>
                          <div className={`h-1 flex-1 rounded-full ${createStep >= 3 ? 'bg-rose-500' : 'bg-slate-200'}`}></div>
                       </div>
                   </div>

                   {/* Step 1: Basics */}
                   {createStep === 1 && (
                       <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                           <h2 className="text-xl font-semibold">The Basics</h2>
                           <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Property Title</label>
                               <input 
                                  type="text" 
                                  value={newListing.name || ''}
                                  onChange={e => setNewListing({...newListing, name: e.target.value})}
                                  placeholder="e.g. Sunny Loft in Brussels"
                                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                               />
                           </div>
                           <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
                               <input 
                                  type="text" 
                                  value={newListing.address || ''}
                                  onChange={e => setNewListing({...newListing, address: e.target.value})}
                                  placeholder="e.g. Rue de la Loi 16, Brussels"
                                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                               />
                           </div>
                           
                           {/* Coordinates Input (Conditional for House/Apartment) */}
                           {(newListing.type === 'house' || newListing.type === 'apartment') && (
                               <div className="grid grid-cols-2 gap-4">
                                   <div>
                                       <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                                       <input 
                                          type="number"
                                          step="any" 
                                          value={newListing.coordinates?.lat || ''}
                                          onChange={e => setNewListing({
                                              ...newListing, 
                                              coordinates: { 
                                                  lng: newListing.coordinates?.lng || 4.3517, 
                                                  lat: parseFloat(e.target.value) 
                                              }
                                          })}
                                          placeholder="50.8503"
                                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                                       <input 
                                          type="number"
                                          step="any"
                                          value={newListing.coordinates?.lng || ''}
                                          onChange={e => setNewListing({
                                              ...newListing, 
                                              coordinates: { 
                                                  lat: newListing.coordinates?.lat || 50.8503, 
                                                  lng: parseFloat(e.target.value) 
                                              }
                                          })}
                                          placeholder="4.3517"
                                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                                       />
                                   </div>
                               </div>
                           )}

                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
                                   <select 
                                      value={newListing.type || 'apartment'}
                                      onChange={e => setNewListing({...newListing, type: e.target.value as any})}
                                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                                   >
                                       <option value="apartment">Apartment</option>
                                       <option value="house">House</option>
                                       <option value="studio">Studio</option>
                                       <option value="villa">Villa</option>
                                   </select>
                               </div>
                               <div>
                                   <label className="block text-sm font-medium text-slate-700 mb-1">Bedrooms</label>
                                   <input 
                                      type="number" 
                                      value={newListing.bedrooms || 1}
                                      onChange={e => setNewListing({...newListing, bedrooms: parseInt(e.target.value)})}
                                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                                   />
                               </div>
                           </div>
                           <div className="flex justify-end pt-4">
                               <button 
                                 onClick={() => setCreateStep(2)}
                                 className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors"
                               >
                                   Next: Details
                               </button>
                           </div>
                       </div>
                   )}

                   {/* Step 2: Details */}
                   {createStep === 2 && (
                       <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                           <h2 className="text-xl font-semibold">Details & Description</h2>
                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-sm font-medium text-slate-700 mb-1">Price per Month (€)</label>
                                   <input 
                                      type="number" 
                                      value={newListing.price || ''}
                                      onChange={e => setNewListing({...newListing, price: parseInt(e.target.value)})}
                                      placeholder="1200"
                                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                                   />
                               </div>
                               <div>
                                   <label className="block text-sm font-medium text-slate-700 mb-1">Size (m²)</label>
                                   <input 
                                      type="number" 
                                      value={newListing.size || ''}
                                      onChange={e => setNewListing({...newListing, size: parseInt(e.target.value)})}
                                      placeholder="85"
                                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                                   />
                               </div>
                           </div>
                           <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                               <textarea 
                                  value={newListing.description || ''}
                                  onChange={e => setNewListing({...newListing, description: e.target.value})}
                                  placeholder="Describe the charm of your property..."
                                  rows={5}
                                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                               />
                           </div>
                           <div className="flex items-center gap-2">
                               <input 
                                  type="checkbox" 
                                  id="pets"
                                  checked={newListing.petsAllowed}
                                  onChange={e => setNewListing({...newListing, petsAllowed: e.target.checked})}
                                  className="w-4 h-4 text-slate-900 focus:ring-slate-900 border-gray-300 rounded"
                               />
                               <label htmlFor="pets" className="text-sm text-slate-700">Pets allowed</label>
                           </div>
                           <div className="flex justify-between pt-4">
                               <button 
                                 onClick={() => setCreateStep(1)}
                                 className="text-slate-600 font-medium hover:underline px-4"
                               >
                                   Back
                               </button>
                               <button 
                                 onClick={() => setCreateStep(3)}
                                 className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors"
                               >
                                   Next: Photos
                               </button>
                           </div>
                       </div>
                   )}

                   {/* Step 3: Photos & Review */}
                   {createStep === 3 && (
                       <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                           <h2 className="text-xl font-semibold">Photos</h2>
                           
                           {/* Upload Section */}
                           <div>
                               <label className="block text-sm font-medium text-slate-700 mb-2">Upload Your Own Photos</label>
                               <div className="flex items-center justify-center w-full">
                                  <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors ${uploading ? 'border-rose-400 bg-rose-50 cursor-wait' : 'border-slate-300'}`}>
                                      {uploading ? (
                                          <div className="flex flex-col items-center justify-center">
                                              <svg className="animate-spin h-8 w-8 text-rose-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                              </svg>
                                              <p className="text-sm text-slate-500">Uploading to cloud...</p>
                                          </div>
                                      ) : (
                                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                              <svg className="w-8 h-8 mb-3 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                              </svg>
                                              <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                              <p className="text-xs text-slate-500">SVG, PNG, JPG or GIF</p>
                                          </div>
                                      )}
                                      <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                  </label>
                               </div>
                           </div>

                           {/* Selected Images Preview */}
                           {newListing.imageUrls && newListing.imageUrls.length > 0 && (
                               <div>
                                   <label className="block text-sm font-medium text-slate-700 mb-2">Selected Photos ({newListing.imageUrls.length})</label>
                                   <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                       {newListing.imageUrls.map((url, idx) => (
                                           <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                               <img src={url} alt={`Listing ${idx}`} className="w-full h-full object-cover" />
                                               <button 
                                                  onClick={() => toggleImageSelection(url)}
                                                  className="absolute top-1 right-1 bg-white/90 text-rose-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                               >
                                                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                     <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                                   </svg>
                                               </button>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                           )}

                           {/* Stock Gallery */}
                           <div>
                               <p className="text-sm font-medium text-slate-700 mb-2">Or choose from Stock Gallery</p>
                               <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                   {SAMPLE_IMAGES.map((img, idx) => (
                                       <div 
                                          key={idx} 
                                          onClick={() => toggleImageSelection(img)}
                                          className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${newListing.imageUrls?.includes(img) ? 'border-rose-500 ring-2 ring-rose-200 opacity-50' : 'border-transparent hover:border-slate-300'}`}
                                       >
                                           <img src={img} alt="Stock" className="w-full h-full object-cover" />
                                            {newListing.imageUrls?.includes(img) && (
                                               <div className="absolute inset-0 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 text-rose-600">
                                                     <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                   </svg>
                                               </div>
                                            )}
                                       </div>
                                   ))}
                               </div>
                           </div>
                           
                           <div className="pt-4 border-t border-slate-100">
                               <div className="bg-slate-50 p-4 rounded-lg">
                                   <h3 className="font-bold text-sm text-slate-700 uppercase mb-2">Review Listing</h3>
                                   <div className="text-sm text-slate-600 space-y-1">
                                       <p><span className="font-medium">Title:</span> {newListing.name}</p>
                                       <p><span className="font-medium">Price:</span> €{newListing.price}/mo</p>
                                       <p><span className="font-medium">Location:</span> {newListing.address}</p>
                                       <p><span className="font-medium">Photos:</span> {newListing.imageUrls?.length || 0}</p>
                                   </div>
                               </div>
                           </div>

                           <div className="flex justify-between pt-4">
                               <button 
                                 onClick={() => setCreateStep(2)}
                                 className="text-slate-600 font-medium hover:underline px-4"
                               >
                                   Back
                               </button>
                               <button 
                                 onClick={handleSubmitListing}
                                 className="bg-rose-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                               >
                                   Publish Listing
                               </button>
                           </div>
                       </div>
                   )}
               </div>
           )}
       </div>
    </div>
  );
};

export default AdminPanel;