"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GC_HPRegen = void 0;
const UE = require("ue");
const mixin_1 = require("../../../mixin");
//需要导入mixin 模块
//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
//import {xxxx} from "../xxxx";
const AssetPath = "/Game/BluePrints/Ability/_01HPRegen/GC_HPRegen.GC_HPRegen_C";
//特效
const HPRegenFX = UE.ParticleSystem.Load("/Game/Assets/Abilities/HealthRegen/P_HealthRegen.P_HealthRegen");
let GC_HPRegen = 
//有继承：export class GC_HPRegen extends xxxx implements GC_HPRegen { }
class GC_HPRegen {
    WhileActive(MyTarget, Parameters) {
        if (HPRegenFX) {
            UE.GameplayStatics.SpawnEmitterAtLocation(this, HPRegenFX, MyTarget.K2_GetActorLocation(), MyTarget.K2_GetActorRotation(), MyTarget.GetActorScale3D(), true, UE.EPSCPoolMethod.AutoRelease, //这里原来用的是ManualRelease
            true);
        }
        return true;
    }
};
GC_HPRegen = __decorate([
    (0, mixin_1.default)(AssetPath)
    //有继承：export class GC_HPRegen extends xxxx implements GC_HPRegen { }
], GC_HPRegen);
exports.GC_HPRegen = GC_HPRegen;
//# sourceMappingURL=GC_HPRegen.js.map