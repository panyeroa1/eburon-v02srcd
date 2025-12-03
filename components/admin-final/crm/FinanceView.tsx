
import React from 'react';
import { Invoice } from '../../../types-admin-final';

interface FinanceViewProps {
  invoices: Invoice[];
}

const FinanceView: React.FC<FinanceViewProps> = ({ invoices }) => {
  return (
      <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Financial Overview</h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
              <h3 className="font-bold text-slate-800 mb-4">Invoices & Payments</h3>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                          <tr>
                              <th className="px-4 py-3">Invoice ID</th>
                              <th className="px-4 py-3">Property</th>
                              <th className="px-4 py-3">Description</th>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Amount</th>
                              <th className="px-4 py-3">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {invoices.map(inv => (
                              <tr key={inv.id} className="hover:bg-slate-50">
                                  <td className="px-4 py-3 font-mono text-slate-500">#{inv.id}</td>
                                  <td className="px-4 py-3 text-slate-800 font-medium">{inv.propertyAddress}</td>
                                  <td className="px-4 py-3 text-slate-600">{inv.description}</td>
                                  <td className="px-4 py-3 text-slate-500">{inv.date}</td>
                                  <td className="px-4 py-3 font-bold text-slate-900">€{inv.amount}</td>
                                  <td className="px-4 py-3">
                                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                      }`}>
                                          {inv.status}
                                      </span>
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

export default FinanceView;
