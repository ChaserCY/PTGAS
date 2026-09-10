import * as UE from 'ue';
import mixin from "../../mixin";
import {BP_PlayerController} from "../Character/Player/BP_PlayerController";
//需要导入mixin 模块

//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
//import {xxxx} from "../xxxx";

const AssetPath = "/Game/BluePrints/Ability/BP_GameplayAbility.BP_GameplayAbility_C";

export interface BP_GameplayAbility extends UE.Game.BluePrints.Ability.BP_GameplayAbility.BP_GameplayAbility_C {
}

@mixin(AssetPath)
//有继承：export class BP_GameplayAbility extends xxxx implements BP_GameplayAbility { }
export class BP_GameplayAbility implements BP_GameplayAbility {
    
    PlayerController:BP_PlayerController;
    HitActors:UE.TArray<UE.Actor>;
    
//开始的UI的CD
    StartUI_CD(){
        this.PlayerController = UE.GameplayStatics.GetPlayerController(this,0) as BP_PlayerController;
        if(this.PlayerController && this.PlayerController.MainUI)
        {
            const AbilitySlots = this.PlayerController.MainUI.AllAbilitySlot;

            console.log(AbilitySlots);

            for(let i = 0;i < AbilitySlots.Num();i++)
            {
                if(this.GetClass()==AbilitySlots.GetRef(i).AbilityClass){
                    AbilitySlots.GetRef(i).StartUI_CD();
                    break;
                }
            }

        }
    }
    
    
}