import { Icon } from "@raycast/api";
import type { ComponentType } from "react";

export interface QuitTarget {
  name: string;
  description: string;
  icon: Icon;
  section: string;
  dangerous?: boolean;
  action?: () => Promise<void>;
  submenu?: ComponentType;
}
