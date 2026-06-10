export const themeVars = {
  foreground: "var(--color-foreground)",
  ring: "var(--color-ring)",
  graphNode: {
    clue: "var(--color-graph-node-clue)",
    code: "var(--color-graph-node-code)",
    observation: "var(--color-graph-node-observation)",
    theory: "var(--color-graph-node-theory)",
    story: "var(--color-graph-node-story)",
    task: "var(--color-graph-node-task)",
  },
  graphLink: {
    room: "var(--color-graph-link-room)",
    tag: "var(--color-graph-link-tag)",
    both: "var(--color-graph-link-both)",
    note: "var(--color-graph-link-note)",
  },
} as const;