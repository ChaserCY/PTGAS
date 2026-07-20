import * as UE from 'ue';
import mixin from "../../../../mixin";
import {TArray} from "ue";

const AssetPath = "/Game/BluePrints/Character/Player/UMG/UMG_MainUI.UMG_MainUI_C";

export interface UMG_MainUI extends UE.Game.BluePrints.Character.Player.UMG.UMG_MainUI.UMG_MainUI_C {
}

@mixin(AssetPath)
export class UMG_MainUI implements UMG_MainUI {
    
    //AllAbilitySlot:TArray<UE.Game.BluePrints.Character.Player.UMG.UMG_AbilitySlot.UMG_AbilitySlot_C>
    
    Construct() {
      
    }

    OnInitialized() {
        
    }
    PreConstruct(IsDesignTime: boolean) {
        this.AbilitySlots.Add(this.AbilitySlot_1);
        this.AbilitySlots.Add(this.AbilitySlot_2);
        this.AbilitySlots.Add(this.AbilitySlot_3);
        this.AbilitySlots.Add(this.AbilitySlot_4);
        this.AbilitySlots.Add(this.AbilitySlot_5);
    }
}