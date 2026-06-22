import * as UE from 'ue';
import mixin from "../../../mixin";


const AssetPath = "/Game/BluePrints/Ability/_00Melee/GA_Melee.GA_Melee_C";

//普通攻击蒙太奇
const MA_Melee = UE.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_Melee.MA_Melee")

export interface GA_Melee extends UE.Game.BluePrints.Ability._00Melee.GA_Melee.GA_Melee_C {
}

@mixin(AssetPath)
//有继承：export class GA_Melee extends xxxx implements GA_Melee { }
export class GA_Melee implements GA_Melee {
    //当GA触发的时候执行
    K2_ActivateAbility() {
        console.log("普通攻击生效");
        this.K2_CommitAbility();
        this.PlayMeleeMontage();
    }

    //播放普通攻击蒙太奇
    private PlayMeleeMontage(){
        
        const StartSection = UE.KismetMathLibrary.RandomInteger(3).toString();
        
        let MeleeMontageTask = UE.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(
            this,
            "",
            MA_Melee,
            1,
            StartSection
        )
        MeleeMontageTask.OnCompleted.Add(()=>this.K2_EndAbility());//完整播放完毕
        MeleeMontageTask.OnInterrupted.Add(()=>this.K2_EndAbility());//被其他动画打断
        MeleeMontageTask.OnBlendOut.Add(()=>this.K2_EndAbility());//Blend out过渡完成
        MeleeMontageTask.OnCancelled.Add(()=>this.K2_EndAbility());//任务被取消
        //这上面四个回调都绑定了结束这个任务，无论哪种情况都会结束任务
        MeleeMontageTask.ReadyForActivation();  //激活这个任务
        
    }
}