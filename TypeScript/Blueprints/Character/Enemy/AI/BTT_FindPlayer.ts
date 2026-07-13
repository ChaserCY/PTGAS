import * as UE from 'ue';
import mixin from "../../../../mixin";
import {$Nullable} from "puerts";
import {BP_BaseCharacter} from "../../BP_BaseCharacter";


const AssetPath = "/Game/BluePrints/Character/Enemy/AI/BTT_FindPlayer.BTT_FindPlayer_C";

const BP_PlayerClass = UE.Class.Load("/Game/BluePrints/Character/Player/BP_Player.BP_Player_C");

export interface BTT_FindPlayer extends UE.Game.BluePrints.Character.Enemy.AI.BTT_FindPlayer.BTT_FindPlayer_C {
}

@mixin(AssetPath)
export class BTT_FindPlayer implements BTT_FindPlayer {
    
    TempPlayer: BP_BaseCharacter;
    
    ReceiveExecuteAI(OwnerController: $Nullable<UE.AIController>, ControlledPawn: $Nullable<UE.Pawn>) {
        
        if(UE.BTFunctionLibrary.GetBlackboardValueAsActor(this,this.Player)){
            this.TempPlayer = UE.BTFunctionLibrary.GetBlackboardValueAsActor(this,this.Player) as BP_BaseCharacter;
            this.ChackCharacter();
        }
        else{
            this.TempPlayer = UE.GameplayStatics.GetActorOfClass(this,BP_PlayerClass) as BP_BaseCharacter;
            this.ChackCharacter();
            
        }
    }
    
    ChackCharacter(){
        if(this.TempPlayer){
            UE.BTFunctionLibrary.SetBlackboardValueAsObject(this,this.Player,this.TempPlayer);
            this.FinishExecute(true);
        }
        else{
            UE.BTFunctionLibrary.SetBlackboardValueAsObject(this,this.Player,null);
            this.FinishExecute(false);
        }
    }

}