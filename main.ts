import { Plugin, TFile, normalizePath } from 'obsidian';
import {
	SmartFileManagerSettings,
	DEFAULT_SETTINGS,
	SmartFileManagerSettingTab,
} from './settings';

export default class SmartFileManagerPlugin extends Plugin {
	settings: SmartFileManagerSettings;
	private movingFiles: Set<string> = new Set();

	async onload() {
		await this.loadSettings();

		// Add settings tab
		this.addSettingTab(new SmartFileManagerSettingTab(this.app, this));

		console.log('Loading Smart File Manager plugin');

		// Listen to metadata cache changes instead of file modifications
		// This ensures the frontmatter is parsed before we try to read it
		this.registerEvent(
			this.app.metadataCache.on('changed', async (file) => {
				if (file instanceof TFile && file.extension === 'md') {
					await this.handleFileModification(file);
				}
			})
		);

		// Also listen to file creation events
		this.registerEvent(
			this.app.vault.on('create', async (file) => {
				if (file instanceof TFile && file.extension === 'md') {
					// Wait a bit for metadata to be processed
					await new Promise((resolve) => setTimeout(resolve, 100));
					await this.handleFileModification(file);
				}
			})
		);
	}

	onunload() {
		console.log('Unloading Smart File Manager plugin');
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async handleFileModification(file: TFile) {
		// Check if plugin is enabled
		if (!this.settings.enabled) {
			return;
		}

		// Prevent infinite loops - if we're already moving this file, skip
		if (this.movingFiles.has(file.path)) {
			return;
		}

		const frontmatter =
			this.app.metadataCache.getFileCache(file)?.frontmatter;

		if (!frontmatter) {
			return;
		}

		// Get the property value
		const propertyValue = frontmatter[this.settings.propertyName];

		if (!propertyValue) {
			return;
		}

		// Handle different property value types
		let mainFolderValue: string | null = null;
		let subfolderValue: string | null = null;

		if (typeof propertyValue === 'string') {
			mainFolderValue = propertyValue;
		} else if (Array.isArray(propertyValue) && propertyValue.length > 0) {
			// If it's an array, use the first value
			mainFolderValue =
				typeof propertyValue[0] === 'string'
					? propertyValue[0]
					: String(propertyValue[0]);
		} else {
			mainFolderValue = String(propertyValue);
		}

		// Get subfolder value if enabled
		if (this.settings.useSubfolders) {
			const subfolderProp = frontmatter[this.settings.subfolderProperty];
			if (subfolderProp) {
				if (typeof subfolderProp === 'string') {
					subfolderValue = subfolderProp;
				} else if (Array.isArray(subfolderProp) && subfolderProp.length > 0) {
					subfolderValue =
						typeof subfolderProp[0] === 'string'
							? subfolderProp[0]
							: String(subfolderProp[0]);
				} else {
					subfolderValue = String(subfolderProp);
				}
			}
		}

		if (mainFolderValue) {
			await this.moveFileToFolder(file, mainFolderValue, subfolderValue);
		}
	}

	normalizeFolderName(name: string): string {
		if (this.settings.normalizeFolderNames) {
			// Convert to lowercase and replace invalid characters
			return name
				.toLowerCase()
				.trim()
				.replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove invalid filename characters
				.replace(/\s+/g, '-') // Replace spaces with hyphens
				.replace(/-+/g, '-') // Replace multiple hyphens with single
				.replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
		}
		return name.trim();
	}

	async moveFileToFolder(
		file: TFile,
		mainFolderValue: string,
		subfolderValue: string | null = null
	) {
		try {
			// Mark this file as being moved to prevent infinite loops
			this.movingFiles.add(file.path);

			// Normalize folder names
			const mainFolder = this.normalizeFolderName(mainFolderValue);

			// Validate folder name
			if (!mainFolder || mainFolder.length === 0) {
				console.warn(
					`Invalid folder name from property "${this.settings.propertyName}": "${mainFolderValue}"`
				);
				return;
			}

			// Build target folder path
			let targetFolderPath = mainFolder;

			// Add subfolder if enabled and value exists
			if (this.settings.useSubfolders && subfolderValue) {
				const subfolder = this.normalizeFolderName(subfolderValue);
				if (subfolder && subfolder.length > 0) {
					targetFolderPath = normalizePath(`${mainFolder}/${subfolder}`);
				}
			}

			// Add base folder if specified
			if (this.settings.baseFolder) {
				const baseFolder = this.normalizeFolderName(
					this.settings.baseFolder
				);
				if (baseFolder && baseFolder.length > 0) {
					targetFolderPath = normalizePath(`${baseFolder}/${targetFolderPath}`);
				}
			}

			// Normalize the final path
			targetFolderPath = normalizePath(targetFolderPath);

			// Check if folder exists, create if it doesn't
			let targetFolder =
				this.app.vault.getAbstractFileByPath(targetFolderPath);

			if (!targetFolder && this.settings.createFolders) {
				try {
					await this.app.vault.createFolder(targetFolderPath);
					targetFolder =
						this.app.vault.getAbstractFileByPath(targetFolderPath);
				} catch (error) {
					console.error(
						`Failed to create folder ${targetFolderPath}:`,
						error
					);
					return;
				}
			} else if (!targetFolder && !this.settings.createFolders) {
				console.warn(
					`Target folder does not exist and auto-create is disabled: ${targetFolderPath}`
				);
				return;
			}

			const currentPath = file.path;
			const targetPath = normalizePath(`${targetFolderPath}/${file.name}`);

			// Only move if the file is not already in the correct location
			if (currentPath !== targetPath) {
				try {
					await this.app.fileManager.renameFile(file, targetPath);
					console.log(`Moved ${file.name} to ${targetPath}`);
				} catch (error) {
					console.error(`Failed to move file ${file.name}:`, error);
				}
			}
		} finally {
			// Remove from moving set after a short delay to allow events to settle
			setTimeout(() => {
				this.movingFiles.delete(file.path);
			}, 500);
		}
	}
}
