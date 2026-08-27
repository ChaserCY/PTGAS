import * as UE from 'ue';
import mixin from "../../../mixin";
import {BP_BaseCharacter} from "../BP_BaseCharacter";
import {UMG_MainUI} from "./UMG/UMG_MainUI";

// 直接注入 C++ ABasePlayerController 类
const BasePlayerControllerPath = "/Script/PTGAS.BasePlayerController";

// #region GameplayTag
//普通攻击标签
const MeleeTag = new UE.GameplayTag("Ability.Melee");
//回血技能标签
const HPRegenTag = new UE.GameplayTag("Ability.HPRegen");
// #endregion

// #region InputAction
const TestAction = UE.InputAction.Load("/Game/BluePrints/Input/Action/IA_Test.IA_Test")
const MeleeAction = UE.InputAction.Load("/Game/BluePrints/Input/Action/IA_Melee.IA_Melee")
const HPRegenAction = UE.InputAction.Load("/Game/BluePrints/Input/Action/IA_HPRegen.IA_HPRegen")
// #endregion

//主UI类
const MainUIClass = UE.Class.Load("/Game/BluePrints/Character/Player/UMG/UMG_MainUI.UMG_MainUI_C")

export interface BP_PlayerController extends UE.BasePlayerController {
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
        }
    }

    // #region Skill_Function
    TestAction(){
        console.log("TestAction Begin")
    }
    
    //普通攻击(重写 C++ 里的 BlueprintNativeEvent)
    Melee(){
        if(this.BP_Player){
            this.BP_Player.ActivateAbility(MeleeTag);
            //对应BP_BaseCharacter.ts里的ActivateAbility方法，传入一个GameplayTag参数
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