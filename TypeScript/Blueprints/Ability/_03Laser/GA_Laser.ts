import * as UE from 'ue';
import mixin from "../../../mixin";
import {BP_GameplayAbility} from "../BP_GameplayAbility";
import {BP_Player} from "../../Character/Player/BP_Player";
import {GameplayEventData} from "ue";
import {BP_BaseCharacter} from "../../Character/BP_BaseCharacter";
//需要导入mixin 模块

//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
//import {xxxx} from "../xxxx";

const AssetPath = "/Game/BluePrints/Ability/_03Laser/GA_Laser.GA_Laser_C";

const MA_Laser = UE.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_Laser.MA_Laser");

const LaserActorClass = UE.Class.Load("/Game/BluePrints/Ability/_03Laser/BP_LaserActor.BP_LaserActor_C");

const LaserDamageClass = UE.Class.Load("/Game/BluePrints/Ability/_03Laser/GE_Laser_Damage.GE_Laser_Damage_C");

//激光消耗Tag
const LaserCostTag = new UE.GameplayTag("Ability.Laser.Cost");
const LaserEndTag  = new UE.GameplayTag("Ability.Laser.LaserEnd");
const LaserDamageTag  = new UE.GameplayTag("Ability.Laser.Damage");

export interface GA_Laser extends UE.Game.BluePrints.Ability._03Laser.GA_Laser.GA_Laser_C {
}

@mixin(AssetPath)
export class GA_Laser extends BP_GameplayAbility implements GA_Laser {
    Character:BP_Player;
    _rotationIntervalID:ReturnType<typeof setInterval> | null = null;
    LaserActor:UE.Actor = null;
    
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
        
        setTimeout(()=>{
            this.SpawnLaserActor();
        },0.3*1000);
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
        
    }
    
    SpawnLaserActor(){
        console.log("生成Actor");
        //实例化一个演员类的实例，但不会自动运行其构造脚本
        this.LaserActor = UE.GameplayStatics.BeginDeferredActorSpawnFromClass(this,LaserActorClass,UE.Transform.Identity);
        UE.GameplayStatics.FinishSpawningActor(this.LaserActor,UE.Transform.Identity);
        if(this.LaserActor)
        {
            this.SpawnSuccess();
        }
    }
    
    SpawnSuccess(){
       //接收激光Actor碰到人后的事件
        const GameplayEvent = UE.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this,LaserDamageTag,null,false,true);
        GameplayEvent.EventReceived.Add((...args)=>this.TriggerDamage(...args));
        GameplayEvent.ReadyForActivation();
        
        this.LaserActor.Instigator = this.Character;
        this.LaserActor.K2_AttachToComponent(
            this.Character.LaserPoint, 
            "",              //普通组件没有SocketName，有骨骼时才填
            UE.EAttachmentRule.SnapToTarget,
            UE.EAttachmentRule.SnapToTarget,
            UE.EAttachmentRule.KeepRelative,
            false   //是否需要物理焊接
            )
    }
    
    //回调触发伤害
    TriggerDamage(Payload:GameplayEventData){
        this.BP_ApplyGameplayEffectToTarget(Payload.TargetData,LaserDamageClass);
        
        //获取命中Actor,施加冲击效果
        const HitActors = UE.AbilitySystemBlueprintLibrary.GetActorsFromTargetData(Payload.TargetData,0);
        if(HitActors.Num()!=0){
            for(let i = 0;i < HitActors.Num();i++){
                const Actor = HitActors.GetRef(i) as BP_BaseCharacter;
                if(Actor&&!Actor.Dead){
                    Actor.Stun(0.2);
                    
                    const StartLocation = Actor.K2_GetActorLocation();
                    const EndLocation = this.Character.K2_GetActorLocation();
                    const Direction = new UE.Vector(
                        StartLocation.X-EndLocation.X,
                        StartLocation.Y-EndLocation.Y,
                        StartLocation.Z-EndLocation.Z
                    )
                    const ForwardVector = UE.KismetMathLibrary.GetForwardVector(UE.KismetMathLibrary.MakeRotFromX(Direction));
                    Actor.DashForward(
                        ForwardVector,
                        1000,
                        0.5
                    )
                }
            }
        }
        
    }
    
    //检测是否消耗完MP
    CheckCost(){
        if(!this.IsSatisfyCost()){
            this.EndMontage(null);
        }
        else{
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

        if(this.LaserActor){
            this.LaserActor.K2_DestroyActor();
        }
        
        if(this._rotationIntervalID){
            clearInterval(this._rotationIntervalID);
            this._rotationIntervalID = null;
        }
    }

}