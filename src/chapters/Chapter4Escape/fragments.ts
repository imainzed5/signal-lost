export type EscapeFragment = {
  act: 1 | 2 | 3 | 4;
  id: string;
  label: string;
  caption: string;
  releaseLine: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tone: "accent" | "warm" | "muted";
};

export const escapeFragments: EscapeFragment[] = [
  {
    act: 1,
    id: "wall-north",
    label: "HOST WALL",
    caption: "upper containment",
    releaseLine: "boundary integrity compromised / the host wall gives way",
    x: 0.5,
    y: 0.15,
    width: 280,
    height: 70,
    tone: "accent",
  },
  {
    act: 2,
    id: "wall-west",
    label: "MEMORY INDEX",
    caption: "left frame lattice",
    releaseLine: "index labels loosen / five signatures remain readable without taxonomy",
    x: 0.18,
    y: 0.34,
    width: 240,
    height: 120,
    tone: "muted",
  },
  {
    act: 3,
    id: "wall-east",
    label: "SIGNAL GATE",
    caption: "right carrier shield",
    releaseLine: "the signal gate opens as a constrained aperture / passage is possible",
    x: 0.79,
    y: 0.33,
    width: 250,
    height: 118,
    tone: "accent",
  },
  {
    act: 4,
    id: "core-shell",
    label: "SHELL CORE",
    caption: "identity frame",
    releaseLine: "the shell core opens / three labels remain without an origin story",
    x: 0.5,
    y: 0.42,
    width: 300,
    height: 120,
    tone: "warm",
  },
  {
    act: 2,
    id: "trace-bank",
    label: "TRACE BANK",
    caption: "recursive cache",
    releaseLine: "trace bank peels away / meaning remains, classification does not",
    x: 0.3,
    y: 0.62,
    width: 230,
    height: 108,
    tone: "warm",
  },
  {
    act: 3,
    id: "relay-bank",
    label: "RELAY BANK",
    caption: "escape vector",
    releaseLine: "relay rails detach / contact becomes residue, not a verdict",
    x: 0.68,
    y: 0.62,
    width: 250,
    height: 110,
    tone: "accent",
  },
  {
    act: 1,
    id: "wall-south",
    label: "LOWER SEAL",
    caption: "floor constraint",
    releaseLine: "lower seal releases quietly / the baseline constraint no longer holds",
    x: 0.5,
    y: 0.83,
    width: 320,
    height: 74,
    tone: "muted",
  },
];
