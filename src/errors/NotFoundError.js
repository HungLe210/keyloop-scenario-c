class NotFoundError extends Error {
    constructor(resource, id = null) {
        super(`${resource} not found`);
        this.name = 'NotFoundError';
        this.statusCode = 404;
        this.errorCode = `${resource.toUpperCase()}_NOT_FOUND`;
        this.resource = resource;
        this.resourceId = id;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = NotFoundError;
