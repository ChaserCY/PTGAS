import * as UE from "ue";
import mixin from "../../mixin";//额外添加这一行使得10行不会报错@mixin(AssetPath)
import {TagsfromPlugin} from "../../Gen/GameplayTags.gen";

const AssetPath = "/Game/BluePrints/Test/BP_Test.BP_Test_C";//这里的路径必须和Content中的蓝图ACtor路径对应，并且.后面必须是BP_Test_C加个_C

export interface BP_Test extends UE.Game.BluePrints.Test.BP_Test.BP_Test_C{
    
}

@mixin(AssetPath)
export class BP_Test implements BP_Test {
    
    Fun1(){
        
        UE.KismetSystemLibrary.PrintString(
            this,
            "我是函数1",
            true,
            true,
            UE.LinearColor.Red,
            2)
    }   
    
    Fun2(){
        UE.KismetSystemLibrary.PrintString(
            this,
            "我是函数2",
            true,
            true,
            UE.LinearColor.Green,
            2)
    }
    
    Fun3(){
        UE.KismetSystemLibrary.PrintString(
            this,
            "我是函数3，通过蓝图调用的",
            true,
            true,
            UE.LinearColor.Green,
            2
        )
        
    }
    
}
