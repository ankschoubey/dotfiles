import { Icon, List } from "@raycast/api";
import { Profile } from "./types";

export interface ProfileSection {
  title: string;
  accessory: List.Item.Accessory;
  profiles: Profile[];
}

const activeSections: ProfileSection[] = [
  {
    title: "Personal",
    accessory: { icon: Icon.Person, tooltip: "Personal" },
    profiles: [{ name: "Ankush", icon: Icon.Person }],
  },
  {
    title: "Gigs",
    accessory: { icon: Icon.Briefcase, tooltip: "Gigs" },
    profiles: [
      { name: "Dev Flax", icon: Icon.Code },
      { name: "Prod Svaaya", icon: Icon.Rocket },
    ],
  },
];

const deprecatedProfiles: Profile[] = [
  { name: "Business Ankush", icon: Icon.Archive },
  { name: "Feel And Heal", icon: Icon.Archive },
  { name: "Your Chrome", icon: Icon.Archive },
];

export function getActiveSections(): ProfileSection[] {
  return activeSections;
}

export function getDeprecatedProfiles(): Profile[] {
  return deprecatedProfiles;
}
