import { Form, ActionPanel, Action, showToast, Toast, open } from "@raycast/api";

export function KillPortInput() {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Kill Process"
            onSubmit={async (values: { port: string }) => {
              if (!values.port) {
                await showToast({ style: Toast.Style.Failure, title: "Port required" });
                return;
              }
              const encodedPort = encodeURIComponent(JSON.stringify({ port: values.port }));
              await showToast({ style: Toast.Style.Animated, title: "Opening Port Manager..." });
              await open(`raycast://extensions/lucaschultz/port-manager/kill-listening-process?arguments=${encodedPort}`);
            }}
            shortcut={{ modifiers: ["cmd"], key: "enter" }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="port"
        title="Port"
        placeholder="Enter port number (e.g. 3000)"
      />
    </Form>
  );
}
