import * as UE from 'ue';
import mixin from "../../../mixin";
import {$Nullable} from "puerts";

const AssetPath = "/Game/BluePrints/Ability/_03Laser/BP_LaserActor.BP_LaserActor_C";

const LaserDamage = new UE.GameplayTag("Ability.Laser.Damage");
export interface BP_LaserActor extends UE.Game.BluePrints.Ability._03Laser.BP_LaserActor.BP_LaserActor_C {
}

@mixin(AssetPath)
export class BP_LaserActor implements BP_LaserActor {
    
    GameplayEventData:UE.GameplayEventData = null;
    
    ReceiveBeginPlay() {
        this.HitActor.Empty();
        console.log("生成了激光Actor");
        this.EndPoint.OnComponentBeginOverlap.Add((...args)=>this.EndPointOnBeginOverlap(...args));
        this.EndPoint.OnComponentEndOverlap.Add((...args)=>this.EndPointOnEndOverlap(...args));
        
        UE.KismetSystemLibrary.K2_SetTimer(this, "LaserDamage", 0.25, true);
        
    }

    //重叠事件
    EndPointOnBeginOverlap(OverlappedComponent: $Nullable<UE.PrimitiveComponent>, OtherActor: $Nullable<UE.Actor>, OtherComp: $Nullable<UE.PrimitiveComponent>, OtherBodyIndex: number, bFromSweep: boolean, SweepResult: UE.HitResult){
        if(OtherActor!=this.GetInstigator()&&!this.HitActor.Contains(OtherActor)) {
            this.HitActor.Add(OtherActor);
        }
        
    }
    
    //离开重叠事件
    EndPointOnEndOverlap(OverlappedComponent: $Nullable<UE.PrimitiveComponent>, OtherActor: $Nullable<UE.Actor>, OtherComp: $Nullable<UE.PrimitiveComponent>, OtherBodyIndex: number){
        if(this.HitActor.Contains(OtherActor)){
            this.HitActor.RemoveAt(this.HitActor.FindIndex(OtherActor));
        }
    }
    
    LaserDamage(){
        this.GameplayEventData = null;
        if(this.HitActor.Num()!=0){
            this.GameplayEventData = new UE.GameplayEventData();
            this.GameplayEventData.EventTag = LaserDamage;
            this.GameplayEventData.Instigator = this.GetInstigator()
            this.GameplayEventData.TargetData = UE.AbilitySystemBlueprintLibrary.AbilityTargetDataFromActorArray(this.HitActor,true);
            UE.AbilitySystemBlueprintLibrary.SendGameplayEventToActor(this.Instigator,LaserDamage,this.GameplayEventData);
        }
    }
    
}