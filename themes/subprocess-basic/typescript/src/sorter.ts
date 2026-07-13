/**
 * Core sorting and subprocess logic for sort-ls-l.
 */

import { stat } from "fs/promises";

export type FileEntry = {
  size: number;
  filename: string;
};

export type ProcessResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

export type LsRunner = (path: string) => ProcessResult;

export class SortLsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SortLsError";
  }
}

export function parseLsOutput(output: string): FileEntry[] {
  const entries: FileEntry[] = [];

  for (const line of output.split("\n")) {
    if (!line || line.startsWith("total ")) {
      continue;
    }

    const fields = line.trim().split(/\s+/, 8);
    const filenameMatch = line.trim().match(/^(?:\S+\s+){8}(.+)$/);
    if (fields.length < 8 || !filenameMatch) {
      continue;
    }

    const permissions = fields[0];
    if (!permissions.startsWith("-")) {
      continue;
    }

    const size = Number(fields[4]);
    if (!Number.isInteger(size)) {
      continue;
    }

    entries.push({ size, filename: filenameMatch[1] });
  }

  return entries;
}

export function sortEntries(entries: FileEntry[]): FileEntry[] {
  return [...entries].sort((left, right) => {
    if (left.size !== right.size) {
      return right.size - left.size;
    }
    return left.filename.localeCompare(right.filename);
  });
}

export function formatEntries(entries: FileEntry[]): string {
  const lines = ["size   filename"];
  for (const entry of entries) {
    lines.push(`${entry.size}   ${entry.filename}`);
  }
  return `${lines.join("\n")}\n`;
}

export function runLs(path: string): ProcessResult {
  const result = Bun.spawnSync(["ls", "-l", path], {
    stdout: "pipe",
    stderr: "pipe",
  });

  return {
    exitCode: result.exitCode,
    stdout: new TextDecoder().decode(result.stdout),
    stderr: new TextDecoder().decode(result.stderr),
  };
}

export async function sortLsL(path: string, runner: LsRunner = runLs): Promise<string> {
  let targetStat;

  try {
    targetStat = await stat(path);
  } catch {
    throw new SortLsError(`Path does not exist: ${path}`);
  }

  if (!targetStat.isDirectory()) {
    throw new SortLsError(`Path is not a directory: ${path}`);
  }

  const result = runner(path);
  if (result.exitCode !== 0) {
    throw new SortLsError(result.stderr.trim() || `ls exited with code ${result.exitCode}`);
  }

  return formatEntries(sortEntries(parseLsOutput(result.stdout)));
}
