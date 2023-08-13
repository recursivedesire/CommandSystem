module.exports = function (babel) {
    const { types: t } = babel;

    return {
        name: "devportal-compat-plugin",
        visitor: {
            Program: {
                enter(path, state) {
                    state.inlineImports = [];

                    path.traverse({
                        ImportDeclaration(innerPath) {
                            const importPath = innerPath.node.source.value;

                            // Check if import has /api/ in its path or is named SharedCode[.js|.ts]
                            if (importPath.includes('/api/') || /^sharedCode(\.js|\.ts)?$/.test(importPath)) {
                                innerPath.remove(); // Remove the import statement
                                return; // Skip the rest of the code for this import
                            }

                            // Treat every import from the 'src' folder in a generalized manner
                            if (importPath.startsWith('./')) { // assuming all imports in src folder are relative paths starting with ./
                                const localName = innerPath.node.specifiers[0].local.name;

                                state.inlineImports.push({
                                    localName: localName,
                                    path: innerPath
                                });
                            }
                        }
                    });
                },
                exit(path, state) {
                    // Step 2: Make replacements
                    state.inlineImports.forEach(inlineImport => {
                        // Remove the import
                        inlineImport.path.remove();

                        // Replace function calls
                        path.traverse({
                            CallExpression(innerPath) {
                                if (innerPath.node.callee.name === inlineImport.localName) {
                                    innerPath.replaceWith(t.callExpression(t.identifier('inlineTestFunction'), []));
                                }
                            }
                        });

                        // Insert the inlined function
                        path.node.body.unshift(
                            t.functionDeclaration(
                                t.identifier('inlineTestFunction'),
                                [],
                                t.blockStatement([
                                    t.expressionStatement(t.callExpression(t.identifier('console.log'), [t.stringLiteral('inline-test')]))
                                ])
                            )
                        );
                    });
                }
            }
        }
    };
};
