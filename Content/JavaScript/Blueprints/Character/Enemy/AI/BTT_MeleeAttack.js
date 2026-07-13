"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BTT_MeleeAttack = void 0;
const UE = require("ue");
const mixin_1 = require("../../../../mixin");
const AssetPath = "/Game/BluePrints/Character/Enemy/AI/BTT_MeleeAttack.BTT_MeleeAttack";
const MeleeTag = new UE.GameplayTag("Ability.Melee");
let BTT_MeleeAttack = class BTT_MeleeAttack {
    ReceiveExecuteAI(OwnerController, ControlledPawn) {
        const Character = ControlledPawn;
        if (Character) {
            Character.ActivateAbility(MeleeTag);
            this.FinishExecute(true);
        }
        else {
            this.FinishExecute(true);
        }
    }
};
BTT_MeleeAttack = __decorate([
    (0, mixin_1.default)(AssetPath)
], BTT_MeleeAttack);
exports.BTT_MeleeAttack = BTT_MeleeAttack;
//# sourceMappingURL=BTT_MeleeAttack.js.map