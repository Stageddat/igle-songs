import { exec } from "child_process";

export async function execCmd(cmd: string) {
	return new Promise((resolve, reject) => {
		exec(cmd, (err, stdout, stderr) => {
			if (err) reject({ err, stderr });
			else resolve({ stdout, stderr });
		});
	});
}