
import React, { useState, useEffect } from 'react';
import WebCall from './WebCall';
import { Lead, Property, User, Ticket, Invoice, AgentPersona, UserRole, Document, Task } from '../../types-admin-final';
import { MOCK_NOTIFICATIONS, MOCK_DOCUMENTS, MOCK_EMAILS, MOCK_CAMPAIGNS, AVAILABLE_VOICES, DEFAULT_AGENT_PERSONA } from '../../constants-admin-final';
import { db } from '../../services/admin-final/db';
import { 
  User as UserIcon, Phone, Mail, Clock, MapPin, DollarSign, Home, CheckCircle, 
  ChevronRight, Search, Play, Pause, X, Send, PhoneIncoming, 
  PhoneMissed, Voicemail, LayoutDashboard, Calendar as CalendarIcon, FileText, 
  PieChart, Settings, Inbox as InboxIcon, Briefcase, Megaphone, Receipt,
  Menu, ChevronLeft, ChevronDown, Wrench, HardHat, Bell, LogOut, Shield,
  Plus, Filter, Download, ArrowUpRight, ArrowDownLeft, AlertCircle, File, Image as ImageIcon,
  MessageSquare, BarChart3, Target, Bot, Users, CheckSquare, CalendarDays, Mic, Save
} from 'lucide-react';

interface CRMProps {
  leads: Lead[];
  properties: Property[];
  onSelectLead: (lead: Lead | null) => void;
  selectedLeadId: string | null;
  onUpdateLead: (lead: Lead) => void;
  currentUser: User;
  onLogout: () => void;
  agentPersona: AgentPersona;
  onUpdateAgentPersona: (persona: AgentPersona) => void;
  onSwitchUser: (role: UserRole) => void;
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  agents: AgentPersona[];
  onAgentsChange: (agents: AgentPersona[]) => void;
  onTabChange?: (tab: TabType) => void;
}

type TabType = 'dashboard' | 'leads' | 'properties' | 'notifications' | 'calendar' | 'documents' | 'finance' | 'marketing' | 'analytics' | 'settings' | 'maintenance' | 'requests' | 'my-home' | 'jobs' | 'schedule' | 'invoices' | 'agent-config' | 'inbox' | 'tasks' | 'web-call';

const CRM: React.FC<CRMProps> = ({ 
    leads, properties, onSelectLead, selectedLeadId, onUpdateLead, currentUser, onLogout,
    agentPersona, onUpdateAgentPersona, onSwitchUser, tasks, onUpdateTask, agents, onAgentsChange, onTabChange
}) => {
  const [tab, setTab] = useState<TabType>('dashboard');

  const handleSetTab = (t: TabType) => {
    setTab(t);
    onTabChange?.(t);
  };
  const [noteInput, setNoteInput] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filterTicketStatus, setFilterTicketStatus] = useState<'ALL' | 'OPEN' | 'SCHEDULED' | 'COMPLETED'>('ALL');
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Reset to dashboard when user changes to prevent dead tabs
    setTab('dashboard');
  }, [currentUser.role]);

  useEffect(() => {
    const loadData = async () => {
        const t = await db.getTickets();
        setTickets(t);
        setInvoices([
            { id: '1', amount: 1200, status: 'PAID', date: '2023-09-01', description: 'Monthly Rent', propertyAddress: 'Kouter 12' },
            { id: '2', amount: 240, status: 'PENDING', date: '2023-09-15', description: 'Plumbing Repair', propertyAddress: 'Meir 24' }
        ]);
    };
    loadData();
  }, [currentUser]);

  const activeLead = leads.find(l => l.id === selectedLeadId);
  const notifications = MOCK_NOTIFICATIONS[currentUser.role] || [];
  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;

  const handleSaveNote = () => {
    if (!noteInput.trim() || !activeLead) return;
    const timestamp = new Date().toLocaleString();
    const newNoteEntry = `[${timestamp}] Call Note: ${noteInput.trim()}`;
    const updatedNotes = activeLead.notes ? `${activeLead.notes}\n\n${newNoteEntry}` : newNoteEntry;
    const updatedLead = { ...activeLead, notes: updatedNotes };
    onUpdateLead(updatedLead);
    setNoteInput('');
  };

  const getStatusIcon = (outcome: string) => {
      switch(outcome) {
          case 'connected': return <PhoneIncoming className="w-4 h-4 text-slate-500" />;
          case 'missed': return <PhoneMissed className="w-4 h-4 text-red-500" />;
          case 'voicemail': return <Voicemail className="w-4 h-4 text-amber-500" />;
          case 'follow_up': return <CalendarDays className="w-4 h-4 text-white 500" />;
          default: return <Phone className="w-4 h-4 text-slate-400" />;
      }
  };

  const NavItem = ({ id, label, icon: Icon, badge }: { id: TabType, label: string, icon: any, badge?: string }) => (
    <button 
        onClick={() => handleSetTab(id)}
        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition-all duration-200 relative group overflow-hidden ${
          tab === id ? 'bg-black 50 text-white 700' : 'text-slate-600 hover:bg-slate-50'
        } ${isSidebarCollapsed ? 'justify-center' : ''}`}
        title={isSidebarCollapsed ? label : undefined}
    >
        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform ${tab === id && isSidebarCollapsed ? 'scale-110' : ''}`} /> 
        <span className={`flex-1 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
          {label}
        </span>
        {badge && !isSidebarCollapsed && (
          <span className="bg-black 100 text-white 600 text-[10px] font-bold py-0.5 px-2 rounded-full min-w-[20px] text-center">
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
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Welcome back, {currentUser.name.split(' ')[0]}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                  { label: currentUser.role === 'BROKER' ? 'Revenue' : 'Balance', val: '€42.5k', change: '+12%', icon: DollarSign, color: 'bg-black 500' },
                  { label: 'Pending Tasks', val: pendingTasks, change: 'Keep it up', icon: CheckSquare, color: 'bg-amber-500' },
                  { label: 'Messages', val: '12', change: 'New', icon: Mail, color: 'bg-slate-500' },
                  { label: 'Rating', val: '4.9', change: '+0.1', icon: CheckCircle, color: 'bg-slate-500' }
              ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
                      <div>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                          <h3 className="text-2xl font-bold text-slate-900">{stat.val}</h3>
                          <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-slate-600' : 'text-slate-500'} flex items-center mt-1`}>
                              {stat.change} this month
                          </span>
                      </div>
                      <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-indigo-100`}>
                          <stat.icon className="w-5 h-5" />
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const AgentConfigView = () => {
      // Local state for the form to handle editing before saving
      const [editPersona, setEditPersona] = useState<AgentPersona>(agentPersona);
      const [showAdvanced, setShowAdvanced] = useState(false);
      const [isSaving, setIsSaving] = useState(false);

      useEffect(() => {
          setEditPersona(agentPersona);
      }, [agentPersona]);

      const handleSave = async () => {
          setIsSaving(true);
          const personaToSave = { ...editPersona };
          
          if (!personaToSave.id) {
              personaToSave.id = `agent-${Date.now()}`;
          }

          // Persist to DB
          await db.createAgent(personaToSave);
          
          // Update global list
          const updatedAgents = [...agents];
          const idx = updatedAgents.findIndex(a => a.id === personaToSave.id);
          if (idx >= 0) updatedAgents[idx] = personaToSave;
          else updatedAgents.push(personaToSave);
          
          onAgentsChange(updatedAgents);
          onUpdateAgentPersona(personaToSave);
          setIsSaving(false);
          alert("Agent Saved Successfully!");
      };

      const handleCreateNew = () => {
          const newAgent: AgentPersona = {
              id: '',
              name: 'New Agent',
              role: 'Sales',
              tone: 'Professional',
              languageStyle: 'English',
              objectives: [],
              systemPrompt: '',
              firstSentence: '',
              voiceId: AVAILABLE_VOICES[0].id
          };
          onUpdateAgentPersona(newAgent); // Set as current to edit
      };

      const handleSelectAgent = (agent: AgentPersona) => {
          onUpdateAgentPersona(agent);
      };

      const handleLoadPredefined = (e: React.ChangeEvent<HTMLSelectElement>) => {
          // This should load from predefined constants (mocked here or passed)
          // For now, we assume this is handled or we add the logic if PREDEFINED_AGENTS was imported
          // In the full context, PREDEFINED_AGENTS is available in constants.ts
          // We will implement if available in context, otherwise skip
      };

      return (
      <div className="animate-in fade-in duration-500 h-[calc(100vh-140px)] flex gap-6">
          {/* Sidebar List of Agents */}
          <div className="w-64 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700">Agents</h3>
                  <button onClick={handleCreateNew} className="p-1 hover:bg-slate-100 rounded-lg text-white 600">
                      <Plus className="w-5 h-5"/>
                  </button>
              </div>
              <div className="overflow-y-auto flex-1">
                  {agents.map(agent => (
                      <div 
                        key={agent.id} 
                        onClick={() => handleSelectAgent(agent)}
                        className={`p-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${agentPersona.id === agent.id ? 'bg-black 50 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
                      >
                          <div className="font-bold text-sm text-slate-800">{agent.name}</div>
                          <div className="text-xs text-slate-500 truncate">{agent.role}</div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Configuration Form */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto">
                  
                  {/* Quick Load Dropdown */}
                  <div className="mb-6 flex items-center justify-end">
                      <select 
                        aria-label="Quick Load Persona"
                        className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                        onChange={(e) => {
                             // This relies on parent passing logic or direct import. 
                             // Since we can't easily import PREDEFINED_AGENTS here without modifying imports, 
                             // we'll assume the user uses the sidebar for now or implement in future.
                        }}
                      >
                          <option value="">Quick Load Persona...</option>
                          <option value="broker">Broker (Laurent)</option>
                          <option value="sales">Sales (Sarah)</option>
                          <option value="manager">Manager (David)</option>
                          <option value="investor">Investor (Marcus)</option>
                          <option value="reception">Reception (Emma)</option>
                          <option value="recruiter">Recruiter (Jessica)</option>
                          <option value="admin">Admin</option>
                          <option value="tech">Tech</option>
                          <option value="legal">Legal</option>
                          <option value="finance">Finance</option>
                      </select>
                  </div>

                  <div className="flex items-center justify-between mb-8">
                      <div>
                          <h2 className="text-2xl font-bold text-slate-800">Agent Configuration</h2>
                          <p className="text-slate-500 text-sm">Create and manage your AI personas</p>
                      </div>
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-slate-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-slate-500/20 hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-2"
                      >
                          {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4"/> Save Agent</>}
                      </button>
                  </div>

                  <div className="space-y-6">
                      
                      {/* Name */}
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Agent Name</label>
                          <div className="relative">
                               <Bot className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                               <input 
                                    type="text" 
                                    value={editPersona.name}
                                    onChange={(e) => setEditPersona({...editPersona, name: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-slate-500 outline-none transition-all font-bold text-slate-900"
                                    placeholder="e.g. Laurent De Wilde"
                                />
                          </div>
                      </div>

                      {/* Voice Selection */}
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Voice to use</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {AVAILABLE_VOICES.map(voice => (
                                  <div 
                                    key={voice.id}
                                    onClick={() => setEditPersona({...editPersona, voiceId: voice.id})}
                                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                                        editPersona.voiceId === voice.id 
                                        ? 'bg-slate-50 border-slate-500 shadow-sm' 
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                                  >
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${editPersona.voiceId === voice.id ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-500'}`}>
                                          <Mic className="w-4 h-4"/>
                                      </div>
                                      <div>
                                          <div className={`text-sm font-bold ${editPersona.voiceId === voice.id ? 'text-slate-900' : 'text-slate-700'}`}>{voice.name}</div>
                                          <div className="text-xs text-slate-500">{voice.description}</div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Intro / First Sentence */}
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Intro (First Sentence)</label>
                          <textarea 
                            value={editPersona.firstSentence || ''}
                            onChange={(e) => setEditPersona({...editPersona, firstSentence: e.target.value})}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-slate-500 outline-none transition-all resize-none text-sm text-slate-700"
                            rows={3}
                            placeholder="Hi, this is [Name] calling from [Company]..."
                          />
                      </div>

                      {/* Roles & Description (System Prompt) */}
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Roles and Description</label>
                          <textarea 
                            value={editPersona.systemPrompt || ''}
                            onChange={(e) => setEditPersona({...editPersona, systemPrompt: e.target.value})}
                            className="w-full h-96 p-4 bg-slate-900 text-slate-400 font-mono text-xs rounded-xl border border-slate-800 focus:border-slate-500 outline-none resize-none leading-relaxed"
                            placeholder="You are an expert real estate broker..."
                          />
                      </div>

                      {/* Hidden / Advanced Data */}
                      <div>
                          <button 
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                          >
                              {showAdvanced ? <ChevronDown className="w-3 h-3"/> : <ChevronRight className="w-3 h-3"/>}
                              {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                          </button>
                          
                          {showAdvanced && (
                              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 mb-1">Model</label>
                                      <input type="text" value={editPersona.model || 'base'} readOnly aria-label="Model" className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm text-slate-500"/>
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 mb-1">Tools</label>
                                      <input type="text" value={editPersona.tools?.join(', ') || ''} readOnly aria-label="Tools" className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm text-slate-500"/>
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 mb-1">Temperature</label>
                                      <input type="text" value="0.6" readOnly aria-label="Temperature" className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm text-slate-500"/>
                                  </div>
                              </div>
                          )}
                      </div>

                  </div>
              </div>
          </div>
      </div>
      );
  };

  const InboxView = () => (
      <div className="animate-in fade-in duration-500 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <div>
                   <h2 className="text-2xl font-bold text-slate-800">Inbox</h2>
                   <p className="text-slate-500 text-sm">Unified messaging (Email, WhatsApp)</p>
              </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex">
              <div className="w-full md:w-1/3 border-r border-slate-100 flex flex-col">
                   <div className="p-4 border-b border-slate-100">
                       <input type="text" placeholder="Search messages..." className="w-full px-4 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-900 500/50"/>
                   </div>
                   <div className="overflow-y-auto flex-1">
                       {MOCK_EMAILS.map(email => (
                           <div key={email.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!email.read ? 'bg-black 50/30' : ''}`}>
                               <div className="flex justify-between items-start mb-1">
                                   <div className="flex items-center gap-2">
                                        {email.source === 'WHATSAPP' ? (
                                            <div className="w-5 h-5 bg-slate-500 rounded-full flex items-center justify-center text-white"><MessageSquare className="w-3 h-3"/></div>
                                        ) : (
                                            <div className="w-5 h-5 bg-slate-500 rounded-full flex items-center justify-center text-white"><Mail className="w-3 h-3"/></div>
                                        )}
                                        <span className={`text-sm font-bold ${!email.read ? 'text-slate-900' : 'text-slate-600'}`}>{email.from}</span>
                                   </div>
                                   <span className="text-xs text-slate-400">{email.date}</span>
                               </div>
                               <div className={`text-sm mb-1 ${!email.read ? 'font-bold text-slate-800' : 'text-slate-700'}`}>{email.subject}</div>
                               <div className="text-xs text-slate-500 truncate">{email.preview}</div>
                           </div>
                       ))}
                   </div>
              </div>
              <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <InboxIcon className="w-8 h-8 text-slate-300"/>
                  </div>
                  <p className="text-sm font-medium">Select a message to view conversation</p>
              </div>
          </div>
      </div>
  );

  const MarketingView = () => (
      <div className="animate-in fade-in duration-500">
           <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Marketing</h2>
                <button className="bg-black 600 text-white px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center">
                    <Plus className="w-4 h-4" /> New Campaign
                </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {MOCK_CAMPAIGNS.map(camp => (
                   <div key={camp.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                       <div className="flex justify-between items-start mb-4">
                           <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                               camp.status === 'Active' ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-600'
                           }`}>
                               {camp.status}
                           </span>
                           <span className="text-xs font-bold text-slate-400">{camp.platform}</span>
                       </div>
                       <h3 className="font-bold text-slate-900 mb-6">{camp.name}</h3>
                       <div className="flex justify-between items-end">
                           <div>
                               <p className="text-xs text-slate-500 uppercase font-bold mb-1">Clicks</p>
                               <p className="text-xl font-bold text-slate-800">{camp.clicks}</p>
                           </div>
                            <div>
                               <p className="text-xs text-slate-500 uppercase font-bold mb-1">Spend</p>
                               <p className="text-xl font-bold text-slate-800">{camp.spend}</p>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
      </div>
  );

  const AnalyticsView = () => (
      <div className="animate-in fade-in duration-500">
           <h2 className="text-2xl font-bold text-slate-800 mb-6">Analytics</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col justify-center items-center text-center">
                   <BarChart3 className="w-16 h-16 text-white 100 mb-4"/>
                   <h3 className="text-lg font-bold text-slate-700">Performance Metrics</h3>
                   <div className="flex gap-2 items-end h-32 mt-4">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                            <div key={i} style={{height: `${h}%`}} className="w-4 bg-slate-500 rounded-t-sm"></div>
                        ))}
                   </div>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col justify-center items-center text-center">
                   <Target className="w-16 h-16 text-white 100 mb-4"/>
                   <h3 className="text-lg font-bold text-slate-700">Conversion Goals</h3>
                    <div className="relative w-32 h-32 mt-4">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="75, 100" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-800">75%</div>
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
              <button className="bg-black 600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black 700 flex items-center gap-2">
                  <Plus className="w-4 h-4"/> New Ticket
              </button>
          </div>
          {/* ... existing implementation ... */}
           <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {(['ALL', 'OPEN', 'SCHEDULED', 'COMPLETED'] as const).map(status => (
                  <button 
                    key={status}
                    onClick={() => setFilterTicketStatus(status)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                        filterTicketStatus === status ? 'bg-black 600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
                              ticket.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
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
                              ticket.status === 'COMPLETED' ? 'text-slate-600' : 'text-white 600'
                          }`}>
                              {ticket.status === 'COMPLETED' ? <CheckCircle className="w-3.5 h-3.5"/> : <Clock className="w-3.5 h-3.5"/>}
                              {ticket.status}
                          </div>
                          <button className="text-slate-400 hover:text-white 600 text-xs font-medium">Details &rarr;</button>
                      </div>
                  </div>
              ))}
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
                                          inv.status === 'PAID' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'
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
    // ... reused logic ...
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    const emptySlots = Array.from({ length: firstDayOfMonth });
    const daySlots = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const isToday = (d: number) => { const today = new Date(); return d === today.getDate() && month === today.getMonth() && year === today.getFullYear(); };

    return (
      <div className="animate-in fade-in duration-500 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">{monthNames[month]} {year}</h2>
              <div className="flex gap-2">
                  <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 border rounded-lg hover:bg-slate-50"><ChevronLeft className="w-4 h-4"/></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-bold border rounded-lg hover:bg-slate-50">Today</button>
                  <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 border rounded-lg hover:bg-slate-50"><ChevronRight className="w-4 h-4"/></button>
              </div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden flex-1">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="bg-slate-50 p-2 text-center text-xs font-bold text-slate-500 uppercase flex items-center justify-center">{d}</div>
               ))}
               {emptySlots.map((_, i) => (<div key={`empty-${i}`} className="bg-white p-2 min-h-[80px]"></div>))}
               {daySlots.map((day) => {
                  const dateStr = new Date(year, month, day).toDateString();
                  const dayTasks = tasks.filter(t => !t.completed && new Date(t.dueDate).toDateString() === dateStr);
                  return (
                      <div key={day} className={`bg-white p-2 min-h-[80px] hover:bg-slate-50 transition-colors relative flex flex-col gap-1 ${isToday(day) ? 'bg-black 50/30' : ''}`}>
                          <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-black 600 text-white' : 'text-slate-700'}`}>{day}</span>
                          <div className="flex flex-col gap-1 overflow-y-auto max-h-[60px] no-scrollbar">
                              {dayTasks.map(t => (
                                  <div key={t.id} className="text-[10px] bg-black 100 text-white 700 px-1.5 py-0.5 rounded truncate border border-black 200" title={t.title}>{t.title}</div>
                              ))}
                          </div>
                      </div>
                  );
               })}
          </div>
      </div>
    );
  };

  const DocumentsView = () => (
      <div className="animate-in fade-in duration-500 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <div>
                   <h2 className="text-2xl font-bold text-slate-800">Documents</h2>
                   <p className="text-slate-500 text-sm">Contracts, Invoices, and Reports</p>
              </div>
              <button className="bg-black 600 text-white px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center hover:bg-black 700">
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
                                              doc.type === 'XLS' ? 'bg-slate-50 text-slate-600' :
                                              doc.type === 'IMG' ? 'bg-slate-50 text-slate-600' : 'bg-slate-50 text-slate-600'
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
                                      <button className="text-slate-400 hover:text-white 600 transition-colors">
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

  const TasksView = () => (
      <div className="animate-in fade-in duration-500 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
              <div>
                   <h2 className="text-2xl font-bold text-slate-800">Tasks</h2>
                   <p className="text-slate-500 text-sm">Follow-ups and to-dos</p>
              </div>
              <button className="bg-black 600 text-white px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center hover:bg-black 700">
                  <Plus className="w-4 h-4" /> New Task
              </button>
          </div>
          <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-20">
              {tasks.map(task => (
                  <div key={task.id} className={`p-4 rounded-xl border transition-all ${task.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:shadow-md'}`}>
                      <div className="flex items-start gap-4">
                          <button 
                            onClick={() => onUpdateTask({...task, completed: !task.completed})}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors mt-0.5 ${
                                task.completed ? 'bg-black 600 border-black 600 text-white' : 'border-slate-300 hover:border-black 500'
                            }`}
                          >
                              {task.completed && <CheckCircle className="w-4 h-4" />}
                          </button>
                          <div className="flex-1">
                              <h3 className={`font-bold ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{task.title}</h3>
                              <div className="flex flex-wrap items-center gap-3 mt-2">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500"><CalendarIcon className="w-3.5 h-3.5" />{new Date(task.dueDate).toLocaleDateString()}</div>
                                  {task.leadName && (<div className="flex items-center gap-1.5 text-xs text-white 600 bg-black 50 px-2 py-1 rounded font-medium"><UserIcon className="w-3 h-3" />{task.leadName}</div>)}
                                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${task.priority === 'HIGH' ? 'bg-red-100 text-red-600' : task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>{task.priority}</div>
                              </div>
                          </div>
                      </div>
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
             <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors hidden lg:block"><Menu className="w-5 h-5" /></button>
            <div className={`flex items-center gap-2 overflow-hidden transition-opacity duration-300 ${isSidebarCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
                <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-slate-200 shrink-0">E</div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight whitespace-nowrap">Eburon</h1>
            </div>
        </div>
        
        <div className="flex items-center gap-4 flex-1 justify-end">
             {/* Notification Bell */}
             <div className="relative">
                 <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (<span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>)}
                 </button>
                 {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center"><h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notifications</h4></div>
                        <div className="max-h-64 overflow-y-auto">
                            {notifications.length > 0 ? notifications.map(n => (
                                <div key={n.id} className="px-4 py-3 border-b border-slate-50">
                                    <p className="text-sm font-semibold">{n.title}</p>
                                    <p className="text-xs text-slate-500">{n.message}</p>
                                </div>
                            )) : <div className="p-4 text-center text-xs">No notifications</div>}
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
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Profile (Demo)</p></div>
                    {(['BROKER', 'OWNER', 'RENTER', 'CONTRACTOR'] as UserRole[]).map(r => (
                        <button key={r} onClick={() => onSwitchUser(r)} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${currentUser.role === r ? 'bg-slate-50 text-slate-700 font-bold' : 'text-slate-600'}`}>
                            <Users className="w-3 h-3"/> {r.charAt(0) + r.slice(1).toLowerCase()}
                        </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1">
                        <button onClick={onLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut className="w-4 h-4" /> Reset / Sign out</button>
                    </div>
                </div>
             </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden bg-slate-50/50 relative">
        {/* Sidebar Nav */}
        <nav 
            className={`bg-white border-r border-slate-200 flex flex-col pt-4 overflow-y-auto no-scrollbar hidden lg:flex shrink-0 transition-all duration-300 ease-in-out text-slate-600`}
            style={{ width: isSidebarCollapsed ? '80px' : '260px' }}
        >
             {currentUser.role === 'BROKER' && (
                <>
                    <div className="px-3"><NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} /></div>
                    <div className="px-3"><NavItem id="inbox" label="Inbox" icon={InboxIcon} /></div>
                    <SectionHeader label="Business" />
                    <div className="px-3 space-y-0.5">
                        <NavItem id="leads" label="Leads" icon={UserIcon} badge={leads.length.toString()} />
                        <NavItem id="properties" label="Properties" icon={Home} />
                        <NavItem id="tasks" label="Tasks" icon={CheckSquare} badge={pendingTasks > 0 ? pendingTasks.toString() : undefined} />
                        <NavItem id="calendar" label="Calendar" icon={CalendarIcon} />
                        <NavItem id="maintenance" label="Maintenance" icon={Wrench} badge={tickets.filter(t=>t.status==='OPEN').length.toString()} />
                    </div>
                    <SectionHeader label="Management" />
                    <div className="px-3 space-y-0.5">
                        <NavItem id="documents" label="Documents" icon={FileText} />
                        <NavItem id="finance" label="Finance" icon={Receipt} />
                        <NavItem id="marketing" label="Marketing" icon={Megaphone} />
                        <NavItem id="analytics" label="Analytics" icon={PieChart} />
                        <NavItem id="agent-config" label="Agent Config" icon={Bot} />
                        <NavItem id="web-call" label="Web Call (Gemini)" icon={Mic} badge="New" />
                    </div>
                </>
             )}
             
             {currentUser.role === 'OWNER' && (
                <>
                    <div className="px-3"><NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} /></div>
                    <div className="px-3 space-y-0.5 mt-2">
                        <NavItem id="properties" label="My Properties" icon={Home} />
                        <NavItem id="finance" label="Financials" icon={DollarSign} />
                        <NavItem id="documents" label="Documents" icon={FileText} />
                        <NavItem id="maintenance" label="Requests" icon={CheckCircle} />
                    </div>
                </>
             )}

             {currentUser.role === 'RENTER' && (
                 <>
                    <div className="px-3"><NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} /></div>
                    <div className="px-3 space-y-0.5 mt-2">
                        <NavItem id="my-home" label="My Home" icon={Home} />
                        <NavItem id="maintenance" label="Report Issue" icon={Wrench} />
                        <NavItem id="documents" label="Documents" icon={FileText} />
                    </div>
                 </>
             )}

             {currentUser.role === 'CONTRACTOR' && (
                 <>
                    <div className="px-3"><NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} /></div>
                    <div className="px-3 space-y-0.5 mt-2">
                        <NavItem id="jobs" label="Jobs" icon={Briefcase} badge={tickets.filter(t=>t.status==='SCHEDULED').length.toString()} />
                        <NavItem id="schedule" label="Schedule" icon={CalendarIcon} />
                        <NavItem id="documents" label="Documents" icon={FileText} />
                    </div>
                 </>
             )}
            
            {/* Sidebar Footer */}
            <div className="mt-auto p-4 border-t border-slate-200">
                 <div className={`bg-slate-50 rounded-xl p-4 text-slate-500 transition-all duration-300 ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
                     <div className="flex items-center gap-3 justify-center">
                         <Shield className="w-5 h-5 text-slate-500"/>
                         {!isSidebarCollapsed && <div className="text-xs font-medium">Eburon Secure</div>}
                     </div>
                </div>
            </div>
        </nav>

        {/* Content View Container */}
        <div className="flex-1 flex overflow-hidden bg-slate-50/50 relative">
            
            {/* List / Main View */}
            <div className={`flex-1 min-w-0 overflow-y-auto no-scrollbar p-4 md:p-8 transition-all duration-300 ${activeLead && currentUser.role === 'BROKER' && tab === 'leads' ? 'hidden lg:block' : 'block'}`}>
                <div className="max-w-7xl mx-auto h-full">
                    {tab === 'dashboard' && <DashboardView />}
                    {tab === 'inbox' && <InboxView />}
                    {tab === 'agent-config' && <AgentConfigView />}
                    {tab === 'web-call' && <WebCall />}
                    {tab === 'marketing' && <MarketingView />}
                    {tab === 'analytics' && <AnalyticsView />}
                    {tab === 'documents' && <DocumentsView />}
                    {tab === 'finance' && <FinanceView />}
                    {tab === 'tasks' && <TasksView />}
                    {(tab === 'calendar' || tab === 'schedule') && <CalendarView />}
                    {(tab === 'maintenance' || tab === 'requests' || tab === 'jobs') && <MaintenanceView />}
                    
                    {['settings', 'my-home'].includes(tab) && (
                         <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center animate-in fade-in duration-500">
                            <Settings className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-700 mb-2">Settings</h3>
                            <p className="max-w-md mx-auto">Configuration options available in full version.</p>
                        </div>
                    )}

                    {/* Leads Table for Broker (reused logic) */}
                    {tab === 'leads' && currentUser.role === 'BROKER' && (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Leads</h2>
                                    <p className="text-slate-500 text-sm mt-1">Manage and track your potential clients</p>
                                </div>
                                <button className="bg-black 600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black 700 shadow-sm transition-colors flex items-center gap-2">
                                    <UserIcon className="w-4 h-4" />
                                    Add Lead
                                </button>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4 hidden md:table-cell">Interest</th>
                                            <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {leads.map((lead) => (
                                            <tr 
                                                key={lead.id} 
                                                onClick={() => onSelectLead(lead)}
                                                className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedLeadId === lead.id ? 'bg-black 50/60' : ''}`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                                                            {lead.firstName[0]}{lead.lastName[0]}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-semibold text-slate-900 truncate">{lead.firstName} {lead.lastName}</div>
                                                            <div className="text-xs text-slate-500 truncate">{lead.phone}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-50 text-slate-700 border-slate-100">
                                                        {lead.interest}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 hidden sm:table-cell whitespace-nowrap">
                                                    <span className="text-slate-600 font-medium text-sm">{lead.status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                    
                     {/* Properties Grid (reused logic) */}
                    {(tab === 'properties' || tab === 'my-home') && (
                        <>
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Properties</h2>
                                {currentUser.role === 'BROKER' && <button className="bg-black 600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Add Property</button>}
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
                    )}
                </div>
            </div>

            {/* Detail Pane (Broker Only) */}
            {activeLead && currentUser.role === 'BROKER' && tab === 'leads' && (
                <div className="w-full lg:w-[380px] shrink-0 bg-white border-l border-slate-200 shadow-2xl overflow-y-auto z-20 lg:relative absolute inset-0 lg:inset-auto animate-in slide-in-from-right duration-300 flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Lead Details</h3>
                        <button onClick={() => onSelectLead(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
                    </div>
                    <div className="p-6">
                         <div className="flex items-center gap-4 mb-6">
                             <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-200">
                                {activeLead.firstName[0]}{activeLead.lastName[0]}
                             </div>
                             <div>
                                <h2 className="text-xl font-bold text-slate-900">{activeLead.firstName} {activeLead.lastName}</h2>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${activeLead.status === 'New' ? 'bg-slate-50 text-slate-700 border-slate-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    {activeLead.status}
                                </span>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <a href={`tel:${activeLead.phone}`} className="flex flex-col items-center justify-center p-3 bg-black 50 hover:bg-black 100 border border-black 100 rounded-xl transition-colors group cursor-pointer">
                                <div className="w-8 h-8 bg-black 200 text-white 700 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
                                    <Phone className="w-4 h-4 fill-current" />
                                </div>
                                <span className="text-xs font-bold text-white 900">Call Mobile</span>
                                <span className="text-[10px] text-white 600 font-medium truncate max-w-full">{activeLead.phone}</span>
                            </a>
                            
                            <a href={`mailto:${activeLead.email}`} className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition-colors group cursor-pointer">
                                <div className="w-8 h-8 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-900">Send Email</span>
                                <span className="text-[10px] text-slate-500 font-medium truncate max-w-full">{activeLead.email}</span>
                            </a>
                        </div>

                         <div className="mb-6">
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">History</h4>
                             {activeLead.recordings.map(rec => (
                                 <div key={rec.id} className="bg-slate-50 p-3 rounded-lg mb-2 flex justify-between items-center">
                                     <div className="flex items-center gap-2">
                                        {getStatusIcon(rec.outcome)}
                                        <span className="text-sm font-medium">{new Date(rec.timestamp).toLocaleDateString()}</span>
                                     </div>
                                     <span className="text-xs font-mono">{rec.duration}s</span>
                                 </div>
                             ))}
                             {activeLead.recordings.length === 0 && <p className="text-xs text-slate-400 italic">No calls yet.</p>}
                         </div>
                         <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</h4>
                            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-3 max-h-40 overflow-y-auto whitespace-pre-wrap">
                                {activeLead.notes || 'No notes available.'}
                            </div>
                            <textarea 
                                value={noteInput} 
                                onChange={e => setNoteInput(e.target.value)} 
                                className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-white min-h-[100px] outline-none focus:ring-2 focus:ring-slate-900 500/20"
                                placeholder="Add a new note..."
                            />
                            <button onClick={handleSaveNote} className="mt-2 w-full bg-black 600 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-black 700 transition-colors">Save Note</button>
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
