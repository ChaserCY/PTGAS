"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GA_Dash = void 0;
const UE = require("ue");
const mixin_1 = require("../../../mixin");
const BP_GameplayAbility_1 = require("../BP_GameplayAbility");
const BP_BaseCharacter_1 = require("../../Character/BP_BaseCharacter");
const ue_1 = require("ue");
const AssetPath = "/Game/BluePrints/Ability/_02Dash/GA_Dash.GA_Dash_C";
const MA_Dash = UE.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_Dash.MA_Dash");
const DashDamageClass = UE.Class.Load("/Game/BluePrints/Ability/_02Dash/GE_Dash_Damage.GE_Dash_Damage_C");
const DashHitTag = new ue_1.GameplayTag("Ability.Dash.HitEvent");
let GA_Dash = class GA_Dash extends BP_GameplayAbility_1.BP_GameplayAbility {
    constructor() {
        super(...arguments);
        this.Character = new BP_BaseCharacter_1.BP_BaseCharacter;
    }
    K2_ActivateAbility() {
        /*获取所施法角色对象*/
        this.Character = this.GetAvatarActorFromActorInfo();
        this.HitCall();
        this.K2_CommitAbility();
        this.StartUI_CD();
        this.PlayDashMontage();
        console.log("冲刺释放");
        this.DashForward();
    }
    PlayDashMontage() {
        const MontageTask = UE.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(this, "Dash", MA_Dash);
        MontageTask.OnCompleted.Add(() => this.K2_SelfEndAbility()); // 完整播放完毕
        MontageTask.OnInterrupted.Add(() => this.K2_SelfEndAbility()); // 被其他动画打断
        MontageTask.OnBlendOut.Add(() => this.K2_SelfEndAbility());
        MontageTask.OnCancelled.Add(() => this.K2_SelfEndAbility()); // 任务被取消
        MontageTask.ReadyForActivation(); // 必须调用，否则蒙太奇不会真正播放
    }
    /*此函数是自定义的函数，相似于下面的回调，可添加逻辑*/
    K2_SelfEndAbility() {
        this.K2_EndAbility();
        if (this.Character) {
            this.Character.SetFrictionToZero(false);
        }
    }
    /*此函数是k2_EndAbility函数的回调，执行完End后自动执行*/
    //K2_OnEndAbility(bWasCancelled: boolean) {
    // if(this.Character){
    //   this.Character.SetFrictionToZero(false);
    //}
    //}
    /*Dash函数触发，控制力度和时间*/
    DashForward() {
        if (this.Character) {
            this.Character.DashForward(this.Character.GetActorForwardVector(), 2000, 0.66);
        }
    }
    //命中监听
    HitCall() {
        const GameplayEvent = UE.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this, DashHitTag, null, false, true);
        GameplayEvent.EventReceived.Add((...args) => this.HitEvent(...args));
        GameplayEvent.ReadyForActivation();
    }
    HitEvent(Payload) {
        this.BP_ApplyGameplayEffectToTarget(UE.AbilitySystemBlueprintLibrary.AbilityTargetDataFromActor(Payload.Target), DashDamageClass);
        const HitCharacter = Payload.Target;
        if (HitCharacter) {
            HitCharacter.Stun(1);
            //两点向量，转化成朝前的旋转
            const StartLocation = HitCharacter.K2_GetActorLocation();
            const EndLocation = this.Character.K2_GetActorLocation();
            const Direction = new UE.Vector(StartLocation.X - EndLocation.X, StartLocation.Y - EndLocation.Y, StartLocation.Z - EndLocation.Z);
            const ForwardVector = UE.KismetMathLibrary.GetForwardVector(UE.KismetMathLibrary.MakeRotFromX(Direction));
            HitCharacter.DashForward(ForwardVector, 1700, 0.7);
        }
    }
};
GA_Dash = __decorate([
    (0, mixin_1.default)(AssetPath)
], GA_Dash);
exports.GA_Dash = GA_Dash;
//# sourceMappingURL=GA_Dash.js.map