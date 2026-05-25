export function reverseGraphemes(s: string): string {
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  const segments = [...segmenter.segment(s)].map((seg) => seg.segment);
  return segments.reverse().join("");
}

export function main(args: string[] = Bun.argv.slice(2)): void {
  if (args.length === 0) {
    console.error("Usage: reverse-string <input-string>");
    process.exit(1);
  }
  console.log(reverseGraphemes(args[0]));
}

if (import.meta.main) {
  main();
}
