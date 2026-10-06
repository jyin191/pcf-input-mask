# Model-driven field example

## Example: phone number field

1. Create or open a table field of type Single Line of Text.
2. Open the field properties.
3. Select the Input Mask PCF control.
4. Configure the control:

```text
mask = (###) ###-####
phoneFormatting = true
placeholderChar = _
```

### Expected behavior

- User enters `1234567890`
- Field display becomes `(123) 456-7890`
- Value persisted in the underlying field is `1234567890`

## Example: custom business format

```text
mask = ####-AA-##
phoneFormatting = false
placeholderChar = _
```

This allows entries like `1234-AB-56` while keeping the stored value clean.
