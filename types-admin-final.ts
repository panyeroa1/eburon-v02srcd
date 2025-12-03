
export interface Recording {
  id: string;
  timestamp: number;
  duration: number; // in seconds
  url: string;
  outcome: 'connected' | 'missed' | 'voicemail' | 'follow_up' | 'closed';
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  interest: 'Buying' | 'Renting' | 'Selling' | 'Management';
  lastActivity: string;
  notes: string;
  recordings: Recording[];
}

export interface Property {
  id: string;
  address: string;
  price: string;
  type: string;
  status: 'Active' | 'Sold' | 'Pending';
  image: string;
}

export enum CallState {
  IDLE = 'IDLE',
  RINGING = 'RINGING',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  ERROR = 'ERROR'
}

export interface AudioVolume {
  input: number;
  output: number;
}

export type UserRole = 'BROKER' | 'OWNER' | 'RENTER' | 'CONTRACTOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'info' | 'success';
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'SCHEDULED' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  propertyId: string;
  propertyAddress: string;
  assignedTo?: string; // Contractor ID
  createdBy: string; // User ID
  createdAt: string;
}

export interface Invoice {
  id: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  date: string;
  description: string;
  propertyAddress: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
  threadId: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'PDF' | 'DOC' | 'IMG' | 'XLS';
  size: string;
  date: string;
  category: 'Contracts' | 'Invoices' | 'Reports' | 'Plans';
  sharedWith: UserRole[]; // Roles that can see this doc
}

export interface AgentPersona {
  id?: string; // Optional for new creations, present for saved ones
  name: string;
  role: string;
  tone: string;
  languageStyle: string;
  objectives: string[];
  systemPrompt?: string;
  voiceId?: string;
  model?: string;
  tools?: string[];
  firstSentence?: string;
}

export interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  source: 'EMAIL' | 'WHATSAPP';
}

export interface Campaign {
  id: string;
  name: string;
  platform: 'Facebook' | 'Instagram' | 'Google';
  status: 'Active' | 'Paused';
  clicks: number;
  spend: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  leadId?: string;
  leadName?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Job {
  id: string;
  title: string;
  date: string;
  status: string;
  address: string;
}

export interface BlandConfig {
  voiceId: string;
  fromNumber: string;
  model: string;
  language: string;
  tools: string[];
}

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
}
