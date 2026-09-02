import * as UE from 'ue';
import mixin from "../../../mixin";
import {BP_GameplayAbility} from "../BP_GameplayAbility";
import {BP_Player} from "../../Character/Player/BP_Player";
//需要导入mixin 模块

//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
//import {xxxx} from "../xxxx";

const AssetPath = "/Game/BluePrints/Ability/_03Laser/GA_Laser.GA_Laser_C";

const MA_Laser = UE.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_Laser.MA_Laser");

//激光消耗Tag
const LaserCostTag = new UE.GameplayTag("Ability.Laser.Cost");

const LaserEndTag  = new UE.GameplayTag("Ability.Laser.LaserEnd");

export interface GA_Laser extends UE.Game.BluePrints.Ability._03Laser.GA_Laser.GA_Laser_C {
}

@mixin(AssetPath)
export class GA_Laser extends BP_GameplayAbility implements GA_Laser {
    Character:BP_Player;
    _rotationIntervalID:ReturnType<typeof setInterval> | null = null;
    
    K2_ActivateAbility() {
        this.Character = this.GetAvatarActorFromActorInfo() as BP_Player;
        if(this.Character){
            this.Character.IsLasering = true;
            this.Character.LookCamera(true);
        }
        else {
            return;
        }
        //单独提交消耗，不交CD
        this.K2_CommitAbilityCost();
        this.BindEndEvent();
        this.PlayMontage();
    }

    //播放动画
    PlayMontage(){
        const MontageTask = UE.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(this, "Laser", MA_Laser);
        MontageTask.ReadyForActivation();
    }
    
    //监听回调结束事件
    BindEndEvent(){
        const GameplayEvent = UE.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this,LaserEndTag,null,true,true);
        GameplayEvent.EventReceived.Add((...args)=>this.EndMontage(...args));
        GameplayEvent.ReadyForActivation();
        
        //按下就会启动，循环计时器
        this._rotationIntervalID = setInterval(()=>{
            this.CheckCost();
        },0.25*1000);
        
        const t = UE.KismetSystemLibrary.K2_SetTimer(this,"CheckCost",0.25,true);
        UE.KismetSystemLibrary.K2_ClearTimerHandle(this,t);
        
        
    }
    
    //检测是否消耗完MP
    CheckCost(){
        if(!this.IsSatisfyCost()){
            this.EndMontage(null);
            console.log("啥意思");
        }
        else{
            console.log("足够消耗")
        }
    }
    
    
    //结束动画
    EndMontage(Payload: UE.GameplayEventData){
        this.MontageJumpToSection("End");
        this.K2_EndAbility();
        if(this._rotationIntervalID){
            clearInterval(this._rotationIntervalID);
            this._rotationIntervalID = null;
        }
    }
    
    K2_OnEndAbility(bWasCancelled: boolean) {
        /*提交CD,开始读秒*/
        this.K2_CommitAbilityCooldown();
        this.StartUI_CD();
        
        /*通过标签Tag移除GE_Cost*/
        this.BP_RemoveGameplayEffectFromOwnerWithAssetTags(this.Character.GetAbilityTag(LaserCostTag));
        
        if(this.Character){
            this.Character.IsLasering = false;
            this.Character.LookCamera(false);
        }

        if(this._rotationIntervalID){
            clearInterval(this._rotationIntervalID);
            this._rotationIntervalID = null;
        }
    }

}