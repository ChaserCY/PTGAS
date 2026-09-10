import * as UE from 'ue';
import mixin from "../../../mixin";
import {BP_GameplayAbility} from "../BP_GameplayAbility";
import {BP_BaseCharacter} from "../../Character/BP_BaseCharacter";
//需要导入mixin 模块

//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
//import {xxxx} from "../xxxx";

const AssetPath = "/Game/BluePrints/Ability/_04GroundBlast/GA_GroundBlast.GA_GroundBlast_C";
//选择蒙太奇
const MA_Select = UE.Object.Load("/Game/BluePrints/Character/Animations/Montage/MA_Select.MA_Select") as UE.AnimMontage;
const MA_Cast = UE.Object.Load("/Game/BluePrints/Character/Animations/Montage/MA_Cast.MA_Cast") as UE.AnimMontage;

//伤害GE
const BlastDamage = UE.Class.Load("/Game/BluePrints/Ability/_04GroundBlast/GE_GroundBlast_Damage.GE_GroundBlast_Damage_C")

export interface GA_GroundBlast extends UE.Game.BluePrints.Ability._04GroundBlast.GA_GroundBlast.GA_GroundBlast_C {
}

@mixin(AssetPath)
export class GA_GroundBlast extends BP_GameplayAbility implements GA_GroundBlast {
    
    Character:BP_BaseCharacter;
    HitLocation:UE.Vector;
    
    
    K2_ActivateAbility() {
        this.Character = this.GetAvatarActorFromActorInfo() as BP_BaseCharacter;
        if(this.Character){
            this.Character.IsGroundBlaseting = true;
        }
        this.playSelectMontage();
        this.SpawnTargetData();
    }

    playSelectMontage(){
        const SelectMontageTask = UE.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(this,"",MA_Select);
        SelectMontageTask.ReadyForActivation();
    }
    
    //成功释放能力
    ValidData(Data:UE.GameplayAbilityTargetDataHandle) {
        //Bug:第二次释放技能会崩溃
        if(Data){
            this.HitLocation = UE.AbilitySystemBlueprintLibrary.GetTargetDataEndPoint(Data,0);
            this.HitActors = UE.AbilitySystemBlueprintLibrary.GetActorsFromTargetData(Data,1);
        }
        this.playCastMontage();
        this.K2_CommitAbility();
        this.StartUI_CD();
    }

    //取消释放能力
    Cancelled(Data:UE.GameplayAbilityTargetDataHandle) {
        this.K2_EndAbility();
    }
    
    playCastMontage() {
        const CastMontageTask = UE.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(this,"",MA_Cast);
        CastMontageTask.OnCompleted.Add(()=>this.K2_EndAbility())
        CastMontageTask.OnBlendOut.Add(()=>this.K2_EndAbility())
        CastMontageTask.OnInterrupted.Add(()=>this.K2_EndAbility())
        CastMontageTask.OnCancelled.Add(()=>this.K2_EndAbility())
        CastMontageTask.ReadyForActivation();
        
        //播放特效
        UE.GameplayStatics.SpawnEmitterAtLocation(
          this,
          this.BlastFX,
          this.HitLocation,
          UE.Rotator.ZeroRotator,             //旋转
            new UE.Vector(0.5, 0.5, 0.5),//大小
            true,             //是否自动销毁
            UE.EPSCPoolMethod.ManualRelease,
            true        //是否自动激活
        );
        
        setTimeout(()=>{
           this.SkillDamage(); 
        },0.35*1000);
    }
    
    //技能伤害
    SkillDamage(){
        if(this.HitActors.Num()!=0){
            this.BP_ApplyGameplayEffectToTarget(UE.AbilitySystemBlueprintLibrary.AbilityTargetDataFromActorArray(this.HitActors,true),BlastDamage);
        
        for(let i = 0;i < this.HitActors.Num();i++){
            const HitCharacter = this.HitActors.Get(i) as BP_BaseCharacter;
            if(HitCharacter){
                HitCharacter.Stun(2);
                
                const StartLocation = HitCharacter.K2_GetActorLocation();
                const EndLocation = this.HitLocation;
                
                const Direction = new UE.Vector(
                    StartLocation.X-EndLocation.X,
                    StartLocation.Y-EndLocation.Y,
                    StartLocation.Z-EndLocation.Z
                )
                const ForwardVector = UE.KismetMathLibrary.GetForwardVector(UE.KismetMathLibrary.MakeRotFromX(Direction));
                HitCharacter.DashForward(ForwardVector,800,1);
            }
        }
        }
    }
    
    
    K2_OnEndAbility(bWasCancelled: boolean) {
        if(this.Character) {
            this.Character.IsGroundBlaseting = false;
        }
    }

}