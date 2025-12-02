
import React, { useState, useEffect } from 'react';
import { Lead, Property, User, Ticket, Invoice, Message } from '../../types-admin';
import { MOCK_NOTIFICATIONS } from '../../constants-admin';
import { db } from '../../services/admin/db';
import AgentConfig from './AgentConfig';
import { 
  User as UserIcon, Phone, Mail, Clock, MapPin, DollarSign, Home, CheckCircle, 
  ChevronRight, Search, Play, Pause, X, Send, PhoneIncoming, 
  PhoneMissed, Voicemail, LayoutDashboard, Calendar as CalendarIcon, FileText, 
  PieChart, Settings, Inbox as InboxIcon, Briefcase, Megaphone, Receipt,
  Menu, ChevronLeft, ChevronDown, Wrench, HardHat, Bell, LogOut, Shield,
  Plus, Filter, Download, ArrowUpRight, ArrowDownLeft, Bot
} from 'lucide-react';

interface CRMProps {
  leads: Lead[];
  properties: Property[];
  onSelectLead: (lead: Lead) => void;
  selectedLeadId: string | null;
  onUpdateLead: (lead: Lead) => void;
  currentUser: User;
  onLogout: () => void;
}

type TabType = 'dashboard' | 'leads' | 'properties' | 'inbox' | 'calendar' | 'documents' | 'finance' | 'marketing' | 'analytics' | 'settings' | 'maintenance' | 'requests' | 'my-home' | 'jobs' | 'schedule' | 'invoices' | 'agent-config';

const CRM: React.FC<CRMProps> = ({ leads, properties, onSelectLead, selectedLeadId, onUpdateLead, currentUser, onLogout }) => {
  const [tab, setTab] = useState<TabType>('dashboard');
  const [noteInput, setNoteInput] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Data State for Tabs
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filterTicketStatus, setFilterTicketStatus] = useState<'ALL' | 'OPEN' | 'SCHEDULED' | 'COMPLETED'>('ALL');

  useEffect(() => {
    // Load initial data for tabs based on current user
    const loadData = async () => {
        const t = await db.getTickets();
        setTickets(t);
        // Mock Invoices
        setInvoices([
            { id: '1', amount: 1200, status: 'PAID', date: '2023-09-01', description: 'Monthly Rent', propertyAddress: 'Kouter 12' },
            { id: '2', amount: 240, status: 'PENDING', date: '2023-09-15', description: 'Plumbing Repair', propertyAddress: 'Meir 24' }
        ]);
        // Mock Messages
        setMessages([
            { id: '1', senderId: '2', senderName: 'Sophie Dubois', content: 'Is the apartment still available?', timestamp: '10:30 AM', read: false, threadId: '1' },
            { id: '2', senderId: '3', senderName: 'Marc Peeters', content: 'I sent the signed contract.', timestamp: 'Yesterday', read: true, threadId: '2' }
        ]);
    };
    loadData();
  }, [currentUser]);

  const activeLead = leads.find(l => l.id === selectedLeadId);
  const notifications = MOCK_NOTIFICATIONS[currentUser.role] || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSaveNote = () => {
    if (!noteInput.trim() || !activeLead) return;
    const timestamp = new Date().toLocaleString();
    const newNoteEntry = `[${timestamp}] Call Note: ${noteInput.trim()}`;
    const updatedNotes = activeLead.notes ? `${activeLead.notes}\n\n${newNoteEntry}` : newNoteEntry;
    const updatedLead = { ...activeLead, notes: updatedNotes };
    onUpdateLead(updatedLead);
    setNoteInput('');
  };

  const getStatusIcon = (outcome: 'connected' | 'missed' | 'voicemail') => {
      switch(outcome) {
          case 'connected': return <PhoneIncoming className="w-4 h-4 text-emerald-500" />;
          case 'missed': return <PhoneMissed className="w-4 h-4 text-red-500" />;
          case 'voicemail': return <Voicemail className="w-4 h-4 text-amber-500" />;
          default: return <Phone className="w-4 h-4 text-slate-400" />;
      }
  };

  const NavItem = ({ id, label, icon: Icon, badge }: { id: TabType, label: string, icon: any, badge?: string }) => (
    <button 
        onClick={() => setTab(id)}
        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition-all duration-200 relative group overflow-hidden ${
          tab === id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
        } ${isSidebarCollapsed ? 'justify-center' : ''}`}
        title={isSidebarCollapsed ? label : undefined}
    >
        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform ${tab === id && isSidebarCollapsed ? 'scale-110' : ''}`} /> 
        <span className={`flex-1 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
          {label}
        </span>
        {badge && !isSidebarCollapsed && (
          <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold py-0.5 px-2 rounded-full min-w-[20px] text-center">
            {badge}
          </span>
        )}
    </button>
  );

  const SectionHeader = ({ label }: { label: string }) => (
    <div className={`px-4 mt-6 mb-2 transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 h-0 mt-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  );

  // --- TAB VIEWS ---

  const DashboardView = () => (
      <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                  { label: 'Total Revenue', val: '€42.5k', change: '+12%', icon: DollarSign, color: 'bg-indigo-500' },
                  { label: 'Active Tickets', val: tickets.filter(t => t.status !== 'COMPLETED').length, change: '-2', icon: Wrench, color: 'bg-amber-500' },
                  { label: 'Leads', val: leads.length, change: '+4', icon: UserIcon, color: 'bg-blue-500' },
                  { label: 'Occupancy', val: '94%', change: '+1%', icon: Home, color: 'bg-emerald-500' }
              ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
                      <div>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                          <h3 className="text-2xl font-bold text-slate-900">{stat.val}</h3>
                          <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-500'} flex items-center mt-1`}>
                              {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3 mr-0.5"/> : <ArrowDownLeft className="w-3 h-3 mr-0.5"/>}
                              {stat.change} this month
                          </span>
                      </div>
                      <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-indigo-100`}>
                          <stat.icon className="w-5 h-5" />
                      </div>
                  </div>
              ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                      {notifications.slice(0,4).map(n => (
                          <div key={n.id} className="flex items-center gap-4">
                              <div className={`w-2 h-2 rounded-full ${n.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                              <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900">{n.title}</p>
                                  <p className="text-xs text-slate-500">{n.message}</p>
                              </div>
                              <span className="text-xs text-slate-400">{n.time}</span>
                          </div>
                      ))}
                  </div>
              </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">Urgent Maintenance</h3>
                  <div className="space-y-3">
                      {tickets.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED').map(t => (
                          <div key={t.id} className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
                              <div>
                                  <p className="text-sm font-bold text-red-900">{t.title}</p>
                                  <p className="text-xs text-red-700">{t.propertyAddress}</p>
                              </div>
                              <button className="px-3 py-1 bg-white text-red-600 text-xs font-bold rounded-lg shadow-sm">View</button>
                          </div>
                      ))}
                      {tickets.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED').length === 0 && (
                          <div className="text-center py-8 text-slate-400 text-sm">No urgent issues</div>
                      )}
                  </div>
              </div>
          </div>
      </div>
  );

  const MaintenanceView = () => (
      <div className="animate-in fade-in duration-500 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Maintenance Tickets</h2>
                <p className="text-slate-500 text-sm">Track repairs and requests</p>
              </div>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
                  <Plus className="w-4 h-4"/> New Ticket
              </button>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {(['ALL', 'OPEN', 'SCHEDULED', 'COMPLETED'] as const).map(status => (
                  <button 
                    key={status}
                    onClick={() => setFilterTicketStatus(status)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                        filterTicketStatus === status ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                      {status}
                  </button>
              ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10">
              {tickets.filter(t => filterTicketStatus === 'ALL' || t.status === filterTicketStatus).map(ticket => (
                  <div key={ticket.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              ticket.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 
                              ticket.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                              {ticket.priority} Priority
                          </span>
                          <span className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1">{ticket.title}</h3>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">{ticket.description}</p>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-2 rounded-lg">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{ticket.propertyAddress}</span>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                          <div className={`flex items-center gap-1.5 text-xs font-bold ${
                              ticket.status === 'COMPLETED' ? 'text-emerald-600' : 'text-indigo-600'
                          }`}>
                              {ticket.status === 'COMPLETED' ? <CheckCircle className="w-3.5 h-3.5"/> : <Clock className="w-3.5 h-3.5"/>}
                              {ticket.status}
                          </div>
                          <button className="text-slate-400 hover:text-indigo-600 text-xs font-medium">Details &rarr;</button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const InboxView = () => (
      <div className="h-full flex bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in">
          <div className="w-1/3 border-r border-slate-100 bg-slate-50 flex flex-col">
              <div className="p-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">Messages</h3>
              </div>
              <div className="overflow-y-auto flex-1">
                  {messages.map(msg => (
                      <div key={msg.id} className="p-4 border-b border-slate-100 hover:bg-white cursor-pointer transition-colors">
                          <div className="flex justify-between mb-1">
                              <span className="font-semibold text-slate-900 text-sm">{msg.senderName}</span>
                              <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">{msg.content}</p>
                      </div>
                  ))}
              </div>
          </div>
          <div className="flex-1 flex flex-col bg-white">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">SD</div>
                       <span className="font-bold text-slate-800">Sophie Dubois</span>
                   </div>
                   <Settings className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                  <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm text-sm max-w-xs shadow-sm">
                          Hi Sophie, thanks for reaching out. Yes, the apartment in Ghent is still available.
                      </div>
                  </div>
                  <div className="flex justify-start">
                       <div className="bg-white text-slate-700 border border-slate-100 px-4 py-2 rounded-2xl rounded-tl-sm text-sm max-w-xs shadow-sm">
                          That's great! When can I visit? I am free this Thursday.
                      </div>
                  </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-white">
                  <div className="flex gap-2">
                      <input type="text" placeholder="Type a message..." className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                      <button className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                          <Send className="w-4 h-4" />
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );

  const FinanceView = () => (
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

  const CalendarView = () => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      // Simple static calendar grid
      return (
          <div className="animate-in fade-in duration-500 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">September 2023</h2>
                  <div className="flex gap-2">
                      <button className="p-2 border rounded-lg hover:bg-slate-50"><ChevronLeft className="w-4 h-4"/></button>
                      <button className="p-2 border rounded-lg hover:bg-slate-50"><ChevronRight className="w-4 h-4"/></button>
                  </div>
              </div>
              <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden flex-1">
                  {days.map(d => (
                      <div key={d} className="bg-slate-50 p-2 text-center text-xs font-bold text-slate-500 uppercase">{d}</div>
                  ))}
                  {Array.from({length: 35}).map((_, i) => {
                      const day = i - 3; // offset
                      const isToday = day === 21;
                      return (
                          <div key={i} className="bg-white p-2 min-h-[100px] relative hover:bg-slate-50 transition-colors">
                              {day > 0 && day <= 30 && (
                                  <>
                                    <span className={`text-sm font-medium ${isToday ? 'bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-700'}`}>
                                        {day}
                                    </span>
                                    {day === 24 && (
                                        <div className="mt-2 bg-blue-100 text-blue-700 text-[10px] p-1 rounded font-medium truncate">
                                            Viewing: Kouter 12
                                        </div>
                                    )}
                                    {day === 26 && (
                                        <div className="mt-1 bg-amber-100 text-amber-700 text-[10px] p-1 rounded font-medium truncate">
                                            Contract Signing
                                        </div>
                                    )}
                                  </>
                              )}
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  }

  const DocumentsView = () => (
       <div className="animate-in fade-in duration-500">
           <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Documents</h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center">
                    <Plus className="w-4 h-4" /> Upload
                </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {[
                   { name: 'Lease_Agreement_Kouter12.pdf', size: '2.4 MB', type: 'PDF' },
                   { name: 'Property_Deed_Meir24.pdf', size: '5.1 MB', type: 'PDF' },
                   { name: 'Inspection_Report_2023.docx', size: '1.2 MB', type: 'DOC' },
                   { name: 'Insurance_Policy_Standard.pdf', size: '3.0 MB', type: 'PDF' }
               ].map((doc, i) => (
                   <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between group hover:shadow-md transition-shadow">
                       <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold">
                               {doc.type}
                           </div>
                           <div>
                               <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{doc.name}</p>
                               <p className="text-xs text-slate-500">{doc.size}</p>
                           </div>
                       </div>
                       <button className="text-slate-400 hover:text-indigo-600 p-2">
                           <Download className="w-4 h-4" />
                       </button>
                   </div>
               ))}
           </div>
       </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* CRM Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 z-30 h-16 shadow-sm relative">
        <div className="flex items-center gap-3 md:gap-4 transition-all duration-300" style={{ width: isSidebarCollapsed ? '60px' : '240px' }}>
             <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors hidden lg:block"
             >
                <Menu className="w-5 h-5" />
             </button>
            <div className={`flex items-center gap-2 overflow-hidden transition-opacity duration-300 ${isSidebarCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 shrink-0">E</div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight whitespace-nowrap">Eburon</h1>
            </div>
        </div>
        
        <div className="flex items-center gap-4 flex-1 justify-end">
             <div className="relative hidden md:block w-full max-w-md mx-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:bg-slate-200 focus:bg-white border border-transparent focus:border-indigo-100"
                />
             </div>
             
             {/* Notification Bell */}
             <div className="relative">
                 <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
                 >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                 </button>
                 
                 {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notifications</h4>
                            <span className="text-xs text-indigo-600 font-medium cursor-pointer">Mark all read</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {notifications.length > 0 ? notifications.map(n => (
                                <div key={n.id} className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-indigo-50/30' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                                            n.type === 'alert' ? 'bg-red-500' : n.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                                        }`}></div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-4 text-center text-xs text-slate-400">No new notifications</div>
                            )}
                        </div>
                    </div>
                 )}
             </div>

             <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-full pr-3 border border-transparent hover:border-slate-200 transition-all group relative">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                    <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}`} alt="User" />
                </div>
                <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-slate-700 leading-none">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
                
                {/* User Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-2 z-50">
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button 
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50"
                    >
                        <LogOut className="w-4 h-4" /> Sign out
                    </button>
                </div>
             </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Nav */}
        <nav 
            className={`bg-white border-r border-slate-200 flex flex-col pt-4 overflow-y-auto no-scrollbar hidden lg:flex shrink-0 transition-all duration-300 ease-in-out`}
            style={{ width: isSidebarCollapsed ? '80px' : '260px' }}
        >
             {currentUser.role === 'BROKER' && (
                <>
                    <div className="px-3"><NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} /></div>
                    <SectionHeader label="Business" />
                    <div className="px-3 space-y-0.5">
                        <NavItem id="leads" label="Leads" icon={UserIcon} badge={leads.length.toString()} />
                        <NavItem id="properties" label="Properties" icon={Home} />
                        <NavItem id="inbox" label="Inbox" icon={InboxIcon} badge="2" />
                        <NavItem id="calendar" label="Calendar" icon={CalendarIcon} />
                        <NavItem id="maintenance" label="Maintenance" icon={Wrench} badge={tickets.filter(t=>t.status==='OPEN').length.toString()} />
                    </div>
                    <SectionHeader label="Management" />
                    <div className="px-3 space-y-0.5">
                        <NavItem id="documents" label="Documents" icon={FileText} />
                        <NavItem id="finance" label="Finance" icon={Receipt} />
                        <NavItem id="agent-config" label="AI Agents" icon={Bot} />
                    </div>
                </>
             )}
             
             {currentUser.role === 'OWNER' && (
                <>
                    <div className="px-3"><NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} /></div>
                    <SectionHeader label="Portfolio" />
                    <div className="px-3 space-y-0.5">
                        <NavItem id="properties" label="My Properties" icon={Home} />
                        <NavItem id="finance" label="Financials" icon={DollarSign} />
                        <NavItem id="maintenance" label="Requests" icon={CheckCircle} />
                    </div>
                    <SectionHeader label="Records" />
                    <div className="px-3 space-y-0.5"><NavItem id="documents" label="Documents" icon={FileText} /></div>
                </>
             )}

             {currentUser.role === 'RENTER' && (
                 <>
                    <div className="px-3"><NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} /></div>
                    <div className="px-3 space-y-0.5 mt-2">
                        <NavItem id="my-home" label="My Home" icon={Home} />
                        <NavItem id="maintenance" label="Report Issue" icon={Wrench} />
                        <NavItem id="finance" label="Payments" icon={DollarSign} />
                        <NavItem id="documents" label="Lease" icon={FileText} />
                    </div>
                 </>
             )}

             {currentUser.role === 'CONTRACTOR' && (
                 <>
                    <div className="px-3"><NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} /></div>
                    <div className="px-3 space-y-0.5 mt-2">
                        <NavItem id="jobs" label="Jobs" icon={Briefcase} badge={tickets.filter(t=>t.status==='SCHEDULED').length.toString()} />
                        <NavItem id="schedule" label="Schedule" icon={CalendarIcon} />
                        <NavItem id="invoices" label="Invoices" icon={Receipt} />
                    </div>
                 </>
             )}

            <div className="px-3 mt-4 mb-2">
                 <div className="h-px bg-slate-100 mx-2"></div>
            </div>
            <div className="px-3">
                <NavItem id="settings" label="Settings" icon={Settings} />
            </div>
            
            <div className="mt-auto p-4 border-t border-slate-100">
                {(currentUser.role === 'BROKER' || currentUser.role === 'OWNER') ? (
                    <div className={`bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
                        {isSidebarCollapsed ? (
                            <div className="flex flex-col items-center justify-center gap-1">
                                <DollarSign className="w-5 h-5 text-white/90"/>
                                <div className="text-[10px] font-bold">70%</div>
                            </div>
                        ) : (
                            <>
                                <p className="text-xs font-medium opacity-80 mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3"/> {currentUser.role === 'BROKER' ? 'Commission' : 'Income'}</p>
                                <p className="text-2xl font-bold tracking-tight">€ 42,500</p>
                                <div className="w-full bg-white/20 h-1.5 rounded-full mt-3 mb-2">
                                    <div className="bg-white h-full rounded-full w-[70%] shadow-sm"></div>
                                </div>
                                <p className="text-xs opacity-80 flex justify-between font-medium">
                                    <span>Goal: €60k</span>
                                    <span>70%</span>
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className={`bg-slate-100 rounded-xl p-4 text-slate-600 transition-all duration-300 ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
                         {isSidebarCollapsed ? (
                             <div className="flex justify-center"><Shield className="w-5 h-5"/></div>
                         ) : (
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600">
                                     <Shield className="w-4 h-4"/>
                                 </div>
                                 <div className="text-xs font-medium">
                                     <div>Eburon Secure</div>
                                     <div className="text-slate-400">Verified</div>
                                 </div>
                             </div>
                         )}
                    </div>
                )}
            </div>
        </nav>

        {/* Content View */}
        <div className="flex-1 flex overflow-hidden bg-slate-50/50">
            {/* List / Main View */}
            <div className={`flex-1 overflow-y-auto no-scrollbar scroll-smooth p-4 md:p-8 transition-all duration-300 ${activeLead && currentUser.role === 'BROKER' && tab === 'leads' ? 'hidden xl:block' : ''}`}>
                <div className="max-w-6xl mx-auto h-full">
                    {tab === 'dashboard' && <DashboardView />}
                    {tab === 'inbox' && <InboxView />}
                    {(tab === 'calendar' || tab === 'schedule') && <CalendarView />}
                    {tab === 'documents' && <DocumentsView />}
                    {tab === 'finance' && <FinanceView />}
                    {(tab === 'maintenance' || tab === 'requests' || tab === 'jobs') && <MaintenanceView />}
                    {tab === 'agent-config' && <AgentConfig currentUserId={currentUser.id} />}
                    
                    {/* Placeholder for less critical tabs to save code space */}
                    {['marketing', 'analytics', 'settings', 'my-home'].includes(tab) && (
                         <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <Settings className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">Module Under Construction</h3>
                            <p className="max-w-md mx-auto mb-8">This feature is coming soon to the Eburon platform.</p>
                        </div>
                    )}

                    {tab === 'leads' && currentUser.role === 'BROKER' && (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Leads</h2>
                                    <p className="text-slate-500 text-sm mt-1">Manage and track your potential clients</p>
                                </div>
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2">
                                    <UserIcon className="w-4 h-4" />
                                    Add Lead
                                </button>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4">Name</th>
                                                <th className="px-6 py-4 hidden md:table-cell">Interest</th>
                                                <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                                                <th className="px-6 py-4 hidden lg:table-cell">Last Activity</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {leads.map((lead) => (
                                                <tr 
                                                    key={lead.id} 
                                                    onClick={() => onSelectLead(lead)}
                                                    className={`hover:bg-slate-50 cursor-pointer transition-colors group ${selectedLeadId === lead.id ? 'bg-indigo-50/60' : ''}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                                {lead.firstName[0]}{lead.lastName[0]}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-slate-900">{lead.firstName} {lead.lastName}</div>
                                                                <div className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3"/> {lead.phone}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                            ${lead.interest === 'Buying' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                                            lead.interest === 'Selling' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            lead.interest === 'Renting' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                                            {lead.interest}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm hidden sm:table-cell">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${lead.status === 'New' ? 'bg-blue-500' : lead.status === 'Qualified' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                            <span className="text-slate-600 font-medium">{lead.status}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" /> 
                                                            <span className="truncate max-w-[150px]">{lead.lastActivity}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="p-1 rounded-full hover:bg-slate-200 inline-block transition-colors text-slate-400 hover:text-slate-600">
                                                            <ChevronRight className="w-4 h-4" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {(tab === 'properties' || tab === 'my-home') && (
                        <>
                             <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Properties</h2>
                                    <p className="text-slate-500 text-sm mt-1">Active listings and portfolio ({properties.length})</p>
                                </div>
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Property
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                                {properties.map((prop, index) => (
                                    <div 
                                        key={prop.id} 
                                        className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group cursor-pointer hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="h-48 bg-slate-200 relative overflow-hidden">
                                            <img src={prop.image} alt="Property" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm border border-white/20">
                                                {prop.status}
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                        <div className="p-5">
                                            <div className="text-xl font-bold text-slate-900 mb-1">{prop.price}</div>
                                            <div className="text-slate-600 text-sm mb-4 flex items-center gap-1.5 font-medium"><MapPin className="w-3.5 h-3.5 text-slate-400"/> {prop.address}</div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
                                                <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-md font-medium text-slate-600"><Home className="w-3.5 h-3.5"/> {prop.type}</span>
                                                <span className="flex-1"></span>
                                                <span className="text-indigo-600 font-medium group-hover:underline flex items-center gap-1">View Details <ArrowUpRight className="w-3 h-3" /></span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Detail Pane (Right Side) - Broker Only for Leads */}
            {activeLead && currentUser.role === 'BROKER' && tab === 'leads' && (
                <div className="w-full xl:w-1/3 bg-white border-l border-slate-200 shadow-2xl overflow-y-auto z-20 xl:relative absolute inset-0 xl:inset-auto animate-in slide-in-from-right duration-300 flex flex-col">
                    <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur z-10">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-indigo-500"/>
                            Lead Details
                        </h3>
                        <div className="flex items-center gap-2">
                             <button onClick={() => onSelectLead(activeLead)} className="p-2 hover:bg-slate-100 rounded-full xl:hidden">
                                <ChevronLeft className="w-5 h-5 text-slate-500" />
                            </button>
                            <button onClick={() => onSelectLead(activeLead)} className="p-2 hover:bg-slate-100 rounded-full hidden xl:block">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="flex items-center gap-5 mb-8">
                             <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center text-3xl font-bold text-indigo-600 shadow-inner border border-indigo-100">
                                {activeLead.firstName[0]}{activeLead.lastName[0]}
                             </div>
                             <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">{activeLead.firstName} {activeLead.lastName}</h2>
                                <div className="space-y-1">
                                    <p className="text-slate-500 flex items-center gap-2 text-sm font-medium"><Mail className="w-3.5 h-3.5 text-slate-400" /> {activeLead.email}</p>
                                    <p className="text-slate-500 flex items-center gap-2 text-sm font-medium"><Phone className="w-3.5 h-3.5 text-slate-400" /> {activeLead.phone}</p>
                                </div>
                             </div>
                        </div>

                        <div className="space-y-8">
                            {/* Quick Actions */}
                            <div className="grid grid-cols-3 gap-3">
                                <button className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-100 shadow-sm group">
                                    <Phone className="w-5 h-5 mb-1.5 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-bold">Call</span>
                                </button>
                                <button className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm group">
                                    <Mail className="w-5 h-5 mb-1.5 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-bold">Email</span>
                                </button>
                                <button className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-100 shadow-sm group">
                                    <CalendarIcon className="w-5 h-5 mb-1.5 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-bold">Meet</span>
                                </button>
                            </div>

                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
                                <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Status & Interest</h4>
                                <div className="flex flex-wrap gap-2">
                                     <span className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold shadow-sm flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                        {activeLead.status}
                                     </span>
                                     <span className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                                        {activeLead.interest}
                                     </span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Key Notes</h4>
                                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-200 rounded-l-2xl"></div>
                                    {activeLead.notes}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        Call History 
                                    </h4>
                                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">{activeLead.recordings.length}</span>
                                </div>
                                
                                {activeLead.recordings.length === 0 ? (
                                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mb-6">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                                            <PhoneMissed className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-400">No calls recorded yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 mb-6">
                                        {activeLead.recordings.map((rec) => (
                                            <div key={rec.id} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-full ${
                                                            rec.outcome === 'connected' ? 'bg-emerald-50 text-emerald-600' :
                                                            rec.outcome === 'missed' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                                        }`}>
                                                            {getStatusIcon(rec.outcome)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-700 leading-none mb-1">
                                                                {rec.outcome.charAt(0).toUpperCase() + rec.outcome.slice(1)} Call
                                                            </div>
                                                            <div className="text-xs text-slate-400 font-medium">
                                                                {new Date(rec.timestamp).toLocaleDateString()} • {new Date(rec.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-600 font-medium">
                                                        {Math.floor(rec.duration / 60)}:{(rec.duration % 60).toString().padStart(2, '0')}
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50 rounded-lg p-2 flex items-center gap-2">
                                                    <Play className="w-4 h-4 text-slate-500" />
                                                    <div className="flex-1 h-1 bg-slate-200 rounded-full">
                                                        <div className="w-1/3 h-full bg-slate-400 rounded-full"></div>
                                                    </div>
                                                    <audio controls src={rec.url} className="w-full h-8 opacity-0 absolute inset-0 cursor-pointer" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add Note Section */}
                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Add Note</h4>
                                <div className="relative group">
                                    <textarea
                                        value={noteInput}
                                        onChange={(e) => setNoteInput(e.target.value)}
                                        placeholder="Type call summary or follow-up details..."
                                        className="w-full p-4 pr-12 text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px] resize-none shadow-sm transition-all group-hover:border-slate-300"
                                    />
                                    <button 
                                        onClick={handleSaveNote}
                                        disabled={!noteInput.trim()}
                                        className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CRM;
