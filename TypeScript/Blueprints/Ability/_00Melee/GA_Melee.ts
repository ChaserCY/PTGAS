import * as UE from 'ue';
import mixin from "../../../mixin";


const AssetPath = "/Game/BluePrints/Ability/_00Melee/GA_Melee.GA_Melee_C";

export interface GA_Melee extends UE.Game.BluePrints.Ability._00Melee.GA_Melee.GA_Melee_C {
}

@mixin(AssetPath)
//有继承：export class GA_Melee extends xxxx implements GA_Melee { }
export class GA_Melee implements GA_Melee {
    K2_ActivateAbility() {
        console.log("普通攻击生效");
        this.K2_CommitAbility();
    }


}