import type React from 'react';
import { tailwindMerge } from './utils';

interface ExampleProps {
  isActive?: boolean;
  isDisabled?: boolean;
}

export const ExampleComponent: React.FC<ExampleProps> = ({
  isActive = false,
  isDisabled = false,
}) => {
  // Example 1: Plain string className (can be refactored by the plugin)
  return (
    <div>
      <h2>Tailwind Refactor Plugin Examples</h2>

      {/* Example 1: Regular className as a string */}
      <div className="p-4 m-2 bg-gray-100 rounded-md shadow-sm">
        This div uses a regular className string.
        <p className={tailwindMerge('text-sm text-gray-600 mt-2')}>
          You can use the refactor tool to convert this to use tailwindMerge
        </p>
      </div>

      {/* Example 2: Using tailwindMerge function with conditional classes */}
      <div
        className={tailwindMerge(
          'p-4 m-2 rounded-md shadow-sm',
          isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800',
          isDisabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        This div already uses the tailwindMerge function.
        <p className="text-sm mt-2">
          This approach helps avoid class conflicts and enables conditional
          styling.
        </p>
      </div>
    </div>
  );
};
