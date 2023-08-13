const fs = require('fs');
const path = require('path');
const babelParser = require('@babel/parser');

module.exports = function (babel) {
    const { types: t } = babel;

    function inlineFileContent(filePath, relativeTo) {
        const currentFileExtension = path.extname(relativeTo);
        let absolutePath = path.resolve(path.dirname(relativeTo), filePath);

        // Try with the inferred extension if the file doesn't exist initially
        if (!fs.existsSync(absolutePath)) {
            absolutePath = `${absolutePath}${currentFileExtension}`;
        }

        try {
            const fileContent = fs.readFileSync(absolutePath, 'utf8');
            const ast = babelParser.parse(fileContent, {
                sourceType: "module"
            });
            return ast.program.body;
        } catch (error) {
            console.error(`Error inlining file content for path ${absolutePath}`, error);
            return [];
        }
    }


    return {
        name: "devportal-compat-plugin",
        visitor: {
            Program: {
                enter(path, state) {
                    state.inlineImports = [];
                    state.nodesToBeRemoved = [];

                    path.traverse({
                        ImportDeclaration(innerPath) {
                            const importPath = innerPath.node.source.value;

                            // Check if the import has no specifiers and inline the file content
                            if (innerPath.node.specifiers.length === 0) {
                                const inlinedContent = inlineFileContent(importPath, state.file.opts.filename);
                                innerPath.replaceWithMultiple(inlinedContent);
                                return; // Skip the rest of the code for this import
                            }

                            // Check if import has /api/ in its path or is named SharedCode[.js|.ts]
                            if (importPath.includes('/api/') || /^sharedCode(\.js|\.ts)?$/.test(importPath)) {
                                state.nodesToBeRemoved.push(innerPath);  // Add to removal list
                                return; // Skip the rest of the code for this import
                            }

                            // Treat every import from the 'src' folder in a generalized manner
                            if (importPath.startsWith('./')) {
                                const localName = innerPath.node.specifiers[0].local.name;

                                state.inlineImports.push({
                                    localName: localName,
                                    path: innerPath
                                });
                            }
                        },
                        // Add handlers for export statements
                        ExportNamedDeclaration(innerPath) {
                            state.nodesToBeRemoved.push(innerPath);
                        },
                        ExportDefaultDeclaration(innerPath) {
                            state.nodesToBeRemoved.push(innerPath);
                        }
                    });
                },
                exit(path, state) {
                    let inlineFunctionInserted = false;

                    // Make replacements
                    state.inlineImports.forEach(inlineImport => {
                        // Mark the import for removal
                        state.nodesToBeRemoved.push(inlineImport.path);

                        // Replace function calls
                        path.traverse({
                            CallExpression(innerPath) {
                                if (innerPath.node.callee.name === inlineImport.localName) {
                                    innerPath.replaceWith(t.callExpression(t.identifier('inlineTestFunction'), []));
                                }
                            }
                        });

                        // Insert the inlined function, but ensure it's added only once
                        if (!inlineFunctionInserted) {
                            path.node.body.unshift(
                                t.functionDeclaration(
                                    t.identifier('inlineTestFunction'),
                                    [],
                                    t.blockStatement([
                                        t.expressionStatement(t.callExpression(t.identifier('console.log'), [t.stringLiteral('inline-test')]))
                                    ])
                                )
                            );
                            inlineFunctionInserted = true;
                        }
                    });

                    // Remove nodes in the removal list
                    state.nodesToBeRemoved.forEach(nodePath => {
                        if (nodePath && !nodePath.removed) {
                            nodePath.remove();
                        }
                    });
                }
            }
        }
    };
};
