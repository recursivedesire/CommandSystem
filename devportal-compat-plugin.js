const fs = require('fs');
const path = require('path');
const babelParser = require('@babel/parser');
const babelTransform = require("@babel/core").transform;

module.exports = function (babel) {
    const { types: t } = babel;

    function inlineFileContent(filePath, relativeTo) {
        const currentFileExtension = path.extname(relativeTo);
        let absolutePath = path.resolve(path.dirname(relativeTo), filePath);

        // Try with the inferred extension if the file doesn't exist initially
        if (!fs.existsSync(absolutePath)) {
            if (fs.existsSync(`${absolutePath}${currentFileExtension}`)) {
                absolutePath = `${absolutePath}${currentFileExtension}`;
            } else if (fs.existsSync(`${absolutePath}.ts`)) {
                absolutePath = `${absolutePath}.ts`;
            } else if (fs.existsSync(`${absolutePath}.js`)) {
                absolutePath = `${absolutePath}.js`;
            }
        }

        try {
            const fileContent = fs.readFileSync(absolutePath, 'utf8');
            const transformed = babelTransform(fileContent, {
                sourceType: "module",
                plugins: [["@babel/plugin-syntax-typescript", { isTSX: false }], "./devportal-compat-plugin"]
            });

            if (transformed && transformed.code) {
                return babelParser.parse(transformed.code, {
                    sourceType: "module",
                    plugins: ["typescript"]
                }).program.body;
            } else {
                console.error(`Error transforming inlined file content for path ${absolutePath}`);
                return [];
            }
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
                    state.fullInlines = [];  // New state to hold the full inlines
                    state.nodesToBeRemoved = [];

                    path.traverse({
                        ImportDeclaration(innerPath) {
                            const importPath = innerPath.node.source.value;

                            // Check if the import has no specifiers and save for later
                            if (innerPath.node.specifiers.length === 0) {
                                state.fullInlines.push({ path: importPath, nodePath: innerPath });
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

                    // Process full inlines
                    state.fullInlines.forEach(inline => {
                        const inlinedContent = inlineFileContent(inline.path, state.file.opts.filename);
                        if (inlinedContent && inlinedContent.length > 0) {
                            inline.nodePath.replaceWithMultiple(inlinedContent);
                        } else {
                            state.nodesToBeRemoved.push(inline.nodePath);
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

