import { exec } from "child_process";
import fs from "fs/promises";
import crypto from "crypto";
import os from "os";
import path from "path";
async function runWithRetry(params, retries = 2) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const result = await runCodeOnce(params);
        if (result.status === "OK" || result.status === "TLE") {
            return result;
        }
        console.log(`Retry ${attempt}/${retries} for ${params.stdin?.substring(0, 30)}...`);
    }
    return await runCodeOnce(params);
}
async function runCodeOnce(params) {
    const { code, stdin = "", timeLimit = 2, memoryLimit = 128 } = params;
    const id = crypto.randomUUID();
    const dir = path.join(os.tmpdir(), id);
    try {
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, "main.py"), code);
        let cmd;
        if (stdin && stdin.trim()) {
            await fs.writeFile(path.join(dir, "input.txt"), stdin);
            console.log("INPUT FILE CREATED:", stdin);
            const dirForDocker = dir.replace(/\\/g, "/");
            cmd = `cat "${dirForDocker}/input.txt" | docker run --rm --network none -i --memory=${memoryLimit}m --cpus="1.0" --pids-limit=64 -v "${dirForDocker}:/home/runner" -w /home/runner python:3.11-slim python3 main.py`;
        }
        else {
            const dirForDocker = dir.replace(/\\/g, "/");
            cmd = `docker run --rm --network none --memory=${memoryLimit}m --cpus="1.0" --pids-limit=64 -v "${dirForDocker}:/home/runner" -w /home/runner python:3.11-slim python3 main.py`;
        }
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
                    const result = { id, status: "TLE", stdout: "", stderr: "Time limit exceeded", execTime };
                    resolve(result);
                }
                else if (hasValidOutput) {
                    const result = { id, status: "OK", stdout: stdout.trim(), stderr: "", execTime };
                    resolve(result);
                }
                else if (error) {
                    const result = { id, status: "RE", stdout: "", stderr: error.message || stderr || "Runtime error", execTime };
                    resolve(result);
                }
                else {
                    const result = { id, status: "OK", stdout: stdout?.trim() || "", stderr: "", execTime };
                    resolve(result);
                }
            });
        });
    }
    catch (err) {
        return {
            id,
            status: "ERR",
            stdout: "",
            stderr: err instanceof Error ? err.message : "Unknown error",
            execTime: 0,
        };
    }
}
export async function runCode(params) {
    return runWithRetry(params, 2);
}
