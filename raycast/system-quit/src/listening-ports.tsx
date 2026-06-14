import { List, Icon, showToast, Toast, Action, ActionPanel } from "@raycast/api";
import { useState, useEffect } from "react";
import { run, runBrewCommand } from "./shell";
import { KillPortInput } from "./kill-port-input";

interface ListeningPort {
  pid: string;
  command: string;
  args: string;
  port: string;
  folder: string;
}

function friendlyName(command: string, args: string): string {
  const npmMatch = args.match(/^(?:npm|pnpm|yarn)\s+run\s+(\S+)/);
  if (npmMatch) return `${command} run ${npmMatch[1]}`;
  const binMatch = args.match(/node_modules\/\.bin\/(\S+)/);
  if (binMatch) return binMatch[1];
  const first = args.split(/\s+/)[0] || "";
  const name = first.split("/").pop() || "";
  if (name && name !== command) return name;
  return command;
}

async function killProcessOnPort(port: string) {
  const { stdout } = await run(`/usr/sbin/lsof -ti :${port} 2>/dev/null`);
  const pids = stdout.trim().split("\n").filter(Boolean);
  if (pids.length === 0) throw new Error("No process found");
  await runBrewCommand("kill", `-9 ${pids.join(" ")}`);
}

export function ListeningPortList() {
  const [ports, setPorts] = useState<ListeningPort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    run("/usr/sbin/lsof -iTCP -sTCP:LISTEN -P -n 2>/dev/null")
      .then((r) => {
        const lines = r.stdout.trim().split("\n").filter(Boolean);
        const records: { pid: string; command: string; port: string }[] = [];

        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].trim().split(/\s+/);
          if (parts.length >= 9) {
            const command = parts[0];
            const pid = parts[1];
            const match = parts[8].match(/:(\d+)/);
            if (match) {
              records.push({ pid, command, port: match[1] });
            }
          }
        }

        const seen = new Set<string>();
        const unique = records.filter((r) => {
          const key = `${r.port}-${r.command}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        const uniquePids = [...new Set(unique.map((r) => r.pid))];
        return Promise.all(
          uniquePids.map(async (pid) => {
            try {
              const [folderResult, argsResult] = await Promise.all([
                run(`/usr/sbin/lsof -p ${pid} -a -d cwd -Fn 2>/dev/null | grep ^n | head -1 | cut -c2-`),
                run(`/bin/ps -p ${pid} -o args= 2>/dev/null`),
              ]);
              return {
                pid,
                folder: folderResult.stdout.trim(),
                args: argsResult.stdout.trim(),
              };
            } catch {
              return { pid, folder: "", args: "" };
            }
          }),
        ).then((details) => {
          const detailMap = Object.fromEntries(details.map((d) => [d.pid, d]));
          return unique.map((r) => ({
            ...r,
            folder: detailMap[r.pid]?.folder || "",
            args: detailMap[r.pid]?.args || "",
          }));
        });
      })
      .then((result) => {
        result.sort((a, b) => {
          const aScore = a.folder.startsWith("/Users/") ? 0 : a.folder ? 1 : 2;
          const bScore = b.folder.startsWith("/Users/") ? 0 : b.folder ? 1 : 2;
          return aScore - bScore;
        });
        setPorts(result);
      })
      .catch(() => setPorts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <List
      searchBarPlaceholder="Search listening ports..."
      navigationTitle="Listening Ports"
      isLoading={loading}
    >
      <List.Section title="Quick Actions">
        <List.Item
          title="Manual Entry"
          icon={Icon.Plus}
          subtitle="Enter port number manually"
          actions={
            <ActionPanel>
              <Action.Push
                title="Enter Port"
                target={<KillPortInput />}
                shortcut={{ modifiers: ["cmd"], key: "enter" }}
              />
            </ActionPanel>
          }
        />
      </List.Section>
      <List.Section title="Listening Ports">
        {ports.map((p) => (
          <List.Item
            key={`${p.port}-${p.command}`}
            title={`:${p.port}`}
            subtitle={friendlyName(p.command, p.args)}
            icon={Icon.Globe}
            accessories={[
              ...(p.folder ? [{ text: p.folder }] : []),
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="Kill Process"
                  icon={Icon.Power}
                  onAction={async () => {
                    await showToast({ style: Toast.Style.Animated, title: `Killing process on port ${p.port}...` });
                    try {
                      await killProcessOnPort(p.port);
                      setPorts((prev) => prev.filter((x) => x.port !== p.port));
                      await showToast({ style: Toast.Style.Success, title: `Killed process on port ${p.port}` });
                    } catch (error) {
                      await showToast({
                        style: Toast.Style.Failure,
                        title: `Failed to kill port ${p.port}`,
                        message: error instanceof Error ? error.message : "Unknown error",
                      });
                    }
                  }}
                  shortcut={{ modifiers: ["cmd"], key: "enter" }}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
