import * as UE from 'ue';
import mixin from "../../../../mixin";
import{BP_GameplayAbility} from "../../../Ability/BP_GameplayAbility";


const AssetPath = "/Game/BluePrints/Character/Player/UMG/UMG_AbilitySlot.UMG_AbilitySlot_C";

export interface UMG_AbilitySlot extends UE.Game.BluePrints.Character.Player.UMG.UMG_AbilitySlot.UMG_AbilitySlot_C {
}

@mixin(AssetPath)
export class UMG_AbilitySlot implements UMG_AbilitySlot {
    
    //总CD
    CD_Intel:number;
    //当前CD
    CD_Current:number;
    //在技能CD区间
    IsDuringCD:boolean;
    //技能类
    AbilityClass:UE.Class;
    
    PreConstruct(IsDesignTime: boolean) {
        this.Key.SetText(this.KeyText);
    }

    Tick(MyGeometry: UE.Geometry, InDeltaTime: number) {
        this.UpdateCD(InDeltaTime);
    }

    //初始化信息
    InitInfo(AbilityInfo:UE.GameplayAbilityInfo){
        this.CD_Intel = AbilityInfo.CD;
        this.AbilityClass=AbilityInfo.AbilityClass;
        this.AbilityImage.SetBrushFromMaterial(AbilityInfo.IconMaterial);
    }
    
    StartUI_CD(){
        this.IsDuringCD = true;
        this.CD.SetVisibility(UE.ESlateVisibility.Visible);
        this.CD_Current = this.CD_Intel;
    }
    
    UpdateCD(DeltaTime:number) {
        //处于CD中...
        if(this.IsDuringCD){
            this.CD_Current = UE.KismetMathLibrary.FClamp(this.CD_Current-DeltaTime,0,this.CD_Intel);
            
            if(this.CD_Current>0){
                this.CD.SetText(
                    UE.KismetTextLibrary.Conv_DoubleToText(
                        this.CD_Current,UE.ERoundingMode.HalfToEven,false,true, 1,324,0,1
                    )
                )
                this.AbilityImage.GetDynamicMaterial().SetScalarParameterValue("Pre",UE.KismetMathLibrary.FClamp((1-this.CD_Current/this.CD_Intel),0,1))
            }
            else{
                this.IsDuringCD = false;
                this.CD.SetVisibility(UE.ESlateVisibility.Hidden);
                this.AbilityImage.GetDynamicMaterial().SetScalarParameterValue("Pre",1);
            }
        }
    }
}