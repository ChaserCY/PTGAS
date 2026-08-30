import * as UE from 'ue';
import mixin from "../../../mixin";
import {BP_GameplayAbility} from "../BP_GameplayAbility";

const AssetPath = "/Game/BluePrints/Ability/_01HPRegen/GA_HPRegen.GA_HPRegen_C";
//恢复动作
const MA_HPRegen = UE.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_HPRegen.MA_HPRegen");
//恢复数值（Class类需要加 _C）
const GE_HPRegenValueClass = UE.Class.Load("/Game/BluePrints/Ability/_01HPRegen/GE_HPRegen_Value.GE_HPRegen_Value_C");

export interface GA_HPRegen extends UE.Game.BluePrints.Ability._01HPRegen.GA_HPRegen.GA_HPRegen_C {
}

@mixin(AssetPath)
export class GA_HPRegen extends BP_GameplayAbility implements GA_HPRegen {
    
    K2_ActivateAbility(){
        this.K2_CommitAbility();
        this.StartUI_CD();
        this.BP_ApplyGameplayEffectToOwner(GE_HPRegenValueClass);
        this.PlayHPRegenMontage();
    }
    
    PlayHPRegenMontage(){
        const MontageTask = UE.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy
        (
            this,
            "HPRegen",       //名称
            MA_HPRegen                       //动画
        );
        MontageTask.OnCompleted.Add(()=>this.K2_EndAbility());
        MontageTask.OnInterrupted.Add(()=>this.K2_EndAbility());
        MontageTask.OnBlendOut.Add(()=>this.K2_EndAbility());
        MontageTask.OnCancelled.Add(()=>this.K2_EndAbility());
        MontageTask.ReadyForActivation();
    }
}