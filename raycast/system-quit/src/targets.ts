import { Icon } from "@raycast/api";
import { QuitTarget } from "./quit-target";
import { DockerContainerList } from "./docker-containers";
import { TmuxSessionsList } from "./tmux-sessions";

export const targets: QuitTarget[] = [
  {
    name: "Docker",
    description: "Manage Docker containers",
    icon: Icon.Docker,
    section: "dev",
    submenu: DockerContainerList,
  },
  {
    name: "Tmux Sessions",
    description: "Kill all tmux sessions",
    icon: Icon.Terminal,
    section: "dev",
    submenu: TmuxSessionsList,
  },
];
