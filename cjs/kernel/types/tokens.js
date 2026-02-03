"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEED_TOKEN = exports.INSTRUCTION_QUEUE = void 0;
var di_1 = require("@hwy-fm/di");
exports.INSTRUCTION_QUEUE = di_1.InjectorToken.get('INSTRUCTION_QUEUE');
exports.SEED_TOKEN = di_1.InjectorToken.get('SEED_TOKEN');