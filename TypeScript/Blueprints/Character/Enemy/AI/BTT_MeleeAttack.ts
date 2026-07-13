import * as UE from 'ue';
import mixin from "../../../../mixin";
import {$Nullable} from "puerts";
import {BP_BaseCharacter} from "../../BP_BaseCharacter";


const AssetPath = "/Game/BluePrints/Character/Enemy/AI/BTT_MeleeAttack.BTT_MeleeAttack";

const MeleeTag = new UE.GameplayTag("Ability.Melee");

export interface BTT_MeleeAttack extends UE.Game.BluePrints.Character.Enemy.AI.BTT_MeleeAttack.BTT_MeleeAttack_C {
}

@mixin(AssetPath)
export class BTT_MeleeAttack implements BTT_MeleeAttack {
    ReceiveExecuteAI(OwnerController: $Nullable<UE.AIController>, ControlledPawn: $Nullable<UE.Pawn>) {
        const Character = ControlledPawn as BP_BaseCharacter;
        if(Character){
            Character.ActivateAbility(MeleeTag);
            this.FinishExecute(true);
        }
        else{
            this.FinishExecute(true);
        }
        
        
    }


}