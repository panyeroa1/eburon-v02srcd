
import React from 'react';
import { Property, User } from '../../../types-admin-final';

interface PropertiesViewProps {
  properties: Property[];
  currentUser: User;
}

const PropertiesView: React.FC<PropertiesViewProps> = ({ properties, currentUser }) => {
  return (
    <>
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Properties</h2>
            {currentUser.role === 'BROKER' && <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Add Property</button>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(prop => (
                <div key={prop.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="h-48 bg-slate-200 relative">
                        <img src={prop.image} alt="Property" className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-xs font-bold">{prop.status}</div>
                    </div>
                    <div className="p-5">
                        <div className="text-xl font-bold text-slate-900 mb-1">{prop.price}</div>
                        <div className="text-slate-600 text-sm mb-4">{prop.address}</div>
                    </div>
                </div>
            ))}
        </div>
    </>
  );
};

export default PropertiesView;
