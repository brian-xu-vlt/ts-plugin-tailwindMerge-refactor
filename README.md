# ts-plugin-tailwind-refactor

A TypeScript Language Service Plugin for refactoring Tailwind CSS className strings into tailwindMerge function calls.

## Features

- Adds a refactoring action to VS Code for className attributes in JSX/TSX files
- Transforms regular string className values into tailwindMerge function calls
- Makes it easier to add conditional class logic for Tailwind CSS projects

## Installation

```bash
npm install --save-dev ts-plugin-tailwind-refactor
```

## Configuration

Add the plugin to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "ts-plugin-tailwind-refactor",
        "functionName": "tailwindMerge" // Optional, defaults to "tailwindMerge"
      }
    ]
  }
}
```

## Usage

1. Place your cursor on a className string in a JSX/TSX file
2. Trigger the refactoring menu (Ctrl+. or Cmd+. in VS Code)
3. Select "Wrap className with tailwindMerge helper"

The plugin will transform:

```jsx
<div className="p-4 m-2 bg-gray-100">Content</div>
```

into:

```jsx
<div className={tailwindMerge("p-4 m-2 bg-gray-100")}>Content</div>
```

## Example

Check out the [examples directory](./examples) for a complete working example of this plugin in action.

### Running the Example

You can run the example using our pnpm workspace setup:

```bash
# Install dependencies for the example
pnpm run examples:install

# Build the example
pnpm run examples:build

# Start the example in watch mode
pnpm run examples:start
```

Alternatively, you can open the workspace file in VS Code and use the pre-configured tasks:

```bash
code ts-plugin-tailwind-refactor.code-workspace
```

Then press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) and type "Run Task", then select one of the example tasks.

## License

MIT
