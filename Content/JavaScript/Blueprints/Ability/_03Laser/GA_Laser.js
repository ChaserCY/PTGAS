"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GA_Laser = void 0;
const UE = require("ue");
const mixin_1 = require("../../../mixin");
const BP_GameplayAbility_1 = require("../BP_GameplayAbility");
//需要导入mixin 模块
//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
//import {xxxx} from "../xxxx";
const AssetPath = "/Game/BluePrints/Ability/_03Laser/GA_Laser.GA_Laser_C";
const MA_Laser = UE.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_Laser.MA_Laser");
//激光消耗Tag
const LaserCostTag = new UE.GameplayTag("Ability.Laser.Cost");
const LaserEndTag = new UE.GameplayTag("Ability.Laser.LaserEnd");
let GA_Laser = class GA_Laser extends BP_GameplayAbility_1.BP_GameplayAbility {
    K2_ActivateAbility() {
        this.Character = this.GetAvatarActorFromActorInfo();
        if (this.Character) {
            this.Character.IsLasering = true;
            this.Character.LookCamera(true);
        }
        else {
            return;
        }
        //单独提交消耗，不交CD
        this.K2_CommitAbilityCost();
        this.BindEndEvent();
        this.PlayMontage();
    }
    //播放动画
    PlayMontage() {
        const MontageTask = UE.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(this, "Laser", MA_Laser);
        MontageTask.ReadyForActivation();
    }
    //监听回调结束事件
    BindEndEvent() {
        const GameplayEvent = UE.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this, LaserEndTag, null, true, true);
        GameplayEvent.EventReceived.Add((...args) => this.EndMontage(...args));
        GameplayEvent.ReadyForActivation();
    }
    //结束动画
    EndMontage(Payload) {
        this.MontageJumpToSection("End");
        this.K2_EndAbility();
    }
    K2_OnEndAbility(bWasCancelled) {
        /*提交CD,开始读秒*/
        this.K2_CommitAbilityCooldown();
        this.StartUI_CD();
        /*通过标签Tag移除GE_Cost*/
        this.BP_RemoveGameplayEffectFromOwnerWithAssetTags(this.Character.GetAbilityTag(LaserCostTag));
        if (this.Character) {
            this.Character.IsLasering = false;
            this.Character.LookCamera(false);
        }
    }
};
GA_Laser = __decorate([
    (0, mixin_1.default)(AssetPath)
], GA_Laser);
exports.GA_Laser = GA_Laser;
//# sourceMappingURL=GA_Laser.js.map