import { List, Icon, showToast, Toast, Action, ActionPanel, useExec } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const PRIMARY_ID = "37D8832A-2D66-02CA-B9F7-8F30A301B230";
const SECONDARY_ID = "CDEA184A-EB60-4C2A-8071-792A6B8B897B";

interface ResolutionPreset {
  name: string;
  command: string;
  description: string;
  icon: Icon;
  section: "primary" | "secondary" | "combined";
}

const presets: ResolutionPreset[] = [
  {
    name: "Primary Full",
    command: `displayplacer "id:${PRIMARY_ID} mode:60"`,
    description: "Primary monitor full resolution",
    icon: Icon.Monitor,
    section: "primary",
  },
  {
    name: "Primary Low",
    command: `displayplacer "id:${PRIMARY_ID} mode:54"`,
    description: "Primary monitor low resolution",
    icon: Icon.Monitor,
    section: "primary",
  },
  {
    name: "Secondary 1080p",
    command: `displayplacer "id:${SECONDARY_ID} mode:65"`,
    description: "Secondary monitor 1080p",
    icon: Icon.Monitor,
    section: "secondary",
  },
  {
    name: "Secondary Full",
    command: `displayplacer "id:${SECONDARY_ID} res:3440x1440 hz:100 color_depth:8 enabled:true"`,
    description: "Secondary monitor full resolution",
    icon: Icon.Monitor,
    section: "secondary",
  },
  {
    name: "Both Full",
    command: `displayplacer "id:${PRIMARY_ID} mode:60" "id:${SECONDARY_ID} res:3440x1440 hz:100 color_depth:8 enabled:true"`,
    description: "Both monitors full resolution",
    icon: Icon.ArrowRight,
    section: "combined",
  },
  {
    name: "Both Low",
    command: `displayplacer "id:${PRIMARY_ID} mode:54" "id:${SECONDARY_ID} mode:65"`,
    description: "Both monitors low resolution",
    icon: Icon.ArrowRight,
    section: "combined",
  },
];

async function applyPreset(preset: ResolutionPreset) {
  await showToast({
    style: Toast.Style.Animated,
    title: `Applying ${preset.name}...`,
  });

  try {
    await execAsync(preset.command);
    await showToast({
      style: Toast.Style.Success,
      title: `Applied ${preset.name}`,
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to apply resolution",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

function PresetActions({ preset }: { preset: ResolutionPreset }) {
  return (
    <ActionPanel>
      <Action
        title="Apply Resolution"
        icon={Icon.Checkmark}
        onAction={() => applyPreset(preset)}
        shortcut={{ modifiers: ["cmd"], key: "enter" }}
      />
    </ActionPanel>
  );
}

export default function Command() {
  const sections = [
    { title: "Primary Monitor", presets: presets.filter((p) => p.section === "primary") },
    { title: "Secondary Monitor", presets: presets.filter((p) => p.section === "secondary") },
    { title: "Combined", presets: presets.filter((p) => p.section === "combined") },
  ];

  return (
    <List
      searchBarPlaceholder="Search resolution presets..."
      navigationTitle="Display Resolution"
    >
      {sections.map((section) => (
        <List.Section key={section.title} title={section.title}>
          {section.presets.map((preset) => (
            <List.Item
              key={preset.name}
              title={preset.name}
              subtitle={preset.description}
              icon={preset.icon}
              actions={<PresetActions preset={preset} />}
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
}
