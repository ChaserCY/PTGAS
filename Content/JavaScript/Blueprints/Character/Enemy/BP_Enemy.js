"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BP_Enemy = void 0;
const mixin_1 = require("../../../mixin");
const BP_BaseCharacter_1 = require("../BP_BaseCharacter");
const AssetPath = "/Game/BluePrints/Character/Enemy/BP_Enemy.BP_Enemy_C";
let BP_Enemy = class BP_Enemy extends BP_BaseCharacter_1.BP_BaseCharacter {
};
BP_Enemy = __decorate([
    (0, mixin_1.default)(AssetPath)
], BP_Enemy);
exports.BP_Enemy = BP_Enemy;
//# sourceMappingURL=BP_Enemy.js.map