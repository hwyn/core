"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_PROTOCOL = exports.ROUTE_MATCHER = exports.ROUTE_STRATEGY = void 0;
var di_1 = require("@hwy-fm/di");
exports.ROUTE_STRATEGY = di_1.InjectorToken.get('ROUTE_STRATEGY');
exports.ROUTE_MATCHER = di_1.InjectorToken.get('ROUTE_MATCHER');
exports.HTTP_PROTOCOL = di_1.InjectorToken.get('HTTP_PROTOCOL');