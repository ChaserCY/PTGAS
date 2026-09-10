import * as UE from 'ue';
import mixin from "../../../mixin";
import {BP_BaseCharacter} from "../BP_BaseCharacter";
import {UMG_EnemyBar} from "./UMG/UMG_EnemyBar";
import {$ref, $Ref} from "puerts";

const AssetPath = "/Game/BluePrints/Character/Enemy/BP_Enemy.BP_Enemy_C";
//创建属性
const AttributeSetHP = new UE.GameplayAttribute("HP","/Script/PTGAS.BaseAttributeSet:HP",null);
const AttributeSetMaxHP = new UE.GameplayAttribute("MaxHP","/Script/PTGAS.BaseAttributeSet:MaxHP",null);


const MA_Stun =  UE.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_Stun.MA_Stun");

export interface BP_Enemy extends UE.Game.BluePrints.Character.Enemy.BP_Enemy.BP_Enemy_C {
}

@mixin(AssetPath)
export class BP_Enemy extends BP_BaseCharacter implements BP_Enemy {
    
    UMG_Bar: UMG_EnemyBar;
    bSuccess: $Ref<boolean> = $ref(false);
    NewRotation: UE.Rotator;
    _rotationIntervalId: ReturnType<typeof setInterval> | null = null;

    ReceiveBeginPlay(){
        // super.ReceiveBeginPlay();
        this.BaseInit();

        this.UMG_Bar = this.Bar.GetUserWidgetObject() as UMG_EnemyBar;
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
 protected HPChangedEvent(Value: number) {
     super.HPChangedEvent(Value);
     this.SetBarValue();
     if(this.Dead){
         if(this.Bar){
             this.Bar.K2_DestroyComponent(this);
         }
         if(this._rotationIntervalId!==null){
             clearInterval(this._rotationIntervalId);
             this._rotationIntervalId = null;
         }
     }
 }

//ReceiveTick(DeltaSeconds: number) {
    //super.ReceiveTick(DeltaSeconds);这段导致了崩溃
    //this.SetBarRotation();
//}
    
    SetBarValue(){
        if(this.UMG_Bar){
            
            this.UMG_Bar.HP = UE.AbilitySystemBlueprintLibrary.GetFloatAttributeFromAbilitySystemComponent
            (
                this.AbilitySystemComponent,
                AttributeSetHP,
                this.bSuccess
            );
            this.UMG_Bar.Max_HP = UE.AbilitySystemBlueprintLibrary.GetFloatAttributeFromAbilitySystemComponent
            (
                this.AbilitySystemComponent,
                AttributeSetMaxHP,
                this.bSuccess
            );
            //console.log(this.UMG_Bar.HP,this.UMG_Bar.Max_HP);
        }
    }

    SelfTick(){
        if(!this.Dead){
            this.SetBarRotation();
        }
       
    }
    
    
    SetBarRotation(){
        const CameraRotation = UE.GameplayStatics.GetPlayerCameraManager(this,0).K2_GetActorRotation();
        this.NewRotation.Pitch = CameraRotation.Pitch * -1;
        this.NewRotation.Yaw = CameraRotation.Yaw + 180;
        this.NewRotation.Roll = CameraRotation.Roll * -1;
        this.Bar.K2_SetWorldRotation(this.NewRotation, false, null, false);
    }
    
    //停止控制器
    protected StopController(){
        const AIController = UE.AIBlueprintHelperLibrary.GetAIController(this.GetController());
        if(AIController){
            AIController.BrainComponent.StopLogic("Stop Controller");
        }
    }
    
    protected ResumeController(){
        const AIController = UE.AIBlueprintHelperLibrary.GetAIController(this.GetController());
        if(AIController){
            AIController.BrainComponent.RestartLogic();
        }
    }
    
    //眩晕
    Stun(StunDuration: number) {
        this.StopController();
        
        this.PlayAnimMontage(MA_Stun);
        
        setTimeout(()=>{
            this.ResumeController();
        },StunDuration*1000)
        
    }
}