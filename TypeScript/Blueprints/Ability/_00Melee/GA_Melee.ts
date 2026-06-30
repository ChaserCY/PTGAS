import * as UE from 'ue';
import mixin from "../../../mixin";


const AssetPath = "/Game/BluePrints/Ability/_00Melee/GA_Melee.GA_Melee_C";
const MA_Melee = UE.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_Melee.MA_Melee");

const MeleeHitTag = new UE.GameplayTag("Ability.Melee.HitEvent");

//伤害类
const MeleeDamageClass = UE.Class.Load("/Game/BluePrints/Ability/_00Melee/GE_Melee_Damage.GE_Melee_Damage_C");


export interface GA_Melee extends UE.Game.BluePrints.Ability._00Melee.GA_Melee.GA_Melee_C {
}

 @mixin(AssetPath) 
//有继承：export class GA_Melee extends xxxx implements GA_Melee { }
export class GA_Melee implements GA_Melee {
    
    //当GA触发的时候执行
    K2_ActivateAbility() {
        console.log("普通攻击生效");
        this.K2_CommitAbility();
        this.BindHitEvent();
        this.PlayMeleeMontage();
    }

    //播放普通攻击蒙太奇
    private PlayMeleeMontage(){
        //加载蒙太奇资源
        
        const StartSection = UE.KismetMathLibrary.RandomInteger(3).toString();
        
        let MeleeMontageTask = UE.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(
            this,
            "",
            MA_Melee,
            1,
            StartSection
        );
        MeleeMontageTask.OnCompleted.Add(()=>this.K2_EndAbility());//完整播放完毕
        MeleeMontageTask.OnInterrupted.Add(()=>this.K2_EndAbility());//被其他动画打断
        MeleeMontageTask.OnBlendOut.Add(()=>this.K2_EndAbility());//Blend out过渡完成
        MeleeMontageTask.OnCancelled.Add(()=>this.K2_EndAbility());//任务被取消
        //这上面四个回调都绑定了结束这个任务，无论哪种情况都会结束任务
        MeleeMontageTask.ReadyForActivation();  //激活这个任务
        
    }
    
    //绑定命中事件
    private BindHitEvent(){
        const GameplayEvent = UE.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this, MeleeHitTag,null,false,true);
    
        GameplayEvent.EventReceived.Add((...arge)=> this.HitEvent(...arge));
    
        GameplayEvent.ReadyForActivation();
        //激活
    }
    
    //命中事件触发
    private HitEvent(Payload: UE.GameplayEventData){
        // 测试打印 UE.KismetSystemLibrary.PrintString(this, "命中事件触发", true, true, new UE.LinearColor(1, 0, 0, 1), 5);
        
        this.BP_ApplyGameplayEffectToTarget(
            UE.AbilitySystemBlueprintLibrary.AbilityTargetDataFromActor(Payload.Target), 
            MeleeDamageClass,
            UE.KismetMathLibrary.RandomIntegerInRange(0,4)
            )
        
    }
    
}