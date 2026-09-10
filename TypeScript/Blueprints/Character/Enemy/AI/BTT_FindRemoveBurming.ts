import * as UE from 'ue';
import mixin from "../../../../mixin";
import {$Nullable} from "puerts";


const AssetPath = "/Game/BluePrints/Character/Enemy/AI/BTT_FindRemoveBurming.BTT_FindRemoveBurming_C";

const RemoveBuffClass  = UE.Class.Load("/Game/BluePrints/Ability/_05FireBlast/BP_RemoveBurming.BP_RemoveBurming_C")

export interface BTT_FindRemoveBurming extends UE.Game.BluePrints.Character.Enemy.AI.BTT_FindRemoveBurming.BTT_FindRemoveBurming_C {
}

@mixin(AssetPath)
export class BTT_FindRemoveBurming implements BTT_FindRemoveBurming {
    
    ReceiveExecuteAI(OwnerController: $Nullable<UE.AIController>, ControlledPawn: $Nullable<UE.Pawn>) {
        const BurmingActor = UE.GameplayStatics.GetActorOfClass(this,RemoveBuffClass);
        
        if(BurmingActor){
            UE.BTFunctionLibrary.SetBlackboardValueAsVector(this,this.Location,BurmingActor.K2_GetActorLocation());
            this.FinishExecute(true);
        }
        else{
            this.FinishExecute(false);
        }
        
        
    }

}