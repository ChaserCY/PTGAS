import * as UE from "ue";
import {argv} from "puerts";




console.log("Hello, TypeScript!");//打印在日志文件中

UE.KismetSystemLibrary.PrintString(//打印在屏幕上
    null,
    `启动！！`,
    true,
    true,
    UE.LinearColor.Green,
    0.1
)

/* 获取游戏实例对象并执行类型断言
 * @param gameInstance - 通过参数管理器获取的PuertsGasGameInstance实例对象
 * @type {UE.PuertsGasGameInstance} - 显式类型断言确保符合游戏实例接口规范 */
const GameInstance = argv.getByName("GameInstance") as UE.GAS_GameInstance;
//这上面有两处必须和自己的C++类GameInstance的名字一致，第一个是代码，第二个是文件名

/* 绑定FCall回调函数
 * @param FunctionName - 需要动态调用的方法名称字符串
 * @param Uobject - 包含目标方法的游戏对象实例
 * @note 使用类型断言(as any)绕过TS类型检查，运行时动态调用对象的指定方法
 * @behavior 当FCall事件触发时，在目标对象上执行指定名称的方法 */
GameInstance.FCall.Bind((FunctionName, Uobject) => {
    (Uobject as any)[FunctionName]();
})

import "./Blueprints/Test/BP_Test";
import "./Blueprints/Character/BP_BaseCharacter";
import "./Blueprints/Character/Player/BP_Player";
import "./Blueprints/Ability/BaseAbility/GA_BaseResponse";
import "./Blueprints/Ability/_00Melee/GA_Melee";
import "./Blueprints/Character/Player/BP_PlayerController";
import "./Blueprints/Character/Enemy/BP_Enemy";
import "./Blueprints/Character/Enemy/UMG/UMG_EnemyBar";
import "./Blueprints/Character/Enemy/BP_AIController";
import "./Blueprints/Character/Enemy/AI/BTT_MeleeAttack";
import "./Blueprints/Character/Enemy/AI/BTT_FindPlayer";
import "./Blueprints/Character/Player/UMG/UMG_AbilitySlot";
import "./Blueprints/Character/Player/UMG/UMG_AttributeBar";
import "./Blueprints/Character/Player/UMG/UMG_MainUI";
import "./Blueprints/Ability/BP_GameplayAbility";
import "./Blueprints/Ability/_01HPRegen/GA_HPRegen";
