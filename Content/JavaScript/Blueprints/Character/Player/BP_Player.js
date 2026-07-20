"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BP_Player = void 0;
const mixin_1 = require("../../../mixin");
const BP_BaseCharacter_1 = require("../BP_BaseCharacter");
const UE = require("ue");
const AssetPath = "/Game/BluePrints/Character/Player/BP_Player.BP_Player_C";
//const IMC_Default = UE.Object.Load("/Game/BluePrints/Input/IMC_Default.IMC_Default") as UE.InputMappingContext;
const IMC_Default = UE.InputMappingContext.Load("/Game/BluePrints/Input/IMC_Default.IMC_Default");
//加载资源，注意类型
//创建属性
const AttributeSetHP = new UE.GameplayAttribute("HP", "/Script/PTGAS.BaseAttributeSet:HP", null);
const AttributeSetMaxHP = new UE.GameplayAttribute("MaxHP", "/Script/PTGAS.BaseAttributeSet:MaxHP", null);
let BP_Player = class BP_Player extends BP_BaseCharacter_1.BP_BaseCharacter {
    constructor() {
        super(...arguments);
        //一定要删除蓝图中对应变量
        //相机开始位置
        this.CameraStartLocation = new UE.Vector;
        //相机结束位置
        this.CameraEndLocation = new UE.Vector(0, 0, 180);
        //相机开始的旋转
        this.CameraStartRotation = new UE.Rotator;
        //相机结束的旋转
        this.CameraEndRotation = new UE.Rotator(-17, 0, 0);
    }
    ReceiveBeginPlay() {
        this.BP_PlayerController = UE.GameplayStatics.GetPlayerController(this, 0);
        //给蓝图中定义的变量赋值，= get player controller + cast to BP_PlayerController
        // super.ReceiveBeginPlay();
        this.BaseInit();
        this.AddMappingContext();
        //执行自定义函数
        this.LookCameraLine.SetPlayRate(1 / 0.3);
        //设置时间轴的播放速度，时间轴也定义在蓝图中
    }
    //添加输入映射
    AddMappingContext() {
        if (this.BP_PlayerController) {
            let EnhanceInputSubsystem = UE.SubsystemBlueprintLibrary.GetLocalPlayerSubSystemFromPlayerController(this.BP_PlayerController, UE.EnhancedInputLocalPlayerSubsystem.StaticClass());
            //as 可以强制告诉let声明变量的类型
            if (EnhanceInputSubsystem && IMC_Default) {
                EnhanceInputSubsystem.AddMappingContext(IMC_Default, 0);
            }
            //限制相机控制的俯仰角度
            UE.GameplayStatics.GetPlayerCameraManager(this, 0).ViewPitchMin = -65;
            UE.GameplayStatics.GetPlayerCameraManager(this, 0).ViewPitchMax = 25;
        }
    }
    InitAbility() {
        super.InitAbility();
        for (let i = 0; i < this.GAS.Num(); i++) {
            if (this.GAS.GetRef(i)) {
                this.AbilitySystemComponent.K2_GiveAbility(this.GAS.GetRef(i));
                this.BP_PlayerController.MainUI.AbilitySlots.GetRef(i).InitInfo(this.GetAbilityInfo(this.GAS.GetRef(i), 0));
            }
        }
    }
    //鼠标移动视角
    Look(ActionValue) {
        this.AddControllerYawInput(ActionValue.X);
        this.AddControllerPitchInput(ActionValue.Y);
    }
    //移动
    Move(ActionValue) {
        //前进
        if (!this.Move_Rotator) {
            this.Move_Rotator = new UE.Rotator(0, 0, 0);
        }
        this.Move_Rotator.Yaw = this.GetControlRotation().Yaw;
        const ForwardVector = UE.KismetMathLibrary.GetForwardVector(this.Move_Rotator);
        const RightVector = UE.KismetMathLibrary.GetRightVector(this.Move_Rotator);
        this.AddMovementInput(ForwardVector, ActionValue.Y);
        this.AddMovementInput(RightVector, ActionValue.X);
    }
    //锁定还需要改类图视图中组件的设置(代码实现)
    //锁定镜头
    LookCamera(OpenLook) {
        //每次执行都按照参数绑定，不需要判断当前状态
        this.bUseControllerRotationYaw = OpenLook;
        this.SpringArm.bUsePawnControlRotation = !OpenLook;
        this.CharacterMovement.bOrientRotationToMovement = !OpenLook;
        if (OpenLook) {
            this.CameraStartLocation = this.Camera.RelativeLocation;
            this.CameraStartRotation = this.Camera.RelativeRotation;
            this.LookCameraLine.PlayFromStart();
            //启动时间轴
        }
        else {
            this.CameraStartLocation = UE.Vector.ZeroVector;
            this.CameraStartRotation = UE.Rotator.ZeroRotator;
            this.LookCameraLine.ReverseFromEnd();
        }
    }
    //镜头缓动,千万不要打错字
    LookCameraLine__UpdateFunc() {
        const NewLocation = UE.KismetMathLibrary.VLerp(this.CameraStartLocation, new UE.Vector(0, 0, 180), this.LookCameraLine_Time_E2604BD340D43B16DB00B9849B380DCE);
        const NewRotation = UE.KismetMathLibrary.RLerp(this.CameraStartRotation, new UE.Rotator(-17, 0, 0), this.LookCameraLine_Time_E2604BD340D43B16DB00B9849B380DCE, true);
        this.Camera.K2_SetRelativeLocationAndRotation(NewLocation, NewRotation, false, null, false);
    }
    HPChangedEvent(Value) {
        super.HPChangedEvent(Value);
        const Pre = Value / UE.AbilitySystemBlueprintLibrary.GetFloatAttributeFromAbilitySystemComponent(this.AbilitySystemComponent, AttributeSetMaxHP, null);
        this.BP_PlayerController.MainUI.HPAttributeBar.SetProgress(Pre);
        //玩家死亡时
        if (this.Dead) {
            //禁用输入
            this.DisableInput(this.BP_PlayerController);
        }
    }
};
BP_Player = __decorate([
    (0, mixin_1.default)(AssetPath)
], BP_Player);
exports.BP_Player = BP_Player;
//# sourceMappingURL=BP_Player.js.map