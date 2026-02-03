/**
 * Standardized error codes for platform-agnostic exception handling.
 */
export declare enum ExceptionCode {
    /** Configuration or startup error */
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
    /** Operation forbidden (permission denied) */
    FORBIDDEN = "FORBIDDEN",
    /** Internal system error */
    INTERNAL_ERROR = "INTERNAL_ERROR",
    /** Invalid input arguments */
    INVALID_ARGUMENT = "INVALID_ARGUMENT",
    /** Resource not found */
    NOT_FOUND = "NOT_FOUND",
    /** Operation timed out */
    TIMEOUT = "TIMEOUT",
    /** Operation aborted explicitly */
    ABORTED = "ABORTED",
    /** Server is too busy to handle the request */
    SERVER_BUSY = "SERVER_BUSY",
    /** Unauthorized access (authentication failed) */
    UNAUTHORIZED = "UNAUTHORIZED"
}
/**
 * Base class for all framework exceptions.
 */
export declare class KernelException extends Error {
    readonly code: ExceptionCode | string;
    readonly payload?: Record<string, any>;
    constructor(code: ExceptionCode | string, message: string, payload?: Record<string, any>);
}
/**
 * Thrown when the user is authorized but lacks permission.
 */
export declare class ForbiddenException extends KernelException {
    constructor(message?: string);
}
/**
 * Thrown when an input argument is invalid.
 */
export declare class IllegalArgumentException extends KernelException {
    constructor(message: string, details?: Record<string, any>);
}
/**
 * Thrown when the pipeline is aborted (cancelled or timed out).
 */
export declare class PipelineAbortedException extends KernelException {
    constructor(message?: string, details?: Record<string, any>);
}
/**
 * Thrown when the server is executing too many requests concurrenty.
 */
export declare class ServerBusyException extends KernelException {
    constructor(message?: string);
}
/**
 * Thrown when a requested resource is not found.
 */
export declare class ResourceNotFoundException extends KernelException {
    constructor(resourceName: string, identifier?: string);
}
/**
 * Thrown when the Kernel/Compiler detects a misconfiguration.
 */
export declare class RuntimeConfigurationException extends KernelException {
    constructor(message: string, details?: Record<string, any>);
}
/**
 * Thrown when the user is not authorized to access a resource.
 */
export declare class UnauthorizedException extends KernelException {
    constructor(message?: string);
}
