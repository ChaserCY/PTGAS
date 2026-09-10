import * as UE from 'ue';
import mixin from "../../../mixin";
import {BP_GameplayAbility} from "../BP_GameplayAbility";
import {GameplayTag} from "ue";
import {BP_BaseCharacter} from "../../Character/BP_BaseCharacter";

const AssetPath = "/Game/BluePrints/Ability/_05FireBlast/GA_FireBlast.GA_FireBlast_C";

const MA_FireBlast = UE.Object.Load("/Game/BluePrints/Character/Animations/Montage/MA_FireBlast.MA_FireBlast") as UE.AnimMontage;
//伤害GE 
const FireBlast_Damage = UE.Class.Load("/Game/BluePrints/Ability/_05FireBlast/GE_FireBlast_Damage.GE_FireBlast_Damage_C");

const PullEventTag = new GameplayTag("Ability.FireBlast.PullEvent");
const PushEventTag = new GameplayTag("Ability.FireBlast.PushEvent");

export interface GA_FireBlast extends UE.Game.BluePrints.Ability._05FireBlast.GA_FireBlast.GA_FireBlast_C {
}

@mixin(AssetPath)
export class GA_FireBlast extends BP_GameplayAbility implements GA_FireBlast {
    
    TargetData:UE.GameplayAbilityTargetDataHandle
    
    K2_ActivateAbility() {
        this.K2_CommitAbility();
        this.StartUI_CD();
        this.BindPull();
        this.BindPush();
        this.PlayMontage();
    }
    
    PlayMontage(){
        const MontageTask = UE.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(this,"",MA_FireBlast);
        MontageTask.OnCompleted.Add(()=>this.K2_EndAbility());
        MontageTask.OnInterrupted.Add(()=>this.K2_EndAbility());
        MontageTask.OnBlendOut.Add(()=>this.K2_EndAbility());
        MontageTask.OnCancelled.Add(()=>this.K2_EndAbility());
        MontageTask.ReadyForActivation();
    }
    
    BindPull(){
        const WaitEvent = UE.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this,PullEventTag,null, true, true);
        WaitEvent.EventReceived.Add((...args)=>this.Pull(...args))
        WaitEvent.ReadyForActivation();
    }
    
    private Pull(Payload:UE.GameplayEventData){
        //蓝图事件触发，生成目标数据柄
        this.SpawnTargetData();
    }
    
    //数据有效执行拉取
    ValidData(Data: UE.GameplayAbilityTargetDataHandle) {
        this.TargetData = Data;
        const AllActors = UE.AbilitySystemBlueprintLibrary.GetActorsFromTargetData(Data,0);

        const AvatarActor = this.GetAvatarActorFromActorInfo();
        //除玩家外的其他目标
        this.HitActors = UE.NewArray(UE.Actor);

        for(let i = 0;i < AllActors.Num();i++){
            const HitCharacter = AllActors.Get(i) as BP_BaseCharacter;
            if(HitCharacter && HitCharacter !== AvatarActor){
                //添加到不包含玩家的数组
                this.HitActors.Add(HitCharacter);

                HitCharacter.Stun(2);

                const StartLocation = HitCharacter.K2_GetActorLocation();
                const EndLocation = AvatarActor.K2_GetActorLocation();

                const Direction = new UE.Vector(
                    EndLocation.X-StartLocation.X,
                    EndLocation.Y-StartLocation.Y,
                    EndLocation.Z-StartLocation.Z
                )
                const ForwardVector = UE.KismetMathLibrary.GetForwardVector(UE.KismetMathLibrary.MakeRotFromX(Direction));
                HitCharacter.DashForward(ForwardVector,800,0.7);
            }
        }
    }

    BindPush(){
        const WaitEvent = UE.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this,PushEventTag,null, true, true);
        WaitEvent.EventReceived.Add((...args)=>this.Push(...args))
        WaitEvent.ReadyForActivation();
    }
    
    private Push(Payload:UE.GameplayEventData){
        
        const TargetData = UE.AbilitySystemBlueprintLibrary.AbilityTargetDataFromActorArray(this.HitActors, true);
        this.BP_ApplyGameplayEffectToTarget(TargetData, FireBlast_Damage);
        
        const AvatarActor = this.GetAvatarActorFromActorInfo();
        
        for(let i = 0;i < this.HitActors.Num();i++){
            const HitCharacter = this.HitActors.Get(i) as BP_BaseCharacter;
            if(HitCharacter){
                HitCharacter.Stun(2);

                const StartLocation = HitCharacter.K2_GetActorLocation();
                const EndLocation = AvatarActor.K2_GetActorLocation();

                const Direction = new UE.Vector(
                    StartLocation.X-EndLocation.X,
                    StartLocation.Y-EndLocation.Y,
                    StartLocation.Z-EndLocation.Z
                )
                const ForwardVector = UE.KismetMathLibrary.GetForwardVector(UE.KismetMathLibrary.MakeRotFromX(Direction));
                HitCharacter.DashForward(ForwardVector,1500,0.7);
            }
        }
    }
    
    
    K2_OnEndAbility(bWasCancelled: boolean) {
        
        
    }

}