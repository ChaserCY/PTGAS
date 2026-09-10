"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BTS_CheckBurming = void 0;
const UE = require("ue");
const mixin_1 = require("../../../../mixin");
const AssetPath = "/Game/BluePrints/Character/Enemy/AI/BTS_CheckBurming.BTS_CheckBurming_C";
const BurmingTag = new UE.GameplayTag("Ability.FireBlast.BurmingDamage");
let BTS_CheckBurming = class BTS_CheckBurming {
    ReceiveSearchStartAI(OwnerController, ControlledPawn) {
        if (UE.AbilitySystemBlueprintLibrary.GetAbilitySystemComponent(ControlledPawn).HasMatchingGameplayTag(BurmingTag)) {
            UE.BTFunctionLibrary.SetBlackboardValueAsBool(this, this.Burming, true);
        }
        else {
            UE.BTFunctionLibrary.SetBlackboardValueAsBool(this, this.Burming, false);
        }
    }
};
BTS_CheckBurming = __decorate([
    (0, mixin_1.default)(AssetPath)
], BTS_CheckBurming);
exports.BTS_CheckBurming = BTS_CheckBurming;
//# sourceMappingURL=BTS_CheckBurming.js.map