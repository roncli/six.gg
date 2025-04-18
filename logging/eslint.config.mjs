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
            "capitalized-comments": "off",
            "class-methods-use-this": "off",
            "complexity": "off",
            "consistent-this": "off",
            "default-case": "off",
            "func-names": "off",
            "global-require": "off",
            "id-length": "off",
            "indent": ["error", 4, {"SwitchCase": 1}],
            "init-declarations": "off",
            "line-comment-position": "off",
            "max-depth": "off",
            "max-len": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-params": "off",
            "max-statements": "off",
            "new-cap": ["error", {"properties": false}],
            "no-await-in-loop": "off",
            "no-confusing-arrow": "off",
            "no-console": "off",
            "no-continue": "off",
            "no-empty": "off",
            "no-empty-function": "off",
            "no-implicit-coercion": "off",
            "no-inline-comments": "off",
            "no-invalid-this": "off",
            "no-loop-func": "off",
            "no-magic-numbers": "off",
            "no-mixed-operators": "off",
            "no-mixed-requires": "off",
            "no-nested-ternary": "off",
            "no-param-reassign": "off",
            "no-plusplus": "off",
            "no-process-env": "off",
            "no-return-assign": "off",
            "no-ternary": "off",
            "no-trailing-spaces": "off",
            "no-underscore-dangle": "off",
            "no-useless-constructor": "off",
            "no-void": "off",
            "one-var": ["off", {"const": "always"}],
            "prefer-destructuring": ["error", {"array": false}, {"enforceForRenamedProperties": true}],
            "prefer-promise-reject-errors": ["error", {"allowEmptyReject": true}],
            "require-atomic-updates": "off",
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
            "@stylistic/linebreak-style": ["error", "windows"],
            "@stylistic/lines-around-comment": "off",
            "@stylistic/lines-between-class-members": ["error", "always", {"exceptAfterSingleLine": true}],
            "@stylistic/multiline-comment-style": "off",
            "@stylistic/multiline-ternary": "off",
            "@stylistic/newline-per-chained-call": "off",
            "@stylistic/no-trailing-spaces": ["error", {"ignoreComments": false}],
            "@stylistic/object-property-newline": "off",
            "@stylistic/padded-blocks": "off",
            "@stylistic/quote-props": "off",
            "@stylistic/quotes": ["error", "double"],
            "@stylistic/space-before-function-paren": "off"
        }
    }
];
