
export interface User {
  id: string;
  email?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  type: 'text_message' | 'code_run' | 'screen_recording' | 'connect_app';
  coderunEvents: string[];
  // Additional fields from Supabase schema
  code_output?: any;
  steps?: any;
  text_is_currently_streaming?: boolean;
  from_template?: boolean;
  script?: string;
  screenrecording_url?: string;
  uid: string;
  user_inputs?: any; // New field added for user inputs
  code_run_state?: 'stopped' | 'paused' | 'running' | 'aborted' | 'finished' | 'waiting_for_user' | 'window_closed'; // Updated field for code run state
  model_cost?: number; // Added model cost field
  code_run_error?: string; // Added code run error field
  apps?: string[]; // Changed from string to string[] for connect_app message type
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  uid: string;
  is_example?: boolean;
  steps?: any;
  script?: string;
  response_id?: string;
  requires_code_rewrite?: boolean | null;
  code_approved?: boolean;
  model_cost?: number; // Added model cost field
  apps?: string[]; // Added apps property to match Supabase schema
  user_inputs?: Record<string, any>; // Added user_inputs property to match the database
}

export interface CoderunEvent {
  id: string;
  message_id: string;
  created_at: string;
  browserEvents: string[];
  // Additional fields from Supabase schema
  input?: any;
  output?: any;
  n_progress?: number;
  n_total?: number;
  requires_browser: boolean;
  uid: string;
  chat_id: string;
  function_name?: string;
  progress_title?: string;
  description?: string;
  control_value?: any; // Added field for control steps (for/if)
  control_description?: string; // Added field for control step description
  disabled?: boolean; // Added field for disabled steps
}

export interface BrowserEvent {
  id: string;
  coderun_event_id: string;
  created_at: string;
  data: any;
  // Additional fields from Supabase schema
  message_id: string;
  chat_id: string;
  uid: string;
  function_name?: string; // Added field for matching with workflow steps
}

export interface DataState {
  messages: {
    [messageId: string]: Message;
  };
  coderunEvents: {
    [eventId: string]: CoderunEvent;
  };
  browserEvents: {
    [eventId: string]: BrowserEvent;
  };
}

export interface WorkflowProps {
  steps?: any[];
  initialSteps?: any[]; // Added initialSteps to the interface
  chatId?: string;
  compact?: boolean;
  className?: string;
}

export interface WorkflowDisplayProps {
  steps: any[];
  browserEvents?: Record<string, any[]>;
  compact?: boolean;
  userInputs?: Record<string, any>;
  setUserInputs?: (inputs: Record<string, any>) => void;
  autoActivateSteps?: boolean;
}

export type CodeRewritingStatus = 'thinking' | 'rewriting_code' | 'done';

// Adding interface for the return type of useSelectedChat hook
export interface SelectedChatHookResult {
  selectedChat: Chat | null;
  codeRewritingStatus: CodeRewritingStatus;
  loading: boolean;
}

