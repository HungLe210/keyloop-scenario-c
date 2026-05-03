class DuplicateError extends Error {
    constructor(field, value = null) {
        super(`${field} already exists`);
        this.name = 'DuplicateError';
        this.statusCode = 409;
        this.errorCode = 'DUPLICATE_ENTRY';
        this.field = field;
        this.value = value;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = DuplicateError;
