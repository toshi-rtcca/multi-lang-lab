export function parseArgs(args: string[]): string | null {
  for (const arg of args) {
    if (arg.startsWith("--name=")) {
      return arg.slice(7);
    }
  }
  return null;
}

export function main(args: string[] = Bun.argv.slice(2)): void {
  const name = parseArgs(args);
  if (name === null) {
    console.error("Sorry, may I have your name?");
    process.exit(1);
  }
  console.log(`Hello, ${name}!`);
}

if (import.meta.main) {
  main();
}
