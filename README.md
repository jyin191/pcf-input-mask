# Input Mask PCF Control

This project provides a reusable PCF solution for input masking in both canvas apps and model-driven forms. It behaves like the *retired* Input Mask concept, but is built for modern Power Apps and keeps the raw value separate from the display formatting.

## What this solves

- Enforces a consistent format on text inputs
- Works with phone, SSN, ZIP, postal, time, and custom patterns defined by a mask
- Keeps the stored value clean for downstream validation and Dataverse integration
- Works in both canvas and model-driven form scenarios without adding an external UI library
- Can be added to single-line text and phone fields

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | bound | - | The field the control is bound to |
| `mask` | text | `(###) ###-####` | Mask pattern, built from the tokens below |
| `phoneFormatting` | yes/no | `true` | Treats the value as a phone number: accepts `+` international numbers and drops a leading `1`. Turn off for SSN, postal codes, and other masks |
| `placeholderChar` | text | `_` | Single character shown for unfilled slots (only the first character is used) |
| `allowExtraDigits` | yes/no | `true` | When `true`, characters beyond the mask's slots are kept after the last slot. When `false`, they are dropped |

## Mask patterns

There are no presets. Set `mask` to the pattern you want, for example:

| Use | Mask |
| --- | --- |
| Phone | `(###) ###-####` |
| SSN | `###-##-####` |
| ZIP+4 | `#####-####` |
| Canadian postal code | `L#L #L#` |
| Time | `##:##` |

Mask tokens:

| Token | Accepts |
| --- | --- |
| `#`, `0`, `9` | A digit |
| `A` | A letter or digit |
| `L` | A letter |
| `X` | Any character |

Any other character in the mask is a literal separator.

## Phone formatting

These rules apply only when `phoneFormatting` is on. Turn it off for non-phone masks: a leading `1` would otherwise be dropped from values such as an SSN.

- **US numbers:** digits are formatted with the mask. A leading `1` is treated as the country or trunk prefix and is removed, so `1-800-555-1234` is stored as `8005551234`.
- **International numbers:** if the text contains a `+`, the mask is skipped. The value is stored as `+` followed by digits (up to 15, the E.164 limit) and shown as typed, for example `+442071838750`.
- **Letters:** letters are ignored. They are not converted to digits, and extension markers such as `x` or `ext` are not kept. With `allowExtraDigits` on, `1-800-555-1234 x22` is stored as `800555123422`.

## Typing behavior

- The input is read-only whenever the host disables the control: a locked form or read-only field in model-driven apps, a non-edit `DisplayMode` in canvas apps, or field-level security without update access.
- Fast typing is supported. While the field has focus, the control ignores values the host sends back and syncs again when the field loses focus.
- The caret stays in place when you edit in the middle of a number.
- The full mask is shown with placeholders (for example `(___) ___-____`) and filled in as you type.

## Example property values

- `mask`: `(###) ###-####`
- `phoneFormatting`: `true`
- `placeholderChar`: `_`
- `allowExtraDigits`: `true`

## Build and validate

```bash
npm install
node --test .\InputMask\maskUtils.test.js
npm run build
```

## Project layout

- `InputMask/` - control source (manifest, `index.ts`, mask engine, CSS, strings)
- `solution/InputMaskSolution/` - solution project (publisher `JY`, prefix `jy`)
- `dist/` - packaged `InputMaskSolution_Managed.zip` and `InputMaskSolution_Unmanaged.zip`

## Deploy to Power Apps

1. Build the project successfully.
2. Import `dist/InputMaskSolution_Unmanaged.zip` (dev) or `dist/InputMaskSolution_Managed.zip` (production) into your environment.
3. Add the control to a text or phone field in a canvas app or a model-driven form.
4. Bind the field to the `value` property.
5. Set `mask` to the format you want, and turn `phoneFormatting` off if it isn't a phone number.

When you publish a new version, raise both the control version in `InputMask/ControlManifest.Input.xml` and the solution version in `Solution.xml`. Otherwise the import may not update the control.

## Recommended usage patterns

- Phone numbers: `mask = (###) ###-####` with `phoneFormatting` on
- Social security numbers: `mask = ###-##-####` with `phoneFormatting` off
- Postal codes: `mask = #####-####` or `L#L #L#` with `phoneFormatting` off
- Times: `mask = ##:##` with `phoneFormatting` off
- Free-form masking: any pattern built from the tokens above, with `phoneFormatting` off

## Notes

The underlying value is stored as the raw, unformatted content while the display is masked. This makes it safer for validation, formulas, and Dataverse storage than rendering the masked string directly as the bound value. In phone formatting, international numbers are stored as `+` followed by digits.
