"use client";

import type { CSSProperties } from "react";

type DialogueLine = {
  id: string;
  speaker: string;
  content: string;
};

type DialogueToneClasses = {
  speakerClassName?: string;
  textClassName?: string;
};

type DialogueRendererProps<TLine extends DialogueLine> = {
  currentIndex: number;
  forceRevealCurrentLine: boolean;
  lines: TLine[];
  listClassName: string;
  lineClassName: string;
  lineStaticClassName: string;
  lineTextClassName: string;
  lineTypingClassName: string;
  onCurrentLineResolved: () => void;
  resolveLineTone?: (line: TLine) => DialogueToneClasses;
  speakerClassName: string;
};

export function DialogueRenderer<TLine extends DialogueLine>({
  currentIndex,
  forceRevealCurrentLine,
  lines,
  listClassName,
  lineClassName,
  lineStaticClassName,
  lineTextClassName,
  lineTypingClassName,
  onCurrentLineResolved,
  resolveLineTone,
  speakerClassName,
}: DialogueRendererProps<TLine>) {
  return (
    <ol className={listClassName}>
      {lines.map((line, index) => {
        const isCurrentLine = index === currentIndex;
        const shouldAnimate = isCurrentLine && !forceRevealCurrentLine;
        const toneClasses = resolveLineTone?.(line);

        return (
          <li key={line.id} className={lineClassName}>
            <span
              className={[speakerClassName, toneClasses?.speakerClassName]
                .filter(Boolean)
                .join(" ")}
            >
              {line.speaker}
            </span>
            <span
              className={[
                lineTextClassName,
                shouldAnimate ? lineTypingClassName : lineStaticClassName,
                toneClasses?.textClassName,
              ]
                .filter(Boolean)
                .join(" ")}
              style={
                {
                  "--type-duration": `${resolveTypingDuration(line.content)}ms`,
                  "--type-steps": Math.max(line.content.length, 1),
                } as CSSProperties
              }
              onAnimationEnd={() => {
                if (isCurrentLine) {
                  onCurrentLineResolved();
                }
              }}
            >
              {line.content}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function resolveTypingDuration(content: string) {
  return Math.min(Math.max(content.length * 38, 900), 2900);
}
