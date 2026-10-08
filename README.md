# PTGAS

基于 **Unreal Engine 5 + GAS + Puerts** 的 ARPG 技能系统 Demo。

核心思路是把游戏逻辑从 C++ 和蓝图里抽到 TypeScript：**C++ 打地基，蓝图做资产，TS 写逻辑**。改技能不用重编 C++，配合热更可在运行中（或不重启进程的情况下）生效。

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
import * as UE from 'ue';
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
        this.StartUI_CD();
        this.PlayMontage();
    }
}
```

`mixin.ts` 内部只做三件事：查缓存（`BlueprintClasses`）→ `UE.Class.Load` 加载蓝图类 → `blueprint.tojs()` 转 JS 类后 `blueprint.mixin` 合并原型。加载失败的路径会直接抛错，不会静默跳过。

## 目录结构

```
Source/PTGAS/                     C++ 基类层（11 个 UCLASS + 1 个模块加载器）
├── Abilitys/                     技能基类、属性集、目标选择器
├── Character/                    角色与玩家控制器基类
├── GameInstance/                 Puerts FJsEnv 宿主
├── HotUpdate/                    冷更 / 热更子系统 + 脚本模块加载器
├── Libary/                       输入绑定静态扩展方法
└── AnimNotify/                   动画通知调脚本

TypeScript/
├── MainGame.ts                   脚本入口：绑定委托 + import 全部模块
├── mixin.ts                      混入机制核心
├── build.js                      esbuild 打包脚本（产物 = Content/JavaScript/bundle.js）
├── ScanImports.ts                批量补 import 工具
├── FileWatcher.ts                监听目录自动补 import（chokidar）
├── Gen/GameplayTags.gen.ts       由插件自动生成，勿手改
├── Blueprints/                   28 个蓝图逻辑（每个对应一个同名蓝图资产）
│   ├── Ability/                  技能：Melee / HPRegen / Dash / Laser / GroundBlast / FireBlast
│   └── Character/                角色：Enemy（含 AI 行为树节点）与 Player（含 UMG）
└── Examples/                     8 个「主动调用 UE」示例，不参与打包

Plugins/PuertsTagGenerator/       自制插件：GameplayTag → TS 常量
Plugins/Puerts/                   官方插件（1.0.5）
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

> **注意**：第 2、3 步都不可省略。引擎实际加载的是 `Content/JavaScript/bundle.js` 这一个文件（由 esbuild 打包，约 60 KB），散装的 `.js` 不参与运行。只跑 `tsc` 不跑 `build.js`，改动不会生效。

新增蓝图 TS 文件后，`FileWatcher.ts` 会自动把 import 追加到 `MainGame.ts`；也可以用 `ScanImports.ts` 批量补一次。

## 技术栈

| 组件 | 说明 |
|---|---|
| Unreal Engine 5.3 | `PTGAS.uproject` |
| GameplayAbilitySystem | 技能与属性系统 |
| EnhancedInput | 输入绑定 |
| [Puerts](https://github.com/Tencent/puerts) 1.0.5 | TypeScript 运行时（V8 后端） |
| esbuild | 打包 `bundle.js`（`platform: node`、`format: cjs`，`ue`/`puerts` 走 external） |
| TypeScript 4.7.4 | 开启 `experimentalDecorators` |

C++ 模块公开依赖：`Core` `CoreUObject` `Engine` `InputCore` `EnhancedInput` `GameplayTags` `GameplayTasks` `GameplayAbilities` `Puerts` `JsEnv` `Http` `Json` `JsonUtilities`

## 热更体系

工程里有**两套**更新机制，共用同一份 `version.json` 格式，落盘目录也统一，区别在「什么时候更新、更新完怎么生效」。

| | 冷更（Cold） | 热更（Live） |
|---|---|---|
| 类 | `UHotUpdateSubsystem` | `ULiveHotUpdateSubsystem` |
| 时机 | 启动后 / 手动触发，下载完重启**进程** | 运行中触发，不重启进程 |
| 入口 | `StartCheckUpdate(version.json URL)` | `DoLiveHotUpdate(version.json URL, 目标地图)` |
| 生效方式 | 重启游戏进程 | 切过渡关卡 → 重启 JS 虚拟机 → 切回主图 |
| 版本文件 | `Saved/PersistentDownloadDir/cold_version.json` | `Saved/PersistentDownloadDir/hot_version.json` |
| 调用方 | `Http_Map`（含清缓存） | `WBP_SelectText`（启动菜单） |

> 类名与功能有个历史遗留的错位：冷更的类叫 `UHotUpdateSubsystem`（日志前缀是 `[ColdUpdate]`），热更的类叫 `ULiveHotUpdateSubsystem`。看日志时按前缀区分。

### 冷更流程

```
StartCheckUpdate(url)
   │
   ├─ GET 远程 version.json → 解析 { version, downloadUrl }
   │      │
   │      └─ 与本地版本比对（底包默认 1.0.0）
   │
   ├─ 版本相同 → OnCheckVersionResult(false, …) → 直接进游戏
   │
   └─ 版本不同 → OnCheckVersionResult(true, …)
            └─ DownloadPatch() → 下载中持续广播 OnUpdateProgress(0~1) 驱动进度条
                     └─ 落盘到 Saved/HotUpdate/JavaScript/bundle.js
                              ├─ SaveLocalVersion() 记下新版本号
                              └─ OnUpdateFinished() → UI 弹窗提示重启
```

网络异常时只打日志并跳过更新直接进游戏，不会卡住启动流程。下载完成后**必须重启**才能生效——`bundle.js` 在脚本环境启动时就被加载了。`RestartGameApp()` 会区分运行环境：编辑器（PIE）里只做安全退出（`QuitGame`），打包版则用 `FPlatformProcess::CreateProc` 拉起一个新进程再退出当前进程。

### 热更流程

```
DoLiveHotUpdate(url, TargetMap)
   │
   ├─ GET version.json → HasNewVersion() 比对
   │      ├─ Saved 里没有 bundle.js → 有新版本
   │      └─ hot_version.json 的版本号与远端不同 → 有新版本
   │
   ├─ 无新版本 → OnVersionChecked(false) → 结束
   │
   └─ 有新版本 → 下载 bundle.js 到 Saved/HotUpdate/JavaScript/
            └─ SaveLocalVersion() → SwitchLevelAndReload()
                     │
                     ├─ OpenLevel("HotReloadTransition_Map")   销毁旧世界里绑着 TS 原型和 GAS 委托的 Actor
                     ├─ 延时 0.3 秒
                     ├─ UGAS_GameInstance::RestartJsEnv()      重启 JS 虚拟机
                     └─ OpenLevel(TargetMap)                   切回主图，新逻辑全面生效
```

`ClearHotUpdateCache()` 会递归删掉整个 `Saved/HotUpdate/`，用于测试冷更时不被上次热更的文件干扰。

### 脚本从哪加载：`FLiveJSModuleLoader`

热更之所以能"覆盖"包体脚本，靠的是 `GAS_GameInstance` 换掉了默认模块加载器：

```
FLiveJSModuleLoader::Search(模块名)
   │
   ├─ ① 先查 <项目>/Saved/HotUpdate/JavaScript/<模块>.js   ← 热更下来的文件
   │
   └─ ② 找不到 → 回落到父类 DefaultJSModuleLoader，读包体内 Content/JavaScript/
```

所以热更文件**永远优先于包体**，删掉 `Saved/HotUpdate/` 就能干净回退到包体版本。入口固定是 `GameScript->Start(TEXT("bundle"))`，并把 GameInstance 作为 `argv` 里的 `GameInstance` 传给 `MainGame.ts`。

### 重启的三个粒度

| 方法 | 作用域 | 用在哪 |
|---|---|---|
| `RestartGameApp()` | 整个**进程**（打包版新起进程 + 退出自己；PIE 只退出） | 冷更 |
| `RestartJsEnv()` | **V8 虚拟机**：解绑 `FCall` → `GameScript.Reset()` → `ForceGarbageCollection` → 重建 | 热更 |
| `OpenLevel(…)` | 单张**关卡**（配合上面的过渡关卡使用） | 热更 |

`RestartJsEnv()` 是关键：它先解绑 `FCall` 防止旧 TS 闭包持有悬空指针，再销毁整个 `FJsEnv` 并强制 GC，然后原地重建——此时 Loader 会自动命中刚下载的 `Saved` 文件，重新走一遍 `bundle` 和所有 `@mixin`。

### version.json 格式

冷更与热更共用同一份结构，与 `FCold_VersionInfo` / `FHot_VersionInfo` 一一对应：

```json
{ "version": "1.0.1", "downloadUrl": "https://your-server/bundle.js" }
```

## 自制插件

**PuertsTagGenerator** — 编辑器模块，监听 GameplayTag 树的变化，0.5 秒防抖后把全部标签生成为 TypeScript 常量（当前 30 个），挂在 `globalThis.TagsfromPlugin` 上。生成的标签会带上父标签与引擎内置标签，因此数量通常多于 `DefaultGameplayTags.ini` 里手写的条目（当前 23 条）。

生成的文件用 `new UE.GameplayTag()` 逐个建实例而非对象字面量——字面量会崩 GAS 的 C++ 接口。输出路径可在 `项目设置 → Puerts Tag Generator` 配置，默认 `TypeScript/Gen/GameplayTags.gen.ts`。

## 地图一览

| 地图 | 用途 |
|---|---|
| `SelectText_Map` | 启动菜单（`GameDefaultMap`），`WBP_SelectText` 上挂热更入口 |
| `Main_Map` | 战斗主图 |
| `Http_Map` | 冷更测试图，绑定版本检查与进度回调 |
| `HotReloadTransition_Map` | 热更用的空过渡关卡 |

## 注意事项（踩过的坑）

- **改了 TS 必须跑两步**：`tsc` 只更新散装 `.js`，引擎读的是 `bundle.js`，漏掉 `node build.js` 改动就是不生效。
- **热更文件落在 `Saved/`，不覆盖包体**：安装目录里的那份始终是可回退的干净基线；打包版 `Saved` 会解析到 `%LOCALAPPDATA%\<项目名>\Saved\`，装在 `Program Files` 下也写得进去。
- **两个版本文件是分开的**：冷更写 `cold_version.json`、热更写 `hot_version.json`，否则一套更新会把另一套的版本号覆盖掉。
- **热更/切关后按键失灵**：`BP_Player` 的 `AddMappingContext()` / `BindKey()` 都带重试（最多 40 次 × 50ms = 2 秒）。因为切关 + 重启虚拟机后，`PlayerController` 与 EnhancedInput 子系统不一定已经就绪，且角色的 `EnhancedInputComponent` 要等 Controller 附身之后才创建。
- **`UI Only` 输入模式不会随切关复位**：菜单图设过 UI 模式后，游戏图必须显式设回 `Game`/`GameAndUI`，否则人物能动但按键全无响应。
- **`DoLiveHotUpdate` 的 `TargetMap` 建议显式传参**：代码里的默认值是 `MainGameMap`，而工程里实际的地图叫 `Main_Map`，用默认值会切到一张不存在的图而卡在过渡关卡。
- **二进制资产走 Git LFS**：`.uasset` / `.umap` / 纹理 / 库文件等（共 1700+ 个文件）由 `.gitattributes` 里的 472 条规则交给 LFS 管理，仓库本身的对象只有几十 MB。

## 仓库镜像

主仓库在腾讯工蜂，包含完整资产；GitHub 是**只含代码的镜像**。

二进制资产（`.uasset` / `.umap` / 纹理 / 库文件等 1700+ 个文件）由 Git LFS 管理，镜像推送时**跳过了 LFS**，所以 GitHub 上拿到的是指向资产的指针文件，从 GitHub 克隆的工程**只能读代码、无法直接运行**。

```bash
# 推工蜂（含 LFS 资产）
git push origin master

# 推 GitHub 镜像（跳过 LFS，只推代码）
GIT_LFS_SKIP_PUSH=1 git push github master
```

## License

MIT © 2026 Chance_Li
