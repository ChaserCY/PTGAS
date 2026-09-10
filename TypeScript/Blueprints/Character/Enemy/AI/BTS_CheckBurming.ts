import * as UE from 'ue';
import mixin from "../../../../mixin";
import {$Nullable} from "puerts";

const AssetPath = "/Game/BluePrints/Character/Enemy/AI/BTS_CheckBurming.BTS_CheckBurming_C";

const BurmingTag = new UE.GameplayTag("Ability.FireBlast.BurmingDamage");

export interface BTS_CheckBurming extends UE.Game.BluePrints.Character.Enemy.AI.BTS_CheckBurming.BTS_CheckBurming_C {
}

@mixin(AssetPath)
export class BTS_CheckBurming implements BTS_CheckBurming {
    
    ReceiveSearchStartAI(OwnerController: $Nullable<UE.AIController>, ControlledPawn: $Nullable<UE.Pawn>) {
        if(UE.AbilitySystemBlueprintLibrary.GetAbilitySystemComponent(ControlledPawn).HasMatchingGameplayTag(BurmingTag)){
            UE.BTFunctionLibrary.SetBlackboardValueAsBool(this,this.Burming,true);
        }
        else{
            UE.BTFunctionLibrary.SetBlackboardValueAsBool(this,this.Burming,false);
        }
    }

}