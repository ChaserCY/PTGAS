"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BP_BaseCharacter = void 0;
const UE = require("ue");
const mixin_1 = require("../../mixin");
const AssetPath = "/Game/BluePrints/Character/BP_BaseCharacter.BP_BaseCharacter_C";
//导入被动回复的GA蓝图文件
const GA_BaseResponseClass = UE.Class.Load("/Game/BluePrints/Ability/BaseAbility/GA_BaseResponse.GA_BaseResponse_C");
const BaseResponseTag = new UE.GameplayTag("Ability.BaseResponse");
//导入普通攻击的GA蓝图文件
const GA_MeleeClass = UE.Class.Load("/Game/BluePrints/Ability/_00Melee/GA_Melee.GA_Melee_C");
//命中标签
const MeleeHitTag = new UE.GameplayTag("Ability.Melee.HitEvent");
let BP_BaseCharacter = class BP_BaseCharacter {
    constructor() {
        //动画蓝图
        this.ABP_Sinbi = null;
        //初始化摩擦力
        this.InitFriction = 0;
    }
    ReceiveBeginPlay() {
        this.BaseInit();
    }
    BaseInit() {
        this.ABP_Sinbi = this.Mesh.GetAnimInstance();
        this.InitAbility();
        this.InitBind();
        this.InitFriction = this.CharacterMovement.GroundFriction;
    }
    //初始化技能
    InitAbility() {
        if (GA_BaseResponseClass) {
            this.AbilitySystemComponent.K2_GiveAbilityAndActivateOnce(GA_BaseResponseClass);
            //调用蓝图对象的ASC组件的"GiveAbilityAndActivateOnce"节点
        }
        //GAS 提供的蓝图节点方法
        //     - 给予该角色这个能力(Gameplay类)
        //     - 立即激活一次该能力（执行 ActivateAbility 逻辑）
        //     - 执行完后移除这个能力（不会保留在能力列表里）
        //   - 用途：适用于一次性效果，比如受击反馈、出生特效、被动触发等
        if (GA_MeleeClass) {
            this.AbilitySystemComponent.K2_GiveAbility(GA_MeleeClass);
        }
    }
    //激活技能
    ActivateAbility(AbilityTay) {
        if (this.Dead)
            return;
        this.AbilitySystemComponent.TryActivateAbilitiesByTag(this.GetAbilityTag(AbilityTay));
    }
    //获取技能标签
    GetAbilityTag(AbilityTay) {
        return UE.BlueprintGameplayTagLibrary.MakeGameplayTagContainerFromTag(AbilityTay);
    }
    InitBind() {
        this.HPChanged.Add((...args) => this.HPChangedEvent(...args));
        //- this.HPChanged：一个 多播委托（Multicast Delegate），当 HP 变化时触发
        //   - .Add(...)：向这个委托注册一个监听函数
        //   - (...args) => this.HPChangedEvent(...args)：箭头函数，将所有参数透传给 HPChangedEvent 方法
        this.MPChanged.Add((...args) => this.MPChangedEvent(...args));
        this.SPChanged.Add((...args) => this.SPChangedEvent(...args));
        this.DamageBox.OnComponentBeginOverlap.Add((...args) => this.WeaponOverlop(...args));
    }
    WeaponOverlop(OverlappedComponent, OtherActor, OtherComp, OtherBodyIndex, bFromSweep, SweepResult) {
        if (this == OtherActor)
            return;
        if (!this.HitActor.Contains(OtherActor)) {
            this.HitActor.Add(OtherActor);
            //这个数组存起来，保证每次平A只会命中一次
            UE.KismetSystemLibrary.PrintString(this, `${this.GetName()}击中了->${OtherActor.GetName()}`, true, true, UE.LinearColor.Green, 5.0);
            const GameplayEventData = new UE.GameplayEventData();
            GameplayEventData.EventTag = MeleeHitTag;
            GameplayEventData.Instigator = this;
            GameplayEventData.Target = OtherActor;
            UE.AbilitySystemBlueprintLibrary.SendGameplayEventToActor(this, MeleeHitTag, GameplayEventData);
        }
    }
    //开始伤害(蒙太奇通知)
    BeginDamage() {
        this.HitActor.Empty();
        this.DamageBox.SetCollisionEnabled(UE.ECollisionEnabled.QueryOnly);
    }
    EndDamage() {
        this.HitActor.Empty();
        this.DamageBox.SetCollisionEnabled(UE.ECollisionEnabled.NoCollision);
    }
    HPChangedEvent(Value) {
        if (Value <= 0 && !this.Dead) {
            this.Dead = true;
            this.ABP_Sinbi.Dead = true; //设置动画蓝图的死亡状态
            //移除被动回复效果
            this.AbilitySystemComponent.RemoveActiveEffectsWithTags(this.GetAbilityTag(BaseResponseTag));
            this.CapsuleComponent.SetCollisionEnabled(UE.ECollisionEnabled.NoCollision);
        }
    }
    MPChangedEvent(Value) {
        // UE.KismetSystemLibrary.PrintString(this, Value.toString(),true,true,UE.LinearColor.Green);
    }
    SPChangedEvent(Value) {
        // UE.KismetSystemLibrary.PrintString(this, Value.toString(),true,true,UE.LinearColor.Green);
    }
    /*冲刺位移技能*/
    DashForward(DashDirection, Force /* = 1.000000 */, DashTime /* = 0.500000 */) {
        this.SetFrictionToZero(true);
        const Impulse = new UE.Vector(DashDirection.X * Force, DashDirection.Y * Force, DashDirection.Z * Force);
        this.CharacterMovement.AddImpulse(Impulse, true);
        setTimeout(() => {
            this.SetFrictionToZero(false);
        }, DashTime * 1000); //毫秒单位倒计时
    }
    /*设置摩擦力为0*/
    SetFrictionToZero(Zero) {
        if (Zero) {
            this.CharacterMovement.GroundFriction = 0;
            this.CapsuleComponent.SetCollisionResponseToChannel(UE.ECollisionChannel.ECC_Pawn, UE.ECollisionResponse.ECR_Ignore);
            this.CapsuleComponent.SetCollisionResponseToChannel(UE.ECollisionChannel.ECC_Camera, UE.ECollisionResponse.ECR_Ignore);
        }
        else {
            this.CharacterMovement.GroundFriction = this.InitFriction;
            this.CapsuleComponent.SetCollisionResponseToChannel(UE.ECollisionChannel.ECC_Pawn, UE.ECollisionResponse.ECR_Block);
            this.CapsuleComponent.SetCollisionResponseToChannel(UE.ECollisionChannel.ECC_Camera, UE.ECollisionResponse.ECR_Block);
        }
    }
};
BP_BaseCharacter = __decorate([
    (0, mixin_1.default)(AssetPath)
], BP_BaseCharacter);
exports.BP_BaseCharacter = BP_BaseCharacter;
//# sourceMappingURL=BP_BaseCharacter.js.map