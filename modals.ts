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

		// TODO add listener that'll submit when enter is hit

		let buttonSetting = new Setting(this.contentEl);
		buttonSetting.addButton((button) => {
			button.setButtonText("Ok");
			button.setCta();
			button.onClick(() => {
				this.close();
				onAck?.();
			});
		});
	}
}

export class BooleanPromptModal extends ExtendedModal {
	constructor(app: App, prompt: string, onSubmit: (result: boolean) => void, trueText: string = "Yes", falseText: string = "No") {
		super(app);
		this.setTitle(prompt);

		this.booleanButtons(trueText, falseText, onSubmit);
	}
}

export class SingleTextSubmissionModal extends ExtendedModal {
	private onCancel: () => void = () => this.close();
	private inputValidator: (input: string) => boolean = () => true;
	private readonly onSubmit: (result: string) => void;

	private invalidNotification = "Invalid Input";
	input: string = "";

	constructor(app: App, prompt: string, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit

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

		this.booleanButtons("Submit", "Cancel", (result) => result ? this.attemptSubmission() : this.onCancel(), settingObj);
	}

	public setOnCancelCallback(callback: () => void) {
		this.onCancel = callback;
	}

	public setInputValidatorCallback(callback: (input: string) => boolean) {
		this.inputValidator = callback;
	}

	public setInvalidNotification(notif: string) {
		this.invalidNotification = notif;
	}

	private attemptSubmission() {
		if (this.inputValidator(this.input)) {
			this.onSubmit(this.input);
			this.close();
		} else {
			new NoticeModal(this.app, this.invalidNotification).open();
		}
	}
}
