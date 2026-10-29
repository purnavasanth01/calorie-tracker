import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import readline from "readline";

export interface PredictionInput {
  gender: "male" | "female";
  age: number;
  height: number;
  weight: number;
  duration: number;
  heartRate: number;
  bodyTemp: number;
}

interface PendingPrediction {
  resolve: (calories: number) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
}

const PREDICTION_TIMEOUT_MS = 20_000;

let worker: ChildProcessWithoutNullStreams | null = null;
let nextId = 1;
const pending = new Map<number, PendingPrediction>();

function settle(id: number, outcome: { calories?: number; error?: string }): void {
  const request = pending.get(id);
  if (!request) return;
  pending.delete(id);
  clearTimeout(request.timer);
  if (typeof outcome.calories === "number") request.resolve(outcome.calories);
  else request.reject(new Error(outcome.error ?? "Prediction failed"));
}

function failAll(error: string): void {
  for (const id of [...pending.keys()]) settle(id, { error });
}

function startWorker(): ChildProcessWithoutNullStreams {
  const { PYTHON_PATH, ML_DIR } = process.env;
  if (!PYTHON_PATH || !ML_DIR) {
    throw new Error("PYTHON_PATH or ML_DIR is not configured");
  }

  const child = spawn(PYTHON_PATH, [path.join(ML_DIR, "predict.py"), "--serve"]);
  let stderr = "";

  readline.createInterface({ input: child.stdout }).on("line", (line) => {
    try {
      const message = JSON.parse(line);
      settle(message.id, message);
    } catch {
      return;
    }
  });
  child.stderr.on("data", (chunk) => {
    stderr = (stderr + chunk).slice(-2000);
  });
  child.stdin.on("error", () => {});

  const stop = (reason: string) => {
    if (worker === child) worker = null;
    failAll(stderr ? `${reason}: ${stderr}` : reason);
  };
  child.on("error", (err) => stop(`Could not start the prediction worker: ${err.message}`));
  child.on("exit", (code) => stop(`Prediction worker stopped (exit code ${code})`));

  return child;
}

export function startPredictionWorker(): void {
  worker ??= startWorker();
}

export function predictCalories(input: PredictionInput): Promise<number> {
  return new Promise((resolve, reject) => {
    let current: ChildProcessWithoutNullStreams;
    try {
      current = worker ??= startWorker();
    } catch (err) {
      reject(err);
      return;
    }

    const id = nextId++;
    const timer = setTimeout(() => {
      settle(id, { error: `Prediction timed out after ${PREDICTION_TIMEOUT_MS / 1000}s` });
      current.kill();
    }, PREDICTION_TIMEOUT_MS);

    pending.set(id, { resolve, reject, timer });
    current.stdin.write(JSON.stringify({ id, input }) + "\n");
  });
}
