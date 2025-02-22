export const formFieldStyles = {
  input: "transition-all duration-200 focus:ring-2 focus:ring-primary/20",
  label: "text-sm font-medium text-foreground/80",
  select: "border-2 hover:border-primary/50 transition-colors",
  textarea: "min-h-[200px] transition-all duration-200 focus:ring-2 focus:ring-primary/20",
  switch: "data-[state=checked]:bg-primary",
  radio: "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
  badge: "transition-all hover:scale-105",
  card: {
    hover: "shadow-md transition-shadow duration-200",
    base: "backdrop-blur-sm border-primary/10",
    header: "bg-gradient-to-r from-muted/30 via-background to-muted/30",
    content: "divide-y divide-muted/20"
  },
  button: {
    zoom: {
      text: "text-[length:clamp(14px,1vw,16px)]",
      padding: "p-[clamp(12px,1.5vw,16px)]",
      height: "h-[clamp(40px,2.5vw,48px)]"
    },
    contrast: {
      primary: "contrast-more:border-2 contrast-more:border-primary/50",
      outline: "contrast-more:border-2 contrast-more:border-foreground/50"
    }
  },
  container: {
    base: "bg-gradient-to-b from-background to-muted/5",
    padding: "p-[clamp(16px,2vw,24px)]",
    shadow: "shadow-lg shadow-primary/5"
  },
  animation: {
    transition: "transition-all duration-200 ease-out",
    hover: "hover:translate-y-[-2px] hover:shadow-lg",
    active: "active:scale-[0.98]"
  }
}
