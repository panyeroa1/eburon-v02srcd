import React, { useState, useEffect } from 'react';
import { Agent, BlandAIConfig } from '../../types-admin';
import { supabase } from '../../services/supabase';
import { blandAIService } from '../../services/blandAI';
import { Plus, Save, Trash2, Phone, Edit2, ChevronDown, ChevronUp } from 'lucide-react';

interface AgentConfigProps {
  currentUserId: string;
}

const AgentConfig: React.FC<AgentConfigProps> = ({ currentUserId }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [expandedConfig, setExpandedConfig] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    voice_id: '',
    intro: '',
    roles: '',
    prompt: '',
    phone_number: '',
    from: ''
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      voice_id: '',
      intro: '',
      roles: '',
      prompt: '',
      phone_number: '',
      from: ''
    });
    setEditingAgent(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.prompt.trim()) {
      alert('Please fill in Agent Name and Prompt (required fields)');
      return;
    }

    try {
      // Get default config and merge with form data
      const defaultConfig = blandAIService.getDefaultConfig();
      const blandConfig: BlandAIConfig = {
        ...defaultConfig,
        phone_number: formData.phone_number,
        voice: formData.voice_id,
        task: formData.prompt,
        first_sentence: formData.intro,
        from: formData.from || defaultConfig.from || '+15674234720'
      } as BlandAIConfig;

      const agentData = {
        name: formData.name,
        voice_id: formData.voice_id,
        intro: formData.intro,
        roles: formData.roles,
        prompt: formData.prompt,
        bland_config: blandConfig,
        created_by: currentUserId,
        updated_at: new Date().toISOString()
      };

      if (editingAgent) {
        // Update existing agent
        const { error } = await supabase
          .from('agents')
          .update(agentData)
          .eq('id', editingAgent.id);

        if (error) throw error;
      } else {
        // Create new agent
        const { error } = await supabase
          .from('agents')
          .insert([agentData]);

        if (error) throw error;
      }

      await loadAgents();
      resetForm();
    } catch (error) {
      console.error('Error saving agent:', error);
      alert('Failed to save agent. Please try again.');
    }
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      voice_id: agent.voice_id || '',
      intro: agent.intro || '',
      roles: agent.roles || '',
      prompt: agent.prompt,
      phone_number: agent.bland_config.phone_number || '',
      from: agent.bland_config.from || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);

      if (error) throw error;
      await loadAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent. Please try again.');
    }
  };

  const handleMakeCall = async (agent: Agent) => {
    const phoneNumber = prompt('Enter phone number to call:');
    if (!phoneNumber) return;

    try {
      const config = {
        ...agent.bland_config,
        phone_number: phoneNumber
      };

      const result = await blandAIService.makeCall(config);
      if (result.success) {
        alert(`Call initiated successfully! Call ID: ${result.call_id}`);
      } else {
        alert(`Failed to initiate call: ${result.error}`);
      }
    } catch (error) {
      console.error('Error making call:', error);
      alert('Failed to initiate call. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">AI Agent Configuration</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your Bland AI voice agents</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'New Agent'}
        </button>
      </div>

      {/* Agent Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingAgent ? 'Edit Agent' : 'Create New Agent'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Agent Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Laurent - Belgium Broker"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Voice ID
              </label>
              <input
                type="text"
                name="voice_id"
                value={formData.voice_id}
                onChange={handleInputChange}
                placeholder="e.g., 55337f4e-482c-4644-b94e-d9671e4d7079"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Roles
              </label>
              <input
                type="text"
                name="roles"
                value={formData.roles}
                onChange={handleInputChange}
                placeholder="e.g., HR Manager, Sales Rep"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Intro / First Sentence
              </label>
              <input
                type="text"
                name="intro"
                value={formData.intro}
                onChange={handleInputChange}
                placeholder="e.g., Hi, this is Laurent from Belgium..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Default Phone Number
              </label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="e.g., +639056741316"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                From Number
              </label>
              <input
                type="text"
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                placeholder="e.g., +15674234720"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                System Prompt / Task Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="prompt"
                value={formData.prompt}
                onChange={handleInputChange}
                rows={8}
                placeholder="Enter the full system prompt for the agent..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Agent
            </button>
          </div>
        </div>
      )}

      {/* Agents List */}
      <div className="grid grid-cols-1 gap-4">
        {agents.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No agents yet</h3>
            <p className="text-slate-500 text-sm mb-4">Create your first AI voice agent to get started</p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Agent
            </button>
          </div>
        ) : (
          agents.map(agent => (
            <div key={agent.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{agent.name}</h3>
                    {agent.roles && (
                      <p className="text-sm text-slate-500 mb-2">{agent.roles}</p>
                    )}
                    {agent.intro && (
                      <p className="text-sm text-slate-600 italic mb-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        "{agent.intro}"
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleMakeCall(agent)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Make Call"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(agent)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(agent.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <button
                    onClick={() => setExpandedConfig(expandedConfig === agent.id ? null : agent.id)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {expandedConfig === agent.id ? (
                      <>
                        <ChevronUp className="w-4 h-4" /> Hide Configuration
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" /> Show Configuration
                      </>
                    )}
                  </button>

                  {expandedConfig === agent.id && (
                    <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-slate-500 font-medium">Voice ID:</span>
                          <p className="text-slate-900 font-mono text-xs mt-1">{agent.voice_id || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Phone:</span>
                          <p className="text-slate-900 font-mono text-xs mt-1">{agent.bland_config.phone_number || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">From:</span>
                          <p className="text-slate-900 font-mono text-xs mt-1">{agent.bland_config.from || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <span className="text-slate-500 font-medium text-sm">System Prompt:</span>
                        <pre className="text-slate-900 text-xs mt-2 bg-white p-3 rounded border border-slate-200 overflow-x-auto max-h-60 overflow-y-auto">
                          {agent.prompt}
                        </pre>
                      </div>

                      <div>
                        <span className="text-slate-500 font-medium text-sm">Full Bland AI Config:</span>
                        <pre className="text-slate-900 text-xs mt-2 bg-white p-3 rounded border border-slate-200 overflow-x-auto max-h-40 overflow-y-auto">
                          {JSON.stringify(agent.bland_config, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgentConfig;
