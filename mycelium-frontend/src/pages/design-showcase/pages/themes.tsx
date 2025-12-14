import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/pages/design-showcase/theming/theme-context';
import type { Theme } from '@/pages/design-showcase/theming/theme';

function ColorSwatch({ name, value, hex }: { name: string; value: string; hex: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-md border-2 border-border"
          style={{ backgroundColor: hex }}
        />
        <div>
          <div className="font-medium text-sm">{name}</div>
          <div className="text-xs text-muted-foreground font-mono">{value}</div>
        </div>
      </div>
      <Badge variant="outline" className="font-mono text-xs">
        {hex}
      </Badge>
    </div>
  );
}

export default function ThemesPage() {
  const { themes, theme, setTheme, currentThemeId } = useTheme();
  const currentTheme = theme;

  const semanticColors = [
    { name: 'Background', key: 'background' },
    { name: 'Foreground', key: 'foreground' },
    { name: 'Primary', key: 'primary' },
    { name: 'Secondary', key: 'secondary' },
    { name: 'Tertiary', key: 'tertiary' },
    { name: 'Quaternary', key: 'quaternary' },
    { name: 'Muted', key: 'muted' },
    { name: 'Accent', key: 'accent' },
    { name: 'Destructive', key: 'destructive' },
    { name: 'Border', key: 'border' },
    { name: 'Input', key: 'input' },
    { name: 'Ring', key: 'ring' },
  ] as const;

  const chartColors = [
    { name: 'Chart 1', key: 'chart-1' },
    { name: 'Chart 2', key: 'chart-2' },
    { name: 'Chart 3', key: 'chart-3' },
    { name: 'Chart 4', key: 'chart-4' },
    { name: 'Chart 5', key: 'chart-5' },
  ] as const;

  const currentThemeName = themes.find(t => t.theme === currentTheme)?.name || 'Custom';

  function SemanticColorRow({ name, themeKey }: { name: string; themeKey: string }) {
    const colorValue = currentTheme[themeKey as keyof Theme];
    return (
      <div className="flex items-center justify-between py-2 px-3 rounded border">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded border" style={{ backgroundColor: colorValue }} />
          <span className="font-medium text-sm">{name}</span>
        </div>
        <code className="text-xs text-muted-foreground">{colorValue}</code>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Dynamic Theming System</h1>
        <p className="text-muted-foreground">
          Your design system uses a dynamic theming approach with base colors mapped to semantic
          roles. The theme object controls how these colors are applied throughout the application.
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Current Theme:</Badge>
          <Badge>{currentThemeName}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Themes</CardTitle>
          <CardDescription>
            Click any theme below to apply it dynamically to the design showcase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map(({ id, name, theme, description }) => (
              <div
                key={name}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  id === currentThemeId
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setTheme(theme, id)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{name}</h3>
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{
                        backgroundColor: theme.primary,
                        borderColor: theme.ring,
                      }}
                    />
                  </div>
                  <p className="text-sm opacity-75">{description}</p>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{
                          backgroundColor: theme.background,
                          borderColor: theme.border,
                          borderRadius: theme.radius,
                        }}
                      />
                      <div
                        className="w-6 h-6 rounded border"
                        style={{
                          backgroundColor: theme.secondary,
                          borderColor: theme.border,
                          borderRadius: theme.radius,
                        }}
                      />
                      <div
                        className="w-6 h-6 rounded border"
                        style={{
                          backgroundColor: theme.accent,
                          borderColor: theme.border,
                          borderRadius: theme.radius,
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>Font: {theme['primary-font']?.split(',')[0]}</div>
                      <div>Radius: {theme.radius}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Color Categories</CardTitle>
            <CardDescription>Current theme colors organized by semantic roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Core Colors</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'background', name: 'Background' },
                  { key: 'foreground', name: 'Foreground' },
                  { key: 'primary', name: 'Primary' },
                  { key: 'secondary', name: 'Secondary' },
                  { key: 'tertiary', name: 'Tertiary' },
                  { key: 'quaternary', name: 'Quaternary' },
                  { key: 'accent', name: 'Accent' },
                  { key: 'muted', name: 'Muted' },
                  { key: 'destructive', name: 'Destructive' },
                ].map(({ key, name }) => (
                  <ColorSwatch
                    key={key}
                    name={name}
                    value={`--${key}`}
                    hex={currentTheme[key as keyof Theme]}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Component Colors</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'card', name: 'Card' },
                  { key: 'popover', name: 'Popover' },
                  { key: 'border', name: 'Border' },
                  { key: 'input', name: 'Input' },
                  { key: 'ring', name: 'Ring' },
                ].map(({ key, name }) => (
                  <ColorSwatch
                    key={key}
                    name={name}
                    value={`--${key}`}
                    hex={currentTheme[key as keyof Theme]}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Chart Colors</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'chart-1', name: 'Chart 1' },
                  { key: 'chart-2', name: 'Chart 2' },
                  { key: 'chart-3', name: 'Chart 3' },
                  { key: 'chart-4', name: 'Chart 4' },
                  { key: 'chart-5', name: 'Chart 5' },
                ].map(({ key, name }) => (
                  <ColorSwatch
                    key={key}
                    name={name}
                    value={`--${key}`}
                    hex={currentTheme[key as keyof Theme]}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Semantic Colors</CardTitle>
            <CardDescription>Colors mapped to UI roles using CSS variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {semanticColors.map(color => (
              <SemanticColorRow key={color.name} name={color.name} themeKey={color.key} />
            ))}
            <div className="pt-4 border-t">
              <div className="text-sm font-medium mb-2">Current Theme Properties</div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>
                  Font Family: <code className="text-xs">{currentTheme['primary-font']}</code>
                </div>
                <div>
                  Border Radius: <code className="text-xs">{currentTheme.radius}</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chart Colors</CardTitle>
          <CardDescription>Colors used for data visualization and charts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {chartColors.map(color => (
              <div key={color.name} className="text-center">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-border mx-auto mb-2"
                  style={{ backgroundColor: currentTheme[color.key as keyof Theme] }}
                />
                <div className="text-sm font-medium">{color.name}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {currentTheme[color.key as keyof Theme]}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
