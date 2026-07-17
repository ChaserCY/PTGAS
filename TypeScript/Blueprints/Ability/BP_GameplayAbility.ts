import * as UE from 'ue';
import mixin from "../../mixin";

//需要导入mixin 模块

//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
//import {xxxx} from "../xxxx";

const AssetPath = "/Game/BluePrints/Ability/BP_GameplayAbility.BP_GameplayAbility_C";

export interface BP_GameplayAbility extends UE.Game.BluePrints.Ability.BP_GameplayAbility.BP_GameplayAbility_C {
}

@mixin(AssetPath)
//有继承：export class BP_GameplayAbility extends xxxx implements BP_GameplayAbility { }
export class BP_GameplayAbility implements BP_GameplayAbility {
}