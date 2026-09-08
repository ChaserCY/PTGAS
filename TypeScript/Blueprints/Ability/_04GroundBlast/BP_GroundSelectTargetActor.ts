import * as UE from 'ue';
import mixin from "../../../mixin";

const AssetPath = "/Game/BluePrints/Ability/_04GroundBlast/BP_GroundSelectTargetActor.BP_GroundSelectTargetActor_C";

export interface BP_GroundSelectTargetActor extends UE.Game.BluePrints.Ability._04GroundBlast.BP_GroundSelectTargetActor.BP_GroundSelectTargetActor_C {
}

@mixin(AssetPath)
export class BP_GroundSelectTargetActor implements BP_GroundSelectTargetActor {
    
    _rotationIntervalId:ReturnType<typeof setInterval> | null = null;
    
    ReceiveBeginPlay(){
        this.SetDecalSize();
        // this._rotationIntervalId = setInterval(()=>{
        //     this.UpdateLocation();
        // },1000*0.2);
        
    }
    
    
    ReceiveTick(DeltaSeconds: number) {
        this.Decal.K2_SetWorldLocation(this.GetPlayerLookAtPoint(), false, null, false);
    }
    
    //设置贴花大小
    SetDecalSize() {
        //this.SelectRadius = 150;
        this.Decal.DecalSize = new UE.Vector(100, this.SelectRadius, this.SelectRadius)
    }
    
    UpdateLocation(){
        
    }

    
}