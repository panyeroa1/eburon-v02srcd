import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { Listing } from '../../types';

const CreateListing: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState<Partial<Listing>>({
    name: '',
    address: '',
    price: 0,
    type: 'apartment',
    size: 0,
    bedrooms: 1,
    description: '',
    petsAllowed: false,
    imageUrls: [],
    energyClass: 'A',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Basic validation
      if (!formData.name || !formData.address || !formData.price) {
        throw new Error("Please fill in all required fields.");
      }

      // Insert into Supabase
      const { error } = await supabase
        .from('listings')
        .insert([{
            ...formData,
            // Ensure coordinates are set if needed, or let DB handle defaults
            // For MVP we might skip geocoding or add a simple one
            coordinates: { lat: 51.05, lng: 3.73 } // Default to Ghent center for now
        }]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Listing created successfully!' });
      // Reset form
      setFormData({
        name: '',
        address: '',
        price: 0,
        type: 'apartment',
        size: 0,
        bedrooms: 1,
        description: '',
        petsAllowed: false,
        imageUrls: [],
        energyClass: 'A',
      });

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Create New Listing</h2>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Property Title</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="e.g. Modern Loft in Ghent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="e.g. Kouter 1, 9000 Gent"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">Price (€)</label>
            <input 
              id="price"
              name="price"
              type="number" 
              required
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-slate-700 mb-1">Size (m²)</label>
            <input 
              id="size"
              name="size"
              type="number" 
              required
              value={formData.size}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
            <select 
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="studio">Studio</option>
              <option value="villa">Villa</option>
              <option value="loft">Loft</option>
            </select>
          </div>
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-slate-700 mb-1">Bedrooms</label>
            <input 
              id="bedrooms"
              name="bedrooms"
              type="number" 
              required
              value={formData.bedrooms}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Describe the property..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="petsAllowed"
            name="petsAllowed"
            type="checkbox"
            checked={formData.petsAllowed}
            onChange={handleChange}
            className="w-4 h-4 text-rose-500 border-slate-300 rounded focus:ring-rose-500"
          />
          <label htmlFor="petsAllowed" className="text-sm font-medium text-slate-700">Pets Allowed</label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Listing...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateListing;
