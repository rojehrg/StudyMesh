/**
 * NodeDetailModal - Slide-out panel showing user profile details
 */

'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Slack, MapPin, Briefcase } from 'lucide-react';
import type { GraphNode } from './hooks/useGraphData';

interface Props {
  node: GraphNode | null;
  onClose: () => void;
}

export function NodeDetailModal({ node, onClose }: Props) {
  const [isAskingForHelp, setIsAskingForHelp] = useState(false);

  const handleAskForHelp = async () => {
    if (!node) return;

    setIsAskingForHelp(true);

    // In a full implementation, this would open the NudgeDialog
    // or trigger a Slack DM flow
    // For now, we'll show a toast or redirect to the find-help page

    try {
      // Placeholder: In real implementation, integrate with existing NudgeDialog
      // or Slack messaging flow
      window.location.href = `/find-help?recipient=${node.id}`;
    } catch (error) {
      console.error('Error initiating help request:', error);
    } finally {
      setIsAskingForHelp(false);
    }
  };

  return (
    <Sheet open={!!node} onOpenChange={() => onClose()}>
      <SheetContent side="right" className="w-[400px] sm:w-[480px]">
        {node && (
          <div className="space-y-6">
            {/* Header with Avatar */}
            <SheetHeader className="flex flex-row items-start gap-4 space-y-0">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarFallback
                  className="text-xl font-medium"
                  style={{ backgroundColor: node.color + '30', color: node.color }}
                >
                  {node.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-xl text-coffee-espresso">
                    {node.name}
                  </SheetTitle>
                  {node.currentlyAvailable && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Available
                    </span>
                  )}
                </div>
                {node.major && (
                  <div className="flex items-center gap-1.5 text-coffee-cortado mt-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="text-sm">{node.major}</span>
                  </div>
                )}
                {node.department && (
                  <div className="flex items-center gap-1.5 text-coffee-cortado mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-sm">{node.department}</span>
                  </div>
                )}
              </div>
            </SheetHeader>

            {/* Expertise Description */}
            {node.expertiseText && (
              <div>
                <h3 className="text-sm font-medium text-coffee-mocha mb-2">
                  About their expertise
                </h3>
                <p className="text-sm text-coffee-cortado leading-relaxed">
                  {node.expertiseText}
                </p>
              </div>
            )}

            {/* Knowledge Areas */}
            {node.knowledgeAreas.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-coffee-mocha mb-2">
                  Knowledge Areas
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {node.knowledgeAreas.map(area => (
                    <Badge
                      key={area}
                      variant="secondary"
                      className="bg-coffee-cream text-coffee-mocha"
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Expertise Depth Indicator */}
            <div>
              <h3 className="text-sm font-medium text-coffee-mocha mb-2">
                Expertise Depth
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-coffee-cream rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${node.expertiseDepth * 10}%`,
                      backgroundColor: node.color,
                    }}
                  />
                </div>
                <span className="text-sm text-coffee-cortado w-8 text-right">
                  {node.expertiseDepth}/10
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-coffee-foam">
              {node.slackConnected ? (
                <Button
                  onClick={handleAskForHelp}
                  disabled={isAskingForHelp}
                  className="w-full bg-coffee-espresso hover:bg-coffee-roast"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {isAskingForHelp ? 'Opening...' : 'Ask for Help'}
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  <Slack className="w-4 h-4 mr-2" />
                  Not connected to Slack
                </Button>
              )}
              <p className="text-xs text-coffee-latte text-center mt-2">
                {node.slackConnected
                  ? 'Opens a conversation to ask for help'
                  : 'This person needs to connect Slack first'}
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
