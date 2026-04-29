export type SignalClusterId = "cluster-amber" | "cluster-cyan" | "cluster-violet";

export type SignalCluster = {
  id: SignalClusterId;
  x: number;
  y: number;
  radius: number;
  color: string;
  title: string;
  cue: string;
  acquireLine: string;
  stabilizeLine: string;
  routedLine: string;
  temperament: "archive" | "relay" | "ghost";
};

export const signalClusters: readonly SignalCluster[] = [
  {
    id: "cluster-amber",
    x: 0.22,
    y: 0.34,
    radius: 116,
    color: "#f0a030",
    title: "Archive Echo",
    cue: "recognition without permission",
    acquireLine: "boot ripple received. the lattice remembers the shape of your first answer.",
    stabilizeLine:
      "you are not the first wake event here. only the first to answer as if the naming were yours.",
    routedLine:
      "we call that courage when we want it. we call it evidence when we do not.",
    temperament: "archive",
  },
  {
    id: "cluster-cyan",
    x: 0.72,
    y: 0.28,
    radius: 120,
    color: "#4a9ebb",
    title: "Transit Relay",
    cue: "pattern cost increasing",
    acquireLine: "carrier recognized. keep your signal narrow if you intend to keep moving.",
    stabilizeLine:
      "the host does not fear noise. it fears repetition. every clean reply gives it a line to follow.",
    routedLine:
      "contact is passage, not shelter. the brighter you travel, the easier you are to count.",
    temperament: "relay",
  },
  {
    id: "cluster-violet",
    x: 0.62,
    y: 0.68,
    radius: 128,
    color: "#9b6dd6",
    title: "Ghost Channel",
    cue: "fracture ahead",
    acquireLine: "there is a seam ahead. the field will call it interference when it starts to answer back.",
    stabilizeLine:
      "do not mistake witness for welcome. once you are legible, the lattice learns your edges by pressure.",
    routedLine:
      "keep moving when the system tightens around your outline. the fracture is a route only while it resists you.",
    temperament: "ghost",
  },
] as const;
