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

      const node = findClassNameNodeAtPosition(ts, sourceFile, positionOrRange);
      if (!node) return prior;

      const refactor: ts.ApplicableRefactorInfo = {
        name: 'tailwindMergeRefactor',
        description: 'Wrap className string with tailwindMerge helper function',
        actions: [
          {
            name: 'wrapWithTailwindMerge',
            description: 'Wrap className="..." with tailwindMerge helper',
          },
        ],
      };

      prior.push(refactor);
      return prior;
    };

    proxy.getEditsForRefactor = (
      fileName: string,
      _formatOptions: ts.FormatCodeSettings | undefined,
      positionOrRange: number | ts.TextRange,
      refactorName: string,
      actionName: string,
    ) => {
      if (
        refactorName !== 'tailwindMergeRefactor' ||
        actionName !== 'wrapWithTailwindMerge'
      ) {
        return;
      }

      const sourceFile = info.languageService
        .getProgram()
        ?.getSourceFile(fileName);
      if (!sourceFile) return;

      const node = findClassNameNodeAtPosition(ts, sourceFile, positionOrRange);
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

  return { create };
}

export = init;
