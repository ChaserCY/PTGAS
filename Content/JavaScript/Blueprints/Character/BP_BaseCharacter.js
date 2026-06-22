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
const GA_BaseResponseClass = UE.Class.Load("/Game/BluePrints/Ability/BaseAbility/GA_BaseResponse.GA_BaseResponse_C");
//导入蓝图文件
const GA_MeleeClass = UE.Class.Load("/Game/BluePrints/Ability/_00Melee/GA_Melee.GA_Melee_C");
let BP_BaseCharacter = class BP_BaseCharacter {
    ReceiveBeginPlay() {
        this.InitAbility();
        this.InitBind();
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
    }
    HPChangedEvent(Value) {
        UE.KismetSystemLibrary.PrintString(this, Value.toString(), true, true, UE.LinearColor.Green);
        // - 当 HP 变化时被调用，Value 是新的 HP 值
        //   - UE.KismetSystemLibrary.PrintString：在屏幕上打印字符串（对应蓝图中的 Print String 节点）
        //     - 参数依次是：WorldContext、字符串、是否打印到屏幕、是否打印到日志、颜色
    }
    MPChangedEvent(Value) {
        UE.KismetSystemLibrary.PrintString(this, Value.toString(), true, true, UE.LinearColor.Green);
    }
    SPChangedEvent(Value) {
        UE.KismetSystemLibrary.PrintString(this, Value.toString(), true, true, UE.LinearColor.Green);
    }
};
BP_BaseCharacter = __decorate([
    (0, mixin_1.default)(AssetPath)
], BP_BaseCharacter);
exports.BP_BaseCharacter = BP_BaseCharacter;
//# sourceMappingURL=BP_BaseCharacter.js.map