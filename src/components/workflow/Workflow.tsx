
import { useState, useEffect, useRef } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { WorkflowDisplay } from './WorkflowDisplay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMessages } from '@/hooks/useMessages';
import { CodeRewritingStatus, Chat } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { nestSteps } from './utils/nestingUtils';
import { useSelectedChat } from '@/hooks/useChats';


interface WorkflowProps {
  steps?: any[];
  initialSteps?: any[]; // Added initialSteps to the interface
  chatId?: string;
  compact?: boolean;
  className?: string;
}

const StatusBadge = ({ status }: { status: CodeRewritingStatus }) => {
  const isReady = status === 'done';
  const prevStatusRef = useRef<CodeRewritingStatus>(status);

  
  // Only log when status changes, not on every render
  useEffect(() => {
    if (prevStatusRef.current !== status) {
      console.log('StatusBadge status changed to:', status);
      prevStatusRef.current = status;
    }
  }, [status]);

  return (
    <div className="flex items-center gap-1">
      {!isReady && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      <Badge 
        variant={isReady ? "default" : "outline"}
        className={cn(
          "text-sm font-medium px-2.5 py-1",
          isReady ? "bg-green-600 hover:bg-green-700" : "border-yellow-500 text-yellow-600"
        )}
      >
        {isReady ? "Ready" : status === 'thinking' ? "Thinking..." : "Rebuilding Workflow"}
      </Badge>
    </div>
  );
};

export const Workflow = ({ 
  initialSteps = [], // Add initialSteps prop with default value
  steps= [],
  chatId,
  compact = false,
  className = '',
}: WorkflowProps) => {

  useEffect(() => {
    console.log('RENDER - Workflow component rendered');
  });
  // Use either initialSteps or steps prop, prioritizing steps if both are provided
  const [workflowSteps, setWorkflowSteps] = useState<any[]>(steps.length > 0 ? steps : initialSteps);
  const [browserEvents, setBrowserEvents] = useState<Record<string, any[]>>({});
  
 
  const [userInputs, setUserInputs] = useState<Record<string, any>>({});
  const { sendMessage } = useMessages(chatId || null);
  
  // Log when chatId changes to help debug
  useEffect(() => {
    console.log('Workflow component received chatId:', chatId);
  }, [chatId]);
  
  // Use our optimized hook to get selected chat and status
  const { selectedChat, codeRewritingStatus } = useSelectedChat(chatId || null);
  
  // When selectedChat changes, log its properties
  useEffect(() => {
    if (selectedChat) {
      console.log('Workflow: Selected chat updated:', {
        id: selectedChat.id,
        requires_code_rewrite: selectedChat.requires_code_rewrite,
        code_approved: selectedChat.code_approved,
        codeRewritingStatus: codeRewritingStatus
      });
    } else {
      console.log('Workflow: Selected chat is null');
    }
  }, [selectedChat, codeRewritingStatus]);

  // Add additional logging when codeRewritingStatus changes
  useEffect(() => {
    console.log('Workflow: codeRewritingStatus changed to:', codeRewritingStatus);
  }, [codeRewritingStatus]);
  
  // Initialize with steps coming from props or selected chat
  useEffect(() => {
    let stepsToUse: any[] = [];
    
    // First priority: use explicitly passed steps
    if (steps && steps.length > 0) {
      stepsToUse = steps;
    }
    // Second priority: use initialSteps
    else if (initialSteps && initialSteps.length > 0) {
      stepsToUse = initialSteps;
    }
    // Third priority: use steps from the selected chat if available
    else if (selectedChat?.steps && Array.isArray(selectedChat.steps)) {
      stepsToUse = selectedChat.steps;
    }
      
    setWorkflowSteps(stepsToUse);
    
    // Initialize user input values from steps if applicable
    if (stepsToUse.length > 0) {
      const userInputStep = stepsToUse.find(step => step.type === 'user_input');
      if (userInputStep?.output && Object.keys(userInputStep.output).length > 0) {
        // Only set initial values if we don't have any
        if (Object.keys(userInputs).length === 0) {
          setUserInputs(JSON.parse(JSON.stringify(userInputStep.output)));
        }
      }
    }
  }, [selectedChat, steps, initialSteps]);
  
  const handleRunWorkflow = async () => {
    console.log('handleRunWorkflow - userInputs', userInputs);
    if (!chatId) return;
    
    try {
      // Get user inputs from store
      // Send an empty message instead of "Run workflow"
      const data = await sendMessage("", "user", "code_run", userInputs);
      
      console.log("Message sent:", data);
      const messageId = data.id;
      window.postMessage({
        type: 'CREATE_AGENT_RUN_WINDOW',
        payload: {
          chatId: chatId,
          roomId: messageId
        }
      }, '*');
    } catch (error) {
      console.error("Error running workflow:", error);
    }
  };
  
  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-background z-10 flex-shrink-0">
        <h2 className="text-lg font-semibold">Workflow</h2>
        <div className="flex items-center gap-2">
          <StatusBadge status={codeRewritingStatus} />
          <Button 
            size="sm" 
            className="gap-1 ml-1" 
            onClick={handleRunWorkflow} 
            disabled={codeRewritingStatus !== 'done' || !workflowSteps || workflowSteps.length === 0}
          >
            <Play className="h-4 w-4" />
            Run
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {(!workflowSteps || workflowSteps.length === 0) ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No workflow steps defined
              </div>
            ) : (
              <WorkflowDisplay 
                steps={workflowSteps} 
                browserEvents={browserEvents}
                compact={compact}
                userInputs={userInputs}
                setUserInputs={setUserInputs}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
