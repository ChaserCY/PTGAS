import * as UE from "ue";

import mixin from "../../mixin";

const AssetPath = "/Game/BluePrints/Character/BP_BaseCharacter.BP_BaseCharacter_C";


export interface BP_BaseCharacter extends UE.Game.BluePrints.Character.BP_BaseCharacter.BP_BaseCharacter_C{
    
}

@mixin(AssetPath)
export class BP_BaseCharacter implements BP_BaseCharacter {
    
    ReceiveBeginPlay(){
        
    }
    
}