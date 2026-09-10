import * as UE from 'ue';
import mixin from "../../../mixin";
import {$Nullable} from "puerts";

const AssetPath = "/Game/BluePrints/Ability/_05FireBlast/BP_RemoveBurming.BP_RemoveBurming_C";

const BurmingTag = new UE.GameplayTag("Ability.FireBlast.BurmingDamage");

export interface BP_RemoveBurming extends UE.Game.BluePrints.Ability._05FireBlast.BP_RemoveBurming.BP_RemoveBurming_C {
}

@mixin(AssetPath)
export class BP_RemoveBurming implements BP_RemoveBurming {
    
    ReceiveBeginPlay() {
        this.Box.OnComponentBeginOverlap.Add((...args)=>this.BoxBeginOverlap(...args))
    }

    
    BoxBeginOverlap(OverlappedComponent: $Nullable<UE.PrimitiveComponent>, OtherActor: $Nullable<UE.Actor>, OtherComp: $Nullable<UE.PrimitiveComponent>, OtherBodyIndex: number, bFromSweep: boolean, SweepResult: UE.HitResult)
    {
        console.log("BoxBeginOverlap");
        if(UE.AbilitySystemBlueprintLibrary.GetAbilitySystemComponent(OtherActor).HasMatchingGameplayTag(BurmingTag)) {
            UE.AbilitySystemBlueprintLibrary.GetAbilitySystemComponent(OtherActor).RemoveActiveEffectsWithTags(
                UE.BlueprintGameplayTagLibrary.MakeGameplayTagContainerFromTag(BurmingTag as UE.GameplayTag)
            );
        }
    }


}