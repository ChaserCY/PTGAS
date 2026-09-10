import * as UE from 'ue';
import mixin from "../../../../mixin";
import {$Nullable} from "puerts";
import {BP_BaseCharacter} from "../../BP_BaseCharacter";

const AssetPath = "/Game/BluePrints/Character/Enemy/AI/BTS_CheckDead.BTS_CheckDead_C";

export interface BTS_CheckDead extends UE.Game.BluePrints.Character.Enemy.AI.BTS_CheckDead.BTS_CheckDead_C {
}

@mixin(AssetPath)
export class BTS_CheckDead implements BTS_CheckDead {
    
    Character:BP_BaseCharacter;
    
    ReceiveActivationAI(OwnerController: $Nullable<UE.AIController>, ControlledPawn: $Nullable<UE.Pawn>) {
        this.Character = ControlledPawn as BP_BaseCharacter;
    }
    
    ReceiveSearchStartAI(OwnerController: $Nullable<UE.AIController>, ControlledPawn: $Nullable<UE.Pawn>) {
        if(this.Character){
            UE.BTFunctionLibrary.SetBlackboardValueAsBool(this,this.Dead,this.Character.Dead);
        }
    }

}