"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKEN_VALIDATION_SCHEMA = void 0;
exports.TOKEN_VALIDATION_SCHEMA = {
    type: {
        in: ['body'],
        notEmpty: {
            errorMessage: 'token type must not be empty',
        },
        custom: {
            options: (value) => value === 'Auth' || 'Refresh',
            errorMessage: 'token type must be Auth either Refresh',
        },
    },
};
