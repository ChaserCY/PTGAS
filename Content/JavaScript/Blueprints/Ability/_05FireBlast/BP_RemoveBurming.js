"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BP_RemoveBurming = void 0;
const UE = require("ue");
const mixin_1 = require("../../../mixin");
const AssetPath = "/Game/BluePrints/Ability/_05FireBlast/BP_RemoveBurming.BP_RemoveBurming_C";
const BurmingTag = new UE.GameplayTag("Ability.FireBlast.BurmingDamage");
let BP_RemoveBurming = class BP_RemoveBurming {
    ReceiveBeginPlay() {
        this.Box.OnComponentBeginOverlap.Add((...args) => this.BoxBeginOverlap(...args));
    }
    BoxBeginOverlap(OverlappedComponent, OtherActor, OtherComp, OtherBodyIndex, bFromSweep, SweepResult) {
        console.log("BoxBeginOverlap");
        if (UE.AbilitySystemBlueprintLibrary.GetAbilitySystemComponent(OtherActor).HasMatchingGameplayTag(BurmingTag)) {
            UE.AbilitySystemBlueprintLibrary.GetAbilitySystemComponent(OtherActor).RemoveActiveEffectsWithTags(UE.BlueprintGameplayTagLibrary.MakeGameplayTagContainerFromTag(BurmingTag));
        }
    }
};
BP_RemoveBurming = __decorate([
    (0, mixin_1.default)(AssetPath)
], BP_RemoveBurming);
exports.BP_RemoveBurming = BP_RemoveBurming;
//# sourceMappingURL=BP_RemoveBurming.js.map