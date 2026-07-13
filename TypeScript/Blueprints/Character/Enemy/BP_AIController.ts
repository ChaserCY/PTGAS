import * as UE from 'ue';
import mixin from "../../../mixin";


const AssetPath = "/Game/BluePrints/Character/Enemy/BP_AIController.BP_AIController_C";

const BT_Tree = UE.BehaviorTree.Load("/Game/BluePrints/Character/Enemy/AI/BT_Tree.BT_Tree");


export interface BP_AIController extends UE.Game.BluePrints.Character.Enemy.BP_AIController.BP_AIController_C {
}

@mixin(AssetPath)
export class BP_AIController implements BP_AIController {
    ReceiveBeginPlay(){
        this.RunBehaviorTree(BT_Tree);
    }
}