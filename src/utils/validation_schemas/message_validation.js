"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MESSAGE_PATCH_VALIDATION = exports.MESSAGE_PUT_VALIDATION = exports.MESSAGE_GET_VALIDATION = exports.MESSAGE_DELETE_SINGLE_VALIDATION = exports.MESSAGE_GET_ATTACHMENTS_VALIDATION = exports.MESSAGE_GET_SINGLE_VALIDATION = void 0;
const uuid_1 = require("uuid");
exports.MESSAGE_GET_SINGLE_VALIDATION = {
    id: {
        in: ["params"],
        notEmpty: {
            errorMessage: "id must not be empty",
        },
        isString: {
            errorMessage: "id must be a valid string",
        },
    },
};
exports.MESSAGE_GET_ATTACHMENTS_VALIDATION = {
    id: {
        in: ["params"],
        notEmpty: {
            errorMessage: "id must not be empty",
        },
        isString: {
            errorMessage: "id must be a valid string",
        },
    },
};
exports.MESSAGE_DELETE_SINGLE_VALIDATION = {
    id: {
        in: ["params"],
        notEmpty: {
            errorMessage: "id must not be empty",
        },
        isString: {
            errorMessage: "id must be a string",
        },
    },
};
exports.MESSAGE_GET_VALIDATION = {
    receiver_id: {
        in: ["query"],
        notEmpty: {
            errorMessage: "receiver_id must not be empty",
        },
        isString: {
            errorMessage: "receiver_id must be a valid string",
        },
    },
};
exports.MESSAGE_PUT_VALIDATION = {
    id: {
        in: ["body"],
        customSanitizer: {
            options: () => (0, uuid_1.v4)(),
        },
    },
    receiver_id: {
        in: ["body"],
        notEmpty: {
            errorMessage: "receiver_id must not be empty",
        },
        isString: {
            errorMessage: "receiver_id must be a valid string",
        },
    },
    content: {
        in: ["body"],
        isString: {
            errorMessage: "content must be a string",
        },
        isLength: {
            options: {
                max: 300,
            },
            errorMessage: "content must be between 1-300 char long",
        },
    },
    // date: {
    // 	in: ["body"],
    // 	customSanitizer: {
    // 		options: () => Date.now(),
    // 	},
    // }
    creation_date: {
        in: ["body"],
        customSanitizer: {
            options: () => Date.now(),
        },
    },
    last_modified_date: {
        in: ["body"],
        customSanitizer: {
            options: () => Date.now(),
        },
    },
    attachment: {
        optional: true,
    }
};
exports.MESSAGE_PATCH_VALIDATION = {
    id: {
        in: ["params"],
        notEmpty: {
            errorMessage: "id must not be empty",
        },
        isString: {
            errorMessage: "id must be a string",
        },
    },
    content: {
        in: ["body"],
        optional: true,
        notEmpty: {
            errorMessage: "content must not be empty",
        },
        isString: {
            errorMessage: "content must be a string",
        },
        isLength: {
            options: {
                min: 1,
                max: 300,
            },
            errorMessage: "content must be between 1-300 char long",
        },
    },
    last_modified_date: {
        in: ["body"],
        customSanitizer: {
            options: () => Date.now(),
        },
    },
};
