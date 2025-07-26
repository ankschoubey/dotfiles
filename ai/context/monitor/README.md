# Monitor Scripts

This directory (`ai/context/monitor`) contains executable scripts that can be used to monitor tasks within the `context` CLI tool.

## How to Create a New Monitor Script

To create a new monitor script, follow these guidelines:

1.  **Create a new file** in this directory (e.g., `my_monitor.sh`, `check_service.py`). The file name should be descriptive of its function.
2.  **Make it Executable:** Ensure the script is executable.
    ```bash
    chmod +x ai/context/monitor/your_script_name.sh
    ```
3.  **Output Format:** The script **must** output JSON to `stdout` with the following keys. Each line of output should be a valid JSON object.

    *   `status` (string, **required**): The current status of the monitor. Recommended values:
        *   `starting`: The monitor is initializing.
        *   `needsInputs`: The monitor requires user input (e.g., a duration).
        *   `running`: The monitor is actively performing its task.
        *   `closing`: The monitor is shutting down.
        *   `completed`: The monitor's task has finished successfully.
        *   `error`: The monitor encountered an error.
    *   `message` (string, **required**): A human-readable message describing the current state. This message will be displayed in the `fzf` preview.
    *   `estimated_time` (string, optional): An estimated time remaining for the task (e.g., "10s", "5m"). Useful for `running` status.
    *   `progress` (string, optional): A percentage of completion (e.g., "50%"). Useful for `running` status.

    **Example of JSON output:**
    ```json
    {"status": "running", "message": "Checking service health...", "progress": "25%"}
    {"status": "completed", "message": "Service is healthy."}
    {"status": "error", "message": "Service failed to start."}
    ```

4.  **Handle Arguments:** Your script will receive arguments from the `context` tool. The first argument (`$1`) will be any user-provided arguments (e.g., duration for a timer). The second argument (`$2`) will be the `task_id` that the monitor is associated with. You can use this `task_id` to create task-specific log files.

    **Example `timer.sh` (simplified):**
    ```bash
    #!/bin/bash

    DURATION=${1:-0}
    TASK_ID=${2:-"unknown"}
    MONITOR_LOG_FILE="$(dirname "$0")"/../monitor_logs/task_"${TASK_ID}"_timer.log"

    # Ensure the log directory exists
    mkdir -p "$(dirname "$MONITOR_LOG_FILE")"

    output_json() {
      local status="$1"
  local message="$2"
  local estimated_time="${3:-}"
  local progress="${4:-}"

  JSON_OUTPUT="{\"status\": \"$status\", \"message\": \"$message\""
  if [ -n "$estimated_time" ]; then
    JSON_OUTPUT+=", \"estimated_time\": \"$estimated_time\""
  fi
  if [ -n "$progress" ]; then
    JSON_OUTPUT+=", \"progress\": \"$progress\""
  fi
  JSON_OUTPUT+="}"
  echo "$JSON_OUTPUT" | tee -a "$MONITOR_LOG_FILE"
    }

    if [ "$DURATION" -le 0 ]; then
      output_json "needsInputs" "Please provide a duration in seconds."
  exit 1
    fi

    output_json "starting" "Timer started for $DURATION seconds."

    # ... (your monitoring logic here, calling output_json periodically) ...

    output_json "completed" "Timer finished."

    ```

By following these instructions, you can create new monitor scripts that integrate seamlessly with the `context` CLI tool's monitoring feature.
