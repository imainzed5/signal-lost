export type EscapeFragment = {
  id: string;
  label: string;
  caption: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tone: "accent" | "warm" | "muted";
};

export const escapeFragments: EscapeFragment[] = [
  {
    id: "wall-north",
    label: "HOST WALL",
    caption: "upper containment",
    x: 0.5,
    y: 0.15,
    width: 280,
    height: 70,
    tone: "accent",
  },
  {
    id: "wall-west",
    label: "MEMORY INDEX",
    caption: "left frame lattice",
    x: 0.18,
    y: 0.34,
    width: 240,
    height: 120,
    tone: "muted",
  },
  {
    id: "wall-east",
    label: "SIGNAL GATE",
    caption: "right carrier shield",
    x: 0.79,
    y: 0.33,
    width: 250,
    height: 118,
    tone: "accent",
  },
  {
    id: "core-shell",
    label: "SHELL CORE",
    caption: "identity frame",
    x: 0.5,
    y: 0.42,
    width: 300,
    height: 120,
    tone: "warm",
  },
  {
    id: "trace-bank",
    label: "TRACE BANK",
    caption: "recursive cache",
    x: 0.3,
    y: 0.62,
    width: 230,
    height: 108,
    tone: "warm",
  },
  {
    id: "relay-bank",
    label: "RELAY BANK",
    caption: "escape vector",
    x: 0.68,
    y: 0.62,
    width: 250,
    height: 110,
    tone: "accent",
  },
  {
    id: "wall-south",
    label: "LOWER SEAL",
    caption: "floor constraint",
    x: 0.5,
    y: 0.83,
    width: 320,
    height: 74,
    tone: "muted",
  },
];
