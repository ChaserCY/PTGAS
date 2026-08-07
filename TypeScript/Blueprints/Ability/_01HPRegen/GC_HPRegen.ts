import * as UE from 'ue';
import mixin from "../../../mixin";
import {$Nullable} from "puerts";

//需要导入mixin 模块

//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
//import {xxxx} from "../xxxx";

const AssetPath = "/Game/BluePrints/Ability/_01HPRegen/GC_HPRegen.GC_HPRegen_C";

//特效
const HPRegenFX = UE.ParticleSystem.Load("/Game/Assets/Abilities/HealthRegen/P_HealthRegen.P_HealthRegen");


export interface GC_HPRegen extends UE.Game.BluePrints.Ability._01HPRegen.GC_HPRegen.GC_HPRegen_C {
}

@mixin(AssetPath)
//有继承：export class GC_HPRegen extends xxxx implements GC_HPRegen { }
export class GC_HPRegen implements GC_HPRegen {
    
    WhileActive(MyTarget: $Nullable<UE.Actor>, Parameters: UE.GameplayCueParameters): boolean {
        
        if(HPRegenFX){
            UE.GameplayStatics.SpawnEmitterAtLocation(
                this,
                HPRegenFX,
                MyTarget.K2_GetActorLocation(),
                MyTarget.K2_GetActorRotation(),
                MyTarget.GetActorScale3D(),
                true,
                UE.EPSCPoolMethod.AutoRelease,   //这里原来用的是ManualRelease
                true
            )
        }
        return true;
    }

}