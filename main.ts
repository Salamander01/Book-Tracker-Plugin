import {App, Plugin, PluginSettingTab, Setting} from 'obsidian';

interface pluginSettings {
	bibliographicRecordLocation: string;
}

const DEFAULT_SETTINGS: pluginSettings = {
	bibliographicRecordLocation: "Bibliographic"
}

export default class bookPlugin extends Plugin {
	settings: pluginSettings;

	// Plugin Methods

	async onload() {
		await this.loadSettings();

		this.ribbonDebugIcon();

		// TODO add bibliographic entry
		this.addCommand({
			id: "add-bibliographic-entry",
			name: "Add Bibliographic Entry",
			callback: () => {
				throw new Error("NOT IMPLEMENTED");
			}
		});

		// This adds the settings tab
		this.addSettingTab(new BookPluginSettingsTab(this.app, this));


		// Unclear what a global DOM event is, but on the change I accidentally use one, I'm leaving this in
		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// Unclear to me what an interval is and what I might use one for
		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

	}

	onunload() {
		// TODO determine what should go here
	}

	// Debug Methods

	ribbonDebugIcon() {
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Debug Button', (evt: MouseEvent) => {
			console.log("DEBUG CONTENT HERE");
			// new BooleanPromptModal(this.app, "Yes or No?!", (result) => new Notice(String(result))).open();
			// new NoticeModal(this.app, "NOTICE! Something important").open();
			// new SingleTextSubmissionModal(this.app, "Lorem Ipsum", "TEST", (result) => new NoticeModal(this.app, result).open()).open();
		});
		// Allows manipulation through CSS (the one use I am aware of for this command)
		ribbonIconEl.addClass('my-plugin-ribbon-class');
	}

	// Utility Methods

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class BookPluginSettingsTab extends PluginSettingTab {
	plugin: bookPlugin;

	constructor(app: App, plugin: bookPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		let recordLocationSetting = new Setting(containerEl);
		recordLocationSetting.setName("Bibliographic Records File Path");
		recordLocationSetting.setDesc("Controls where the plugin looks for and saves bibliographic records");
		recordLocationSetting.addText((text) => {
			text.onChange(async (value) => {
				this.plugin.settings.bibliographicRecordLocation = value;
				await this.plugin.saveSettings();
			});
		});
	}
}
