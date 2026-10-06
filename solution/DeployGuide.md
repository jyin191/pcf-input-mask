# Dataverse-ready deployment guide

This folder captures the operational steps needed to package and deploy the Input Mask PCF control into a Dataverse / Power Apps environment.

## 1) Build the control

From the project root:

```bash
npm install
npm run build
```

This produces the compiled PCF output in the generated build folder.

## 2) Package the solution

The solution project in `solution/InputMaskSolution` references the PCF project, uses publisher `JY` (prefix `jy`), and builds both package types:

```bash
cd solution/InputMaskSolution
dotnet build -c Release -p:SolutionPackageType=Both
```

Output: `bin/Release/InputMaskSolution.zip` (unmanaged) and `bin/Release/InputMaskSolution_managed.zip`.

## 3) Deploy

Import a zip with `pac solution import --path <zip>`, or push the control directly for development (always pass the prefix, the default is `dev`):

```bash
pac pcf push --publisher-prefix jy
```

## 4) Configure the control on a field

For a text field in a model-driven app:

1. Open the table and field in the maker experience.
2. Choose the field type that supports custom controls.
3. Add the Input Mask control.
4. Set the properties:
   - `mask`: `(###) ###-####`
   - `phoneFormatting`: `true`
   - `placeholderChar`: `_`
5. Save and publish the customization.

## 5) Canvas app usage

In a canvas app:

- Insert the custom component
- Bind the `value` property to a text input or data source field
- Set `mask` as needed, and turn `phoneFormatting` off for non-phone masks

## Validation checklist

- Build succeeds
- Managed solution imports into Dataverse without errors
- The control formats phone, SSN, and custom values correctly
- Stored raw value remains clean for downstream logic
