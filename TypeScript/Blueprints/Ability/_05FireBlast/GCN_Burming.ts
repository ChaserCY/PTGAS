import * as UE from 'ue';
import mixin from "../../../mixin";
import {$Nullable} from "puerts";

const AssetPath = "/Game/BluePrints/Ability/_05FireBlast/GCN_Burming.GCN_Burming_C";

//const BurmingFX = UE.Object.Load("/Game/Assets/FX/Simple_Cartoon_FX_Pack_2/Particles/Fire_Pillar.Fire_Pillar") as UE.ParticleSystem

export interface GCN_Burming extends UE.Game.BluePrints.Ability._05FireBlast.GCN_Burming.GCN_Burming_C {
}

@mixin(AssetPath)
export class GCN_Burming implements GCN_Burming {
    
    // 粒子系统组件
    FireEmittCom: UE.ParticleSystemComponent;
    
    //添加粒子系统
    OnApplication(Target: $Nullable<UE.Actor>, Parameters: UE.GameplayCueParameters, SpawnResults: UE.GameplayCueNotify_SpawnResult) {
        console.log("添加粒子系统")
        if(Target){
            this.FireEmittCom = UE.GameplayStatics.SpawnEmitterAttached(
                this.BurmingFX,
                Target.RootComponent,
                "",
                new UE.Vector(0,0,-65),
                UE.Rotator.ZeroRotator,
                new UE.Vector(0.4,0.4,0.4),
                UE.EAttachLocation.KeepRelativeOffset,
                false,
                UE.EPSCPoolMethod.ManualRelease,
                true
            )
        }
        
        
    }
    
    // 移除
    OnRemoval(Target: $Nullable<UE.Actor>, Parameters: UE.GameplayCueParameters, SpawnResults: UE.GameplayCueNotify_SpawnResult) {
        if(this.FireEmittCom){
            this.FireEmittCom.ReleaseToPool();
            this.K2_EndGameplayCue();
        }
    }

}