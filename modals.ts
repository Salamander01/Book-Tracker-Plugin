import {App, Modal, Setting} from "obsidian";

abstract class ExtendedModal extends Modal {

	/**
	 * Important to note that both buttons close the Modal; maybe should change?
	 * @param trueText
	 * @param falseText
	 * @param onSubmit
	 * @protected
	 */
	protected booleanButtons(trueText: string, falseText: string, onSubmit: (result: boolean) => void) {
		const buttonContainer = this.contentEl.createDiv({
			cls: 'boolean-modal-buttons'
		});

		let buttonSetting = new Setting(buttonContainer);

		// False button
		buttonSetting.addButton((button) => {
			button.buttonEl.addClass("false-button-class");
			button.setButtonText(falseText);
			button.setCta();
			button.onClick(() => {
				this.close();
				onSubmit(false);
			});
		});

		// True button
		buttonSetting.addButton((button) => {
			button.buttonEl.addClass("true-button-class");
			button.setButtonText(trueText);
			button.setCta();
			button.onClick(() => {
				this.close();
				onSubmit(true);
			});
		});

		buttonContainer.createEl('style', {
			text: `
			.boolean-modal-buttons .setting-item {
				display: flex;
				justify-content: center;
				padding: 0;
			}
			.boolean-modal-buttons .setting-item-control {
				width: 100%;
				display: flex;
				justify-content: space-between;
			}
			.boolean-modal-buttons .true-button-class {
				margin-right: auto;
				margin-left: 25%;
			}
			.boolean-modal-buttons .false-button-class {
				margin-left: auto;
				margin-right: 25%;
			}
			.modal-title {
				text-align: center;
			}
			.boolean-modal-buttons {
				margin-top: 20px;
			}
			`
		});
	}
}

export class NoticeModal extends Modal {
	constructor(app: App, prompt: string) {
		super(app);
		this.setTitle(prompt);

		let buttonSetting = new Setting(this.contentEl);
		buttonSetting.addButton((button) => {
			button.setButtonText("Ok");
			button.setCta();
			button.onClick(() => this.close());
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
	constructor(app: App, prompt: string, fieldName: string, onSubmit: (result: string) => void, onCancel: () => void = () => {}) {
		super(app);
		this.setTitle(prompt);

		let input = "";

		let textSetting = new Setting(this.contentEl);
		textSetting.setName(fieldName);
		textSetting.addText((text) => text.onChange((value) => input = value));

		this.booleanButtons("Submit", "Cancel", (result) => result ? onSubmit(input) : onCancel());
	}
}
