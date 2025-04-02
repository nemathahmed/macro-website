import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FileSpreadsheet, 
  BrainCircuit,
  Chrome,
  Github,
  Twitter,
  Facebook,
  Linkedin,
  Slack,
  Trello,
  Figma,
  Code,           // Instead of Vscode
  ClipboardList,  // Instead of Notion
  Briefcase      // Instead of Jira
} from 'lucide-react';

export const IntroMessage = () => {
  return (
    <div className="flex justify-start mb-4 w-full">
      <Card className="max-w-[85%] p-5 shadow-md border-l-4 border-l-primary">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-full ring-3 ring-primary flex items-center justify-center bg-primary/10">
            <div className="relative w-6 h-6">
              {/* Geometric logo - overlapping shapes */}
              <div className="absolute top-0 left-0 w-4 h-4 bg-primary/80 rounded-sm transform rotate-45"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary/90 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white transform -translate-x-1/2 -translate-y-1/2 rotate-12"></div>
            </div>
          </div>
          <p className="text-xl font-semibold text-primary">I am Macro, your AI assistant</p>
        </div>
        
        <p className="text-lg mb-5">You can teach me to do your job</p>
        
        <div className="mb-5">
          <p className="text-lg font-medium mb-3">I excel at:</p>
          <ul className="list-disc pl-6 space-y-4">
            <li className="flex items-center gap-3">
              <span className="text-lg">Using websites</span>
              <div className="flex items-center gap-2">
                <Chrome size={22} />
                <Github size={22} />
                <Twitter size={22} />
                <Facebook size={22} />
                <Linkedin size={22} />
              </div>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-lg">Working with spreadsheets</span>
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={22} />
              </div>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-lg">Using professional tools</span>
              <div className="flex items-center gap-2">
                <Slack size={22} />
                <Trello size={22} />
                <Briefcase size={22} />
                <Figma size={22} />
                <Code size={22} />
                <ClipboardList size={22} />
              </div>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-lg">Thinking (I'm smarter than you think!)</span>
              <BrainCircuit size={22} />
            </li>
          </ul>
        </div>
        
        <div className="mb-4">
          <p className="text-lg font-medium mb-2">What do you want me to do? (Try to be detailed)</p>
        </div>
        
        <p className="text-lg mt-4 text-primary">
          Afterwards I'll ask some follow up questions and allow you to share your screen to demonstrate your task.
        </p>
      </Card>
    </div>
  );
};
