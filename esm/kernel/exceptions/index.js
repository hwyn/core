/**
 * Standardized error codes for platform-agnostic exception handling.
 */
export var ExceptionCode;
(function (ExceptionCode) {
    /** Configuration or startup error */
    ExceptionCode["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
    /** Operation forbidden (permission denied) */
    ExceptionCode["FORBIDDEN"] = "FORBIDDEN";
    /** Internal system error */
    ExceptionCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    /** Invalid input arguments */
    ExceptionCode["INVALID_ARGUMENT"] = "INVALID_ARGUMENT";
    /** Resource not found */
    ExceptionCode["NOT_FOUND"] = "NOT_FOUND";
    /** Operation timed out */
    ExceptionCode["TIMEOUT"] = "TIMEOUT";
    /** Operation aborted explicitly */
    ExceptionCode["ABORTED"] = "ABORTED";
    /** Server is too busy to handle the request */
    ExceptionCode["SERVER_BUSY"] = "SERVER_BUSY";
    /** Unauthorized access (authentication failed) */
    ExceptionCode["UNAUTHORIZED"] = "UNAUTHORIZED";
})(ExceptionCode || (ExceptionCode = {}));
/**
 * Base class for all framework exceptions.
 */
export class KernelException extends Error {
    constructor(code, message, payload) {
        super(message);
        this.code = code;
        this.payload = payload;
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = this.constructor.name;
    }
}
/**
 * Thrown when the user is authorized but lacks permission.
 */
export class ForbiddenException extends KernelException {
    constructor(message = 'Operation forbidden.') {
        super(ExceptionCode.FORBIDDEN, message);
    }
}
/**
 * Thrown when an input argument is invalid.
 */
export class IllegalArgumentException extends KernelException {
    constructor(message, details) {
        super(ExceptionCode.INVALID_ARGUMENT, message, details);
    }
}
/**
 * Thrown when the pipeline is aborted (cancelled or timed out).
 */
export class PipelineAbortedException extends KernelException {
    constructor(message = 'Pipeline execution aborted.', details) {
        super(ExceptionCode.ABORTED, message, details);
    }
}
/**
 * Thrown when the server is executing too many requests concurrenty.
 */
export class ServerBusyException extends KernelException {
    constructor(message = 'Server is busy. Please try again later.') {
        super(ExceptionCode.SERVER_BUSY, message);
    }
}
/**
 * Thrown when a requested resource is not found.
 */
export class ResourceNotFoundException extends KernelException {
    constructor(resourceName, identifier) {
        super(ExceptionCode.NOT_FOUND, `Resource '${resourceName}' ${identifier ? `(${identifier}) ` : ''}not found.`, { resourceName, identifier });
    }
}
/**
 * Thrown when the Kernel/Compiler detects a misconfiguration.
 */
export class RuntimeConfigurationException extends KernelException {
    constructor(message, details) {
        super(ExceptionCode.CONFIGURATION_ERROR, message, details);
    }
}
/**
 * Thrown when the user is not authorized to access a resource.
 */
export class UnauthorizedException extends KernelException {
    constructor(message = 'Unauthorized access.') {
        super(ExceptionCode.UNAUTHORIZED, message);
    }
}