import * as UE from 'ue';
import mixin from "../../../mixin";
import {BP_BaseCharacter} from "../BP_BaseCharacter";

const AssetPath = "/Game/BluePrints/Character/Player/BP_PlayerController.BP_PlayerController_C";

const MeleeTag = new UE.GameplayTag("Ability.Melee");

export interface BP_PlayerController extends UE.Game.BluePrints.Character.Player.BP_PlayerController.BP_PlayerController_C {
}

@mixin(AssetPath)
export class BP_PlayerController implements BP_PlayerController {
    //玩家
    BP_Player : BP_BaseCharacter;
    
    ReceiveBeginPlay() {
        this.BP_Player = UE.GameplayStatics.GetPlayerCharacter(this,0) as BP_BaseCharacter;
    }
    
    //普通攻击(重写编辑器里的同名函数)
    Melee(){
        if(this.BP_Player){
            this.BP_Player.ActivateAbility(MeleeTag);
            //对应BP_BaseCharacter.ts里的ActivateAbility方法，传入一个GameplayTag参数
        }
    }
}