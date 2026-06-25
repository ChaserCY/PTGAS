import * as UE from 'ue';
import mixin from "../../../mixin";
import {BP_BaseCharacter} from "../BP_BaseCharacter";

const AssetPath = "/Game/BluePrints/Character/Enemy/BP_Enemy.BP_Enemy_C";

export interface BP_Enemy extends UE.Game.BluePrints.Character.Enemy.BP_Enemy.BP_Enemy_C {
}

@mixin(AssetPath)
export class BP_Enemy extends BP_BaseCharacter implements BP_Enemy {
    
    
    
    
}