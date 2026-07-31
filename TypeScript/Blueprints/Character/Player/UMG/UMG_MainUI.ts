import * as UE from 'ue';
import mixin from "../../../../mixin";
import {NewArray, TArray} from "ue";
import {blueprint} from "puerts";

const AssetPath = "/Game/BluePrints/Character/Player/UMG/UMG_MainUI.UMG_MainUI_C";

export interface UMG_MainUI extends UE.Game.BluePrints.Character.Player.UMG.UMG_MainUI.UMG_MainUI_C {
}

@mixin(AssetPath)
export class UMG_MainUI implements UMG_MainUI {
    
    AllAbilitySlot:TArray<UE.Game.BluePrints.Character.Player.UMG.UMG_AbilitySlot.UMG_AbilitySlot_C>
    
    Construct() {
      
    }

    OnInitialized() {
        
    }
    PreConstruct(IsDesignTime: boolean) {
        blueprint.load(UE.Game.BluePrints.Character.Player.UMG.UMG_AbilitySlot.UMG_AbilitySlot_C);
        this.AllAbilitySlot = NewArray(UE.Game.BluePrints.Character.Player.UMG.UMG_AbilitySlot.UMG_AbilitySlot_C);
        this.AbilitySlots.Add(this.AbilitySlot_1);
        this.AbilitySlots.Add(this.AbilitySlot_2);
        this.AbilitySlots.Add(this.AbilitySlot_3);
        this.AbilitySlots.Add(this.AbilitySlot_4);
        this.AbilitySlots.Add(this.AbilitySlot_5);
        this.AllAbilitySlot.Add(this.AbilitySlot_1);
        this.AllAbilitySlot.Add(this.AbilitySlot_2);
        this.AllAbilitySlot.Add(this.AbilitySlot_3);
        this.AllAbilitySlot.Add(this.AbilitySlot_4);
        this.AllAbilitySlot.Add(this.AbilitySlot_5);
        blueprint.unload(UE.Game.BluePrints.Character.Player.UMG.UMG_AbilitySlot.UMG_AbilitySlot_C);
        
    }
}