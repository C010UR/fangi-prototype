import { Card, CardContent } from '@/components/ui/card';

function ColorSwatch({ name, variable, text }: { name: string; variable: string; text?: string }) {
  const colorKey = variable.replace('bg-', '');

  return (
    <div
      className={`h-24 w-full rounded-md border shadow-sm p-2 flex flex-col justify-between ${variable} ${text || 'text-foreground'}`}
    >
      <span className="text-sm font-medium leading-none self-start">{name}</span>
      <div className="flex flex-col items-end gap-1 self-end">
        <span className="text-xs font-mono opacity-90">{colorKey}</span>
      </div>
    </div>
  );
}

function FontSwatch({ name, fontFamily }: { name: string; fontFamily: string }) {
  return (
    <div className="h-32 w-full rounded-md border shadow-sm p-4 flex flex-col justify-between bg-card">
      <div className="space-y-2">
        <span className="text-sm font-medium text-card-foreground">{name}</span>
        <div className="text-2xl font-normal leading-tight" style={{ fontFamily }}>
          The quick brown fox jumps over the lazy dog
        </div>
        <div className="text-sm opacity-75" style={{ fontFamily }}>
          0123456789 !@#$%^&*()
        </div>
      </div>
      <span className="text-xs font-mono opacity-60 self-end">{fontFamily}</span>
    </div>
  );
}

export default function ColorsPage() {
  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-1">Primary Theme Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch name="Background" variable="bg-background" />
              <ColorSwatch name="Foreground" variable="bg-foreground" text="text-background" />
              <ColorSwatch name="Primary" variable="bg-primary" text="text-primary-foreground" />
              <ColorSwatch
                name="Primary Foreground"
                variable="bg-primary-foreground"
                text="text-primary"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-1">Secondary, Tertiary & Accent Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch
                name="Secondary"
                variable="bg-secondary"
                text="text-secondary-foreground"
              />
              <ColorSwatch
                name="Secondary Foreground"
                variable="bg-secondary-foreground"
                text="text-secondary"
              />
              <ColorSwatch name="Tertiary" variable="bg-tertiary" text="text-tertiary-foreground" />
              <ColorSwatch
                name="Tertiary Foreground"
                variable="bg-tertiary-foreground"
                text="text-tertiary"
              />
              <ColorSwatch
                name="Quaternary"
                variable="bg-quaternary"
                text="text-quaternary-foreground"
              />
              <ColorSwatch
                name="Quaternary Foreground"
                variable="bg-quaternary-foreground"
                text="text-quaternary"
              />
              <ColorSwatch name="Accent" variable="bg-accent" text="text-accent-foreground" />
              <ColorSwatch
                name="Accent Foreground"
                variable="bg-accent-foreground"
                text="text-accent"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-1">UI Component Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch name="Card" variable="bg-card" />
              <ColorSwatch name="Card Foreground" variable="bg-card-foreground" text="text-card" />
              <ColorSwatch name="Popover" variable="bg-popover" />
              <ColorSwatch
                name="Popover Foreground"
                variable="bg-popover-foreground"
                text="text-popover"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-1">Utility & Form Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch name="Border" variable="bg-border" />
              <ColorSwatch name="Input" variable="bg-input" />
              <ColorSwatch name="Ring" variable="bg-ring" />
              <ColorSwatch name="Muted" variable="bg-muted" text="text-muted-foreground" />
              <ColorSwatch
                name="Muted Foreground"
                variable="bg-muted-foreground"
                text="text-muted"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-1">Status & Feedback Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch
                name="Destructive"
                variable="bg-destructive"
                text="text-destructive-foreground"
              />
              <ColorSwatch
                name="Destructive Foreground"
                variable="bg-destructive-foreground"
                text="text-destructive"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-1">Sidebar & Navigation Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch
                name="Sidebar Background"
                variable="bg-sidebar"
                text="text-sidebar-foreground"
              />
              <ColorSwatch
                name="Sidebar Foreground"
                variable="bg-sidebar-foreground"
                text="text-sidebar"
              />
              <ColorSwatch
                name="Sidebar Primary"
                variable="bg-sidebar-primary"
                text="text-sidebar-primary-foreground"
              />
              <ColorSwatch
                name="Sidebar Primary FG"
                variable="bg-sidebar-primary-foreground"
                text="text-sidebar-primary"
              />
              <ColorSwatch
                name="Sidebar Accent"
                variable="bg-sidebar-accent"
                text="text-sidebar-accent-foreground"
              />
              <ColorSwatch
                name="Sidebar Accent FG"
                variable="bg-sidebar-accent-foreground"
                text="text-sidebar-accent"
              />
              <ColorSwatch name="Sidebar Border" variable="bg-sidebar-border" />
              <ColorSwatch name="Sidebar Ring" variable="bg-sidebar-ring" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-1">Typography Fonts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FontSwatch name="Avenir" fontFamily="var(--primary-font)" />
              <FontSwatch name="Source Code Pro" fontFamily="var(--monospace-font)" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
