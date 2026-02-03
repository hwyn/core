"use strict";
/**
 * Standardized error codes for platform-agnostic exception handling.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedException = exports.RuntimeConfigurationException = exports.ResourceNotFoundException = exports.ServerBusyException = exports.PipelineAbortedException = exports.IllegalArgumentException = exports.ForbiddenException = exports.KernelException = exports.ExceptionCode = void 0;
var tslib_1 = require("tslib");
var ExceptionCode;
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
})(ExceptionCode || (exports.ExceptionCode = ExceptionCode = {}));
/**
 * Base class for all framework exceptions.
 */
var KernelException = /** @class */ (function (_super) {
    tslib_1.__extends(KernelException, _super);
    function KernelException(code, message, payload) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.payload = payload;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        _this.name = _this.constructor.name;
        return _this;
    }
    return KernelException;
}(Error));
exports.KernelException = KernelException;
/**
 * Thrown when the user is authorized but lacks permission.
 */
var ForbiddenException = /** @class */ (function (_super) {
    tslib_1.__extends(ForbiddenException, _super);
    function ForbiddenException(message) {
        if (message === void 0) { message = 'Operation forbidden.'; }
        return _super.call(this, ExceptionCode.FORBIDDEN, message) || this;
    }
    return ForbiddenException;
}(KernelException));
exports.ForbiddenException = ForbiddenException;
/**
 * Thrown when an input argument is invalid.
 */
var IllegalArgumentException = /** @class */ (function (_super) {
    tslib_1.__extends(IllegalArgumentException, _super);
    function IllegalArgumentException(message, details) {
        return _super.call(this, ExceptionCode.INVALID_ARGUMENT, message, details) || this;
    }
    return IllegalArgumentException;
}(KernelException));
exports.IllegalArgumentException = IllegalArgumentException;
/**
 * Thrown when the pipeline is aborted (cancelled or timed out).
 */
var PipelineAbortedException = /** @class */ (function (_super) {
    tslib_1.__extends(PipelineAbortedException, _super);
    function PipelineAbortedException(message, details) {
        if (message === void 0) { message = 'Pipeline execution aborted.'; }
        return _super.call(this, ExceptionCode.ABORTED, message, details) || this;
    }
    return PipelineAbortedException;
}(KernelException));
exports.PipelineAbortedException = PipelineAbortedException;
/**
 * Thrown when the server is executing too many requests concurrenty.
 */
var ServerBusyException = /** @class */ (function (_super) {
    tslib_1.__extends(ServerBusyException, _super);
    function ServerBusyException(message) {
        if (message === void 0) { message = 'Server is busy. Please try again later.'; }
        return _super.call(this, ExceptionCode.SERVER_BUSY, message) || this;
    }
    return ServerBusyException;
}(KernelException));
exports.ServerBusyException = ServerBusyException;
/**
 * Thrown when a requested resource is not found.
 */
var ResourceNotFoundException = /** @class */ (function (_super) {
    tslib_1.__extends(ResourceNotFoundException, _super);
    function ResourceNotFoundException(resourceName, identifier) {
        return _super.call(this, ExceptionCode.NOT_FOUND, "Resource '".concat(resourceName, "' ").concat(identifier ? "(".concat(identifier, ") ") : '', "not found."), { resourceName: resourceName, identifier: identifier }) || this;
    }
    return ResourceNotFoundException;
}(KernelException));
exports.ResourceNotFoundException = ResourceNotFoundException;
/**
 * Thrown when the Kernel/Compiler detects a misconfiguration.
 */
var RuntimeConfigurationException = /** @class */ (function (_super) {
    tslib_1.__extends(RuntimeConfigurationException, _super);
    function RuntimeConfigurationException(message, details) {
        return _super.call(this, ExceptionCode.CONFIGURATION_ERROR, message, details) || this;
    }
    return RuntimeConfigurationException;
}(KernelException));
exports.RuntimeConfigurationException = RuntimeConfigurationException;
/**
 * Thrown when the user is not authorized to access a resource.
 */
var UnauthorizedException = /** @class */ (function (_super) {
    tslib_1.__extends(UnauthorizedException, _super);
    function UnauthorizedException(message) {
        if (message === void 0) { message = 'Unauthorized access.'; }
        return _super.call(this, ExceptionCode.UNAUTHORIZED, message) || this;
    }
    return UnauthorizedException;
}(KernelException));
exports.UnauthorizedException = UnauthorizedException;