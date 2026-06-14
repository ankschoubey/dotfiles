import { execSync } from "child_process";

export function createEntry(journalName: string): void {
  const output = execSync(`dayone -j "${journalName}" new --no-stdin`, {
    timeout: 10000,
    encoding: "utf-8",
  });

  try {
    const wid = execSync(
      `aerospace list-windows --monitor all --app-id com.bloombuilt.dayone-mac --format '%{window-id}'`,
      { timeout: 5000, encoding: "utf-8" },
    ).trim().split("\n")[0];

    if (wid) {
      const currentWs = execSync("aerospace list-workspaces --focused", {
        timeout: 5000,
        encoding: "utf-8",
      }).trim();

      execSync(`aerospace move-node-to-workspace --window-id "${wid}" "${currentWs}"`, {
        timeout: 5000,
      });
    }
  } catch {
    // Day One not running or not in aerospace, open normally
  }

  const match = output.match(/uuid:\s*(\S+)/);
  if (match) {
    const uuid = match[1];
    execSync(`open "dayone://edit?entryId=${uuid}"`, { timeout: 5000 });
  } else {
    execSync(`open -a "Day One"`, { timeout: 5000 });
  }
}
