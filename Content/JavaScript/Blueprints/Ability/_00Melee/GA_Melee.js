"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GA_Melee = void 0;
const UE = require("ue");
const mixin_1 = require("../../../mixin");
const AssetPath = "/Game/BluePrints/Ability/_00Melee/GA_Melee.GA_Melee_C";
const MA_Melee = UE.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_Melee.MA_Melee");
const MeleeHitTag = new UE.GameplayTag("Ability.Melee.HitEvent");
//伤害类
const MeleeDamageClass = UE.Class.Load("/Game/BluePrints/Ability/_00Melee/GE_Melee_Damage.GE_Melee_Damage_C");
let GA_Melee = 
//有继承：export class GA_Melee extends xxxx implements GA_Melee { }
class GA_Melee {
    //当GA触发的时候执行
    K2_ActivateAbility() {
        console.log("普通攻击生效");
        this.K2_CommitAbility();
        this.BindHitEvent();
        this.PlayMeleeMontage();
    }
    //播放普通攻击蒙太奇
    PlayMeleeMontage() {
        //加载蒙太奇资源
        const StartSection = UE.KismetMathLibrary.RandomInteger(3).toString();
        let MeleeMontageTask = UE.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(this, "", MA_Melee, 1, StartSection);
        MeleeMontageTask.OnCompleted.Add(() => this.K2_EndAbility()); //完整播放完毕
        MeleeMontageTask.OnInterrupted.Add(() => this.K2_EndAbility()); //被其他动画打断
        MeleeMontageTask.OnBlendOut.Add(() => this.K2_EndAbility()); //Blend out过渡完成
        MeleeMontageTask.OnCancelled.Add(() => this.K2_EndAbility()); //任务被取消
        //这上面四个回调都绑定了结束这个任务，无论哪种情况都会结束任务
        MeleeMontageTask.ReadyForActivation(); //激活这个任务
    }
    //绑定命中事件
    BindHitEvent() {
        const GameplayEvent = UE.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this, MeleeHitTag, null, false, true);
        GameplayEvent.EventReceived.Add((...arge) => this.HitEvent(...arge));
        GameplayEvent.ReadyForActivation();
    }
    //命中事件触发
    HitEvent(Payload) {
        // 测试打印 UE.KismetSystemLibrary.PrintString(this, "命中事件触发", true, true, new UE.LinearColor(1, 0, 0, 1), 5);
        this.BP_ApplyGameplayEffectToTarget(UE.AbilitySystemBlueprintLibrary.AbilityTargetDataFromActor(Payload.Target), MeleeDamageClass, UE.KismetMathLibrary.RandomIntegerInRange(0, 4));
    }
};
GA_Melee = __decorate([
    (0, mixin_1.default)(AssetPath)
    //有继承：export class GA_Melee extends xxxx implements GA_Melee { }
], GA_Melee);
exports.GA_Melee = GA_Melee;
//# sourceMappingURL=GA_Melee.js.map