"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BP_Enemy = void 0;
const UE = require("ue");
const mixin_1 = require("../../../mixin");
const BP_BaseCharacter_1 = require("../BP_BaseCharacter");
const puerts_1 = require("puerts");
const AssetPath = "/Game/BluePrints/Character/Enemy/BP_Enemy.BP_Enemy_C";
//创建属性
const AttributeSetHP = new UE.GameplayAttribute("HP", "/Script/PTGAS.BaseAttributeSet:HP", null);
const AttributeSetMaxHP = new UE.GameplayAttribute("MaxHP", "/Script/PTGAS.BaseAttributeSet:MaxHP", null);
let BP_Enemy = class BP_Enemy extends BP_BaseCharacter_1.BP_BaseCharacter {
    constructor() {
        super(...arguments);
        this.bSuccess = (0, puerts_1.$ref)(false);
        this._rotationIntervalId = null;
    }
    ReceiveBeginPlay() {
        // super.ReceiveBeginPlay();
        this.BaseInit();
        this.UMG_Bar = this.Bar.GetUserWidgetObject();
        this.SetBarValue();
        // 在 BeginPlay 中初始化，不能放类字段初始化器里（mixin 模式下不会执行）
        this.NewRotation = new UE.Rotator();
        // 用 setInterval 代替 Tick
        this._rotationIntervalId = setInterval(() => {
            this.SelfTick();
        }, 50);
        //50ms执行一次
    }
    //监听血量变化
    HPChangedEvent(Value) {
        super.HPChangedEvent(Value);
        this.SetBarValue();
        if (this.Dead) {
            if (this.Bar) {
                this.Bar.K2_DestroyComponent(this);
            }
            if (this._rotationIntervalId !== null) {
                clearInterval(this._rotationIntervalId);
                this._rotationIntervalId = null;
            }
        }
    }
    //ReceiveTick(DeltaSeconds: number) {
    //super.ReceiveTick(DeltaSeconds);这段导致了崩溃
    //this.SetBarRotation();
    //}
    SetBarValue() {
        if (this.UMG_Bar) {
            this.UMG_Bar.HP = UE.AbilitySystemBlueprintLibrary.GetFloatAttributeFromAbilitySystemComponent(this.AbilitySystemComponent, AttributeSetHP, this.bSuccess);
            this.UMG_Bar.Max_HP = UE.AbilitySystemBlueprintLibrary.GetFloatAttributeFromAbilitySystemComponent(this.AbilitySystemComponent, AttributeSetMaxHP, this.bSuccess);
            console.log(this.UMG_Bar.HP, this.UMG_Bar.Max_HP);
        }
    }
    SelfTick() {
        if (!this.Dead) {
            this.SetBarRotation();
        }
    }
    SetBarRotation() {
        const CameraRotation = UE.GameplayStatics.GetPlayerCameraManager(this, 0).K2_GetActorRotation();
        this.NewRotation.Pitch = CameraRotation.Pitch * -1;
        this.NewRotation.Yaw = CameraRotation.Yaw + 180;
        this.NewRotation.Roll = CameraRotation.Roll * -1;
        this.Bar.K2_SetWorldRotation(this.NewRotation, false, null, false);
    }
};
BP_Enemy = __decorate([
    (0, mixin_1.default)(AssetPath)
], BP_Enemy);
exports.BP_Enemy = BP_Enemy;
//# sourceMappingURL=BP_Enemy.js.map