
import { useState, useEffect, } from "react";
import { WorkflowStep } from "./WorkflowStep";
import { BrowserEvent } from "@/types";
import { nestSteps, StepNode } from "./utils/nestingUtils";
import { cn } from "@/lib/utils";

interface WorkflowDisplayProps {
  steps: any[];
  browserEvents?: Record<string, BrowserEvent[]>;
  className?: string;
  compact?: boolean;
  userInputs?: Record<string, any>;
  setUserInputs?: (userInputs: Record<string, any>) => void;
  autoActivateSteps?: boolean; // Add this new prop
}

export const WorkflowDisplay = ({ 
  steps, 
  browserEvents = {}, 
  className, 
  compact = false, 
  userInputs,
  setUserInputs,
  autoActivateSteps = false, // Default it to false
}: WorkflowDisplayProps) => {

  useEffect(() => {
    console.log('RENDER - WorkflowDisplay component rendered');
  });
  // Create nested steps structure
  const nestedSteps = nestSteps(steps);

  // Get browser events for a specific step
  const getBrowserEventsForStep = (step: any) => {
    if (step.type !== 'function' || !step.function_name) return [];
    return browserEvents[step.function_name] || [];
  };
  
  // Get appropriate background color for a control block
  const getControlBlockStyle = (type: string) => {
    switch (type) {
      case 'for':
        return 'bg-purple-100/30 dark:bg-purple-900/30';
      case 'if':
        return 'bg-blue-100/30 dark:bg-blue-900/30';
      default:
        return 'bg-gray-50 dark:bg-gray-900/40';
    }
  };
  
  
  // Recursive component to render step nodes
  const renderStepNode = (node: StepNode, index: number) => {
    const hasChildren = node.children && node.children.length > 0;
    const isUserInputStep = node.step.type === 'user_input';
    
    if (!hasChildren) {
      // For leaf nodes (no children), render a simple step
      return (
        <div key={`node-${node.step.step_number}`} className="workflow-node mb-2">
          <WorkflowStep
            step={node.step}
            browserEvents={getBrowserEventsForStep(node.step)}
            autoOpen={node.step.active === true || autoActivateSteps}
            hasChildren={false}
            isUserInputStep={isUserInputStep}
            userInputs={isUserInputStep ? userInputs : undefined}
            setUserInputs={isUserInputStep ? setUserInputs : undefined}
          />
        </div>
      );
    }
    
    // For parent nodes with children, render a container with the step and its children
    const blockStyle = getControlBlockStyle(node.step.type);
    
    return (
      <div 
        key={`node-${node.step.step_number}`} 
        className="workflow-node mb-2"
      >
        <div className={cn(
          blockStyle, 
          "rounded-md overflow-hidden border border-gray-200 dark:border-gray-800"
        )}>
          <WorkflowStep
            step={node.step}
            browserEvents={getBrowserEventsForStep(node.step)}
            autoOpen={node.step.active === true || autoActivateSteps}
            hasChildren={true}
            isUserInputStep={isUserInputStep}
            userInputs={isUserInputStep ? userInputs : undefined}
            setUserInputs={isUserInputStep ? setUserInputs : undefined}
          />
          
          <div className="p-3">
            {node.children.map((childNode, childIdx) => renderStepNode(childNode, childIdx))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`${className || ''} w-full max-w-full overflow-hidden`}>
      {/* Display workflow steps using the nested structure */}
      {nestedSteps?.length > 0 ? (
        <div className="space-y-1">
          {nestedSteps.map((node, idx) => renderStepNode(node, idx))}
        </div>
      ) : null}
    </div>
  );
};

WorkflowDisplay.displayName = "WorkflowDisplay";
