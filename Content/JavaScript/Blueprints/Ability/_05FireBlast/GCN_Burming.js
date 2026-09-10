"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GCN_Burming = void 0;
const UE = require("ue");
const mixin_1 = require("../../../mixin");
const AssetPath = "/Game/BluePrints/Ability/_05FireBlast/GCN_Burming.GCN_Burming_C";
let GCN_Burming = class GCN_Burming {
    //添加粒子系统
    OnApplication(Target, Parameters, SpawnResults) {
        console.log("添加粒子系统");
        if (Target) {
            this.FireEmittCom = UE.GameplayStatics.SpawnEmitterAttached(this.BurmingFX, Target.RootComponent, "", new UE.Vector(0, 0, -65), UE.Rotator.ZeroRotator, new UE.Vector(0.4, 0.4, 0.4), UE.EAttachLocation.KeepRelativeOffset, false, UE.EPSCPoolMethod.ManualRelease, true);
        }
    }
    // 移除
    OnRemoval(Target, Parameters, SpawnResults) {
        if (this.FireEmittCom) {
            this.FireEmittCom.ReleaseToPool();
            this.K2_EndGameplayCue();
        }
    }
};
GCN_Burming = __decorate([
    (0, mixin_1.default)(AssetPath)
], GCN_Burming);
exports.GCN_Burming = GCN_Burming;
//# sourceMappingURL=GCN_Burming.js.map