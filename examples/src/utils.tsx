import { twMerge } from 'tailwind-merge';

/**
 * Helper function to merge Tailwind CSS classes
 * This is the function used by the ts-plugin-tailwind-refactor plugin
 */
export function tailwindMerge(...classes: string[]) {
  return twMerge(...classes);
}
