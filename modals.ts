import {App, Modal, Setting} from "obsidian";

abstract class ExtendedModal extends Modal {

	/**
	 * @param trueText
	 * @param falseText
	 * @param onSubmit
	 * @param setting quite possibly not needed, but could be useful
	 * @protected
	 */
	protected booleanButtons(trueText: string, falseText: string, onSubmit: (result: boolean) => void, setting: Setting = new Setting(this.contentEl)) {
		// False button
		setting.addButton((button) => {
			button.buttonEl.addClass("false-button-class");
			button.setButtonText(falseText);
			button.onClick(() => onSubmit(false));
		});

		// True button
		setting.addButton((button) => {
			button.buttonEl.addClass("true-button-class");
			button.setButtonText(trueText);
			button.setCta();
			button.onClick(() => onSubmit(true));
		});
	}
}

export class NoticeModal extends Modal {
	constructor(app: App, message: string, onAck?: () => void) {
		super(app);
		this.setTitle(message);

		let buttonSetting = new Setting(this.contentEl);
		buttonSetting.addButton((button) => {
			button.setButtonText("Ok");
			button.setCta();
			button.onClick(() => {
				this.close();
				onAck?.();
			});
		});

		this.open();
	}
}

export class BooleanPromptModal extends ExtendedModal {
	constructor(app: App, prompt: string, onSubmit: (result: boolean) => void, trueText: string = "Yes", falseText: string = "No") {
		super(app);
		this.setTitle(prompt);

		this.booleanButtons(trueText, falseText, onSubmit);
	}
}

export class AsyncBooleanPromptModal extends ExtendedModal {
	private resolvePromise: (value: boolean) => void;

	constructor(app: App, prompt: string, trueText: string = "Yes", falseText: string = "No") {
		super(app);
		this.setTitle(prompt);

		this.booleanButtons(trueText, falseText, (result) => this.resolvePromise(result));

		this.open();
	}

	async getInput(): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			this.resolvePromise = resolve;
		});
	}
}

export class SingleTextSubmissionModal extends ExtendedModal {
	private resolvePromise: (value: string | null) => void;
	private readonly inputPromise: Promise<string | null>;

	private inputValidator: (input: string) => boolean = () => true;
	private invalidCallback: (input: string) => void = () => new NoticeModal(this.app, "Invalid Input");

	private input: string = "";


	constructor(app: App, prompt: string) {
		super(app);

		this.inputPromise = new Promise<string | null>((resolve) => {
			this.resolvePromise = resolve;
		});

		this.setTitle(prompt);

		let settingObj = new Setting(this.contentEl);

		settingObj.addText((textComponent) => {
			textComponent.onChange((value) => this.input = value);
			textComponent.inputEl.style.width = "100%"; // Didn't make it span the entire width. More fiddling with css necessary
			textComponent.inputEl.addEventListener("keydown", (event: KeyboardEvent) => {
				if (event.key === "Enter") {
					event.preventDefault();
					this.attemptSubmission();
				}
			});
		});

		this.booleanButtons("Submit", "Cancel", (result) => result ? this.attemptSubmission() : this.resolvePromise(null), settingObj);

		this.open();
	}

	public async getInput(): Promise<string | null> {
		return this.inputPromise;
	}

	private attemptSubmission() {
		if (this.inputValidator(this.input)) {
			this.resolvePromise(this.input);
			this.close();
		} else {
			this.invalidCallback(this.input);
		}
	}

	public setInputValidator(callback: (input: string) => boolean) {
		this.inputValidator = callback;
	}

	public setInvalidInputCallback(callback: (input: string) => void) {
		this.invalidCallback = callback;
	}
}
