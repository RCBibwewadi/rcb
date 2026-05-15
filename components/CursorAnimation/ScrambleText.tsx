import { useState, useRef } from "react";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type ScrambleTextProps = {
  text: string;
  className?: string;
};

export function ScrambleText({ text, className = "" }: ScrambleTextProps) {
  const [display, setDisplay] = useState<string>(text);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleMouseEnter = () => {
    let iteration = 0;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setDisplay(() =>
        text
          .split("")
          .map((char: string, index: number) => {
            if (char === " ") return " ";
            if (index < iteration) return text[index];
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }

      iteration += 1 / 3;
    }, 30);
  };

  return (
    <span className={className} onMouseEnter={handleMouseEnter}>
      {display}
    </span>
  );
}