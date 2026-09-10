"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BTS_CheckDead = void 0;
const UE = require("ue");
const mixin_1 = require("../../../../mixin");
const AssetPath = "/Game/BluePrints/Character/Enemy/AI/BTS_CheckDead.BTS_CheckDead_C";
let BTS_CheckDead = class BTS_CheckDead {
    ReceiveActivationAI(OwnerController, ControlledPawn) {
        this.Character = ControlledPawn;
    }
    ReceiveSearchStartAI(OwnerController, ControlledPawn) {
        if (this.Character) {
            UE.BTFunctionLibrary.SetBlackboardValueAsBool(this, this.Dead, this.Character.Dead);
        }
    }
};
BTS_CheckDead = __decorate([
    (0, mixin_1.default)(AssetPath)
], BTS_CheckDead);
exports.BTS_CheckDead = BTS_CheckDead;
//# sourceMappingURL=BTS_CheckDead.js.map