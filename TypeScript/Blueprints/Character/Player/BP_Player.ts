import mixin from "../../../mixin";

import {BP_BaseCharacter} from "../BP_BaseCharacter";
import * as UE from "ue";
//继承自父类蓝图，导入父类ts
import {BP_PlayerController} from "./BP_PlayerController";
import {$Nullable} from "puerts";
import {GameplayTag} from "ue";

const AssetPath = "/Game/BluePrints/Character/Player/BP_Player.BP_Player_C";

/*冲刺命中事件*/
const DashHitTag = new GameplayTag("Ability.Dash.HitEvent");

const JumpAction = UE.InputAction.Load("/Game/BluePrints/Input/Action/IA_Jump.IA_Jump")
const MoveAction = UE.InputAction.Load("/Game/BluePrints/Input/Action/IA_Move.IA_Move")
const LookAction = UE.InputAction.Load("/Game/BluePrints/Input/Action/IA_Look.IA_Look")

//锁定相机
const LockCameraAction = UE.InputAction.Load("/Game/BluePrints/Input/Action/IA_LockCamera.IA_LockCamera")

//const IMC_Default = UE.Object.Load("/Game/BluePrints/Input/IMC_Default.IMC_Default") as UE.InputMappingContext;//加载资源，注意类型
const IMC_Default = UE.InputMappingContext.Load("/Game/BluePrints/Input/IMC_Default.IMC_Default");

//创建属性
const AttributeSetHP = new UE.GameplayAttribute("HP","/Script/PTGAS.BaseAttributeSet:HP",null);
const AttributeSetMaxHP = new UE.GameplayAttribute("MaxHP","/Script/PTGAS.BaseAttributeSet:MaxHP",null);

const AttributeSetMP = new UE.GameplayAttribute("MP","/Script/PTGAS.BaseAttributeSet:MP",null);
const AttributeSetMaxMP = new UE.GameplayAttribute("MaxMP","/Script/PTGAS.BaseAttributeSet:MaxMP",null);

const AttributeSetSP = new UE.GameplayAttribute("SP","/Script/PTGAS.BaseAttributeSet:SP",null);
const AttributeSetMaxSP = new UE.GameplayAttribute("MaxSP","/Script/PTGAS.BaseAttributeSet:MaxSP",null);

export interface BP_Player extends UE.Game.BluePrints.Character.Player.BP_Player.BP_Player_C {

}

@mixin(AssetPath)
export class  BP_Player extends BP_BaseCharacter implements BP_Player {

    //玩家控制器,一定要删除蓝图中对应变量
    PlayerController: BP_PlayerController;
    
    //相机开始位置
    CameraStartLocation = new UE.Vector;
    //相机结束位置
    CameraEndLocation = new UE.Vector(0, 0, 180);
    //相机开始的旋转
    CameraStartRotation = new UE.Rotator;
    //相机结束的旋转
    CameraEndRotation = new UE.Rotator(-17, 0, 0);
    
    InLock:boolean = false;
    
    ReceiveBeginPlay(){
        this.PlayerController = UE.GameplayStatics.GetPlayerController(this,0) as BP_PlayerController;
        //给蓝图中定义的变量赋值，= get player controller + cast to BP_PlayerController
        
        // super.ReceiveBeginPlay();
        this.BaseInit();
        
        //执行自定义函数
        this.AddMappingContext();

        //设置时间轴的播放速度，时间轴也定义在蓝图中
        if(this.LookCameraLine){
            this.LookCameraLine.SetPlayRate(1/0.3);
        }
        
        //添加球形碰撞触发事件
        this.Sphere.OnComponentBeginOverlap.Add((...args)=>this.SphereOnOverlap(...args));
        
    }
    

    Move_Rotator: UE.Rotator;

    //添加输入映射
    AddMappingContext(){
        if(this.PlayerController){
            
            let EnhanceInputSubsystem = UE.SubsystemBlueprintLibrary.GetLocalPlayerSubSystemFromPlayerController(
                this.PlayerController,
                UE.EnhancedInputLocalPlayerSubsystem.StaticClass()
            )as UE.EnhancedInputLocalPlayerSubsystem;
            //as 可以强制告诉let声明变量的类型
            
            if(EnhanceInputSubsystem&&IMC_Default){
                EnhanceInputSubsystem.AddMappingContext(IMC_Default,0);
            }
            
            //限制相机控制的俯仰角度
            const CameraManager = UE.GameplayStatics.GetPlayerCameraManager(this,0);
            if(CameraManager){
                CameraManager.ViewPitchMin = -65;
                CameraManager.ViewPitchMax = 25;
            }
            
            this.BindKey();
        }
        
    }

    //绑定按键
    BindKey(){
        const InputComponent = this.GetComponentByClass(UE.EnhancedInputComponent.StaticClass()) as UE.EnhancedInputComponent;
        if(InputComponent){
            InputComponent.BindAction(JumpAction,UE.ETriggerEvent.Started,this,"Jumpp"); //这里的第一个函数必须是蓝图函数，或者C++蓝图可以调用的函数
            InputComponent.BindAction(MoveAction,UE.ETriggerEvent.Triggered, this,"Move");
            InputComponent.BindAction(LookAction,UE.ETriggerEvent.Triggered, this,"Look");
            InputComponent.BindAction(LockCameraAction,UE.ETriggerEvent.Started, this,"IA_LockCamera");
        }
        
    }
    
    protected InitAbility(){
        super.InitAbility();
        for(let i=0;i<this.GAS.Num();i++){
            if(this.GAS.GetRef(i)){
                this.AbilitySystemComponent.K2_GiveAbility(this.GAS.GetRef(i));
                if(this.PlayerController && this.PlayerController.MainUI && this.PlayerController.MainUI.AbilitySlots.GetRef(i)){
                    this.PlayerController.MainUI.AbilitySlots.GetRef(i).InitInfo(this.GetAbilityInfo(this.GAS.GetRef(i),0));
                }
            }
        }
    }
    
    Jumpp() {
        this.Jump();
    }

    IA_LockCamera() {
        this.LookCamera(!this.InLock);
        this.InLock = !this.InLock;
    }

    //鼠标移动视角
    Look(ActionValue: UE.InputActionValue) {
        const Value2D = UE.EnhancedInputLibrary.Conv_InputActionValueToAxis2D(ActionValue);
        this.AddControllerYawInput(Value2D.X);
        this.AddControllerPitchInput(Value2D.Y);
        
    }

    //移动
    Move(ActionValue: UE.InputActionValue) {
        //前进
        const Value2D = UE.EnhancedInputLibrary.Conv_InputActionValueToAxis2D(ActionValue);
        
        if (!this.Move_Rotator) {
            this.Move_Rotator = new UE.Rotator(0, 0, 0);
        }
        this.Move_Rotator.Yaw =this.GetControlRotation().Yaw;
    
        const ForwardVector = UE.KismetMathLibrary.GetForwardVector(this.Move_Rotator);
        const RightVector = UE.KismetMathLibrary.GetRightVector(this.Move_Rotator);
        
        this.AddMovementInput(ForwardVector,Value2D.Y);
        this.AddMovementInput(RightVector,Value2D.X);
        
    }
    
    //锁定还需要改类图视图中组件的设置(代码实现)
    //锁定镜头
    LookCamera(OpenLook: boolean) {
        //每次执行都按照参数绑定，不需要判断当前状态
        this.bUseControllerRotationYaw = OpenLook;
        this.SpringArm.bUsePawnControlRotation = !OpenLook;
        this.CharacterMovement.bOrientRotationToMovement = !OpenLook;
        
        if(OpenLook){
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
    LookCameraLine__UpdateFunc(){
        
        const NewLocation = UE.KismetMathLibrary.VLerp(this.CameraStartLocation, new UE.Vector(0,0,180),this.LookCameraLine_Time_E2604BD340D43B16DB00B9849B380DCE);
    
        const NewRotation = UE.KismetMathLibrary.RLerp(this.CameraStartRotation, new UE.Rotator(-17,0,0), this.LookCameraLine_Time_E2604BD340D43B16DB00B9849B380DCE, true);
        
        this.Camera.K2_SetRelativeLocationAndRotation(NewLocation, NewRotation, false, null, false);
        
    }
    
    //碰撞事件的回调
    SphereOnOverlap(OverlappedComponent: $Nullable<UE.PrimitiveComponent>, OtherActor: $Nullable<UE.Actor>, OtherComp: $Nullable<UE.PrimitiveComponent>, OtherBodyIndex: number, bFromSweep: boolean, SweepResult: UE.HitResult){
        if(OtherActor != this&& !this.HitActor.Contains(OtherActor)){
            this.HitActor.Add(OtherActor);
            UE.KismetSystemLibrary.PrintString(
                this,
                `${this.GetName()}击中了->${OtherActor.GetName()}`,
                true,
                true,
                UE.LinearColor.Green,
                5.0
            );

            const GameplayEventData = new UE.GameplayEventData();
            GameplayEventData.EventTag = DashHitTag;
            GameplayEventData.Instigator = this;
            GameplayEventData.Target = OtherActor;
            UE.AbilitySystemBlueprintLibrary.SendGameplayEventToActor(this,DashHitTag,GameplayEventData);
        }
    }
    
    SetFrictionToZero(isZero: boolean) {
        super.SetFrictionToZero(isZero);
        /*防止摄像机杆子收缩*/
        this.SpringArm.bDoCollisionTest = !isZero;
        this.Sphere.SetCollisionEnabled(isZero?UE.ECollisionEnabled.QueryOnly:UE.ECollisionEnabled.NoCollision);
        /*第二个参数是是否更改后，立即检测*/
        this.Sphere.SetSphereRadius(isZero? 80 : 32, true);
        this.HitActor.Empty();
    }

    protected HPChangedEvent(Value: number){
        super.HPChangedEvent(Value);

        if(this.PlayerController && this.PlayerController.MainUI){
            const Pre = Value/UE.AbilitySystemBlueprintLibrary.GetFloatAttributeFromAbilitySystemComponent(this.AbilitySystemComponent,AttributeSetMaxHP,null);
            this.PlayerController.MainUI.HPAttributeBar.SetProgress(Pre);
        }

        //玩家死亡时
        if(this.Dead){
           //禁用输入
            this.DisableInput(this.PlayerController);
        }

    }
    
    protected MPChangedEvent(Value: number) {
        super.MPChangedEvent(Value);
        if(this.PlayerController && this.PlayerController.MainUI){
            const Pre = Value/UE.AbilitySystemBlueprintLibrary.GetFloatAttributeFromAbilitySystemComponent(this.AbilitySystemComponent,AttributeSetMaxMP,null);
            this.PlayerController.MainUI.MPAttributeBar.SetProgress(Pre);
        }
    }

    protected SPChangedEvent(Value: number) {
        super.SPChangedEvent(Value);
        if(this.PlayerController && this.PlayerController.MainUI){
            const Pre = Value/UE.AbilitySystemBlueprintLibrary.GetFloatAttributeFromAbilitySystemComponent(this.AbilitySystemComponent,AttributeSetMaxSP,null);
            this.PlayerController.MainUI.SPAttributeBar.SetProgress(Pre);
        }
    }
    

}