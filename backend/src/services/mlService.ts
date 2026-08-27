import { spawn } from "child_process";
import path from "path";

export interface PredictionInput {
  gender: "male" | "female";
  age: number;
  height: number;
  weight: number;
  duration: number;
  heartRate: number;
  bodyTemp: number;
}

export function predictCalories(input: PredictionInput): Promise<number> {
  const pythonPath = process.env.PYTHON_PATH;
  const mlDir = process.env.ML_DIR;

  if (!pythonPath || !mlDir) {
    return Promise.reject(new Error("PYTHON_PATH or ML_DIR is not configured"));
  }

  const scriptPath = path.join(mlDir, "predict.py");

  return new Promise((resolve, reject) => {
    const child = spawn(pythonPath, [scriptPath]);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Prediction script failed: ${stderr || stdout}`));
        return;
      }

      try {
        const result = JSON.parse(stdout.trim());
        if (result.error) {
          reject(new Error(result.error));
          return;
        }
        resolve(result.calories as number);
      } catch (err) {
        reject(new Error(`Failed to parse prediction output: ${stdout}`));
      }
    });

    child.stdin.write(JSON.stringify(input));
    child.stdin.end();
  });
}
