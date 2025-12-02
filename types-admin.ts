
export interface Recording {
  id: string;
  timestamp: number;
  duration: number; // in seconds
  url: string;
  outcome: 'connected' | 'missed' | 'voicemail';
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
