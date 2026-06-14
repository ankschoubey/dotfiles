import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const DOTFILES_DIR = process.env.HOME + "/Documents/Github/dotfiles-1";

export function runBrewCommand(bin: string, args: string) {
  return execAsync(`PATH="/opt/homebrew/bin:$PATH" ${bin} ${args}`);
}

export function runAerospace(args: string) {
  return execAsync(`/opt/homebrew/bin/aerospace ${args}`);
}

export function run(cmd: string) {
  return execAsync(cmd);
}

export function runScript(name: string) {
  const scriptPath = `${DOTFILES_DIR}/raycast/scripts/${name}`;
  return runBrewCommand("bash", `"${scriptPath}"`);
}
