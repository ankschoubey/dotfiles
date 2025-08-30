# Gemini Usage Guidelines

This document outlines conventions and best practices for interacting with the Gemini AI assistant within this project.

## Scripting

- **Environment Variables**: All shell scripts that reference other files within this repository should use the `$DOTFILES_ROOT` environment variable to construct absolute paths. This ensures that scripts are executable from any directory.

- **Example**:

  ```bash
  # Incorrect
  source "scripts/utils.sh"

  # Correct
  source "$DOTFILES_ROOT/scripts/utils.sh"
  ```
