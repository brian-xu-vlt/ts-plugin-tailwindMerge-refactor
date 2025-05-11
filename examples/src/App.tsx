import type React from 'react';
import { useState } from 'react';
import { ExampleComponent } from './ExampleComponent';

export const App: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tailwind Merge Plugin Demo</h1>

      <div className="mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
          onClick={() => setIsActive(!isActive)}
        >
          Toggle Active: {isActive ? 'On' : 'Off'}
        </button>

        <button
          className="px-4 py-2 bg-gray-500 text-white rounded"
          onClick={() => setIsDisabled(!isDisabled)}
        >
          Toggle Disabled: {isDisabled ? 'On' : 'Off'}
        </button>
      </div>

      <ExampleComponent isActive={isActive} isDisabled={isDisabled} />

      <div className="mt-8 p-4 bg-yellow-100 rounded border border-yellow-400">
        <h3 className="font-semibold">How to use the plugin:</h3>
        <ol className="list-decimal ml-5 mt-2">
          <li>Place your cursor inside a className string</li>
          <li>Use the refactoring command (Ctrl+. or Cmd+.)</li>
          <li>Select "Wrap className with tailwindMerge helper"</li>
        </ol>
      </div>
    </div>
  );
};
