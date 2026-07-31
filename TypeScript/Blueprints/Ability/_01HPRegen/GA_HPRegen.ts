import * as UE from 'ue';
import mixin from "../../../mixin";
import {BP_GameplayAbility} from "../BP_GameplayAbility";
//需要导入mixin 模块

//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
//import {xxxx} from "../xxxx";

const AssetPath = "/Game/BluePrints/Ability/_01HPRegen/GA_HPRegen.GA_HPRegen_C";

export interface GA_HPRegen extends UE.Game.BluePrints.Ability._01HPRegen.GA_HPRegen.GA_HPRegen_C {
}

@mixin(AssetPath)
export class GA_HPRegen extends BP_GameplayAbility implements GA_HPRegen {
    
    K2_ActivateAbility(){
        this.K2_CommitAbility();
        this.StartUI_CD();
    }
    
}