import {
  App,
  Plugin,
  PluginSettingTab,
  SettingDefinitionItem,
  addIcon,
  debounce,
  normalizePath,
} from "obsidian";
import { ModuleBoxView, VIEW_TYPE } from "./view.ts";
import {
  ModuleBoxSettings,
  defaultSettings,
  normalizeSettings,
} from "./settings.ts";
import { MODULES_ROOT } from "./vault.ts";
import { ICON_ID, ICON_SVG } from "./icon.ts";

export default class ModuleBoxPlugin extends Plugin {
  settings: ModuleBoxSettings = defaultSettings();

  async onload(): Promise<void> {
    await this.loadSettings();

    addIcon(ICON_ID, ICON_SVG);

    this.registerView(VIEW_TYPE, (leaf) => new ModuleBoxView(leaf, this));

    this.addRibbonIcon(ICON_ID, "Open Module Box", () => this.activateView());

    // Obsidian shows the plugin name before command names, so they omit it.
    this.addCommand({
      id: "open-view",
      name: "Open Module Box",
      callback: () => this.activateView(),
    });

    this.addCommand({
      id: "reload-modules",
      name: "Reload modules",
      callback: () => this.reloadAllViews(),
    });

    this.addSettingTab(new ModuleBoxSettingTab(this.app, this));
  }

  onunload(): void {
    // Leaves are detached automatically; nothing else to clean up.
  }

  async activateView(): Promise<void> {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getLeaf(true);
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }
    await workspace.revealLeaf(leaf);
  }

  reloadAllViews(): void {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
      const v = leaf.view;
      if (v instanceof ModuleBoxView) void v.reloadModules();
    }
  }

  async loadSettings(): Promise<void> {
    this.settings = normalizeSettings(await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}

/** Clean a user-typed vault folder path; blank falls back to the default. */
export function cleanFolderPath(raw: string): string {
  const p = normalizePath(raw.trim());
  return p === "" || p === "/" ? MODULES_ROOT : p;
}

class ModuleBoxSettingTab extends PluginSettingTab {
  /** Reload once typing in the folder field pauses, not on every keystroke. */
  private reloadSoon = debounce(() => this.plugin.reloadAllViews(), 600, true);

  constructor(app: App, private plugin: ModuleBoxPlugin) {
    super(app, plugin);
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        name: "Modules folder",
        desc: "Vault folder that holds the choreography modules, including its subfolders.",
        control: { type: "folder", key: "modulesRoot", placeholder: MODULES_ROOT },
      },
    ];
  }

  getControlValue(key: string): unknown {
    return key === "modulesRoot" ? this.plugin.settings.modulesRoot : undefined;
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    if (key !== "modulesRoot" || typeof value !== "string") return;
    this.plugin.settings.modulesRoot = cleanFolderPath(value);
    await this.plugin.saveSettings();
    this.reloadSoon();
  }
}
