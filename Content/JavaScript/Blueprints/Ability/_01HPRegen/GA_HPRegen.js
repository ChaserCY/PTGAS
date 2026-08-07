"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GA_HPRegen = void 0;
const UE = require("ue");
const mixin_1 = require("../../../mixin");
const BP_GameplayAbility_1 = require("../BP_GameplayAbility");
//需要导入mixin 模块
//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
//import {xxxx} from "../xxxx";
const AssetPath = "/Game/BluePrints/Ability/_01HPRegen/GA_HPRegen.GA_HPRegen_C";
//恢复动作
const MA_HPRegen = UE.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_HPRegen.MA_HPRegen");
//恢复数值（Class类需要加 _C）
const GE_HPRegenValueClass = UE.Class.Load("/Game/BluePrints/Ability/_01HPRegen/GE_HPRegen_Value.GE_HPRegen_Value_C");
let GA_HPRegen = class GA_HPRegen extends BP_GameplayAbility_1.BP_GameplayAbility {
    K2_ActivateAbility() {
        this.K2_CommitAbility();
        this.StartUI_CD();
        this.BP_ApplyGameplayEffectToOwner(GE_HPRegenValueClass);
        this.PlayHPRegenMontage();
    }
    PlayHPRegenMontage() {
        const MontageTask = UE.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(this, "HPRegen", //名称
        MA_HPRegen //动画
        );
        MontageTask.OnCompleted.Add(() => this.K2_EndAbility());
        MontageTask.OnInterrupted.Add(() => this.K2_EndAbility());
        MontageTask.OnBlendOut.Add(() => this.K2_EndAbility());
        MontageTask.OnCancelled.Add(() => this.K2_EndAbility());
        MontageTask.ReadyForActivation();
    }
};
GA_HPRegen = __decorate([
    (0, mixin_1.default)(AssetPath)
], GA_HPRegen);
exports.GA_HPRegen = GA_HPRegen;
//# sourceMappingURL=GA_HPRegen.js.map