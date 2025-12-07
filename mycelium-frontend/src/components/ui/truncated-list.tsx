import * as React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface TruncatedListProps {
  items: string[] | null | undefined;
  maxVisible?: number;
  renderItem?: (item: string) => React.ReactNode;
  emptyMessage?: React.ReactNode;
  title?: string;
}

export function TruncatedList({
  items: rawItems,
  maxVisible = 1,
  renderItem = item => item,
  emptyMessage = '-',
  title = 'Items',
}: TruncatedListProps) {
  const items = rawItems || [];

  if (items.length === 0) {
    return <div className="text-muted-foreground">{emptyMessage}</div>;
  }

  if (items.length <= maxVisible) {
    return (
      <div className="truncate">
        {items.map((item, i) => (
          <React.Fragment key={i}>{renderItem(item)}</React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div>
      <HoverCard>
        <HoverCardTrigger asChild onClick={e => e.stopPropagation()}>
          <div>
            {items.slice(0, maxVisible).map((item, i) => (
              <React.Fragment key={i}>{renderItem(item)}</React.Fragment>
            ))}
            <span className="text-muted-foreground ml-1">+ {items.length - maxVisible}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent align="start">
          <div className="flex flex-col gap-2">
            <h4 className="font-medium leading-none">{title}</h4>
            <div className="text-sm text-muted-foreground">
              <ul className="space-y-1">
                {items.map((item, i) => (
                  <li key={i} className="break-all">
                    {renderItem(item)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
