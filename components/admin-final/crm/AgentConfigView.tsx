
import React, { useState, useEffect } from 'react';
import { Plus, Save, Bot, Mic, ChevronDown, ChevronRight } from 'lucide-react';
import { AgentPersona } from '../../../types-admin-final';
import { AVAILABLE_VOICES } from '../../../constants-admin-final';
import { db } from '../../../services/admin-final/db';

interface AgentConfigViewProps {
  agentPersona: AgentPersona;
  onUpdateAgentPersona: (persona: AgentPersona) => void;
  agents: AgentPersona[];
  onAgentsChange: (agents: AgentPersona[]) => void;
}

const AgentConfigView: React.FC<AgentConfigViewProps> = ({ agentPersona, onUpdateAgentPersona, agents, onAgentsChange }) => {
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

    return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-140px)] flex gap-6">
        {/* Sidebar List of Agents */}
        <div className="w-64 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Agents</h3>
                <button onClick={handleCreateNew} className="p-1 hover:bg-slate-100 rounded-lg text-indigo-600">
                    <Plus className="w-5 h-5"/>
                </button>
            </div>
            <div className="overflow-y-auto flex-1">
                {agents.map(agent => (
                    <div 
                      key={agent.id} 
                      onClick={() => handleSelectAgent(agent)}
                      className={`p-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${agentPersona.id === agent.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
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
                      title="Quick Load Persona"
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
                      className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2"
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
                                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-slate-900"
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
                                      ? 'bg-emerald-50 border-emerald-500 shadow-sm' 
                                      : 'bg-white border-slate-200 hover:border-emerald-300'
                                  }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${editPersona.voiceId === voice.id ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                                        <Mic className="w-4 h-4"/>
                                    </div>
                                    <div>
                                        <div className={`text-sm font-bold ${editPersona.voiceId === voice.id ? 'text-emerald-900' : 'text-slate-700'}`}>{voice.name}</div>
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
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none text-sm text-slate-700"
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
                          className="w-full h-96 p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 focus:border-emerald-500 outline-none resize-none leading-relaxed"
                          placeholder="You are an expert real estate broker..."
                        />
                    </div>

                    {/* Hidden / Advanced Data */}
                    <div>
                        <button 
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="text-xs font-bold text-slate-400 hover:text-emerald-600 flex items-center gap-1"
                        >
                            {showAdvanced ? <ChevronDown className="w-3 h-3"/> : <ChevronRight className="w-3 h-3"/>}
                            {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                        </button>
                        
                        {showAdvanced && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1" htmlFor="model-input">Model</label>
                                    <input id="model-input" type="text" value={editPersona.model || 'base'} readOnly className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm text-slate-500"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1" htmlFor="tools-input">Tools</label>
                                    <input id="tools-input" type="text" value={editPersona.tools?.join(', ') || ''} readOnly className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm text-slate-500"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1" htmlFor="temp-input">Temperature</label>
                                    <input id="temp-input" type="text" value="0.6" readOnly className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm text-slate-500"/>
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

export default AgentConfigView;
