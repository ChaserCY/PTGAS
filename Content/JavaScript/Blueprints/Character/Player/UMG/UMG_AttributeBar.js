"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UMG_AttributeBar = void 0;
const UE = require("ue");
const mixin_1 = require("../../../../mixin");
const AssetPath = "/Game/BluePrints/Character/Player/UMG/UMG_AttributeBar.UMG_AttributeBar_C";
let UMG_AttributeBar = 
//有继承：export class UMG_AttributeBar extends xxxx implements UMG_AttributeBar { }
class UMG_AttributeBar {
    PreConstruct(IsDesignTime) {
        this.SetColor();
    }
    SetColor() {
        this.Image_Bar.GetDynamicMaterial().SetVectorParameterValue("Color", this.Color);
    }
    SetProgress(Progress) {
        this.Image_Bar.GetDynamicMaterial().SetScalarParameterValue("Pre", UE.KismetMathLibrary.FClamp(Progress, 0, 1));
    }
};
UMG_AttributeBar = __decorate([
    (0, mixin_1.default)(AssetPath)
    //有继承：export class UMG_AttributeBar extends xxxx implements UMG_AttributeBar { }
], UMG_AttributeBar);
exports.UMG_AttributeBar = UMG_AttributeBar;
//# sourceMappingURL=UMG_AttributeBar.js.map