import * as UE from 'ue';
import mixin from "../../../../mixin";

//需要导入mixin 模块

//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
//import {xxxx} from "../xxxx";

const AssetPath = "/Game/BluePrints/Character/Enemy/UMG/UMG_EnemyBar.UMG_EnemyBar_C";

export interface UMG_EnemyBar extends UE.Game.BluePrints.Character.Enemy.UMG.UMG_EnemyBar.UMG_EnemyBar_C {
}

@mixin(AssetPath)
//有继承：export class UMG_EnemyBar extends xxxx implements UMG_EnemyBar { }
export class UMG_EnemyBar implements UMG_EnemyBar {
    //血量
    HP:number;
    
    //最大血量
    Max_HP:number;
    
    GetPercent():number{
        return UE.KismetMathLibrary.FClamp(this.HP/this.Max_HP,0,1);
    }
    
    Get_BarText():string{
        return `${this.HP}/${this.Max_HP}`;
        //给文本框的绑定函数返回显示字符串
    }
    
}