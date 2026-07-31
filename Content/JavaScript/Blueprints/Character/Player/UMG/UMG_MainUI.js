"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UMG_MainUI = void 0;
const UE = require("ue");
const mixin_1 = require("../../../../mixin");
const ue_1 = require("ue");
const puerts_1 = require("puerts");
const AssetPath = "/Game/BluePrints/Character/Player/UMG/UMG_MainUI.UMG_MainUI_C";
let UMG_MainUI = class UMG_MainUI {
    Construct() {
    }
    OnInitialized() {
    }
    PreConstruct(IsDesignTime) {
        puerts_1.blueprint.load(UE.Game.BluePrints.Character.Player.UMG.UMG_AbilitySlot.UMG_AbilitySlot_C);
        this.AllAbilitySlot = (0, ue_1.NewArray)(UE.Game.BluePrints.Character.Player.UMG.UMG_AbilitySlot.UMG_AbilitySlot_C);
        this.AbilitySlots.Add(this.AbilitySlot_1);
        this.AbilitySlots.Add(this.AbilitySlot_2);
        this.AbilitySlots.Add(this.AbilitySlot_3);
        this.AbilitySlots.Add(this.AbilitySlot_4);
        this.AbilitySlots.Add(this.AbilitySlot_5);
        this.AllAbilitySlot.Add(this.AbilitySlot_1);
        this.AllAbilitySlot.Add(this.AbilitySlot_2);
        this.AllAbilitySlot.Add(this.AbilitySlot_3);
        this.AllAbilitySlot.Add(this.AbilitySlot_4);
        this.AllAbilitySlot.Add(this.AbilitySlot_5);
        puerts_1.blueprint.unload(UE.Game.BluePrints.Character.Player.UMG.UMG_AbilitySlot.UMG_AbilitySlot_C);
    }
};
UMG_MainUI = __decorate([
    (0, mixin_1.default)(AssetPath)
], UMG_MainUI);
exports.UMG_MainUI = UMG_MainUI;
//# sourceMappingURL=UMG_MainUI.js.map