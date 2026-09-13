import * as UE from 'ue';
import mixin from "../../../mixin";
import {BP_BaseCharacter} from "../BP_BaseCharacter";
import {UMG_MainUI} from "./UMG/UMG_MainUI";

// 直接注入 C++ ABasePlayerController 类
const BasePlayerControllerPath = "/Game/BluePrints/Character/Player/BP_PlayerController.BP_PlayerController_C";

// #region GameplayTag
/*普通攻击标签*/
const MeleeTag = new UE.GameplayTag("Ability.Melee");
/*回血技能标签*/
const HPRegenTag = new UE.GameplayTag("Ability.HPRegen");
/*冲刺技能标签*/
const DashTag = new UE.GameplayTag("Ability.Dash");
/*激光技能标签*/
const LaserTag = new UE.GameplayTag("Ability.Laser");
//激光技能结束标签
const LaserEndTag  = new UE.GameplayTag("Ability.Laser.LaserEnd");
//山崩地裂技能标签
const GroundBlastTag = new UE.GameplayTag("Ability.GroundBlast");
//火球技能标签
const FireBlastTag = new UE.GameplayTag("Ability.FireBlast");
// #endregion

// #region InputAction
const TestAction = UE.InputAction.Load("/Game/BluePrints/Input/Action/IA_Test.IA_Test")
const MeleeAction = UE.InputAction.Load("/Game/BluePrints/Input/Action/IA_Melee.IA_Melee")
const HPRegenAction = UE.InputAction.Load("/Game/BluePrints/Input/Action/IA_HPRegen.IA_HPRegen")
const DashAction = UE.InputAction.Load("/Game/BluePrints/Input/Action/IA_Dash.IA_Dash")
const LaserAction = UE.InputAction.Load("/Game/BluePrints/Input/Action/IA_Laser.IA_Laser")
const GroundBlastAction = UE.InputAction.Load("/Game/BluePrints/Input/Action/IA_GroundBlast.IA_GroundBlast")
const RightAction = UE.InputAction.Load("/Game/BluePrints/Input/Action/IA_Right.IA_Right")
const FireBlastAction = UE.InputAction.Load("/Game/BluePrints/Input/Action/IA_FireBlast.IA_FireBlast")

// #endregion

//主UI类
const MainUIClass = UE.Class.Load("/Game/BluePrints/Character/Player/UMG/UMG_MainUI.UMG_MainUI_C")

export interface BP_PlayerController extends UE.Game.BluePrints.Character.Player.BP_PlayerController.BP_PlayerController_C {
}

@mixin(BasePlayerControllerPath)
export class BP_PlayerController implements BP_PlayerController {

    //主UI
    MainUI: UMG_MainUI;

    //玩家
    BP_Player : BP_BaseCharacter;

    ReceiveBeginPlay() {
        this.BP_Player = UE.GameplayStatics.GetPlayerCharacter(this,0) as BP_BaseCharacter;

        this.MainUI = UE.WidgetBlueprintLibrary.Create(this,MainUIClass,this) as UMG_MainUI;
        if(this.MainUI){
            this.MainUI.AddToViewport();
        }
        
        this.BindKey();  //手动绑定自定义按键
    }

    //绑定按键
    BindKey(){
        const InputComponent = this.GetComponentByClass(UE.EnhancedInputComponent.StaticClass()) as UE.EnhancedInputComponent;
        if(InputComponent){
            InputComponent.BindAction(TestAction,UE.ETriggerEvent.Started,this,"TestAction"); //这里的第一个函数必须是蓝图函数，或者C++蓝图可以调用的函数
            InputComponent.BindAction(MeleeAction,UE.ETriggerEvent.Started, this,"Melee");
            InputComponent.BindAction(HPRegenAction,UE.ETriggerEvent.Started, this,"HPRegen");
            InputComponent.BindAction(DashAction,UE.ETriggerEvent.Started, this,"Dash");
            InputComponent.BindAction(LaserAction,UE.ETriggerEvent.Started, this,"Laser");
            InputComponent.BindAction(GroundBlastAction,UE.ETriggerEvent.Started, this,"GroundBlast");
            InputComponent.BindAction(RightAction,UE.ETriggerEvent.Started, this,"RightPressed");
            InputComponent.BindAction(FireBlastAction,UE.ETriggerEvent.Started, this,"FireBlast");
        }
    }

    // #region Skill_Function
    TestAction(){
        console.log("TestAction Begin")
    }
    
    //普通攻击(重写 C++ 里的 BlueprintNativeEvent)
    Melee(){
        if(this.BP_Player){
            if(this.BP_Player.IsGroundBlaseting){
                this.BP_Player.AbilitySystemComponent.TargetConfirm();
                this.BP_Player.IsGroundBlaseting = false;
                
            }
            else{
                //对应BP_BaseCharacter.ts里的ActivateAbility方法，传入一个GameplayTag参数
                this.BP_Player.ActivateAbility(MeleeTag);
            }
        }
    }

    RightPressed(){
        if(this.BP_Player) {
            this.BP_Player.AbilitySystemComponent.TargetCancel();
            this.BP_Player.IsGroundBlaseting = false;
        }
    }
    
    
    Dash() {
        if(this.BP_Player){
            this.BP_Player.ActivateAbility(DashTag);
        }
    }

    //激活激光
    Laser() {
        if(this.BP_Player){
            if(!this.BP_Player.IsLasering){
                this.BP_Player.ActivateAbility(LaserTag);
            }
            //如果已经在发射激光，再次按下按键时，发送事件
            else{
                const GameplayEventData = new UE.GameplayEventData();
                GameplayEventData.EventTag = LaserEndTag;
                GameplayEventData.Instigator = this;
                GameplayEventData.Target = this;
                UE.AbilitySystemBlueprintLibrary.SendGameplayEventToActor(this.BP_Player, LaserEndTag, GameplayEventData);
            }
        }
        
    }

    GroundBlast(){
        //防止多次释放
        if(this.BP_Player && !this.BP_Player.IsGroundBlaseting){
            this.BP_Player.ActivateAbility(GroundBlastTag);
        }
    }
    
    FireBlast(){
        console.log("按下5键")
        if(this.BP_Player){
            this.BP_Player.ActivateAbility(FireBlastTag);
        }
    }
    
    HPRegen() {
        console.log("HPRegen");
        if(this.BP_Player){
            this.BP_Player.ActivateAbility(HPRegenTag);
        }
    }
    // #endregion
}