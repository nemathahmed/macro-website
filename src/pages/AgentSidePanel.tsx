
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelectedChat } from "@/hooks/useChats";
import { WorkflowSidePanel } from "@/components/workflow/WorkflowSidePanel";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CodeRewritingStatus } from "@/types";
import { useWindowMessages } from "@/hooks/useWindowMessages";

// Status badge component for workflow state
const StatusBadge = ({ status }: { status: CodeRewritingStatus }) => {
  const isReady = status === 'done';
  
  return (
    <div className="flex items-center gap-1">
      {!isReady && <Loader2 className="h-3 w-3 animate-spin" />}
      <Badge 
        variant={isReady ? "default" : "outline"}
        className={cn(
          "text-xs px-2 py-0.5",
          isReady ? "bg-green-600 hover:bg-green-700" : "border-yellow-500 text-yellow-600"
        )}
      >
        {isReady ? "Ready" : status === 'thinking' ? "Thinking..." : "Rebuilding"}
      </Badge>
    </div>
  );
};

const AgentSidePanel = () => {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chatId');
  const { selectedChat, codeRewritingStatus } = useSelectedChat(chatId || null);
  const { sendMessage } = useMessages(chatId || null);
  const [userInputs, setUserInputs] = useState<Record<string, any>>({});
  
  // Initialize user inputs from selected chat steps
  useEffect(() => {
    if (selectedChat?.steps && Array.isArray(selectedChat.steps)) {
      const userInputStep = selectedChat.steps.find(step => step.type === 'user_input');
      if (userInputStep?.output && Object.keys(userInputStep.output).length > 0) {
        if (Object.keys(userInputs).length === 0) {
          setUserInputs(JSON.parse(JSON.stringify(userInputStep.output)));
        }
      }
    }
  }, [selectedChat]);
  
  // Listen for window messages
  useWindowMessages();
  
  // Handle workflow run
  const handleRunWorkflow = async () => {
    if (!chatId) return;
    
    try {
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
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="px-3 py-2 border-b flex items-center justify-between sticky top-0 bg-background z-10">
        <h1 className="text-sm font-medium">Workflow Steps</h1>
        <div className="flex items-center gap-2">
          <StatusBadge status={codeRewritingStatus} />
          <Button 
            size="sm" 
            variant="secondary"
            className="h-7 text-xs px-2 flex items-center gap-1" 
            onClick={handleRunWorkflow}
            disabled={codeRewritingStatus !== 'done' || !selectedChat?.steps || selectedChat.steps.length === 0}
          >
            <Play className="h-3 w-3" />
            Run
          </Button>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        {selectedChat && selectedChat.steps && (
          <WorkflowSidePanel 
            steps={selectedChat.steps}
            chatId={chatId || undefined}
            userInputs={userInputs}
            setUserInputs={setUserInputs}
          />
        )}
        {(!selectedChat?.steps || selectedChat.steps.length === 0) && (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No workflow steps available
          </div>
        )}
      </main>
    </div>
  );
};

export default AgentSidePanel;
