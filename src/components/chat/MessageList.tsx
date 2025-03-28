import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BrowserEvent, CoderunEvent, DataState, Message } from '@/types';
import { Card } from '@/components/ui/card';
import { IntroMessage } from './IntroMessage';
import ReactMarkdown from 'react-markdown';
import { WorkflowDisplay } from '../workflow/WorkflowDisplay';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MessageListProps {
  dataState: DataState;
  loading: boolean;
}

const TextMessageBubble = ({ message }: { message: Message }) => {
  // Add a ref to track content changes for highlighting
  const contentRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(false);
  const previousContentRef = useRef(message.content);
  
  // Highlight content only when it changes from previous render
  useEffect(() => {
    if (contentRef.current && message.content !== previousContentRef.current) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 1000);
      previousContentRef.current = message.content;
      return () => clearTimeout(timer);
    }
  }, [message.content]);
  
  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      } mb-4 w-full`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 transition-colors duration-300 ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground mr-0'
            : 'bg-muted ml-0'
        } ${highlight ? 'ring-2 ring-accent' : ''}`}
      >
        <div ref={contentRef} className="whitespace-pre-wrap break-words overflow-hidden">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

const CodeRunStateIndicator = ({ state }: { state?: 'running' | 'paused' | 'stopped' }) => {
  if (!state) return null;
  
  const getStateIcon = () => {
    switch (state) {
      case 'running':
        return <Play className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      case 'stopped':
        return <Square className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStateColor = () => {
    switch (state) {
      case 'running':
        return "bg-green-500 hover:bg-green-600";
      case 'paused':
        return "bg-yellow-500 hover:bg-yellow-600";
      case 'stopped':
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Badge className={`${getStateColor()} flex items-center gap-1.5 px-3 py-1.5 text-sm`}>
      {getStateIcon()}
      <span className="capitalize">{state}</span>
    </Badge>
  );
};

const CodeRunControls = ({ message }: { message: Message }) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const state = message.code_run_state;

  if (!state || state === 'stopped') return null;

  const updateCodeRunState = async (newState: 'running' | 'paused' | 'stopped') => {
    if (!user || isUpdating) return;

    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('messages')
        .update({ code_run_state: newState })
        .eq('id', message.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: `Workflow ${newState}`,
        description: newState === 'stopped' ? 'The workflow has been stopped.' : 
                    newState === 'paused' ? 'The workflow has been paused.' : 
                    'The workflow has resumed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating workflow state',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {state === 'running' ? (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => updateCodeRunState('paused')}
            disabled={isUpdating}
          >
            <Pause className="h-3.5 w-3.5 mr-1" />
            Pause
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => updateCodeRunState('stopped')}
            disabled={isUpdating}
          >
            <Square className="h-3.5 w-3.5 mr-1" />
            Stop
          </Button>
        </>
      ) : state === 'paused' ? (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => updateCodeRunState('running')}
            disabled={isUpdating}
          >
            <Play className="h-3.5 w-3.5 mr-1" />
            Resume
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => updateCodeRunState('stopped')}
            disabled={isUpdating}
          >
            <Square className="h-3.5 w-3.5 mr-1" />
            Stop
          </Button>
        </>
      ) : null}
    </div>
  );
};

const CodeRunMessageBubble = ({ message, browserEvents }: { 
  message: Message; 
  browserEvents: Record<string, BrowserEvent>;
}) => {
  // Determine if this is a recent message (created in the last 5 seconds)
  const isRecentMessage = new Date().getTime() - new Date(message.created_at).getTime() < 5000;
  
  // Start with open state for recent messages
  const [isOpen, setIsOpen] = useState(isRecentMessage);
  const [highlight, setHighlight] = useState(false);
  const previousContentRef = useRef(message.content);
  
  // Highlight content only when it changes from previous render
  useEffect(() => {
    if (message.content !== previousContentRef.current) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 1000);
      previousContentRef.current = message.content;
      return () => clearTimeout(timer);
    }
  }, [message.content]);
  
  // Get browser events associated with this message
  const messageBrowserEvents = Object.values(browserEvents).filter(
    event => event.message_id === message.id
  );
  
  // Handle jump to window button click
  const handleJumpToWindow = () => {
    window.postMessage(
      {
        type: 'jump',
        payload: { messageId: message.id }
      },
      '*'
    );
  };
  
  // Process workflow steps to include browser events
  const processStepsWithBrowserEvents = (steps: any[]) => {
    if (!steps || !Array.isArray(steps)) return [];
    
    return steps.map(step => {
      // Only process function steps to add browser events
      if (step.type === 'function' && step.function_name) {
        const functionEvents = messageBrowserEvents.filter(
          event => event.function_name === step.function_name
        );
        
        if (functionEvents.length > 0) {
          return {
            ...step,
            browserEvents: functionEvents,
            active: true
          };
        }
      }
      return step;
    });
  };
  
  return (
    <div className="flex justify-center mb-4 w-full">
      <Card className={`w-full max-w-[95%] p-4 transition-colors duration-300 ${highlight ? 'ring-2 ring-accent' : ''}`}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                </Button>
              </CollapsibleTrigger>
              <h3 className="text-sm font-medium">Code Run</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Only show Jump to Window button if code_run_state is not stopped */}
              {message.code_run_state && message.code_run_state !== 'stopped' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleJumpToWindow}
                  title="Jump to Window"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Jump to Window
                </Button>
              )}
              <CodeRunStateIndicator state={message.code_run_state} />
              {message.code_run_state && message.code_run_state !== 'stopped' && (
                <CodeRunControls message={message} />
              )}
            </div>
          </div>
          
          {/* Don't show message content for code_run messages */}
          
          <CollapsibleContent>
            {/* Display workflow steps with browser events */}
            {message.steps && message.steps.length > 0 && (
              <div className="w-full overflow-hidden">
                <WorkflowDisplay 
                  steps={processStepsWithBrowserEvents(message.steps)}
                  compact={true}
                  autoActivateSteps={true}
                />
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

const ScreenRecordingBubble = ({ message }: { message: Message }) => {
  // Add a ref to track content changes for highlighting
  const contentRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(false);
  
  // Highlight content when it changes
  useEffect(() => {
    if (contentRef.current) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [message.content]);
  
  return (
    <div className="flex justify-start mb-4 w-full">
      <Card className={`max-w-[80%] p-4 transition-colors duration-300 ${highlight ? 'ring-2 ring-accent' : ''}`}>
        <div ref={contentRef} className="whitespace-pre-wrap mb-2 overflow-hidden">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {message.screenrecording_url && (
          <div className="mt-2 border-t pt-2">
            <p className="text-sm font-medium mb-1">Screen Recording:</p>
            <p className="text-xs text-muted-foreground truncate">{message.screenrecording_url}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export const MessageList = ({ dataState, loading }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, browserEvents } = dataState;
  const prevMessageCountRef = useRef(Object.keys(messages).length);
  const prevMessagesRef = useRef<string[]>([]);
  
  // Auto-scroll to bottom when new messages are added, but not when existing messages are updated
  useEffect(() => {
    const currentMessageCount = Object.keys(messages).length;
    const currentMessageIds = Object.keys(messages);
    
    // Check if there are new messages added (not just updates)
    const hasNewMessages = currentMessageIds.some(id => !prevMessagesRef.current.includes(id));
    
    // Only auto-scroll if new messages were added, not when existing ones are updated
    if ((currentMessageCount > prevMessageCountRef.current || hasNewMessages) && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    prevMessageCountRef.current = currentMessageCount;
    prevMessagesRef.current = currentMessageIds;
  }, [messages]);

  // Sort messages by created_at once instead of re-sorting on every render
  const messageList = Object.values(messages).sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const renderMessage = (message: Message) => {
    switch (message.type) {
      case 'text_message':
        return <TextMessageBubble key={message.id} message={message} />;
      case 'code_run':
        return (
          <CodeRunMessageBubble 
            key={message.id}
            message={message}
            browserEvents={browserEvents}
          />
        );
      case 'screen_recording':
        return <ScreenRecordingBubble key={message.id} message={message} />;
      default:
        return <TextMessageBubble key={message.id} message={message} />;
    }
  };

  return (
    <ScrollArea className="h-full px-2 py-6">
      {loading ? (
        <div className="flex items-center justify-center h-20">
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          <div className="w-full max-w-full">
            <IntroMessage />
            {messageList.length === 0 ? (
              <div className="flex justify-center mt-6">
                <p className="text-muted-foreground text-sm">Send a message to start the conversation</p>
              </div>
            ) : (
              <div className="flex flex-col items-stretch w-full">
                {messageList.map(renderMessage)}
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>
      )}
    </ScrollArea>
  );
};
