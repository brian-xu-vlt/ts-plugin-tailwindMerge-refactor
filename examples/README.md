# Tailwind Refactor Plugin Example

This example demonstrates how to use the `ts-plugin-tailwind-refactor` TypeScript plugin, which helps you refactor plain className strings into tailwindMerge function calls.

## Features Demonstrated

This example shows:

1. A component with plain string className attributes (which can be refactored by the plugin)
2. A component that already uses the tailwindMerge function to handle conditional classes

## How to Run

1. Install dependencies:
   ```
   npm install
   ```

2. Build the project:
   ```
   npm run build
   ```

3. Serve the HTML file with your preferred local server

## How to Use the Plugin

When editing a TSX file:

1. Place your cursor inside a `className` string attribute
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

This transformation makes it easier to conditionally apply classes later, and helps avoid class conflicts using the tailwind-merge library.
