import mixin from "../../../mixin";

import {BP_BaseCharacter} from "../BP_BaseCharacter";
import * as UE from "ue";
//继承自父类蓝图，导入父类ts


const AssetPath = "/Game/BluePrints/Character/Player/BP_Player.BP_Player_C";

//const IMC_Default = UE.Object.Load("/Game/BluePrints/Input/IMC_Default.IMC_Default") as UE.InputMappingContext;
const IMC_Default = UE.InputMappingContext.Load("/Game/BluePrints/Input/IMC_Default.IMC_Default");
//加载资源，注意类型

export interface BP_Player extends UE.Game.BluePrints.Character.Player.BP_Player.BP_Player_C {

}

@mixin(AssetPath)
export class  BP_Player extends BP_BaseCharacter implements BP_Player {
    
    ReceiveBeginPlay(){
        // super.ReceiveBeginPlay();
        this.BaseInit();
        
        
        this.BP_PlayerController = UE.GameplayStatics.GetPlayerController(this,0) as UE.Game.BluePrints.Character.Player.BP_PlayerController.BP_PlayerController_C;
        //给蓝图中定义的变量赋值，= get player controller + cast to BP_PlayerController

        this.AddMappingContext();
        //执行自定义函数

        this.LookCameraLine.SetPlayRate(1/0.3);
        //设置时间轴的播放速度，时间轴也定义在蓝图中
    }

    //相机开始位置
    CameraStartLocation = new UE.Vector;
    //相机结束位置
    CameraEndLocation = new UE.Vector(0, 0, 180);
    //相机开始的旋转
    CameraStartRotation = new UE.Rotator;
    //相机结束的旋转
    CameraEndRotation = new UE.Rotator(-17, 0, 0);

    Move_Rotator: UE.Rotator;

    //添加输入映射
    AddMappingContext(){
        if(this.BP_PlayerController){
            
            let EnhanceInputSubsystem = UE.SubsystemBlueprintLibrary.GetLocalPlayerSubSystemFromPlayerController(
                this.BP_PlayerController,
                UE.EnhancedInputLocalPlayerSubsystem.StaticClass()
            )as UE.EnhancedInputLocalPlayerSubsystem;
            //as 可以强制告诉let声明变量的类型
            
            if(EnhanceInputSubsystem&&IMC_Default){
                EnhanceInputSubsystem.AddMappingContext(IMC_Default,0);
            }
            
            //限制相机控制的俯仰角度
            UE.GameplayStatics.GetPlayerCameraManager(this,0).ViewPitchMin = -65;
            UE.GameplayStatics.GetPlayerCameraManager(this,0).ViewPitchMax = 25;
            
        }
        
    }
    
    //鼠标移动视角
    Look(ActionValue: UE.Vector2D) {
        this.AddControllerYawInput(ActionValue.X);
        this.AddControllerPitchInput(ActionValue.Y);
        
    }

    //移动
    Move(ActionValue: UE.Vector2D) {
        //前进
        if (!this.Move_Rotator) {
            this.Move_Rotator = new UE.Rotator(0, 0, 0);
        }
        this.Move_Rotator.Yaw =this.GetControlRotation().Yaw;
    
        const ForwardVector = UE.KismetMathLibrary.GetForwardVector(this.Move_Rotator);
        const RightVector = UE.KismetMathLibrary.GetRightVector(this.Move_Rotator);
        
        this.AddMovementInput(ForwardVector,ActionValue.Y);
        this.AddMovementInput(RightVector,ActionValue.X);
        
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
    
    
    
}