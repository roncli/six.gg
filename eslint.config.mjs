import globals from "globals";
import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import stylistic from "@stylistic/eslint-plugin";

export default [
    {
        files: ["**/*.js"],
        languageOptions: {
            sourceType: "commonjs",
            globals: {
                ...globals.node,
                ...globals.jest
            }
        },
        plugins: {
            jsdoc,
            "@stylistic": stylistic
        },
        rules: {
            ...js.configs.all.rules,
            ...stylistic.configs["disable-legacy"].rules,
            ...stylistic.configs.all.rules,
            "camelcase": "off",
            "capitalized-comments": ["error", "always", {"ignorePattern": "html"}],
            "complexity": "off",
            "consistent-this": "off",
            "default-case": "off",
            "func-names": ["error", "as-needed"],
            "id-length": "off",
            "init-declarations": "off",
            "max-depth": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-params": "off",
            "max-statements": "off",
            "new-cap": ["error", {"properties": false, "capIsNewExceptions": ["Express", "HttpErrors"]}],
            "no-console": "off",
            "no-continue": "off",
            "no-inline-comments": "off",
            "no-magic-numbers": "off",
            "no-param-reassign": "off",
            "no-plusplus": "off",
            "no-ternary": "off",
            "no-underscore-dangle": ["error", {"allow": ["_getData", "_id"]}],
            "no-unused-vars": ["error", {"argsIgnorePattern": "^_"}],
            "no-void": "off",
            "one-var": "off",
            "require-unicode-regexp": "off",
            "sort-keys": "off",
            "sort-vars": "off",
            "strict": "off",

            "jsdoc/require-jsdoc": [
                "error", {
                    "require": {
                        "FunctionDeclaration": true,
                        "MethodDefinition": true,
                        "ClassDeclaration": true,
                        "ArrowFunctionExpression": true,
                        "FunctionExpression": true
                    }
                }
            ],
            "jsdoc/require-returns": ["error", {"forceRequireReturn": true}],
            "jsdoc/require-returns-description": "error",

            "@stylistic/array-element-newline": "off",
            "@stylistic/dot-location": "off",
            "@stylistic/function-call-argument-newline": "off",
            "@stylistic/indent": ["error", 4, {"SwitchCase": 1}],
            "@stylistic/linebreak-style": ["error", "windows"],
            "@stylistic/lines-around-comment": "off",
            "@stylistic/multiline-comment-style": "off",
            "@stylistic/multiline-ternary": "off",
            "@stylistic/newline-per-chained-call": "off",
            "@stylistic/no-confusing-arrow": "off",
            "@stylistic/no-extra-parens": "error",
            "@stylistic/no-trailing-spaces": ["error", {"ignoreComments": false}],
            "@stylistic/object-property-newline": "off",
            "@stylistic/padded-blocks": "off",
            "@stylistic/quote-props": "off",
            "@stylistic/quotes": ["error", "double"],
            "@stylistic/space-before-function-paren": "off"
        }
    },
    {
        files: ["public/**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "script",
            globals: {
                ...globals.es6,
                ...globals.browser
            }
        },
        rules: {
            "no-alert": "off"
        }
    }
];
