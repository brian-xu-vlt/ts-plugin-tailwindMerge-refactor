import * as ts from 'typescript/lib/tsserverlibrary';

function init(modules: { typescript: typeof ts }) {
  const typescript = modules.typescript;

  function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    const proxy: ts.LanguageService = Object.create(null);

    const isValidIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(
      info.config.functionName,
    );
    const functionName = isValidIdentifier
      ? info.config.functionName
      : 'tailwindMerge';

    for (const k in info.languageService) {
      (proxy as any)[k] = (info.languageService as any)[k];
    }

    proxy.getApplicableRefactors = (
      fileName: string,
      positionOrRange: number | ts.TextRange,
      preferences: ts.UserPreferences | undefined,
      triggerReason?: ts.RefactorTriggerReason,
    ) => {
      const prior =
        info.languageService.getApplicableRefactors(
          fileName,
          positionOrRange,
          preferences,
          triggerReason,
        ) || [];

      const sourceFile = info.languageService
        .getProgram()
        ?.getSourceFile(fileName);
      if (!sourceFile) return prior;

      const nodeWithString = findClassNameNodeAtPosition(
        ts,
        sourceFile,
        positionOrRange,
      );
      const nodeWithTailwindMerge = findClassNameWithTailwindMergeAtPosition(
        ts,
        sourceFile,
        positionOrRange,
        functionName,
      );
      const nodeWithBracedString = findClassNameWithBracedStringAtPosition(
        ts,
        sourceFile,
        positionOrRange,
      );

      // If none of the node types was found, return previous refactors
      if (!nodeWithString && !nodeWithTailwindMerge && !nodeWithBracedString)
        return prior;

      const refactor: ts.ApplicableRefactorInfo = {
        name: 'tailwindMergeRefactor',
        description: 'Tailwind className refactoring options',
        actions: [],
      };

      // Add action to wrap with tailwindMerge if we found a string className
      if (nodeWithString) {
        refactor.actions.push({
          name: 'wrapWithTailwindMerge',
          description: 'Wrap className attribute with tailwindMerge',
        });
      }

      // Add action to wrap with tailwindMerge if we found a braced string
      if (nodeWithBracedString) {
        refactor.actions.push({
          name: 'wrapBracedStringWithTailwindMerge',
          description: 'Wrap braced className string with tailwindMerge',
        });
      }

      // Add action to unwrap from tailwindMerge if we found a tailwindMerge call with a single argument
      if (nodeWithTailwindMerge) {
        refactor.actions.push({
          name: 'unwrapFromTailwindMerge',
          description: 'Convert tailwindMerge call back to string',
        });
      }

      // Only add the refactor if we have at least one action
      if (refactor.actions.length > 0) {
        prior.push(refactor);
      }

      return prior;
    };

    proxy.getEditsForRefactor = (
      fileName: string,
      formatOptions: ts.FormatCodeSettings,
      positionOrRange: number | ts.TextRange,
      refactorName: string,
      actionName: string,
      preferences: ts.UserPreferences | undefined,
    ) => {
      if (refactorName !== 'tailwindMergeRefactor') {
        return info.languageService.getEditsForRefactor(
          fileName,
          formatOptions,
          positionOrRange,
          refactorName,
          actionName,
          preferences,
        );
      }

      const sourceFile = info.languageService
        .getProgram()
        ?.getSourceFile(fileName);
      if (!sourceFile) return;

      // Handle the action to wrap with tailwindMerge
      if (actionName === 'wrapWithTailwindMerge') {
        const node = findClassNameNodeAtPosition(
          ts,
          sourceFile,
          positionOrRange,
        );
        if (!node) return;

        const initializer = node.initializer;
        if (!initializer || !ts.isStringLiteral(initializer)) return;

        const newText = `className={${functionName}(${initializer.getText()})}`;

        const change: ts.TextChange = {
          span: {
            start: node.getStart(),
            length: node.getWidth(),
          },
          newText,
        };
        return {
          edits: [
            {
              fileName,
              textChanges: [change],
            },
          ],
        };
      }

      // Handle the action to wrap braced string with tailwindMerge
      if (actionName === 'wrapBracedStringWithTailwindMerge') {
        const node = findClassNameWithBracedStringAtPosition(
          ts,
          sourceFile,
          positionOrRange,
        );
        if (!node) return;

        const jsxExpression = node.initializer as ts.JsxExpression;
        const stringLiteral = jsxExpression.expression as ts.StringLiteral;

        const newText = `className={${functionName}(${stringLiteral.getText()})}`;

        const change: ts.TextChange = {
          span: {
            start: node.getStart(),
            length: node.getWidth(),
          },
          newText,
        };

        return {
          edits: [
            {
              fileName,
              textChanges: [change],
            },
          ],
        };
      }

      // Handle the action to unwrap from tailwindMerge
      if (actionName === 'unwrapFromTailwindMerge') {
        const node = findClassNameWithTailwindMergeAtPosition(
          ts,
          sourceFile,
          positionOrRange,
          functionName,
        );
        if (!node) return;

        const jsxExpression = node.initializer as ts.JsxExpression;
        const callExpression = jsxExpression.expression as ts.CallExpression;
        const stringArg = callExpression.arguments[0] as ts.StringLiteral;

        const newText = `className=${stringArg.getText()}`;

        const change: ts.TextChange = {
          span: {
            start: node.getStart(),
            length: node.getWidth(),
          },
          newText,
        };

        return {
          edits: [
            {
              fileName,
              textChanges: [change],
            },
          ],
        };
      }

      return;
    };

    return proxy;
  }

  function findClassNameNodeAtPosition(
    ts: typeof typescript,
    sourceFile: ts.SourceFile,
    positionOrRange: number | ts.TextRange,
  ): ts.JsxAttribute | undefined {
    const pos =
      typeof positionOrRange === 'number'
        ? positionOrRange
        : positionOrRange.pos;

    function find(node: ts.Node): ts.JsxAttribute | undefined {
      if (
        ts.isJsxAttribute(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === 'className' &&
        node.initializer &&
        ts.isStringLiteral(node.initializer) &&
        pos >= node.getStart() &&
        pos <= node.getEnd()
      ) {
        return node;
      }

      return ts.forEachChild(node, find);
    }

    return find(sourceFile);
  }

  function findClassNameWithTailwindMergeAtPosition(
    ts: typeof typescript,
    sourceFile: ts.SourceFile,
    positionOrRange: number | ts.TextRange,
    functionName: string,
  ): ts.JsxAttribute | undefined {
    const pos =
      typeof positionOrRange === 'number'
        ? positionOrRange
        : positionOrRange.pos;

    function find(node: ts.Node): ts.JsxAttribute | undefined {
      if (
        ts.isJsxAttribute(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === 'className' &&
        node.initializer &&
        ts.isJsxExpression(node.initializer) &&
        node.initializer.expression &&
        ts.isCallExpression(node.initializer.expression) &&
        ts.isIdentifier(node.initializer.expression.expression) &&
        node.initializer.expression.expression.text === functionName &&
        node.initializer.expression.arguments.length === 1 &&
        ts.isStringLiteral(node.initializer.expression.arguments[0]) &&
        pos >= node.getStart() &&
        pos <= node.getEnd()
      ) {
        return node;
      }

      return ts.forEachChild(node, find);
    }

    return find(sourceFile);
  }

  function findClassNameWithBracedStringAtPosition(
    ts: typeof typescript,
    sourceFile: ts.SourceFile,
    positionOrRange: number | ts.TextRange,
  ): ts.JsxAttribute | undefined {
    const pos =
      typeof positionOrRange === 'number'
        ? positionOrRange
        : positionOrRange.pos;

    function find(node: ts.Node): ts.JsxAttribute | undefined {
      if (
        ts.isJsxAttribute(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === 'className' &&
        node.initializer &&
        ts.isJsxExpression(node.initializer) &&
        node.initializer.expression &&
        ts.isStringLiteral(node.initializer.expression) &&
        pos >= node.getStart() &&
        pos <= node.getEnd()
      ) {
        return node;
      }

      return ts.forEachChild(node, find);
    }

    return find(sourceFile);
  }

  return { create };
}

export = init;
