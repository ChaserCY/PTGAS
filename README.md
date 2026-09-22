# PTGAS

基于 **Unreal Engine 5 + GAS + Puerts** 的 ARPG 技能系统 Demo。

核心思路是把游戏逻辑从 C++ 和蓝图里抽到 TypeScript：**C++ 打地基，蓝图做资产，TS 写逻辑**。改技能不用重编 C++，走热更即可生效。

## 架构

```
┌──────────────────────────────────────────────┐
│  TypeScript 逻辑层   TypeScript/Blueprints/  │  技能怎么放、伤害怎么算、UI 怎么刷
├──────────────────────────────────────────────┤  ↕ mixin 缝合
│  蓝图资产层          Content/BluePrints/     │  配数值、连节点、挂蒙太奇与 GameplayEffect
├──────────────────────────────────────────────┤  ▲ 继承（UCLASS 父类）
│  C++ 基类层          Source/PTGAS/           │  父类、属性集、目标选择器、基础设施
└──────────────────────────────────────────────┘
```

每个 `TypeScript/Blueprints/**/*.ts` 文件都对应一个**同名蓝图资产**，通过 Puerts 的 mixin 机制建立关联。

## mixin 三段式

以 `GA_FireBlast.ts` 为例，所有蓝图 TS 都是这个写法：

```ts
import mixin from "../../../mixin";

// ① 声明对应的蓝图资产路径（_C 表示生成的类）
const AssetPath = "/Game/BluePrints/Ability/_05FireBlast/GA_FireBlast.GA_FireBlast_C";

// ② 接口声明合并：让 TS 静态期知道蓝图里有哪些变量和函数
export interface GA_FireBlast extends UE.Game.BluePrints.Ability._05FireBlast.GA_FireBlast.GA_FireBlast_C {}

// ③ 装饰器执行混入
@mixin(AssetPath)
export class GA_FireBlast extends BP_GameplayAbility implements GA_FireBlast {
    K2_ActivateAbility() {
        this.K2_CommitAbility();
        this.PlayMontage();
    }
}
```

`mixin.ts` 内部只做三件事：查缓存 → `UE.Class.Load` 加载蓝图类 → `blueprint.mixin` 合并原型。

## 目录结构

```
Source/PTGAS/                     C++ 基类层（10 个 UCLASS）
├── Abilitys/                     技能基类、属性集、目标选择器
├── Character/                    角色与玩家控制器基类
├── GameInstance/                 Puerts FJsEnv 宿主
├── HotUpdate/                    HTTP 热更子系统
├── Libary/                       输入绑定静态扩展方法
└── AnimNotify/                   动画通知调脚本

TypeScript/
├── MainGame.ts                   脚本入口：绑定委托 + import 全部模块
├── mixin.ts                      混入机制核心
├── ScanImports.ts                批量补 import 工具
├── FileWatcher.ts                监听目录自动补 import
├── Gen/GameplayTags.gen.ts       由插件自动生成，勿手改
└── Blueprints/                   28 个蓝图逻辑（每个对应一个同名蓝图资产）

Plugins/PuertsTagGenerator/       自制插件：GameplayTag → TS 常量
```

## 快速开始

需要 Node.js 与已配置好的 UE5 工程。

```bash
# 1. 安装依赖
npm install

# 2. 编译 TS（或在编辑器里让 tsc --watch 常驻）
npm start                  # 等价于 tsc --watch

# 3. 打包成运行时入口（必须在 TypeScript/ 目录下执行）
cd TypeScript && node build.js
```

> **注意**：第 2、3 步都不可省略。引擎实际加载的是 `Content/JavaScript/bundle.js` 这一个文件（由 esbuild 打包），散装的 `.js` 不参与运行。只跑 `tsc` 不跑 `build.js`，改动不会生效。

新增蓝图 TS 文件后，`FileWatcher.ts` 会自动把 import 追加到 `MainGame.ts`；也可以用 `ScanImports.ts` 批量补一次。

## 技术栈

| 组件 | 说明 |
|---|---|
| Unreal Engine 5.3 | `PTGAS.uproject` |
| GameplayAbilitySystem | 技能与属性系统 |
| EnhancedInput | 输入绑定 |
| [Puerts](https://github.com/Tencent/puerts) 1.0.5 | TypeScript 运行时 |
| esbuild | 打包 `bundle.js` |

C++ 模块公开依赖：`Core` `CoreUObject` `Engine` `InputCore` `EnhancedInput` `GameplayTags` `GameplayTasks` `GameplayAbilities` `Puerts` `JsEnv` `Http` `Json` `JsonUtilities`

## 热更流程

`UHotUpdateSubsystem`（GameInstanceSubsystem）负责脚本热更，更新对象就是 `bundle.js` 本身。入口 `StartCheckUpdate(远程 version.json 地址)` 是蓝图可调用的。

```
StartCheckUpdate(url)
   │
   ├─ GET 请求远程 version.json
   │
   ├─ OnRemoteVersionResponse  解析出 { version, downloadUrl }
   │      │
   │      └─ 与本地版本比对
   │         （本地记录在 Saved/PersistentDownloadDir/version.json，底包默认 1.0.0）
   │
   ├─ 版本相同 → OnCheckVersionResult(false, …) → 直接进游戏
   │
   └─ 版本不同 → OnCheckVersionResult(true, …)
            │
            └─ DownloadPatch() → 下载中持续广播 OnUpdateProgress(0~1) 驱动进度条
                     │
                     └─ 落盘到 Content/JavaScript/bundle.js
                              │
                              ├─ SaveLocalVersion() 记下新版本号
                              └─ OnUpdateFinished() → UI 弹窗提示重启
```

**下载完成后必须重启游戏** —— `bundle.js` 在脚本环境启动时就被加载了，运行中替换文件不会生效。所以有了 `RestartGameApp()`：它会区分运行环境，编辑器（PIE）里只做安全退出，打包版则拉起一个新进程再关掉当前进程。

三个委托供蓝图绑定，用来驱动 UI：`OnCheckVersionResult` / `OnUpdateProgress` / `OnUpdateFinished`。网络异常时只打日志并跳过更新直接进游戏，不会卡住启动流程。

远程 `version.json` 的格式与 `FVersionInfo` 结构体一一对应：

```json
{ "version": "1.0.1", "downloadUrl": "https://your-server/bundle.js" }
```

## 自制插件

**PuertsTagGenerator** — 编辑器模块，监听 GameplayTag 树的变化，0.5 秒防抖后把全部标签生成为 TypeScript 常量（当前 30 个），挂在 `globalThis.TagsfromPlugin` 上。生成的标签会带上父标签与引擎内置标签，因此数量通常多于 `DefaultGameplayTags.ini` 里手写的条目。

输出路径可在 `项目设置 → Puerts Tag Generator` 配置，默认 `TypeScript/Gen/GameplayTags.gen.ts`。

## License

MIT © 2026 Chance_Li
