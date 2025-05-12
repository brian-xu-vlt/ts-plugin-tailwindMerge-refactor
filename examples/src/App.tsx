import type React from 'react';
import { useState } from 'react';
import { tailwindMerge } from './utils';

export const App: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <div>
      <h2>Tailwind Refactor Plugin Examples</h2>

      {/* ✅ Example 1: Regular className as a string */}
      <div className={'p-4 m-2 bg-gray-100 rounded-md shadow-sm'}>
        This div uses a regular className string.
        {/* ✅ Example 2: Braced className as a string */}
        <p className={'text-sm text-gray-600 mt-2'}>
          You can use the refactor tool to convert this to use tailwindMerge
        </p>
      </div>

      {/* 🔴 Example: TailwindMerge function with multiple string arguments, will not offer code action */}
      <div
        className={tailwindMerge(
          'p-4 m-2 rounded-md shadow-sm',
          isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800',
          isDisabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        This div already uses the tailwindMerge function.
        {/* ✅ Example 3: TailwindMerge function with single string argument */}
        <p className={tailwindMerge('text-sm mt-2')}>
          This approach helps avoid class conflicts and enables conditional
          styling.
        </p>
      </div>
    </div>
  );
};
