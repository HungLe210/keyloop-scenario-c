class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
        this.errorCode = 'VALIDATION_ERROR';
        this.field = field;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ValidationError;
