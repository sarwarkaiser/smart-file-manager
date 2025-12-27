import { App, PluginSettingTab, Setting } from 'obsidian';
import TopicMoverPlugin from './main';

export interface TopicMoverSettings {
	enabled: boolean;
	propertyName: string;
	baseFolder: string;
	useSubfolders: boolean;
	subfolderProperty: string;
	normalizeFolderNames: boolean;
	createFolders: boolean;
}

export const DEFAULT_SETTINGS: TopicMoverSettings = {
	enabled: true,
	propertyName: 'topic',
	baseFolder: '',
	useSubfolders: false,
	subfolderProperty: 'subtopic',
	normalizeFolderNames: true,
	createFolders: true,
};

export class TopicMoverSettingTab extends PluginSettingTab {
	plugin: TopicMoverPlugin;

	constructor(app: App, plugin: TopicMoverPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Topic Mover Settings' });

		containerEl.createEl('p', {
			text: 'Automatically organize your notes by moving them to folders based on frontmatter properties.',
			cls: 'setting-item-description',
		});

		// Enable/Disable Toggle
		new Setting(containerEl)
			.setName('Enable Plugin')
			.setDesc('Turn the automatic file moving on or off')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enabled)
					.onChange(async (value) => {
						this.plugin.settings.enabled = value;
						await this.plugin.saveSettings();
					})
			);

		// Property Name
		new Setting(containerEl)
			.setName('Property Name')
			.setDesc(
				'The frontmatter property to use for folder organization (e.g., "topic", "tag", "category")'
			)
			.addText((text) =>
				text
					.setPlaceholder('topic')
					.setValue(this.plugin.settings.propertyName)
					.onChange(async (value) => {
						this.plugin.settings.propertyName = value.trim();
						await this.plugin.saveSettings();
					})
			);

		// Base Folder
		new Setting(containerEl)
			.setName('Base Folder')
			.setDesc(
				'Optional base folder path. Leave empty to use vault root. Example: "Organized"'
			)
			.addText((text) =>
				text
					.setPlaceholder('')
					.setValue(this.plugin.settings.baseFolder)
					.onChange(async (value) => {
						this.plugin.settings.baseFolder = value.trim();
						await this.plugin.saveSettings();
					})
			);

		// Use Subfolders
		new Setting(containerEl)
			.setName('Use Subfolders')
			.setDesc(
				'Create nested subfolders based on an additional property (e.g., topic/subtopic)'
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.useSubfolders)
					.onChange(async (value) => {
						this.plugin.settings.useSubfolders = value;
						await this.plugin.saveSettings();
						this.display(); // Refresh to show/hide subfolder property setting
					})
			);

		// Subfolder Property
		if (this.plugin.settings.useSubfolders) {
			new Setting(containerEl)
				.setName('Subfolder Property')
				.setDesc(
					'The frontmatter property to use for subfolder creation (e.g., "subtopic", "category")'
				)
				.addText((text) =>
					text
						.setPlaceholder('subtopic')
						.setValue(this.plugin.settings.subfolderProperty)
						.onChange(async (value) => {
							this.plugin.settings.subfolderProperty = value.trim();
							await this.plugin.saveSettings();
						})
				);
		}

		// Normalize Folder Names
		new Setting(containerEl)
			.setName('Normalize Folder Names')
			.setDesc(
				'Convert folder names to lowercase and remove special characters for better compatibility'
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.normalizeFolderNames)
					.onChange(async (value) => {
						this.plugin.settings.normalizeFolderNames = value;
						await this.plugin.saveSettings();
					})
			);

		// Create Folders
		new Setting(containerEl)
			.setName('Auto-create Folders')
			.setDesc('Automatically create folders if they do not exist')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.createFolders)
					.onChange(async (value) => {
						this.plugin.settings.createFolders = value;
						await this.plugin.saveSettings();
					})
			);

		// Example Section
		containerEl.createEl('h3', { text: 'Examples' });
		const exampleContainer = containerEl.createEl('div', {
			cls: 'setting-item-description',
		});

		exampleContainer.createEl('p', {
			text: 'Example 1: Simple organization',
		});
		exampleContainer.createEl('pre', {
			text: `---
topic: soccer
---

File will be moved to: soccer/`,
		});

		exampleContainer.createEl('p', {
			text: 'Example 2: With base folder',
		});
		exampleContainer.createEl('pre', {
			text: `Base Folder: "Notes"
Property: "category"

---
category: work
---

File will be moved to: Notes/work/`,
		});

		exampleContainer.createEl('p', {
			text: 'Example 3: With subfolders',
		});
		exampleContainer.createEl('pre', {
			text: `Property: "topic"
Subfolder Property: "subtopic"

---
topic: sports
subtopic: soccer
---

File will be moved to: sports/soccer/`,
		});
	}
}

