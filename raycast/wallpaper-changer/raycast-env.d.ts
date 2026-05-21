/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Wallpaper Directory - Path to your wallpaper directory. Defaults to $DOTFILES_ROOT/wallpaper */
  "wallpaperDir": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `wallpaper-changer` command */
  export type WallpaperChanger = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `wallpaper-changer` command */
  export type WallpaperChanger = {}
}

