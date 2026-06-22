import * as UE from 'ue';
import mixin from "../../../mixin";


const AssetPath = "/Game/BluePrints/Ability/BaseAbility/GA_BaseResponse.GA_BaseResponse_C";

export interface GA_BaseResponse extends UE.Game.BluePrints.Ability.BaseAbility.GA_BaseResponse.GA_BaseResponse_C {
}

@mixin(AssetPath)

export class GA_BaseResponse implements GA_BaseResponse {
    
    //这是 GA（Gameplay Ability） 的激活入口函数，对应 C++ 中的 ActivateAbility。
    k2_ActivateAbility(){
        this.K2_CommitAbilityCost(); //触发编辑器里绑定的那个Cast类(新建的)
    }
    
    
}