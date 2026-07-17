import * as UE from 'ue';
import mixin from "../../../../mixin";

//需要导入mixin 模块

//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
//import {xxxx} from "../xxxx";

const AssetPath = "/Game/BluePrints/Character/Player/UMG/UMG_AttributeBar.UMG_AttributeBar_C";

export interface UMG_AttributeBar extends UE.Game.BluePrints.Character.Player.UMG.UMG_AttributeBar.UMG_AttributeBar_C {
}

@mixin(AssetPath)
//有继承：export class UMG_AttributeBar extends xxxx implements UMG_AttributeBar { }
export class UMG_AttributeBar implements UMG_AttributeBar {
    PreConstruct(IsDesignTime: boolean) {
        this.SetColor();
    }
    
    protected SetColor(){
        this.Image_Bar.GetDynamicMaterial().SetVectorParameterValue("Color",this.Color);
    }
    
    SetProgress(Progress:number){
        this.Image_Bar.GetDynamicMaterial().SetScalarParameterValue("Pre",UE.KismetMathLibrary.FClamp(Progress,0,1));
    }
    
    
}