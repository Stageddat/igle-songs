import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function isDiskAlmostFull(threshold = 95): Promise<boolean> {
  try {
    const { stdout } = await execAsync("df -h / | tail -1");
    const usageMatch = stdout.match(/\s(\d+)%/);

    if (usageMatch) {
      const usedPercentage = parseInt(usageMatch[1], 10);
      return usedPercentage >= threshold;
    }

    console.error("unable to parse disk usage:", stdout);
    return false;
  } catch (err) {
    console.error("failed to check disk space:", err);
    return false;
  }
}
