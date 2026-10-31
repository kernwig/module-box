import {
  App,
  Plugin,
  PluginSettingTab,
  Setting,
  debounce,
  normalizePath,
} from "obsidian";
import { SquareCallerView, VIEW_TYPE } from "./view.ts";
import {
  SquareCallerSettings,
  defaultSettings,
  normalizeSettings,
} from "./settings.ts";
import { MODULES_ROOT } from "./vault.ts";

export default class SquareCallerPlugin extends Plugin {
  settings: SquareCallerSettings = defaultSettings();

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(VIEW_TYPE, (leaf) => new SquareCallerView(leaf, this));

    this.addRibbonIcon("music", "Open Square Caller", () => this.activateView());

    // Obsidian shows the plugin name before command names, so they omit it.
    this.addCommand({
      id: "open-square-caller",
      name: "Open caller view",
      callback: () => this.activateView(),
    });

    this.addCommand({
      id: "reload-square-caller-modules",
      name: "Reload modules",
      callback: () => this.reloadAllViews(),
    });

    this.addSettingTab(new SquareCallerSettingTab(this.app, this));
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
      if (v instanceof SquareCallerView) void v.reloadModules();
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

class SquareCallerSettingTab extends PluginSettingTab {
  /** Reload once typing in the folder field pauses, not on every keystroke. */
  private reloadSoon = debounce(() => this.plugin.reloadAllViews(), 600, true);

  constructor(app: App, private plugin: SquareCallerPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Modules folder")
      .setDesc("Vault folder that holds the choreography modules, including its subfolders.")
      .addText((t) =>
        t
          .setPlaceholder(MODULES_ROOT)
          .setValue(this.plugin.settings.modulesRoot)
          .onChange(async (v) => {
            this.plugin.settings.modulesRoot = cleanFolderPath(v);
            await this.plugin.saveSettings();
            this.reloadSoon();
          }),
      );
  }
}
