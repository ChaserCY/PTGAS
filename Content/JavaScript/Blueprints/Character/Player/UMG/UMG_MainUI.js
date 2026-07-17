"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UMG_MainUI = void 0;
const mixin_1 = require("../../../../mixin");
const AssetPath = "/Game/BluePrints/Character/Player/UMG/UMG_MainUI.UMG_MainUI_C";
let UMG_MainUI = class UMG_MainUI {
    OnInitialized() {
        this.AllAbilitySlot.Add(this.AbilitySlot_1);
        this.AllAbilitySlot.Add(this.AbilitySlot_2);
        this.AllAbilitySlot.Add(this.AbilitySlot_3);
        this.AllAbilitySlot.Add(this.AbilitySlot_4);
        this.AllAbilitySlot.Add(this.AbilitySlot_5);
    }
};
UMG_MainUI = __decorate([
    (0, mixin_1.default)(AssetPath)
], UMG_MainUI);
exports.UMG_MainUI = UMG_MainUI;
//# sourceMappingURL=UMG_MainUI.js.map