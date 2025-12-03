
import React from 'react';
import { Plus, FileText, Download } from 'lucide-react';
import { MOCK_DOCUMENTS } from '../../../constants-admin-final';

const DocumentsView: React.FC = () => {
  return (
      <div className="animate-in fade-in duration-500 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <div>
                   <h2 className="text-2xl font-bold text-slate-800">Documents</h2>
                   <p className="text-slate-500 text-sm">Contracts, Invoices, and Reports</p>
              </div>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center hover:bg-indigo-700">
                  <Plus className="w-4 h-4" /> Upload
              </button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                          <tr>
                              <th className="px-6 py-4">Name</th>
                              <th className="px-6 py-4">Category</th>
                              <th className="px-6 py-4">Date</th>
                              <th className="px-6 py-4">Size</th>
                              <th className="px-6 py-4"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {MOCK_DOCUMENTS.map(doc => (
                              <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                          <div className={`p-2 rounded-lg ${
                                              doc.type === 'PDF' ? 'bg-red-50 text-red-600' : 
                                              doc.type === 'XLS' ? 'bg-green-50 text-green-600' :
                                              doc.type === 'IMG' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                          }`}>
                                              <FileText className="w-5 h-5"/>
                                          </div>
                                          <div className="font-medium text-slate-900">{doc.name}</div>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{doc.category}</span>
                                  </td>
                                  <td className="px-6 py-4 text-slate-500">{doc.date}</td>
                                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{doc.size}</td>
                                  <td className="px-6 py-4 text-right">
                                      <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                          <Download className="w-4 h-4"/>
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
  );
};

export default DocumentsView;
