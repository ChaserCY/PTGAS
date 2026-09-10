"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GA_FireBlast = void 0;
const UE = require("ue");
const mixin_1 = require("../../../mixin");
const BP_GameplayAbility_1 = require("../BP_GameplayAbility");
const ue_1 = require("ue");
const AssetPath = "/Game/BluePrints/Ability/_05FireBlast/GA_FireBlast.GA_FireBlast_C";
const MA_FireBlast = UE.Object.Load("/Game/BluePrints/Character/Animations/Montage/MA_FireBlast.MA_FireBlast");
//伤害GE 
const FireBlast_Damage = UE.Class.Load("/Game/BluePrints/Ability/_05FireBlast/GE_FireBlast_Damage.GE_FireBlast_Damage_C");
const PullEventTag = new ue_1.GameplayTag("Ability.FireBlast.PullEvent");
const PushEventTag = new ue_1.GameplayTag("Ability.FireBlast.PushEvent");
let GA_FireBlast = class GA_FireBlast extends BP_GameplayAbility_1.BP_GameplayAbility {
    K2_ActivateAbility() {
        this.K2_CommitAbility();
        this.StartUI_CD();
        this.BindPull();
        this.BindPush();
        this.PlayMontage();
    }
    PlayMontage() {
        const MontageTask = UE.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(this, "", MA_FireBlast);
        MontageTask.OnCompleted.Add(() => this.K2_EndAbility());
        MontageTask.OnInterrupted.Add(() => this.K2_EndAbility());
        MontageTask.OnBlendOut.Add(() => this.K2_EndAbility());
        MontageTask.OnCancelled.Add(() => this.K2_EndAbility());
        MontageTask.ReadyForActivation();
    }
    BindPull() {
        const WaitEvent = UE.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this, PullEventTag, null, true, true);
        WaitEvent.EventReceived.Add((...args) => this.Pull(...args));
        WaitEvent.ReadyForActivation();
    }
    Pull(Payload) {
        //蓝图事件触发，生成目标数据柄
        this.SpawnTargetData();
    }
    //数据有效执行拉取
    ValidData(Data) {
        this.TargetData = Data;
        const AllActors = UE.AbilitySystemBlueprintLibrary.GetActorsFromTargetData(Data, 0);
        const AvatarActor = this.GetAvatarActorFromActorInfo();
        //除玩家外的其他目标
        this.HitActors = UE.NewArray(UE.Actor);
        for (let i = 0; i < AllActors.Num(); i++) {
            const HitCharacter = AllActors.Get(i);
            if (HitCharacter && HitCharacter !== AvatarActor) {
                //添加到不包含玩家的数组
                this.HitActors.Add(HitCharacter);
                HitCharacter.Stun(2);
                const StartLocation = HitCharacter.K2_GetActorLocation();
                const EndLocation = AvatarActor.K2_GetActorLocation();
                const Direction = new UE.Vector(EndLocation.X - StartLocation.X, EndLocation.Y - StartLocation.Y, EndLocation.Z - StartLocation.Z);
                const ForwardVector = UE.KismetMathLibrary.GetForwardVector(UE.KismetMathLibrary.MakeRotFromX(Direction));
                HitCharacter.DashForward(ForwardVector, 800, 0.7);
            }
        }
    }
    BindPush() {
        const WaitEvent = UE.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this, PushEventTag, null, true, true);
        WaitEvent.EventReceived.Add((...args) => this.Push(...args));
        WaitEvent.ReadyForActivation();
    }
    Push(Payload) {
        const TargetData = UE.AbilitySystemBlueprintLibrary.AbilityTargetDataFromActorArray(this.HitActors, true);
        this.BP_ApplyGameplayEffectToTarget(TargetData, FireBlast_Damage);
        const AvatarActor = this.GetAvatarActorFromActorInfo();
        for (let i = 0; i < this.HitActors.Num(); i++) {
            const HitCharacter = this.HitActors.Get(i);
            if (HitCharacter) {
                HitCharacter.Stun(2);
                const StartLocation = HitCharacter.K2_GetActorLocation();
                const EndLocation = AvatarActor.K2_GetActorLocation();
                const Direction = new UE.Vector(StartLocation.X - EndLocation.X, StartLocation.Y - EndLocation.Y, StartLocation.Z - EndLocation.Z);
                const ForwardVector = UE.KismetMathLibrary.GetForwardVector(UE.KismetMathLibrary.MakeRotFromX(Direction));
                HitCharacter.DashForward(ForwardVector, 1500, 0.7);
            }
        }
    }
    K2_OnEndAbility(bWasCancelled) {
    }
};
GA_FireBlast = __decorate([
    (0, mixin_1.default)(AssetPath)
], GA_FireBlast);
exports.GA_FireBlast = GA_FireBlast;
//# sourceMappingURL=GA_FireBlast.js.map