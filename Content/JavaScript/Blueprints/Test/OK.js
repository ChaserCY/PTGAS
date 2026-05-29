"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OK = void 0;
const mixin_1 = __importDefault(require("../../mixin"));
//需要导入mixin 模块
//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
const AssetPath = "TypeScript/Blueprints/Test/OK_C";
let OK = class OK {
};
exports.OK = OK;
exports.OK = OK = __decorate([
    (0, mixin_1.default)(AssetPath)
], OK);
//# sourceMappingURL=OK.js.map