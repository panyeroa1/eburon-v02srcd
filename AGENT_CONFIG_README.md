# AI Agent Configuration Setup

This guide explains how to set up and use the new AI Agent Configuration feature in the admin portal.

## Overview

The AI Agent Configuration tab allows you to create, manage, and deploy Bland AI voice agents directly from the admin portal. You can configure agents with custom prompts, voices, and behaviors, then save them to Supabase for use in the dialer.

## Setup Instructions

### 1. Database Setup

First, you need to create the `agents` table in your Supabase database. Run the following SQL in your Supabase SQL editor:

```sql
-- Create Agents Table (for Bland AI voice agent configurations)
create table public.agents (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  voice_id text,
  intro text,
  roles text,
  prompt text not null,
  bland_config jsonb not null, -- Full Bland AI configuration
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.agents enable row level security;

-- Policy: Authenticated users can read all agents
create policy "Authenticated users can read agents"
  on public.agents for select
  using ( auth.role() = 'authenticated' );

-- Policy: Authenticated users can insert agents
create policy "Authenticated users can insert agents"
  on public.agents for insert
  with check ( auth.role() = 'authenticated' );

-- Policy: Users can update their own agents
create policy "Users can update own agents"
  on public.agents for update
  using ( auth.uid() = created_by );

-- Policy: Users can delete their own agents
create policy "Users can delete own agents"
  on public.agents for delete
  using ( auth.uid() = created_by );
```

### 2. Environment Variables

The Bland AI credentials are currently hardcoded in `/services/blandAI.ts`. For production, you should move these to environment variables:

1. Add to your `.env` file (copy from `.env.example`):
   ```
   VITE_BLAND_AI_AUTH_TOKEN=org_5009c11063cb54d7d1daa2cbef4944f6a57f464015cdaa3767d5047fd5cab63a1012a08785c667becd0369
   VITE_BLAND_AI_ENCRYPTED_KEY=0ec48f6b-9d48-4e8b-b050-c59d7d673a85
   ```

2. Update `/services/blandAI.ts` to use environment variables:
   ```typescript
   const BLAND_AUTH_TOKEN = import.meta.env.VITE_BLAND_AI_AUTH_TOKEN;
   const BLAND_ENCRYPTED_KEY = import.meta.env.VITE_BLAND_AI_ENCRYPTED_KEY;
   ```

## Using the AI Agent Configuration

### Accessing the Feature

1. Log in to the admin portal as a BROKER user
2. Navigate to **Management** → **AI Agents** in the sidebar
3. You'll see the AI Agent Configuration page

### Creating a New Agent

1. Click the **"New Agent"** button
2. Fill in the form:
   - **Agent Name** (required): A descriptive name for your agent
   - **Voice ID**: The Bland AI voice ID to use
   - **Roles**: The role(s) the agent will play (e.g., "HR Manager, Recruiter")
   - **Intro / First Sentence**: What the agent says when the call connects
   - **Default Phone Number**: The default number to call
   - **From Number**: The caller ID number
   - **System Prompt** (required): The full task description and instructions for the agent

3. Click **"Save Agent"** to save the configuration

### Managing Agents

Each agent card displays:
- Agent name and roles
- Intro/first sentence
- Action buttons:
  - **Phone icon**: Make a test call with this agent
  - **Edit icon**: Edit the agent configuration
  - **Delete icon**: Remove the agent

Click **"Show Configuration"** to expand and view:
- Full system prompt
- Complete Bland AI configuration (JSON)
- Voice ID, phone numbers, and other settings

### Making Calls

1. Click the phone icon on any agent card
2. Enter the phone number you want to call
3. The system will initiate a call using Bland AI with the agent's configuration

## Features

### Form Fields

- **Agent Name**: User-friendly identifier for the agent
- **Voice to use**: Bland AI voice ID (e.g., `55337f4e-482c-4644-b94e-d9671e4d7079`)
- **Intro**: First sentence spoken when call connects
- **Roles**: Agent's roles (for description/organization)
- **System Prompt**: Full task instructions (maps to Bland AI `task` field)

### Hidden/Auto-filled Configuration

The following Bland AI configuration is automatically set with sensible defaults:
- `wait_for_greeting`: false
- `record`: true
- `answered_by_enabled`: true
- `noise_cancellation`: true
- `interruption_threshold`: 500
- `block_interruptions`: false
- `max_duration`: 37.7
- `model`: "base"
- `language`: "babel"
- `background_track`: "office"
- `endpoint`: "https://api.bland.ai"
- `voicemail_action`: "hangup"
- `isCallActive`: false
- `temperature`: 0.6
- `tools`: []

Users can focus on the essential fields (name, voice, intro, system prompt) while the technical configuration is handled automatically.

## Integration with Dialer

Agents saved in this configuration can be used from the dialer:
- Select an agent from the list
- Click the phone icon to make a call
- The dialer will use the agent's configuration for the call

## Example Agent Configuration

Here's an example of a configured agent:

```
Agent Name: Laurent - Belgium Broker
Voice ID: 55337f4e-482c-4644-b94e-d9671e4d7079
Roles: Real Estate Broker
Intro: Hi, this is Laurent De Wilde, a broker here in Belgium — you left your number on my site earlier, so I just wanted to personally see how I can help you with your property or search.
System Prompt: [Your full HR manager prompt from the original request]
```

## Technical Details

### Database Schema

The `agents` table stores:
- `id`: Unique identifier (UUID)
- `name`: Agent display name
- `voice_id`: Bland AI voice identifier
- `intro`: First sentence
- `roles`: Agent roles
- `prompt`: System prompt/task description
- `bland_config`: Full Bland AI configuration (JSONB)
- `created_by`: User who created the agent
- `created_at`, `updated_at`: Timestamps

### API Integration

The BlandAIService (`/services/blandAI.ts`) handles:
- Making calls via Bland AI API
- Providing default configuration templates
- Error handling and response parsing

### Components

- **AgentConfig** (`/components/admin-replacement/AgentConfig.tsx`): Main configuration UI
- **CRM** (`/components/admin-replacement/CRM.tsx`): Navigation and routing
- **Types** (`/types-admin.ts`): TypeScript interfaces for Agent and BlandAIConfig

## Security Considerations

⚠️ **Important**: 
- Never commit actual API keys to version control
- Store credentials in environment variables
- Use `.gitignore` to exclude `.env` files
- Consider using backend proxy for API calls in production
- Implement proper authentication and authorization

## Troubleshooting

### Agent not saving
- Check Supabase connection in browser console
- Verify the `agents` table was created
- Ensure row-level security policies are applied

### Call not initiating
- Verify Bland AI credentials are correct
- Check browser console for API errors
- Ensure phone number is in correct format (e.g., +1234567890)

### Can't see AI Agents tab
- Log in as a BROKER user (other roles don't have access)
- Refresh the page after logging in
