import { spawnSync } from "node:child_process";
import { delimiter, join } from "node:path";
import { existsSync } from "node:fs";

/**
 * Finds a working Python 3 executable in the current environment.
 * Bypasses non-functional, permission-denied, or quarantined binaries in PATH.
 *
 * @returns {string|null} Full path or command name of working Python interpreter, or null.
 */
export function findPythonExecutable() {
  // 1. Explicit environment variable overrides
  const envPy = process.env.PYTHON || process.env.PYTHON_BIN;
  if (envPy) {
    try {
      const res = spawnSync(envPy, ["--version"], { stdio: "pipe" });
      if (!res.error && res.status === 0) return envPy;
    } catch {}
  }

  // 2. Primary candidate paths & commands across macOS, Linux, Windows
  const primaryCandidates = [
    "python3",
    "/opt/homebrew/bin/python3",
    "/usr/local/bin/python3",
    "/usr/bin/python3",
    "python",
    "py",
  ];

  for (const cand of primaryCandidates) {
    try {
      const res = spawnSync(cand, ["--version"], { stdio: "pipe" });
      if (!res.error && res.status === 0) return cand;
    } catch {}
  }

  // 3. Scan all PATH directories for working Python executables
  const pathDirs = (process.env.PATH || "").split(delimiter);
  const exeNames =
    process.platform === "win32"
      ? ["python.exe", "python3.exe", "py.exe"]
      : ["python3", "python3.14", "python3.13", "python3.12", "python3.11", "python3.10", "python3.9", "python3.8", "python"];

  for (const dir of pathDirs) {
    if (!dir) continue;
    for (const exe of exeNames) {
      const full = join(dir, exe);
      if (existsSync(full)) {
        try {
          const res = spawnSync(full, ["--version"], { stdio: "pipe" });
          if (!res.error && res.status === 0) return full;
        } catch {}
      }
    }
  }

  return null;
}
