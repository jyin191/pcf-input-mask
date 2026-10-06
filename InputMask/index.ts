import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { applyMask, formatPhone, normalizePhone } from "./maskUtils";

export class InputMaskControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private container: HTMLDivElement;
  private input: HTMLInputElement;
  private notifyOutputChanged: () => void;
  private currentValue = "";
  private mask = "";
  private placeholderChar = "_";
  private allowExtraDigits = true;
  private isPhone = false;

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement,
  ): void {
    this.container = container;
    this.notifyOutputChanged = notifyOutputChanged;

    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.className = "input-mask-control-input";
    this.input.setAttribute("autocomplete", "off");
    this.input.setAttribute("aria-label", "Masked input");
    this.input.addEventListener("input", this.handleInput);
    this.input.addEventListener("blur", this.handleBlur);

    const wrapper = document.createElement("div");
    wrapper.className = "input-mask-control";
    wrapper.appendChild(this.input);
    this.container.appendChild(wrapper);

    this.updateView(context);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    const value = context.parameters.value?.raw ?? "";
    const rawMask = context.parameters.mask?.raw ?? "";
    const placeholder = context.parameters.placeholderChar?.raw ?? "_";

    this.mask = rawMask.trim();
    this.placeholderChar = this.cleanPlaceholder(placeholder);
    this.allowExtraDigits = context.parameters.allowExtraDigits?.raw ?? true;
    this.isPhone = context.parameters.phoneFormatting?.raw ?? true;
    // Disabled covers locked forms and read-only fields in model-driven apps and DisplayMode in canvas apps.
    this.input.readOnly =
      context.mode.isControlDisabled || context.parameters.value?.security?.editable === false;

    // The host echoes back older values while the user is typing; local state wins until blur.
    if (document.activeElement === this.input) {
      return;
    }

    this.currentValue = this.isPhone
      ? normalizePhone(value ?? "", this.placeholderChar)
      : (value ?? "");
    this.input.value = this.format(this.currentValue);
  }

  public getOutputs(): IOutputs {
    return { value: this.currentValue };
  }

  public destroy(): void {
    this.input.removeEventListener("input", this.handleInput);
    this.input.removeEventListener("blur", this.handleBlur);
    this.container.innerHTML = "";
  }

  private handleInput = (): void => {
    const caret = this.input.selectionStart ?? this.input.value.length;
    const rawBeforeCaret = this.toRaw(this.input.value.slice(0, caret)).length;

    this.currentValue = this.toRaw(this.input.value);
    this.input.value = this.format(this.currentValue);
    this.restoreCaret(rawBeforeCaret);
    this.notifyOutputChanged();
  };

  private handleBlur = (): void => {
    this.currentValue = this.toRaw(this.input.value);
    this.input.value = this.format(this.currentValue);
    this.notifyOutputChanged();
  };

  // Puts the caret right after the Nth entered character of the reformatted text.
  private restoreCaret(rawCount: number): void {
    if (document.activeElement !== this.input) {
      return;
    }

    const text = this.input.value;
    let position = 0;
    while (position < text.length && this.toRaw(text.slice(0, position)).length < rawCount) {
      position += 1;
    }
    this.input.setSelectionRange(position, position);
  }

  private toRaw(text: string): string {
    return this.isPhone
      ? normalizePhone(text, this.placeholderChar)
      : this.extractRawValue(text, this.mask);
  }

  private format(raw: string): string {
    return this.isPhone
      ? formatPhone(raw, this.mask, this.placeholderChar, this.allowExtraDigits)
      : applyMask(raw, this.mask, this.placeholderChar, this.allowExtraDigits);
  }

  private cleanPlaceholder(value: string): string {
    return value && value.length > 0 ? value.substring(0, 1) : "_";
  }

  private extractRawValue(value: string, mask: string): string {
    if (!mask) {
      return value ?? "";
    }

    const allowedTokens = new Set(["#", "0", "A", "L", "X", "9"]);
    const literals = new Set(Array.from(mask).filter((char) => !allowedTokens.has(char)));
    return Array.from(value ?? "")
      .filter((char) => !literals.has(char) && char !== this.placeholderChar)
      .join("");
  }
}
