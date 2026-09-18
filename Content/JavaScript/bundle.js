var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// MainGame.ts
var UE30 = __toESM(require("ue"));
var import_puerts4 = require("puerts");

// Blueprints/Test/BP_Test.ts
var UE2 = __toESM(require("ue"));

// mixin.ts
var UE = __toESM(require("ue"));
var import_puerts = require("puerts");
var BlueprintClasses = /* @__PURE__ */ new Map();
function mixin(pathOrClass, objectTakeByNative = true) {
  let UClass = BlueprintClasses.get(pathOrClass);
  if (!UClass) {
    UClass = UE.Class.Load(pathOrClass);
    if (UClass) {
      BlueprintClasses.set(pathOrClass, UClass);
    } else {
      throw new Error(`Failed to load Class at path:${pathOrClass}`);
    }
  }
  return function(target) {
    const JsClass = import_puerts.blueprint.tojs(UClass);
    return import_puerts.blueprint.mixin(JsClass, target, { objectTakeByNative });
  };
}

// Blueprints/Test/BP_Test.ts
var AssetPath = "/Game/BluePrints/Test/BP_Test.BP_Test_C";
var BP_Test = class {
  Fun1() {
    UE2.KismetSystemLibrary.PrintString(
      this,
      "\u6211\u662F\u51FD\u65701",
      true,
      true,
      UE2.LinearColor.Red,
      2
    );
  }
  Fun2() {
    UE2.KismetSystemLibrary.PrintString(
      this,
      "\u6211\u662F\u51FD\u65702",
      true,
      true,
      UE2.LinearColor.Green,
      2
    );
  }
  Fun3() {
    UE2.KismetSystemLibrary.PrintString(
      this,
      "\u6211\u662F\u51FD\u65703\uFF0C\u901A\u8FC7\u84DD\u56FE\u8C03\u7528\u7684",
      true,
      true,
      UE2.LinearColor.Green,
      2
    );
  }
};
BP_Test = __decorateClass([
  mixin(AssetPath)
], BP_Test);

// Blueprints/Character/BP_BaseCharacter.ts
var UE3 = __toESM(require("ue"));
var AssetPath2 = "/Game/BluePrints/Character/BP_BaseCharacter.BP_BaseCharacter_C";
var GA_BaseResponseClass = UE3.Class.Load("/Game/BluePrints/Ability/BaseAbility/GA_BaseResponse.GA_BaseResponse_C");
var BaseResponseTag = new UE3.GameplayTag("Ability.BaseResponse");
var GA_MeleeClass = UE3.Class.Load("/Game/BluePrints/Ability/_00Melee/GA_Melee.GA_Melee_C");
var MeleeHitTag = new UE3.GameplayTag("Ability.Melee.HitEvent");
var AbilityAllTag = new UE3.GameplayTag("Ability");
var BP_BaseCharacter = class {
  constructor() {
    //动画蓝图
    this.ABP_Sinbi = null;
    //初始化摩擦力
    this.InitFriction = 0;
  }
  ReceiveBeginPlay() {
    this.BaseInit();
  }
  BaseInit() {
    this.ABP_Sinbi = this.Mesh.GetAnimInstance();
    this.InitAbility();
    this.InitBind();
    this.InitFriction = this.CharacterMovement.GroundFriction;
  }
  //初始化技能
  InitAbility() {
    if (GA_BaseResponseClass) {
      this.AbilitySystemComponent.K2_GiveAbilityAndActivateOnce(GA_BaseResponseClass);
    }
    if (GA_MeleeClass) {
      this.AbilitySystemComponent.K2_GiveAbility(GA_MeleeClass);
    }
  }
  //激活技能
  ActivateAbility(AbilityTay) {
    if (this.Dead) return;
    this.AbilitySystemComponent.TryActivateAbilitiesByTag(this.GetAbilityTag(AbilityTay));
  }
  //获取技能标签
  GetAbilityTag(AbilityTay) {
    return UE3.BlueprintGameplayTagLibrary.MakeGameplayTagContainerFromTag(AbilityTay);
  }
  InitBind() {
    this.HPChanged.Add((...args) => this.HPChangedEvent(...args));
    this.MPChanged.Add((...args) => this.MPChangedEvent(...args));
    this.SPChanged.Add((...args) => this.SPChangedEvent(...args));
    this.DamageBox.OnComponentBeginOverlap.Add((...args) => this.WeaponOverlop(...args));
  }
  WeaponOverlop(OverlappedComponent, OtherActor, OtherComp, OtherBodyIndex, bFromSweep, SweepResult) {
    if (this == OtherActor) return;
    if (!this.HitActor.Contains(OtherActor) && this.GetClass() != OtherActor.GetClass()) {
      this.HitActor.Add(OtherActor);
      UE3.KismetSystemLibrary.PrintString(
        this,
        `${this.GetName()}\u51FB\u4E2D\u4E86->${OtherActor.GetName()}`,
        true,
        true,
        UE3.LinearColor.Green,
        5
      );
      const GameplayEventData5 = new UE3.GameplayEventData();
      GameplayEventData5.EventTag = MeleeHitTag;
      GameplayEventData5.Instigator = this;
      GameplayEventData5.Target = OtherActor;
      UE3.AbilitySystemBlueprintLibrary.SendGameplayEventToActor(this, MeleeHitTag, GameplayEventData5);
    }
  }
  //开始伤害(蒙太奇通知)
  BeginDamage() {
    this.HitActor.Empty();
    this.DamageBox.SetCollisionEnabled(UE3.ECollisionEnabled.QueryOnly);
  }
  EndDamage() {
    this.HitActor.Empty();
    this.DamageBox.SetCollisionEnabled(UE3.ECollisionEnabled.NoCollision);
  }
  HPChangedEvent(Value) {
    if (Value <= 0 && !this.Dead) {
      this.Dead = true;
      this.ABP_Sinbi.Dead = true;
      this.AbilitySystemComponent.RemoveActiveEffectsWithTags(this.GetAbilityTag(BaseResponseTag));
      this.CapsuleComponent.SetCollisionEnabled(UE3.ECollisionEnabled.NoCollision);
      this.AbilitySystemComponent.RemoveActiveEffectsWithTags(this.GetAbilityTag(AbilityAllTag));
    }
  }
  MPChangedEvent(Value) {
  }
  SPChangedEvent(Value) {
  }
  /*冲刺位移技能*/
  DashForward(DashDirection, Force, DashTime) {
    this.SetFrictionToZero(true);
    const Impulse = new UE3.Vector(
      DashDirection.X * Force,
      DashDirection.Y * Force,
      DashDirection.Z * Force
    );
    this.CharacterMovement.AddImpulse(Impulse, true);
    setTimeout(() => {
      this.SetFrictionToZero(false);
    }, DashTime * 1e3);
  }
  /*设置摩擦力为0*/
  SetFrictionToZero(isZero) {
    if (isZero) {
      this.CharacterMovement.GroundFriction = 0;
      this.CapsuleComponent.SetCollisionResponseToChannel(UE3.ECollisionChannel.ECC_Pawn, UE3.ECollisionResponse.ECR_Ignore);
      this.CapsuleComponent.SetCollisionResponseToChannel(UE3.ECollisionChannel.ECC_Camera, UE3.ECollisionResponse.ECR_Ignore);
    } else {
      this.CharacterMovement.GroundFriction = this.InitFriction;
      this.CapsuleComponent.SetCollisionResponseToChannel(UE3.ECollisionChannel.ECC_Pawn, UE3.ECollisionResponse.ECR_Block);
      this.CapsuleComponent.SetCollisionResponseToChannel(UE3.ECollisionChannel.ECC_Camera, UE3.ECollisionResponse.ECR_Block);
    }
  }
  /*眩晕n秒*/
  Stun(StunDuration) {
  }
};
BP_BaseCharacter = __decorateClass([
  mixin(AssetPath2)
], BP_BaseCharacter);

// Blueprints/Character/Player/BP_Player.ts
var UE4 = __toESM(require("ue"));
var import_ue = require("ue");
var AssetPath3 = "/Game/BluePrints/Character/Player/BP_Player.BP_Player_C";
var DashHitTag = new import_ue.GameplayTag("Ability.Dash.HitEvent");
var JumpAction = UE4.InputAction.Load("/Game/BluePrints/Input/Action/IA_Jump.IA_Jump");
var MoveAction = UE4.InputAction.Load("/Game/BluePrints/Input/Action/IA_Move.IA_Move");
var LookAction = UE4.InputAction.Load("/Game/BluePrints/Input/Action/IA_Look.IA_Look");
var PullEventTag = new import_ue.GameplayTag("Ability.FireBlast.PullEvent");
var PushEventTag = new import_ue.GameplayTag("Ability.FireBlast.PushEvent");
var LockCameraAction = UE4.InputAction.Load("/Game/BluePrints/Input/Action/IA_LockCamera.IA_LockCamera");
var IMC_Default = UE4.InputMappingContext.Load("/Game/BluePrints/Input/IMC_Default.IMC_Default");
var AttributeSetHP = new UE4.GameplayAttribute("HP", "/Script/PTGAS.BaseAttributeSet:HP", null);
var AttributeSetMaxHP = new UE4.GameplayAttribute("MaxHP", "/Script/PTGAS.BaseAttributeSet:MaxHP", null);
var AttributeSetMP = new UE4.GameplayAttribute("MP", "/Script/PTGAS.BaseAttributeSet:MP", null);
var AttributeSetMaxMP = new UE4.GameplayAttribute("MaxMP", "/Script/PTGAS.BaseAttributeSet:MaxMP", null);
var AttributeSetSP = new UE4.GameplayAttribute("SP", "/Script/PTGAS.BaseAttributeSet:SP", null);
var AttributeSetMaxSP = new UE4.GameplayAttribute("MaxSP", "/Script/PTGAS.BaseAttributeSet:MaxSP", null);
var BP_Player = class extends BP_BaseCharacter {
  constructor() {
    super(...arguments);
    //相机开始位置
    this.CameraStartLocation = new UE4.Vector();
    //相机结束位置
    this.CameraEndLocation = new UE4.Vector(0, 0, 180);
    //相机开始的旋转
    this.CameraStartRotation = new UE4.Rotator();
    //相机结束的旋转
    this.CameraEndRotation = new UE4.Rotator(-17, 0, 0);
    this.InLock = false;
  }
  ReceiveBeginPlay() {
    this.PlayerController = UE4.GameplayStatics.GetPlayerController(this, 0);
    this.BaseInit();
    this.AddMappingContext();
    if (this.LookCameraLine) {
      this.LookCameraLine.SetPlayRate(1 / 0.3);
    }
    this.Sphere.OnComponentBeginOverlap.Add((...args) => this.SphereOnOverlap(...args));
  }
  //添加输入映射
  AddMappingContext() {
    if (this.PlayerController) {
      let EnhanceInputSubsystem = UE4.SubsystemBlueprintLibrary.GetLocalPlayerSubSystemFromPlayerController(
        this.PlayerController,
        UE4.EnhancedInputLocalPlayerSubsystem.StaticClass()
      );
      if (EnhanceInputSubsystem && IMC_Default) {
        EnhanceInputSubsystem.AddMappingContext(IMC_Default, 0);
      }
      const CameraManager = UE4.GameplayStatics.GetPlayerCameraManager(this, 0);
      if (CameraManager) {
        CameraManager.ViewPitchMin = -65;
        CameraManager.ViewPitchMax = 25;
      }
      this.BindKey();
    }
  }
  //绑定按键
  BindKey() {
    const InputComponent = this.GetComponentByClass(UE4.EnhancedInputComponent.StaticClass());
    if (InputComponent) {
      InputComponent.BindAction(JumpAction, UE4.ETriggerEvent.Started, this, "Jumpp");
      InputComponent.BindAction(MoveAction, UE4.ETriggerEvent.Triggered, this, "Move");
      InputComponent.BindAction(LookAction, UE4.ETriggerEvent.Triggered, this, "Look");
      InputComponent.BindAction(LockCameraAction, UE4.ETriggerEvent.Started, this, "IA_LockCamera");
    }
  }
  InitAbility() {
    super.InitAbility();
    for (let i = 0; i < this.GAS.Num(); i++) {
      if (this.GAS.GetRef(i)) {
        this.AbilitySystemComponent.K2_GiveAbility(this.GAS.GetRef(i));
        if (this.PlayerController && this.PlayerController.MainUI && this.PlayerController.MainUI.AbilitySlots.GetRef(i)) {
          this.PlayerController.MainUI.AbilitySlots.GetRef(i).InitInfo(this.GetAbilityInfo(this.GAS.GetRef(i), 0));
        }
      }
    }
  }
  Jumpp() {
    this.Jump();
  }
  IA_LockCamera() {
    this.LookCamera(!this.InLock);
    this.InLock = !this.InLock;
  }
  //鼠标移动视角
  Look(ActionValue) {
    const Value2D = UE4.EnhancedInputLibrary.Conv_InputActionValueToAxis2D(ActionValue);
    this.AddControllerYawInput(Value2D.X);
    this.AddControllerPitchInput(Value2D.Y);
  }
  //移动
  Move(ActionValue) {
    const Value2D = UE4.EnhancedInputLibrary.Conv_InputActionValueToAxis2D(ActionValue);
    if (!this.Move_Rotator) {
      this.Move_Rotator = new UE4.Rotator(0, 0, 0);
    }
    this.Move_Rotator.Yaw = this.GetControlRotation().Yaw;
    const ForwardVector = UE4.KismetMathLibrary.GetForwardVector(this.Move_Rotator);
    const RightVector = UE4.KismetMathLibrary.GetRightVector(this.Move_Rotator);
    this.AddMovementInput(ForwardVector, Value2D.Y);
    this.AddMovementInput(RightVector, Value2D.X);
  }
  //锁定还需要改类图视图中组件的设置(代码实现)
  //锁定镜头
  LookCamera(OpenLook) {
    this.bUseControllerRotationYaw = OpenLook;
    this.SpringArm.bUsePawnControlRotation = !OpenLook;
    this.CharacterMovement.bOrientRotationToMovement = !OpenLook;
    if (OpenLook) {
      this.CameraStartLocation = this.Camera.RelativeLocation;
      this.CameraStartRotation = this.Camera.RelativeRotation;
      this.LookCameraLine.PlayFromStart();
    } else {
      this.CameraStartLocation = UE4.Vector.ZeroVector;
      this.CameraStartRotation = UE4.Rotator.ZeroRotator;
      this.LookCameraLine.ReverseFromEnd();
    }
  }
  //镜头缓动,千万不要打错字
  LookCameraLine__UpdateFunc() {
    const NewLocation = UE4.KismetMathLibrary.VLerp(this.CameraStartLocation, new UE4.Vector(0, 0, 180), this.LookCameraLine_Time_E2604BD340D43B16DB00B9849B380DCE);
    const NewRotation = UE4.KismetMathLibrary.RLerp(this.CameraStartRotation, new UE4.Rotator(-17, 0, 0), this.LookCameraLine_Time_E2604BD340D43B16DB00B9849B380DCE, true);
    this.Camera.K2_SetRelativeLocationAndRotation(NewLocation, NewRotation, false, null, false);
  }
  //碰撞事件的回调
  SphereOnOverlap(OverlappedComponent, OtherActor, OtherComp, OtherBodyIndex, bFromSweep, SweepResult) {
    if (OtherActor != this && !this.HitActor.Contains(OtherActor)) {
      this.HitActor.Add(OtherActor);
      UE4.KismetSystemLibrary.PrintString(
        this,
        `${this.GetName()}\u51FB\u4E2D\u4E86->${OtherActor.GetName()}`,
        true,
        true,
        UE4.LinearColor.Green,
        5
      );
      const GameplayEventData5 = new UE4.GameplayEventData();
      GameplayEventData5.EventTag = DashHitTag;
      GameplayEventData5.Instigator = this;
      GameplayEventData5.Target = OtherActor;
      UE4.AbilitySystemBlueprintLibrary.SendGameplayEventToActor(this, DashHitTag, GameplayEventData5);
    }
  }
  SetFrictionToZero(isZero) {
    super.SetFrictionToZero(isZero);
    this.SpringArm.bDoCollisionTest = !isZero;
    this.Sphere.SetCollisionEnabled(isZero ? UE4.ECollisionEnabled.QueryOnly : UE4.ECollisionEnabled.NoCollision);
    this.Sphere.SetSphereRadius(isZero ? 80 : 32, true);
    this.HitActor.Empty();
  }
  HPChangedEvent(Value) {
    super.HPChangedEvent(Value);
    if (this.PlayerController && this.PlayerController.MainUI) {
      const Pre = Value / UE4.AbilitySystemBlueprintLibrary.GetFloatAttributeFromAbilitySystemComponent(this.AbilitySystemComponent, AttributeSetMaxHP, null);
      this.PlayerController.MainUI.HPAttributeBar.SetProgress(Pre);
    }
    if (this.Dead) {
      this.DisableInput(this.PlayerController);
    }
  }
  MPChangedEvent(Value) {
    super.MPChangedEvent(Value);
    if (this.PlayerController && this.PlayerController.MainUI) {
      const Pre = Value / UE4.AbilitySystemBlueprintLibrary.GetFloatAttributeFromAbilitySystemComponent(this.AbilitySystemComponent, AttributeSetMaxMP, null);
      this.PlayerController.MainUI.MPAttributeBar.SetProgress(Pre);
    }
  }
  SPChangedEvent(Value) {
    super.SPChangedEvent(Value);
    if (this.PlayerController && this.PlayerController.MainUI) {
      const Pre = Value / UE4.AbilitySystemBlueprintLibrary.GetFloatAttributeFromAbilitySystemComponent(this.AbilitySystemComponent, AttributeSetMaxSP, null);
      this.PlayerController.MainUI.SPAttributeBar.SetProgress(Pre);
    }
  }
  //通知GA_FireBlast拉取
  Pull() {
    UE4.AbilitySystemBlueprintLibrary.SendGameplayEventToActor(this, PullEventTag, null);
  }
  Push() {
    UE4.AbilitySystemBlueprintLibrary.SendGameplayEventToActor(this, PushEventTag, null);
  }
};
BP_Player = __decorateClass([
  mixin(AssetPath3)
], BP_Player);

// Blueprints/Ability/BaseAbility/GA_BaseResponse.ts
var AssetPath4 = "/Game/BluePrints/Ability/BaseAbility/GA_BaseResponse.GA_BaseResponse_C";
var GA_BaseResponse = class {
  //这是 GA（Gameplay Ability） 的激活入口函数，对应 C++ 中的 ActivateAbility。
  k2_ActivateAbility() {
    this.K2_CommitAbilityCost();
  }
};
GA_BaseResponse = __decorateClass([
  mixin(AssetPath4)
], GA_BaseResponse);

// Blueprints/Ability/_00Melee/GA_Melee.ts
var UE5 = __toESM(require("ue"));
var AssetPath5 = "/Game/BluePrints/Ability/_00Melee/GA_Melee.GA_Melee_C";
var MA_Melee = UE5.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_Melee.MA_Melee");
var MeleeHitTag2 = new UE5.GameplayTag("Ability.Melee.HitEvent");
var MeleeDamageClass = UE5.Class.Load("/Game/BluePrints/Ability/_00Melee/GE_Melee_Damage.GE_Melee_Damage_C");
var GA_Melee = class {
  //当GA触发的时候执行
  K2_ActivateAbility() {
    this.K2_CommitAbility();
    this.BindHitEvent();
    this.PlayMeleeMontage();
  }
  //播放普通攻击蒙太奇
  PlayMeleeMontage() {
    const StartSection = UE5.KismetMathLibrary.RandomInteger(3).toString();
    let MeleeMontageTask = UE5.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(
      this,
      "",
      MA_Melee,
      1,
      StartSection
    );
    MeleeMontageTask.OnCompleted.Add(() => this.K2_EndAbility());
    MeleeMontageTask.OnInterrupted.Add(() => this.K2_EndAbility());
    MeleeMontageTask.OnBlendOut.Add(() => this.K2_EndAbility());
    MeleeMontageTask.OnCancelled.Add(() => this.K2_EndAbility());
    MeleeMontageTask.ReadyForActivation();
  }
  //绑定命中事件
  BindHitEvent() {
    const GameplayEvent = UE5.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this, MeleeHitTag2, null, false, true);
    GameplayEvent.EventReceived.Add((...arge) => this.HitEvent(...arge));
    GameplayEvent.ReadyForActivation();
  }
  //命中事件触发
  HitEvent(Payload) {
    this.BP_ApplyGameplayEffectToTarget(
      UE5.AbilitySystemBlueprintLibrary.AbilityTargetDataFromActor(Payload.Target),
      MeleeDamageClass,
      UE5.KismetMathLibrary.RandomIntegerInRange(0, 4)
    );
  }
};
GA_Melee = __decorateClass([
  mixin(AssetPath5)
], GA_Melee);

// Blueprints/Character/Player/BP_PlayerController.ts
var UE6 = __toESM(require("ue"));
var BasePlayerControllerPath = "/Game/BluePrints/Character/Player/BP_PlayerController.BP_PlayerController_C";
var MeleeTag = new UE6.GameplayTag("Ability.Melee");
var HPRegenTag = new UE6.GameplayTag("Ability.HPRegen");
var DashTag = new UE6.GameplayTag("Ability.Dash");
var LaserTag = new UE6.GameplayTag("Ability.Laser");
var LaserEndTag = new UE6.GameplayTag("Ability.Laser.LaserEnd");
var GroundBlastTag = new UE6.GameplayTag("Ability.GroundBlast");
var FireBlastTag = new UE6.GameplayTag("Ability.FireBlast");
var TestAction = UE6.InputAction.Load("/Game/BluePrints/Input/Action/IA_Test.IA_Test");
var MeleeAction = UE6.InputAction.Load("/Game/BluePrints/Input/Action/IA_Melee.IA_Melee");
var HPRegenAction = UE6.InputAction.Load("/Game/BluePrints/Input/Action/IA_HPRegen.IA_HPRegen");
var DashAction = UE6.InputAction.Load("/Game/BluePrints/Input/Action/IA_Dash.IA_Dash");
var LaserAction = UE6.InputAction.Load("/Game/BluePrints/Input/Action/IA_Laser.IA_Laser");
var GroundBlastAction = UE6.InputAction.Load("/Game/BluePrints/Input/Action/IA_GroundBlast.IA_GroundBlast");
var RightAction = UE6.InputAction.Load("/Game/BluePrints/Input/Action/IA_Right.IA_Right");
var FireBlastAction = UE6.InputAction.Load("/Game/BluePrints/Input/Action/IA_FireBlast.IA_FireBlast");
var MainUIClass = UE6.Class.Load("/Game/BluePrints/Character/Player/UMG/UMG_MainUI.UMG_MainUI_C");
var BP_PlayerController = class {
  ReceiveBeginPlay() {
    this.BP_Player = UE6.GameplayStatics.GetPlayerCharacter(this, 0);
    this.MainUI = UE6.WidgetBlueprintLibrary.Create(this, MainUIClass, this);
    if (this.MainUI) {
      this.MainUI.AddToViewport();
    }
    this.BindKey();
  }
  //绑定按键
  BindKey() {
    const InputComponent = this.GetComponentByClass(UE6.EnhancedInputComponent.StaticClass());
    if (InputComponent) {
      InputComponent.BindAction(TestAction, UE6.ETriggerEvent.Started, this, "TestAction");
      InputComponent.BindAction(MeleeAction, UE6.ETriggerEvent.Started, this, "Melee");
      InputComponent.BindAction(HPRegenAction, UE6.ETriggerEvent.Started, this, "HPRegen");
      InputComponent.BindAction(DashAction, UE6.ETriggerEvent.Started, this, "Dash");
      InputComponent.BindAction(LaserAction, UE6.ETriggerEvent.Started, this, "Laser");
      InputComponent.BindAction(GroundBlastAction, UE6.ETriggerEvent.Started, this, "GroundBlast");
      InputComponent.BindAction(RightAction, UE6.ETriggerEvent.Started, this, "RightPressed");
      InputComponent.BindAction(FireBlastAction, UE6.ETriggerEvent.Started, this, "FireBlast");
    }
  }
  // #region Skill_Function
  TestAction() {
    console.log("TestAction Begin");
  }
  //普通攻击(重写 C++ 里的 BlueprintNativeEvent)
  Melee() {
    if (this.BP_Player) {
      if (this.BP_Player.IsGroundBlaseting) {
        this.BP_Player.AbilitySystemComponent.TargetConfirm();
        this.BP_Player.IsGroundBlaseting = false;
      } else {
        this.BP_Player.ActivateAbility(MeleeTag);
      }
    }
  }
  RightPressed() {
    if (this.BP_Player) {
      this.BP_Player.AbilitySystemComponent.TargetCancel();
      this.BP_Player.IsGroundBlaseting = false;
    }
  }
  Dash() {
    if (this.BP_Player) {
      this.BP_Player.ActivateAbility(DashTag);
    }
  }
  //激活激光
  Laser() {
    if (this.BP_Player) {
      if (!this.BP_Player.IsLasering) {
        this.BP_Player.ActivateAbility(LaserTag);
      } else {
        const GameplayEventData5 = new UE6.GameplayEventData();
        GameplayEventData5.EventTag = LaserEndTag;
        GameplayEventData5.Instigator = this;
        GameplayEventData5.Target = this;
        UE6.AbilitySystemBlueprintLibrary.SendGameplayEventToActor(this.BP_Player, LaserEndTag, GameplayEventData5);
      }
    }
  }
  GroundBlast() {
    if (this.BP_Player && !this.BP_Player.IsGroundBlaseting) {
      this.BP_Player.ActivateAbility(GroundBlastTag);
    }
  }
  FireBlast() {
    console.log("\u6309\u4E0B5\u952E");
    if (this.BP_Player) {
      this.BP_Player.ActivateAbility(FireBlastTag);
    }
  }
  HPRegen() {
    console.log("HPRegen");
    if (this.BP_Player) {
      this.BP_Player.ActivateAbility(HPRegenTag);
    }
  }
  // #endregion
};
BP_PlayerController = __decorateClass([
  mixin(BasePlayerControllerPath)
], BP_PlayerController);

// Blueprints/Character/Enemy/BP_Enemy.ts
var UE7 = __toESM(require("ue"));
var import_puerts2 = require("puerts");
var AssetPath6 = "/Game/BluePrints/Character/Enemy/BP_Enemy.BP_Enemy_C";
var AttributeSetHP2 = new UE7.GameplayAttribute("HP", "/Script/PTGAS.BaseAttributeSet:HP", null);
var AttributeSetMaxHP2 = new UE7.GameplayAttribute("MaxHP", "/Script/PTGAS.BaseAttributeSet:MaxHP", null);
var MA_Stun = UE7.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_Stun.MA_Stun");
var BP_Enemy = class extends BP_BaseCharacter {
  constructor() {
    super(...arguments);
    this.bSuccess = (0, import_puerts2.$ref)(false);
    this._rotationIntervalId = null;
  }
  ReceiveBeginPlay() {
    this.BaseInit();
    this.UMG_Bar = this.Bar.GetUserWidgetObject();
    this.SetBarValue();
    this.NewRotation = new UE7.Rotator();
    this._rotationIntervalId = setInterval(() => {
      this.SelfTick();
    }, 50);
  }
  //监听血量变化
  HPChangedEvent(Value) {
    super.HPChangedEvent(Value);
    this.SetBarValue();
    if (this.Dead) {
      if (this.Bar) {
        this.Bar.K2_DestroyComponent(this);
      }
      if (this._rotationIntervalId !== null) {
        clearInterval(this._rotationIntervalId);
        this._rotationIntervalId = null;
      }
    }
  }
  //ReceiveTick(DeltaSeconds: number) {
  //super.ReceiveTick(DeltaSeconds);这段导致了崩溃
  //this.SetBarRotation();
  //}
  SetBarValue() {
    if (this.UMG_Bar) {
      this.UMG_Bar.HP = UE7.AbilitySystemBlueprintLibrary.GetFloatAttributeFromAbilitySystemComponent(
        this.AbilitySystemComponent,
        AttributeSetHP2,
        this.bSuccess
      );
      this.UMG_Bar.Max_HP = UE7.AbilitySystemBlueprintLibrary.GetFloatAttributeFromAbilitySystemComponent(
        this.AbilitySystemComponent,
        AttributeSetMaxHP2,
        this.bSuccess
      );
    }
  }
  SelfTick() {
    if (!this.Dead) {
      this.SetBarRotation();
    }
  }
  SetBarRotation() {
    const CameraRotation = UE7.GameplayStatics.GetPlayerCameraManager(this, 0).K2_GetActorRotation();
    this.NewRotation.Pitch = CameraRotation.Pitch * -1;
    this.NewRotation.Yaw = CameraRotation.Yaw + 180;
    this.NewRotation.Roll = CameraRotation.Roll * -1;
    this.Bar.K2_SetWorldRotation(this.NewRotation, false, null, false);
  }
  //停止控制器
  StopController() {
    const AIController = UE7.AIBlueprintHelperLibrary.GetAIController(this.GetController());
    if (AIController) {
      AIController.BrainComponent.StopLogic("Stop Controller");
    }
  }
  ResumeController() {
    const AIController = UE7.AIBlueprintHelperLibrary.GetAIController(this.GetController());
    if (AIController) {
      AIController.BrainComponent.RestartLogic();
    }
  }
  //眩晕
  Stun(StunDuration) {
    this.StopController();
    this.PlayAnimMontage(MA_Stun);
    setTimeout(() => {
      this.ResumeController();
    }, StunDuration * 1e3);
  }
};
BP_Enemy = __decorateClass([
  mixin(AssetPath6)
], BP_Enemy);

// Blueprints/Character/Enemy/UMG/UMG_EnemyBar.ts
var UE8 = __toESM(require("ue"));
var AssetPath7 = "/Game/BluePrints/Character/Enemy/UMG/UMG_EnemyBar.UMG_EnemyBar_C";
var UMG_EnemyBar = class {
  GetPercent() {
    return UE8.KismetMathLibrary.FClamp(this.HP / this.Max_HP, 0, 1);
  }
  Get_BarText() {
    return `${this.HP}/${this.Max_HP}`;
  }
};
UMG_EnemyBar = __decorateClass([
  mixin(AssetPath7)
], UMG_EnemyBar);

// Blueprints/Character/Enemy/BP_AIController.ts
var UE9 = __toESM(require("ue"));
var AssetPath8 = "/Game/BluePrints/Character/Enemy/BP_AIController.BP_AIController_C";
var BT_Tree = UE9.BehaviorTree.Load("/Game/BluePrints/Character/Enemy/AI/BT_Tree.BT_Tree");
var BP_AIController = class {
  ReceiveBeginPlay() {
    this.RunBehaviorTree(BT_Tree);
  }
};
BP_AIController = __decorateClass([
  mixin(AssetPath8)
], BP_AIController);

// Blueprints/Character/Enemy/AI/BTT_MeleeAttack.ts
var UE10 = __toESM(require("ue"));
var AssetPath9 = "/Game/BluePrints/Character/Enemy/AI/BTT_MeleeAttack.BTT_MeleeAttack_C";
var MeleeTag2 = new UE10.GameplayTag("Ability.Melee");
var BTT_MeleeAttack = class {
  ReceiveExecuteAI(OwnerController, ControlledPawn) {
    const Character = ControlledPawn;
    if (Character) {
      Character.ActivateAbility(MeleeTag2);
      this.FinishExecute(true);
    } else {
      this.FinishExecute(true);
    }
  }
};
BTT_MeleeAttack = __decorateClass([
  mixin(AssetPath9)
], BTT_MeleeAttack);

// Blueprints/Character/Enemy/AI/BTT_FindPlayer.ts
var UE11 = __toESM(require("ue"));
var AssetPath10 = "/Game/BluePrints/Character/Enemy/AI/BTT_FindPlayer.BTT_FindPlayer_C";
var BP_PlayerClass = UE11.Class.Load("/Game/BluePrints/Character/Player/BP_Player.BP_Player_C");
var BTT_FindPlayer = class {
  ReceiveExecuteAI(OwnerController, ControlledPawn) {
    if (UE11.BTFunctionLibrary.GetBlackboardValueAsActor(this, this.Player)) {
      this.TempPlayer = UE11.BTFunctionLibrary.GetBlackboardValueAsActor(this, this.Player);
      this.ChackCharacter();
    } else {
      this.TempPlayer = UE11.GameplayStatics.GetActorOfClass(this, BP_PlayerClass);
      this.ChackCharacter();
    }
  }
  ChackCharacter() {
    if (this.TempPlayer) {
      UE11.BTFunctionLibrary.SetBlackboardValueAsObject(this, this.Player, this.TempPlayer);
      this.FinishExecute(true);
    } else {
      UE11.BTFunctionLibrary.SetBlackboardValueAsObject(this, this.Player, null);
      this.FinishExecute(false);
    }
  }
};
BTT_FindPlayer = __decorateClass([
  mixin(AssetPath10)
], BTT_FindPlayer);

// Blueprints/Character/Player/UMG/UMG_AbilitySlot.ts
var UE12 = __toESM(require("ue"));
var AssetPath11 = "/Game/BluePrints/Character/Player/UMG/UMG_AbilitySlot.UMG_AbilitySlot_C";
var UMG_AbilitySlot = class {
  PreConstruct(IsDesignTime) {
    this.Key.SetText(this.KeyText);
  }
  Tick(MyGeometry, InDeltaTime) {
    this.UpdateCD(InDeltaTime);
  }
  //初始化信息
  InitInfo(AbilityInfo) {
    this.CD_Intel = AbilityInfo.CD;
    this.AbilityClass = AbilityInfo.AbilityClass;
    this.AbilityImage.SetBrushFromMaterial(AbilityInfo.IconMaterial);
  }
  StartUI_CD() {
    this.IsDuringCD = true;
    this.CD.SetVisibility(UE12.ESlateVisibility.Visible);
    this.CD_Current = this.CD_Intel;
  }
  UpdateCD(DeltaTime) {
    if (this.IsDuringCD) {
      this.CD_Current = UE12.KismetMathLibrary.FClamp(this.CD_Current - DeltaTime, 0, this.CD_Intel);
      if (this.CD_Current > 0) {
        this.CD.SetText(
          UE12.KismetTextLibrary.Conv_DoubleToText(
            this.CD_Current,
            UE12.ERoundingMode.HalfToEven,
            false,
            true,
            1,
            324,
            0,
            1
          )
        );
        this.AbilityImage.GetDynamicMaterial().SetScalarParameterValue("Pre", UE12.KismetMathLibrary.FClamp(1 - this.CD_Current / this.CD_Intel, 0, 1));
      } else {
        this.IsDuringCD = false;
        this.CD.SetVisibility(UE12.ESlateVisibility.Hidden);
        this.AbilityImage.GetDynamicMaterial().SetScalarParameterValue("Pre", 1);
      }
    }
  }
};
UMG_AbilitySlot = __decorateClass([
  mixin(AssetPath11)
], UMG_AbilitySlot);

// Blueprints/Character/Player/UMG/UMG_AttributeBar.ts
var UE13 = __toESM(require("ue"));
var AssetPath12 = "/Game/BluePrints/Character/Player/UMG/UMG_AttributeBar.UMG_AttributeBar_C";
var UMG_AttributeBar = class {
  PreConstruct(IsDesignTime) {
    this.SetColor();
  }
  SetColor() {
    this.Image_Bar.GetDynamicMaterial().SetVectorParameterValue("Color", this.Color);
  }
  SetProgress(Progress) {
    this.Image_Bar.GetDynamicMaterial().SetScalarParameterValue("Pre", UE13.KismetMathLibrary.FClamp(Progress, 0, 1));
  }
};
UMG_AttributeBar = __decorateClass([
  mixin(AssetPath12)
], UMG_AttributeBar);

// Blueprints/Character/Player/UMG/UMG_MainUI.ts
var UE14 = __toESM(require("ue"));
var import_ue2 = require("ue");
var import_puerts3 = require("puerts");
var AssetPath13 = "/Game/BluePrints/Character/Player/UMG/UMG_MainUI.UMG_MainUI_C";
var UMG_MainUI = class {
  Construct() {
  }
  OnInitialized() {
  }
  PreConstruct(IsDesignTime) {
    import_puerts3.blueprint.load(UE14.Game.BluePrints.Character.Player.UMG.UMG_AbilitySlot.UMG_AbilitySlot_C);
    this.AllAbilitySlot = (0, import_ue2.NewArray)(UE14.Game.BluePrints.Character.Player.UMG.UMG_AbilitySlot.UMG_AbilitySlot_C);
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
    import_puerts3.blueprint.unload(UE14.Game.BluePrints.Character.Player.UMG.UMG_AbilitySlot.UMG_AbilitySlot_C);
  }
};
UMG_MainUI = __decorateClass([
  mixin(AssetPath13)
], UMG_MainUI);

// Blueprints/Ability/BP_GameplayAbility.ts
var UE15 = __toESM(require("ue"));
var AssetPath14 = "/Game/BluePrints/Ability/BP_GameplayAbility.BP_GameplayAbility_C";
var BP_GameplayAbility = class {
  //开始的UI的CD
  StartUI_CD() {
    this.PlayerController = UE15.GameplayStatics.GetPlayerController(this, 0);
    if (this.PlayerController && this.PlayerController.MainUI) {
      const AbilitySlots = this.PlayerController.MainUI.AllAbilitySlot;
      console.log(AbilitySlots);
      for (let i = 0; i < AbilitySlots.Num(); i++) {
        if (this.GetClass() == AbilitySlots.GetRef(i).AbilityClass) {
          AbilitySlots.GetRef(i).StartUI_CD();
          break;
        }
      }
    }
  }
};
BP_GameplayAbility = __decorateClass([
  mixin(AssetPath14)
], BP_GameplayAbility);

// Blueprints/Ability/_01HPRegen/GA_HPRegen.ts
var UE16 = __toESM(require("ue"));
var AssetPath15 = "/Game/BluePrints/Ability/_01HPRegen/GA_HPRegen.GA_HPRegen_C";
var MA_HPRegen = UE16.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_HPRegen.MA_HPRegen");
var GE_HPRegenValueClass = UE16.Class.Load("/Game/BluePrints/Ability/_01HPRegen/GE_HPRegen_Value.GE_HPRegen_Value_C");
var GA_HPRegen = class extends BP_GameplayAbility {
  K2_ActivateAbility() {
    this.K2_CommitAbility();
    this.StartUI_CD();
    this.BP_ApplyGameplayEffectToOwner(GE_HPRegenValueClass);
    this.PlayHPRegenMontage();
  }
  PlayHPRegenMontage() {
    const MontageTask = UE16.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(
      this,
      "HPRegen",
      //名称
      MA_HPRegen
      //动画
    );
    MontageTask.OnCompleted.Add(() => this.K2_EndAbility());
    MontageTask.OnInterrupted.Add(() => this.K2_EndAbility());
    MontageTask.OnBlendOut.Add(() => this.K2_EndAbility());
    MontageTask.OnCancelled.Add(() => this.K2_EndAbility());
    MontageTask.ReadyForActivation();
  }
};
GA_HPRegen = __decorateClass([
  mixin(AssetPath15)
], GA_HPRegen);

// Blueprints/Ability/_01HPRegen/GC_HPRegen.ts
var UE17 = __toESM(require("ue"));
var AssetPath16 = "/Game/BluePrints/Ability/_01HPRegen/GC_HPRegen.GC_HPRegen_C";
var HPRegenFX = UE17.ParticleSystem.Load("/Game/Assets/Abilities/HealthRegen/P_HealthRegen.P_HealthRegen");
var GC_HPRegen = class {
  WhileActive(MyTarget, Parameters) {
    if (HPRegenFX) {
      UE17.GameplayStatics.SpawnEmitterAtLocation(
        this,
        HPRegenFX,
        MyTarget.K2_GetActorLocation(),
        MyTarget.K2_GetActorRotation(),
        MyTarget.GetActorScale3D(),
        true,
        UE17.EPSCPoolMethod.AutoRelease,
        //这里原来用的是ManualRelease
        true
      );
    }
    return true;
  }
};
GC_HPRegen = __decorateClass([
  mixin(AssetPath16)
], GC_HPRegen);

// Blueprints/Ability/_02Dash/GA_Dash.ts
var UE18 = __toESM(require("ue"));
var import_ue3 = require("ue");
var AssetPath17 = "/Game/BluePrints/Ability/_02Dash/GA_Dash.GA_Dash_C";
var MA_Dash = UE18.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_Dash.MA_Dash");
var DashDamageClass = UE18.Class.Load("/Game/BluePrints/Ability/_02Dash/GE_Dash_Damage.GE_Dash_Damage_C");
var DashHitTag2 = new import_ue3.GameplayTag("Ability.Dash.HitEvent");
var GA_Dash = class extends BP_GameplayAbility {
  constructor() {
    super(...arguments);
    this.Character = new BP_BaseCharacter();
  }
  K2_ActivateAbility() {
    this.Character = this.GetAvatarActorFromActorInfo();
    this.HitCall();
    this.K2_CommitAbility();
    this.StartUI_CD();
    this.PlayDashMontage();
    console.log("\u51B2\u523A\u91CA\u653E");
    this.DashForward();
  }
  PlayDashMontage() {
    const MontageTask = UE18.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(
      this,
      "Dash",
      MA_Dash
    );
    MontageTask.OnCompleted.Add(() => this.K2_SelfEndAbility());
    MontageTask.OnInterrupted.Add(() => this.K2_SelfEndAbility());
    MontageTask.OnBlendOut.Add(() => this.K2_SelfEndAbility());
    MontageTask.OnCancelled.Add(() => this.K2_SelfEndAbility());
    MontageTask.ReadyForActivation();
  }
  /*此函数是自定义的函数，相似于下面的回调，可添加逻辑*/
  K2_SelfEndAbility() {
    this.K2_EndAbility();
    if (this.Character) {
      this.Character.SetFrictionToZero(false);
    }
  }
  /*此函数是k2_EndAbility函数的回调，执行完End后自动执行*/
  //K2_OnEndAbility(bWasCancelled: boolean) {
  // if(this.Character){
  //   this.Character.SetFrictionToZero(false);
  //}
  //}
  /*Dash函数触发，控制力度和时间*/
  DashForward() {
    if (this.Character) {
      this.Character.DashForward(
        this.Character.GetActorForwardVector(),
        2e3,
        0.66
      );
    }
  }
  //命中监听
  HitCall() {
    const GameplayEvent = UE18.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this, DashHitTag2, null, false, true);
    GameplayEvent.EventReceived.Add((...args) => this.HitEvent(...args));
    GameplayEvent.ReadyForActivation();
  }
  HitEvent(Payload) {
    this.BP_ApplyGameplayEffectToTarget(UE18.AbilitySystemBlueprintLibrary.AbilityTargetDataFromActor(Payload.Target), DashDamageClass);
    const HitCharacter = Payload.Target;
    if (HitCharacter) {
      HitCharacter.Stun(1);
      const StartLocation = HitCharacter.K2_GetActorLocation();
      const EndLocation = this.Character.K2_GetActorLocation();
      const Direction = new UE18.Vector(
        StartLocation.X - EndLocation.X,
        StartLocation.Y - EndLocation.Y,
        StartLocation.Z - EndLocation.Z
      );
      const ForwardVector = UE18.KismetMathLibrary.GetForwardVector(UE18.KismetMathLibrary.MakeRotFromX(Direction));
      HitCharacter.DashForward(
        ForwardVector,
        1700,
        0.7
      );
    }
  }
};
GA_Dash = __decorateClass([
  mixin(AssetPath17)
], GA_Dash);

// Blueprints/Ability/_03Laser/GA_Laser.ts
var UE19 = __toESM(require("ue"));
var AssetPath18 = "/Game/BluePrints/Ability/_03Laser/GA_Laser.GA_Laser_C";
var MA_Laser = UE19.AnimMontage.Load("/Game/BluePrints/Character/Animations/Montage/MA_Laser.MA_Laser");
var LaserActorClass = UE19.Class.Load("/Game/BluePrints/Ability/_03Laser/BP_LaserActor.BP_LaserActor_C");
var LaserDamageClass = UE19.Class.Load("/Game/BluePrints/Ability/_03Laser/GE_Laser_Damage.GE_Laser_Damage_C");
var LaserCostTag = new UE19.GameplayTag("Ability.Laser.Cost");
var LaserEndTag2 = new UE19.GameplayTag("Ability.Laser.LaserEnd");
var LaserDamageTag = new UE19.GameplayTag("Ability.Laser.Damage");
var GA_Laser = class extends BP_GameplayAbility {
  constructor() {
    super(...arguments);
    this._rotationIntervalID = null;
    this.LaserActor = null;
  }
  K2_ActivateAbility() {
    this.Character = this.GetAvatarActorFromActorInfo();
    if (this.Character) {
      this.Character.IsLasering = true;
      this.Character.LookCamera(true);
    } else {
      return;
    }
    this.K2_CommitAbilityCost();
    this.BindEndEvent();
    this.PlayMontage();
  }
  //播放动画
  PlayMontage() {
    const MontageTask = UE19.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(this, "Laser", MA_Laser);
    MontageTask.ReadyForActivation();
    setTimeout(() => {
      this.SpawnLaserActor();
    }, 0.3 * 1e3);
  }
  //监听回调结束事件
  BindEndEvent() {
    const GameplayEvent = UE19.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this, LaserEndTag2, null, true, true);
    GameplayEvent.EventReceived.Add((...args) => this.EndMontage(...args));
    GameplayEvent.ReadyForActivation();
    this._rotationIntervalID = setInterval(() => {
      this.CheckCost();
    }, 0.25 * 1e3);
  }
  SpawnLaserActor() {
    console.log("\u751F\u6210Actor");
    this.LaserActor = UE19.GameplayStatics.BeginDeferredActorSpawnFromClass(this, LaserActorClass, UE19.Transform.Identity);
    UE19.GameplayStatics.FinishSpawningActor(this.LaserActor, UE19.Transform.Identity);
    if (this.LaserActor) {
      this.SpawnSuccess();
    }
  }
  SpawnSuccess() {
    const GameplayEvent = UE19.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this, LaserDamageTag, null, false, true);
    GameplayEvent.EventReceived.Add((...args) => this.TriggerDamage(...args));
    GameplayEvent.ReadyForActivation();
    this.LaserActor.Instigator = this.Character;
    this.LaserActor.K2_AttachToComponent(
      this.Character.LaserPoint,
      "",
      //普通组件没有SocketName，有骨骼时才填
      UE19.EAttachmentRule.SnapToTarget,
      UE19.EAttachmentRule.SnapToTarget,
      UE19.EAttachmentRule.KeepRelative,
      false
      //是否需要物理焊接
    );
  }
  //回调触发伤害
  TriggerDamage(Payload) {
    this.BP_ApplyGameplayEffectToTarget(Payload.TargetData, LaserDamageClass);
    const HitActors = UE19.AbilitySystemBlueprintLibrary.GetActorsFromTargetData(Payload.TargetData, 0);
    if (HitActors.Num() != 0) {
      for (let i = 0; i < HitActors.Num(); i++) {
        const Actor2 = HitActors.GetRef(i);
        if (Actor2 instanceof BP_BaseCharacter && !Actor2.Dead) {
          Actor2.Stun(0.2);
          const StartLocation = Actor2.K2_GetActorLocation();
          const EndLocation = this.Character.K2_GetActorLocation();
          const Direction = new UE19.Vector(
            StartLocation.X - EndLocation.X,
            StartLocation.Y - EndLocation.Y,
            StartLocation.Z - EndLocation.Z
          );
          const ForwardVector = UE19.KismetMathLibrary.GetForwardVector(UE19.KismetMathLibrary.MakeRotFromX(Direction));
          Actor2.DashForward(
            ForwardVector,
            1e3,
            0.5
          );
        }
      }
    }
  }
  //检测是否消耗完MP
  CheckCost() {
    if (!this.IsSatisfyCost()) {
      this.EndMontage(null);
    } else {
    }
  }
  //结束动画
  EndMontage(Payload) {
    this.MontageJumpToSection("End");
    this.K2_EndAbility();
    if (this._rotationIntervalID) {
      clearInterval(this._rotationIntervalID);
      this._rotationIntervalID = null;
    }
  }
  K2_OnEndAbility(bWasCancelled) {
    this.K2_CommitAbilityCooldown();
    this.StartUI_CD();
    this.BP_RemoveGameplayEffectFromOwnerWithAssetTags(this.Character.GetAbilityTag(LaserCostTag));
    if (this.Character) {
      this.Character.IsLasering = false;
      this.Character.LookCamera(false);
    }
    if (this.LaserActor) {
      this.LaserActor.K2_DestroyActor();
    }
    if (this._rotationIntervalID) {
      clearInterval(this._rotationIntervalID);
      this._rotationIntervalID = null;
    }
  }
};
GA_Laser = __decorateClass([
  mixin(AssetPath18)
], GA_Laser);

// Blueprints/Ability/_03Laser/BP_LaserActor.ts
var UE20 = __toESM(require("ue"));
var AssetPath19 = "/Game/BluePrints/Ability/_03Laser/BP_LaserActor.BP_LaserActor_C";
var LaserDamage = new UE20.GameplayTag("Ability.Laser.Damage");
var BP_LaserActor = class {
  constructor() {
    this.GameplayEventData = null;
  }
  ReceiveBeginPlay() {
    this.HitActor.Empty();
    console.log("\u751F\u6210\u4E86\u6FC0\u5149Actor");
    this.EndPoint.OnComponentBeginOverlap.Add((...args) => this.EndPointOnBeginOverlap(...args));
    this.EndPoint.OnComponentEndOverlap.Add((...args) => this.EndPointOnEndOverlap(...args));
    UE20.KismetSystemLibrary.K2_SetTimer(this, "LaserDamage", 0.25, true);
  }
  //重叠事件
  EndPointOnBeginOverlap(OverlappedComponent, OtherActor, OtherComp, OtherBodyIndex, bFromSweep, SweepResult) {
    if (OtherActor != this.GetInstigator() && !this.HitActor.Contains(OtherActor)) {
      this.HitActor.Add(OtherActor);
    }
  }
  //离开重叠事件
  EndPointOnEndOverlap(OverlappedComponent, OtherActor, OtherComp, OtherBodyIndex) {
    if (this.HitActor.Contains(OtherActor)) {
      this.HitActor.RemoveAt(this.HitActor.FindIndex(OtherActor));
    }
  }
  LaserDamage() {
    this.GameplayEventData = null;
    if (this.HitActor.Num() != 0) {
      this.GameplayEventData = new UE20.GameplayEventData();
      this.GameplayEventData.EventTag = LaserDamage;
      this.GameplayEventData.Instigator = this.GetInstigator();
      this.GameplayEventData.TargetData = UE20.AbilitySystemBlueprintLibrary.AbilityTargetDataFromActorArray(this.HitActor, true);
      UE20.AbilitySystemBlueprintLibrary.SendGameplayEventToActor(this.Instigator, LaserDamage, this.GameplayEventData);
    }
  }
};
BP_LaserActor = __decorateClass([
  mixin(AssetPath19)
], BP_LaserActor);

// Blueprints/Ability/_04GroundBlast/GA_GroundBlast.ts
var UE21 = __toESM(require("ue"));
var AssetPath20 = "/Game/BluePrints/Ability/_04GroundBlast/GA_GroundBlast.GA_GroundBlast_C";
var MA_Select = UE21.Object.Load("/Game/BluePrints/Character/Animations/Montage/MA_Select.MA_Select");
var MA_Cast = UE21.Object.Load("/Game/BluePrints/Character/Animations/Montage/MA_Cast.MA_Cast");
var BlastDamage = UE21.Class.Load("/Game/BluePrints/Ability/_04GroundBlast/GE_GroundBlast_Damage.GE_GroundBlast_Damage_C");
var GA_GroundBlast = class extends BP_GameplayAbility {
  K2_ActivateAbility() {
    this.Character = this.GetAvatarActorFromActorInfo();
    if (this.Character) {
      this.Character.IsGroundBlaseting = true;
    }
    this.playSelectMontage();
    this.SpawnTargetData();
  }
  playSelectMontage() {
    const SelectMontageTask = UE21.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(this, "", MA_Select);
    SelectMontageTask.ReadyForActivation();
  }
  //成功释放能力
  ValidData(Data) {
    if (Data) {
      this.HitLocation = UE21.AbilitySystemBlueprintLibrary.GetTargetDataEndPoint(Data, 0);
      this.HitActors = UE21.AbilitySystemBlueprintLibrary.GetActorsFromTargetData(Data, 1);
    }
    this.playCastMontage();
    this.K2_CommitAbility();
    this.StartUI_CD();
  }
  //取消释放能力
  Cancelled(Data) {
    this.K2_EndAbility();
  }
  playCastMontage() {
    const CastMontageTask = UE21.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(this, "", MA_Cast);
    CastMontageTask.OnCompleted.Add(() => this.K2_EndAbility());
    CastMontageTask.OnBlendOut.Add(() => this.K2_EndAbility());
    CastMontageTask.OnInterrupted.Add(() => this.K2_EndAbility());
    CastMontageTask.OnCancelled.Add(() => this.K2_EndAbility());
    CastMontageTask.ReadyForActivation();
    UE21.GameplayStatics.SpawnEmitterAtLocation(
      this,
      this.BlastFX,
      this.HitLocation,
      UE21.Rotator.ZeroRotator,
      //旋转
      new UE21.Vector(0.5, 0.5, 0.5),
      //大小
      true,
      //是否自动销毁
      UE21.EPSCPoolMethod.ManualRelease,
      true
      //是否自动激活
    );
    setTimeout(() => {
      this.SkillDamage();
    }, 0.35 * 1e3);
  }
  //技能伤害
  SkillDamage() {
    if (this.HitActors.Num() != 0) {
      this.BP_ApplyGameplayEffectToTarget(UE21.AbilitySystemBlueprintLibrary.AbilityTargetDataFromActorArray(this.HitActors, true), BlastDamage);
      for (let i = 0; i < this.HitActors.Num(); i++) {
        const HitCharacter = this.HitActors.Get(i);
        if (HitCharacter) {
          HitCharacter.Stun(2);
          const StartLocation = HitCharacter.K2_GetActorLocation();
          const EndLocation = this.HitLocation;
          const Direction = new UE21.Vector(
            StartLocation.X - EndLocation.X,
            StartLocation.Y - EndLocation.Y,
            StartLocation.Z - EndLocation.Z
          );
          const ForwardVector = UE21.KismetMathLibrary.GetForwardVector(UE21.KismetMathLibrary.MakeRotFromX(Direction));
          HitCharacter.DashForward(ForwardVector, 800, 1);
        }
      }
    }
  }
  K2_OnEndAbility(bWasCancelled) {
    if (this.Character) {
      this.Character.IsGroundBlaseting = false;
    }
  }
};
GA_GroundBlast = __decorateClass([
  mixin(AssetPath20)
], GA_GroundBlast);

// Blueprints/Ability/_04GroundBlast/BP_GroundSelectTargetActor.ts
var UE22 = __toESM(require("ue"));
var AssetPath21 = "/Game/BluePrints/Ability/_04GroundBlast/BP_GroundSelectTargetActor.BP_GroundSelectTargetActor_C";
var BP_GroundSelectTargetActor = class {
  //_rotationIntervalId:ReturnType<typeof setInterval> | null = null;
  ReceiveBeginPlay() {
    this.SetDecalSize();
  }
  ReceiveTick(DeltaSeconds) {
    this.Decal.K2_SetWorldLocation(this.GetPlayerLookAtPoint(), false, null, false);
  }
  //设置贴花大小
  SetDecalSize() {
    this.Decal.DecalSize = new UE22.Vector(100, this.SelectRadius, this.SelectRadius);
  }
};
BP_GroundSelectTargetActor = __decorateClass([
  mixin(AssetPath21)
], BP_GroundSelectTargetActor);

// Blueprints/Ability/_05FireBlast/GA_FireBlast.ts
var UE23 = __toESM(require("ue"));
var import_ue4 = require("ue");
var AssetPath22 = "/Game/BluePrints/Ability/_05FireBlast/GA_FireBlast.GA_FireBlast_C";
var MA_FireBlast = UE23.Object.Load("/Game/BluePrints/Character/Animations/Montage/MA_FireBlast.MA_FireBlast");
var FireBlast_Damage = UE23.Class.Load("/Game/BluePrints/Ability/_05FireBlast/GE_FireBlast_Damage.GE_FireBlast_Damage_C");
var PullEventTag2 = new import_ue4.GameplayTag("Ability.FireBlast.PullEvent");
var PushEventTag2 = new import_ue4.GameplayTag("Ability.FireBlast.PushEvent");
var GA_FireBlast = class extends BP_GameplayAbility {
  K2_ActivateAbility() {
    this.K2_CommitAbility();
    this.StartUI_CD();
    this.BindPull();
    this.BindPush();
    this.PlayMontage();
  }
  PlayMontage() {
    const MontageTask = UE23.AbilityTask_PlayMontageAndWait.CreatePlayMontageAndWaitProxy(this, "", MA_FireBlast);
    MontageTask.OnCompleted.Add(() => this.K2_EndAbility());
    MontageTask.OnInterrupted.Add(() => this.K2_EndAbility());
    MontageTask.OnBlendOut.Add(() => this.K2_EndAbility());
    MontageTask.OnCancelled.Add(() => this.K2_EndAbility());
    MontageTask.ReadyForActivation();
  }
  BindPull() {
    const WaitEvent = UE23.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this, PullEventTag2, null, true, true);
    WaitEvent.EventReceived.Add((...args) => this.Pull(...args));
    WaitEvent.ReadyForActivation();
  }
  Pull(Payload) {
    this.SpawnTargetData();
  }
  //数据有效执行拉取
  ValidData(Data) {
    this.TargetData = Data;
    const AllActors = UE23.AbilitySystemBlueprintLibrary.GetActorsFromTargetData(Data, 0);
    const AvatarActor = this.GetAvatarActorFromActorInfo();
    this.HitActors = UE23.NewArray(UE23.Actor);
    for (let i = 0; i < AllActors.Num(); i++) {
      const HitCharacter = AllActors.Get(i);
      if (HitCharacter && HitCharacter !== AvatarActor) {
        this.HitActors.Add(HitCharacter);
        HitCharacter.Stun(2);
        const StartLocation = HitCharacter.K2_GetActorLocation();
        const EndLocation = AvatarActor.K2_GetActorLocation();
        const Direction = new UE23.Vector(
          EndLocation.X - StartLocation.X,
          EndLocation.Y - StartLocation.Y,
          EndLocation.Z - StartLocation.Z
        );
        const ForwardVector = UE23.KismetMathLibrary.GetForwardVector(UE23.KismetMathLibrary.MakeRotFromX(Direction));
        HitCharacter.DashForward(ForwardVector, 800, 0.7);
      }
    }
  }
  BindPush() {
    const WaitEvent = UE23.AbilityTask_WaitGameplayEvent.WaitGameplayEvent(this, PushEventTag2, null, true, true);
    WaitEvent.EventReceived.Add((...args) => this.Push(...args));
    WaitEvent.ReadyForActivation();
  }
  Push(Payload) {
    const TargetData = UE23.AbilitySystemBlueprintLibrary.AbilityTargetDataFromActorArray(this.HitActors, true);
    this.BP_ApplyGameplayEffectToTarget(TargetData, FireBlast_Damage);
    const AvatarActor = this.GetAvatarActorFromActorInfo();
    for (let i = 0; i < this.HitActors.Num(); i++) {
      const HitCharacter = this.HitActors.Get(i);
      if (HitCharacter) {
        HitCharacter.Stun(2);
        const StartLocation = HitCharacter.K2_GetActorLocation();
        const EndLocation = AvatarActor.K2_GetActorLocation();
        const Direction = new UE23.Vector(
          StartLocation.X - EndLocation.X,
          StartLocation.Y - EndLocation.Y,
          StartLocation.Z - EndLocation.Z
        );
        const ForwardVector = UE23.KismetMathLibrary.GetForwardVector(UE23.KismetMathLibrary.MakeRotFromX(Direction));
        HitCharacter.DashForward(ForwardVector, 1500, 0.7);
      }
    }
  }
  K2_OnEndAbility(bWasCancelled) {
  }
};
GA_FireBlast = __decorateClass([
  mixin(AssetPath22)
], GA_FireBlast);

// Blueprints/Ability/_05FireBlast/GCN_Burming.ts
var UE24 = __toESM(require("ue"));
var AssetPath23 = "/Game/BluePrints/Ability/_05FireBlast/GCN_Burming.GCN_Burming_C";
var GCN_Burming = class {
  //添加粒子系统
  OnApplication(Target, Parameters, SpawnResults) {
    console.log("\u6DFB\u52A0\u7C92\u5B50\u7CFB\u7EDF");
    if (Target) {
      this.FireEmittCom = UE24.GameplayStatics.SpawnEmitterAttached(
        this.BurmingFX,
        Target.RootComponent,
        "",
        new UE24.Vector(0, 0, -65),
        UE24.Rotator.ZeroRotator,
        new UE24.Vector(0.4, 0.4, 0.4),
        UE24.EAttachLocation.KeepRelativeOffset,
        false,
        UE24.EPSCPoolMethod.ManualRelease,
        true
      );
    }
  }
  // 移除
  OnRemoval(Target, Parameters, SpawnResults) {
    if (this.FireEmittCom) {
      this.FireEmittCom.ReleaseToPool();
      this.K2_EndGameplayCue();
    }
  }
};
GCN_Burming = __decorateClass([
  mixin(AssetPath23)
], GCN_Burming);

// Blueprints/Ability/_05FireBlast/BP_RemoveBurming.ts
var UE25 = __toESM(require("ue"));
var AssetPath24 = "/Game/BluePrints/Ability/_05FireBlast/BP_RemoveBurming.BP_RemoveBurming_C";
var BurmingTag = new UE25.GameplayTag("Ability.FireBlast.BurmingDamage");
var BP_RemoveBurming = class {
  ReceiveBeginPlay() {
    this.Box.OnComponentBeginOverlap.Add((...args) => this.BoxBeginOverlap(...args));
  }
  BoxBeginOverlap(OverlappedComponent, OtherActor, OtherComp, OtherBodyIndex, bFromSweep, SweepResult) {
    console.log("BoxBeginOverlap");
    if (UE25.AbilitySystemBlueprintLibrary.GetAbilitySystemComponent(OtherActor).HasMatchingGameplayTag(BurmingTag)) {
      UE25.AbilitySystemBlueprintLibrary.GetAbilitySystemComponent(OtherActor).RemoveActiveEffectsWithTags(
        UE25.BlueprintGameplayTagLibrary.MakeGameplayTagContainerFromTag(BurmingTag)
      );
    }
  }
};
BP_RemoveBurming = __decorateClass([
  mixin(AssetPath24)
], BP_RemoveBurming);

// Blueprints/Character/Enemy/AI/BTS_CheckDead.ts
var UE26 = __toESM(require("ue"));
var AssetPath25 = "/Game/BluePrints/Character/Enemy/AI/BTS_CheckDead.BTS_CheckDead_C";
var BTS_CheckDead = class {
  ReceiveActivationAI(OwnerController, ControlledPawn) {
    this.Character = ControlledPawn;
  }
  ReceiveSearchStartAI(OwnerController, ControlledPawn) {
    if (this.Character) {
      UE26.BTFunctionLibrary.SetBlackboardValueAsBool(this, this.Dead, this.Character.Dead);
    }
  }
};
BTS_CheckDead = __decorateClass([
  mixin(AssetPath25)
], BTS_CheckDead);

// Blueprints/Character/Enemy/AI/BTS_CheckBurming.ts
var UE27 = __toESM(require("ue"));
var AssetPath26 = "/Game/BluePrints/Character/Enemy/AI/BTS_CheckBurming.BTS_CheckBurming_C";
var BurmingTag2 = new UE27.GameplayTag("Ability.FireBlast.BurmingDamage");
var BTS_CheckBurming = class {
  ReceiveSearchStartAI(OwnerController, ControlledPawn) {
    if (UE27.AbilitySystemBlueprintLibrary.GetAbilitySystemComponent(ControlledPawn).HasMatchingGameplayTag(BurmingTag2)) {
      UE27.BTFunctionLibrary.SetBlackboardValueAsBool(this, this.Burming, true);
    } else {
      UE27.BTFunctionLibrary.SetBlackboardValueAsBool(this, this.Burming, false);
    }
  }
};
BTS_CheckBurming = __decorateClass([
  mixin(AssetPath26)
], BTS_CheckBurming);

// Blueprints/Character/Enemy/AI/BTT_FindRemoveBurming.ts
var UE28 = __toESM(require("ue"));
var AssetPath27 = "/Game/BluePrints/Character/Enemy/AI/BTT_FindRemoveBurming.BTT_FindRemoveBurming_C";
var RemoveBuffClass = UE28.Class.Load("/Game/BluePrints/Ability/_05FireBlast/BP_RemoveBurming.BP_RemoveBurming_C");
var BTT_FindRemoveBurming = class {
  ReceiveExecuteAI(OwnerController, ControlledPawn) {
    const BurmingActor = UE28.GameplayStatics.GetActorOfClass(this, RemoveBuffClass);
    if (BurmingActor) {
      UE28.BTFunctionLibrary.SetBlackboardValueAsVector(this, this.Location, BurmingActor.K2_GetActorLocation());
      this.FinishExecute(true);
    } else {
      this.FinishExecute(false);
    }
  }
};
BTT_FindRemoveBurming = __decorateClass([
  mixin(AssetPath27)
], BTT_FindRemoveBurming);

// Gen/GameplayTags.gen.ts
var UE29 = __toESM(require("ue"));
function _createTag(name) {
  const tag = new UE29.GameplayTag();
  tag.TagName = name;
  return tag;
}
var TagsfromPlugin = {
  /** Tag: Ability.BaseResponse */
  Ability_BaseResponse: _createTag("Ability.BaseResponse"),
  /** Tag: Ability.Dash */
  Ability_Dash: _createTag("Ability.Dash"),
  /** Tag: Ability.Dash.Active */
  Ability_Dash_Active: _createTag("Ability.Dash.Active"),
  /** Tag: Ability.Dash.HitEvent */
  Ability_Dash_HitEvent: _createTag("Ability.Dash.HitEvent"),
  /** Tag: Ability.FireBlast */
  Ability_FireBlast: _createTag("Ability.FireBlast"),
  /** Tag: Ability.FireBlast.BurmingDamage */
  Ability_FireBlast_BurmingDamage: _createTag("Ability.FireBlast.BurmingDamage"),
  /** Tag: Ability.FireBlast.PullDamage */
  Ability_FireBlast_PullDamage: _createTag("Ability.FireBlast.PullDamage"),
  /** Tag: Ability.FireBlast.PullEvent */
  Ability_FireBlast_PullEvent: _createTag("Ability.FireBlast.PullEvent"),
  /** Tag: Ability.FireBlast.PushDamage */
  Ability_FireBlast_PushDamage: _createTag("Ability.FireBlast.PushDamage"),
  /** Tag: Ability.FireBlast.PushEvent */
  Ability_FireBlast_PushEvent: _createTag("Ability.FireBlast.PushEvent"),
  /** Tag: Ability.GroundBlast */
  Ability_GroundBlast: _createTag("Ability.GroundBlast"),
  /** Tag: Ability.HPRegen */
  Ability_HPRegen: _createTag("Ability.HPRegen"),
  /** Tag: Ability.Laser */
  Ability_Laser: _createTag("Ability.Laser"),
  /** Tag: Ability.Laser.Cost */
  Ability_Laser_Cost: _createTag("Ability.Laser.Cost"),
  /** Tag: Ability.Laser.Damage */
  Ability_Laser_Damage: _createTag("Ability.Laser.Damage"),
  /** Tag: Ability.Laser.LaserEnd */
  Ability_Laser_LaserEnd: _createTag("Ability.Laser.LaserEnd"),
  /** Tag: Ability.Melee */
  Ability_Melee: _createTag("Ability.Melee"),
  /** Tag: Ability.Melee.HitEvent */
  Ability_Melee_HitEvent: _createTag("Ability.Melee.HitEvent"),
  /** Tag: GameplayCue */
  GameplayCue: _createTag("GameplayCue"),
  /** Tag: GameplayCue.Burming */
  GameplayCue_Burming: _createTag("GameplayCue.Burming"),
  /** Tag: GameplayCue.HPRegen */
  GameplayCue_HPRegen: _createTag("GameplayCue.HPRegen"),
  /** Tag: InputUserSettings.FailureReasons.InvalidMappingName */
  InputUserSettings_FailureReasons_InvalidMappingName: _createTag("InputUserSettings.FailureReasons.InvalidMappingName"),
  /** Tag: InputUserSettings.FailureReasons.NoKeyProfile */
  InputUserSettings_FailureReasons_NoKeyProfile: _createTag("InputUserSettings.FailureReasons.NoKeyProfile"),
  /** Tag: InputUserSettings.FailureReasons.NoMappingRowFound */
  InputUserSettings_FailureReasons_NoMappingRowFound: _createTag("InputUserSettings.FailureReasons.NoMappingRowFound"),
  /** Tag: InputUserSettings.FailureReasons.NoMatchingMappings */
  InputUserSettings_FailureReasons_NoMatchingMappings: _createTag("InputUserSettings.FailureReasons.NoMatchingMappings"),
  /** Tag: InputUserSettings.Profiles.Default */
  InputUserSettings_Profiles_Default: _createTag("InputUserSettings.Profiles.Default"),
  /** Tag: Tests.Cest.1 */
  Tests_Cest_1: _createTag("Tests.Cest.1"),
  /** Tag: Tests.Cest.2 */
  Tests_Cest_2: _createTag("Tests.Cest.2"),
  /** Tag: Tests.Cest.3 */
  Tests_Cest_3: _createTag("Tests.Cest.3"),
  /** Tag: Tests.GenericTag */
  Tests_GenericTag: _createTag("Tests.GenericTag")
};
globalThis.TagsfromPlugin = TagsfromPlugin;

// MainGame.ts
console.log("Hello, TypeScript!");
UE30.KismetSystemLibrary.PrintString(
  //打印在屏幕上
  null,
  `\u542F\u52A8\uFF01\uFF01`,
  true,
  true,
  UE30.LinearColor.Green,
  0.1
);
var GameInstance = import_puerts4.argv.getByName("GameInstance");
GameInstance.FCall.Bind((FunctionName, Uobject) => {
  Uobject[FunctionName]();
});
//# sourceMappingURL=bundle.js.map
