import * as UE from 'ue';
import mixin from "../../../mixin";
import {BP_GameplayAbility} from "../BP_GameplayAbility";
import {BP_BaseCharacter} from "../../Character/BP_BaseCharacter";

const AssetPath = "/Game/BluePrints/Ability/_02Dash/GA_Dash.GA_Dash_C";
const MA_Dash = UE.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_Dash.MA_Dash");


export interface GA_Dash extends UE.Game.BluePrints.Ability._02Dash.GA_Dash.GA_Dash_C {

}

@mixin(AssetPath)
export class GA_Dash extends BP_GameplayAbility implements GA_Dash {

    Character: BP_BaseCharacter = new BP_BaseCharacter;
    
    K2_ActivateAbility() {
        /*获取所施法角色对象*/
        this.Character = this.GetAvatarActorFromActorInfo() as BP_BaseCharacter;
        this.K2_CommitAbility();
        this.StartUI_CD();
        this.PlayDashMontage();
        console.log("冲刺释放");
        this.DashForward();
    }

    PlayDashMontage(){
        const MontageTask = UE.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(
            this,
            "Dash",
            MA_Dash
        );

        MontageTask.OnCompleted.Add(()=>this.K2_SelfEndAbility());   // 完整播放完毕
        MontageTask.OnInterrupted.Add(()=>this.K2_SelfEndAbility()); // 被其他动画打断
        MontageTask.OnBlendOut.Add(()=>this.K2_SelfEndAbility());
        MontageTask.OnCancelled.Add(()=>this.K2_SelfEndAbility());   // 任务被取消

        MontageTask.ReadyForActivation();              // 必须调用，否则蒙太奇不会真正播放
    }

    /*此函数是自定义的函数，相似于下面的回调，可添加逻辑*/
    K2_SelfEndAbility():void{
        this.K2_EndAbility();
        if(this.Character){
            this.Character.SetFrictionToZero(false);
        }
    }
    

    /*此函数是k2_EndAbility函数的回调，执行完End后自动执行*/
    //K2_OnEndAbility(bWasCancelled: boolean) {
       // if(this.Character){
         //   this.Character.SetFrictionToZero(false);
        //}
    //}

    DashForward():void{
        if(this.Character){
            this.Character.DashForward(
                this.Character.GetActorForwardVector(),
                2000,0.66
            )
        }
    }
}