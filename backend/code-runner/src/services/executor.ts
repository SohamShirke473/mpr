import { exec } from "child_process";
import fs from "fs/promises";
import crypto from "crypto";
import os from "os";
import path from "path";
import { insertLog } from "./database.js";

export interface ExecutionResult {
  id: string;
  status: "OK" | "TLE" | "MLE" | "RE" | "ERR";
  stdout: string;
  stderr: string;
  execTime: number;
}

export interface ExecutionParams {
  code: string;
  stdin?: string;
  timeLimit?: number;
  memoryLimit?: number;
}

async function runWithRetry(params: ExecutionParams, retries = 2): Promise<ExecutionResult> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const result = await runCodeOnce(params);
    if (result.status === "OK" || result.status === "TLE") {
      return result;
    }
    console.log(`Retry ${attempt}/${retries} for ${params.stdin?.substring(0, 30)}...`);
  }
  return await runCodeOnce(params);
}

async function runCodeOnce(params: ExecutionParams): Promise<ExecutionResult> {
  const { code, stdin = "", timeLimit = 2, memoryLimit = 128 } = params;
  const id = crypto.randomUUID();
  const dir = path.join(os.tmpdir(), id);

  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "main.py"), code);
    
    const safeStdin = typeof stdin === "string" ? stdin + (stdin.endsWith("\n") ? "" : "\n") : "\n";
    await fs.writeFile(path.join(dir, "input.txt"), safeStdin);
    const dirForDocker = dir.replace(/\\/g, "/");
    const cmd = `cat "${dirForDocker}/input.txt" | docker run --rm --network none -i --memory=${memoryLimit}m --cpus="1.0" --pids-limit=64 -v "${dirForDocker}:/home/runner" -w /home/runner python:3.11-slim python3 main.py`;

    console.log("DOCKER CMD:", cmd);
    const start = Date.now();

    return new Promise((resolve) => {
      exec(cmd, { timeout: timeLimit * 1000 + 2000 }, (error, stdout, stderr) => {
        const execTime = Date.now() - start;
        console.log("DOCKER RESULT:", {
          error: error?.message?.substring(0, 100),
          stdout: stdout?.substring(0, 100),
          stderr: stderr?.substring(0, 100),
        });
        
        const hasValidOutput = stdout && stdout.trim().length > 0;
        
        if (error?.killed || (stderr && stderr.includes("Killed"))) {
          const result = { id, status: "TLE" as const, stdout: "", stderr: "Time limit exceeded", execTime };
          resolve(result);
        } else if (hasValidOutput) {
          const result = { id, status: "OK" as const, stdout: stdout.trim(), stderr: "", execTime };
          resolve(result);
        } else if (error) {
          const result = { id, status: "RE" as const, stdout: "", stderr: error.message || stderr || "Runtime error", execTime };
          resolve(result);
        } else {
          const result = { id, status: "OK" as const, stdout: stdout?.trim() || "", stderr: "", execTime };
          resolve(result);
        }
      });
    });
  } catch (err) {
    return {
      id,
      status: "ERR",
      stdout: "",
      stderr: err instanceof Error ? err.message : "Unknown error",
      execTime: 0,
    };
  }
}

export async function runCode(params: ExecutionParams): Promise<ExecutionResult> {
  return runWithRetry(params, 2);
}