
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getStepIcon } from "./utils/iconUtils";
import { formatFunctionName } from "./utils/stringUtils";
import { KeyValueDisplay } from "./KeyValueDisplay";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface WorkflowStepCardProps {
  step: any;
  status: 'previous' | 'current' | 'next';
  userInputs?: Record<string, any>;
  setUserInputs?: (userInputs: Record<string, any>) => void;
}

// Component for a single workflow step in the side panel
const WorkflowStepCard = ({ 
  step, 
  status,
  userInputs,
  setUserInputs
}: WorkflowStepCardProps) => {
  const stepType = step.type;
  const isActive = step.active || false;
  const isDisabled = step.disabled || false;
  const isUserInputStep = stepType === 'user_input';

  // Styling based on status
  const cardStyle = cn(
    "p-3 mb-3 transition-all duration-300",
    status === 'previous' && "opacity-50 scale-95",
    status === 'current' && "border-primary shadow-sm bg-primary/5",
    status === 'next' && "opacity-50 scale-95",
    isDisabled && "opacity-40 bg-muted/20"
  );

  const getStepTitle = () => {
    switch (stepType) {
      case 'function':
        return formatFunctionName(step.function_name);
      case 'for':
      case 'if':
        return step.control_description || (stepType === 'for' ? 'Repeat Steps' : 'Check Condition');
      case 'done':
        return 'Workflow Complete';
      default:
        return 'Step';
    }
  };

  return (
    <Card className={cardStyle}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full font-medium text-xs border",
          isActive && !isDisabled 
            ? "bg-primary text-primary-foreground border-primary" 
            : isDisabled 
              ? "bg-muted text-muted-foreground border-muted" 
              : "bg-primary/10 text-primary border-primary/20"
        )}>
          {step.step_number}
        </div>
        
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            {getStepIcon(stepType)}
            <h3 className={cn(
              "font-medium text-sm",
              isActive && !isDisabled && "text-primary"
            )}>
              {getStepTitle()}
            </h3>
          </div>
          
          {step.function_description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {step.function_description}
            </p>
          )}
          
          {isUserInputStep && userInputs && setUserInputs && (
            <div className="mt-2 pt-2 border-t">
              <h4 className="text-xs font-medium mb-1">Inputs:</h4>
              <KeyValueDisplay 
                data={userInputs}
                setUserInputs={setUserInputs}
                compact={true}
                isEditable={true}
              />
            </div>
          )}
          
          {stepType === 'function' && step.output && Object.keys(step.output).length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <h4 className="text-xs font-medium mb-1">Output:</h4>
              <div className="max-h-24 overflow-y-auto text-xs">
                <KeyValueDisplay 
                  data={step.output}
                  compact={true}
                  isEditable={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

interface WorkflowSidePanelProps {
  steps: any[];
  chatId?: string;
  userInputs?: Record<string, any>;
  setUserInputs?: (userInputs: Record<string, any>) => void;
}

export const WorkflowSidePanel = ({ 
  steps,
  chatId,
  userInputs,
  setUserInputs,
}: WorkflowSidePanelProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Find the active step index
  useEffect(() => {
    if (steps && steps.length > 0) {
      const activeIndex = steps.findIndex(step => step.active === true);
      if (activeIndex !== -1) {
        setCurrentIndex(activeIndex);
      }
    }
  }, [steps]);
  
  // Navigation handlers
  const handlePrevStep = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };
  
  const handleNextStep = () => {
    setCurrentIndex(prev => Math.min(steps.length - 1, prev + 1));
  };
  
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className="h-full flex flex-col p-3">
      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {/* Previous step (if exists) */}
          {currentIndex > 0 && (
            <div className="relative pl-4">
              <div className="absolute left-0 top-1/2 h-full -translate-y-1/2 w-0.5 bg-muted-foreground/30" />
              <ChevronLeft className="absolute left-0 top-3 h-4 w-4 text-muted-foreground -translate-x-1/2 bg-background rounded-full p-0.5" />
              <WorkflowStepCard 
                step={steps[currentIndex - 1]} 
                status="previous" 
              />
            </div>
          )}
          
          {/* Current step */}
          <WorkflowStepCard 
            step={steps[currentIndex]} 
            status="current"
            userInputs={userInputs}
            setUserInputs={setUserInputs}
          />
          
          {/* Next step (if exists) */}
          {currentIndex < steps.length - 1 && (
            <div className="relative pl-4">
              <div className="absolute left-0 top-1/2 h-full -translate-y-1/2 w-0.5 bg-muted-foreground/30" />
              <ChevronRight className="absolute left-0 top-3 h-4 w-4 text-muted-foreground -translate-x-1/2 bg-background rounded-full p-0.5" />
              <WorkflowStepCard 
                step={steps[currentIndex + 1]} 
                status="next"
              />
            </div>
          )}
        </div>
      </ScrollArea>
      
      {steps.length > 1 && (
        <div className="flex justify-between items-center pt-3 border-t mt-3">
          <button 
            onClick={handlePrevStep}
            disabled={currentIndex <= 0}
            className={cn(
              "flex items-center gap-1 text-xs",
              currentIndex <= 0 ? "text-muted-foreground/50" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ChevronLeft className="h-3 w-3" />
            Previous
          </button>
          <div className="text-xs text-muted-foreground">
            {currentIndex + 1} of {steps.length}
          </div>
          <button
            onClick={handleNextStep}
            disabled={currentIndex >= steps.length - 1}
            className={cn(
              "flex items-center gap-1 text-xs",
              currentIndex >= steps.length - 1 ? "text-muted-foreground/50" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Next
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};
