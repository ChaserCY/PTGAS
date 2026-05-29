"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BP_BaseCharacter = void 0;
const mixin_1 = require("../../mixin");
const AssetPath = "/Game/BluePrints/Character/BP_BaseCharacter.BP_BaseCharacter_C";
let BP_BaseCharacter = class BP_BaseCharacter {
    ReceiveBeginPlay() {
    }
};
BP_BaseCharacter = __decorate([
    (0, mixin_1.default)(AssetPath)
], BP_BaseCharacter);
exports.BP_BaseCharacter = BP_BaseCharacter;
//# sourceMappingURL=BP_BaseCharacter.js.map