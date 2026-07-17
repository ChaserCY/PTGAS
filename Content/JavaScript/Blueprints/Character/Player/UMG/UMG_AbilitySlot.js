"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UMG_AbilitySlot = void 0;
const UE = require("ue");
const mixin_1 = require("../../../../mixin");
const AssetPath = "/Game/BluePrints/Character/Player/UMG/UMG_AbilitySlot.UMG_AbilitySlot_C";
let UMG_AbilitySlot = class UMG_AbilitySlot {
    PreConstruct(IsDesignTime) {
        this.Key.SetText(this.KeyText);
    }
    Tick(MyGeometry, InDeltaTime) {
        this.UpdateCD(InDeltaTime);
    }
    //初始化信息
    InitInfo(AbilityInfo) {
        this.CD_Intel = AbilityInfo.CD;
        this.AbilityClass = AbilityInfo.AbilityClass;
        this.AbilityImage.SetBrushFromMaterial(AbilityInfo.IconMaterial);
    }
    StartUI_CD() {
        this.IsDuringCD = true;
        this.CD.SetVisibility(UE.ESlateVisibility.Visible);
        this.CD_Current = this.CD_Intel;
    }
    UpdateCD(DeltaTime) {
        //处于CD中...
        if (this.IsDuringCD) {
            this.CD_Current = UE.KismetMathLibrary.FClamp(this.CD_Current - DeltaTime, 0, this.CD_Intel);
            if (this.CD_Current > 0) {
                this.CD.SetText(UE.KismetTextLibrary.Conv_DoubleToText(this.CD_Current, UE.ERoundingMode.HalfToEven, false, true, 1, 324, 0, 1));
                this.AbilityImage.GetDynamicMaterial().SetScalarParameterValue("Pre", UE.KismetMathLibrary.FClamp((1 - this.CD_Current / this.CD_Intel), 0, 1));
            }
            else {
                this.IsDuringCD = false;
                this.CD.SetVisibility(UE.ESlateVisibility.Hidden);
                this.AbilityImage.GetDynamicMaterial().SetScalarParameterValue("Pre", 1);
            }
        }
    }
};
UMG_AbilitySlot = __decorate([
    (0, mixin_1.default)(AssetPath)
], UMG_AbilitySlot);
exports.UMG_AbilitySlot = UMG_AbilitySlot;
//# sourceMappingURL=UMG_AbilitySlot.js.map