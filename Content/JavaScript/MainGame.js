"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UE = require("ue");
const puerts_1 = require("puerts");
console.log("Hello, TypeScript!"); //打印在日志文件中
UE.KismetSystemLibrary.PrintString(//打印在屏幕上
null, `启动！！`, true, true, UE.LinearColor.Green, 0.1);
/* 获取游戏实例对象并执行类型断言
 * @param gameInstance - 通过参数管理器获取的PuertsGasGameInstance实例对象
 * @type {UE.PuertsGasGameInstance} - 显式类型断言确保符合游戏实例接口规范 */
const GameInstance = puerts_1.argv.getByName("GameInstance");
//这上面有两处必须和自己的C++类GameInstance的名字一致，第一个是代码，第二个是文件名
/* 绑定FCall回调函数
 * @param FunctionName - 需要动态调用的方法名称字符串
 * @param Uobject - 包含目标方法的游戏对象实例
 * @note 使用类型断言(as any)绕过TS类型检查，运行时动态调用对象的指定方法
 * @behavior 当FCall事件触发时，在目标对象上执行指定名称的方法 */
GameInstance.FCall.Bind((FunctionName, Uobject) => {
    Uobject[FunctionName]();
});
require("./Blueprints/Test/BP_Test");
require("./Blueprints/Character/BP_BaseCharacter");
require("./Blueprints/Character/Player/BP_Player");
require("./Blueprints/Ability/BaseAbility/GA_BaseResponse");
require("./Blueprints/Ability/_00Melee/GA_Melee");
require("./Blueprints/Character/Player/BP_PlayerController");
require("./Blueprints/Character/Enemy/BP_Enemy");
require("./Blueprints/Character/Enemy/UMG/UMG_EnemyBar");
require("./Blueprints/Character/Enemy/BP_AIController");
require("./Blueprints/Character/Enemy/AI/BTT_MeleeAttack");
require("./Blueprints/Character/Enemy/AI/BTT_FindPlayer");
require("./Blueprints/Character/Player/UMG/UMG_AbilitySlot");
require("./Blueprints/Character/Player/UMG/UMG_AttributeBar");
require("./Blueprints/Character/Player/UMG/UMG_MainUI");
require("./Blueprints/Ability/BP_GameplayAbility");
require("./Blueprints/Ability/_01HPRegen/GA_HPRegen");
require("./Blueprints/Ability/_01HPRegen/GC_HPRegen");
require("./Blueprints/Ability/_02Dash/GA_Dash");
require("./Blueprints/Ability/_03Laser/GA_Laser");
require("./Blueprints/Ability/_03Laser/BP_LaserActor");
//# sourceMappingURL=MainGame.js.map