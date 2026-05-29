/// <reference path="puerts.d.ts" />
declare module "ue" {
    import {$Ref, $Nullable} from "puerts"

    import * as cpp from "cpp"

    import * as UE from "ue"

// __TYPE_DECL_START: BE5459D6452CAC0796B5629281D53DC9
    namespace Game.BluePrints.Main.BP_GAS_GameInstance {
        class BP_GAS_GameInstance_C extends UE.GAS_GameInstance {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_GAS_GameInstance_C;
            static Load(InName: string): BP_GAS_GameInstance_C;
        
            __tid_BP_GAS_GameInstance_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 34B105414117D7F5DF9F1B9534DCA89C
    namespace Game.StarterContent.Blueprints.BP_LightStudio {
        class BP_LightStudio_C extends UE.Actor {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            SkyLight1: UE.SkyLightComponent;
            ExponentialHeightFog1: UE.ExponentialHeightFogComponent;
            PrevisArrow: UE.StaticMeshComponent;
            Skybox: UE.StaticMeshComponent;
            Scene1: UE.SceneComponent;
            GlobalBrightness: number;
            Use_HDRI: boolean;
            UseSunLight: boolean;
            SunBrightness: number;
            SunTint: UE.LinearColor;
            StationaryLightForSun: boolean;
            SunDirectionalLight: UE.DirectionalLightComponent;
            UseAtmosphere: boolean;
            AtmosphereBrightness: number;
            AtmosphereTint: UE.LinearColor;
            PrevisArrowMaterial: UE.MaterialInstanceDynamic;
            LightColor: UE.LinearColor;
            SunColorCurve: UE.CurveLinearColor;
            OverrideSunColor: boolean;
            AtmosphereDensityMultiplier: number;
            AtmosphereAltitude: number;
            DisableSunDisk: boolean;
            UseFog: boolean;
            FogBrightness: number;
            FogTint: UE.LinearColor;
            FogAltitude: number;
            FogMaxOpacity: number;
            FogHeightFalloff: number;
            FogDensity: number;
            FogBrightnessCurve: UE.CurveFloat;
            FogStartDistance: number;
            DisableGroundScattering: boolean;
            AtmosphereDistanceScale: number;
            SkyboxMaterial: UE.MaterialInstanceDynamic;
            HDRI_Brightness: number;
            HDRI_Contrast: number;
            HDRI_Tint: UE.LinearColor;
            HDRI_Cubemap: UE.Texture;
            HDRI_Rotation: number;
            AtmosphereOpacityHorizon: number;
            AtmosphereOpacityZenith: number;
            HighDensityAtmosphere: boolean;
            AtmosphericFog: UE.AtmosphericFogComponent;
            UseSkylight: boolean;
            Shadowdistance: number;
            LightShaftBloom: boolean;
            LightShaftOcclusion: boolean;
            OcclusionMaskDarkness: number;
            BloomScale: number;
            BloomThreshold: number;
            BloomTint: UE.Color;
            AtmosphereFogMultiplier: number;
            AtmosphereDensityHeight: number;
            AtmosphereMaxScatteringOrder: number;
            AtmosphereAltitudeSampleNumber: number;
            LightFunctionMaterial: UE.MaterialInterface;
            MIC_Black: UE.MaterialInstance;
            MIC_HDRI: UE.MaterialInstance;
            AtmosphereDensity() : void;
            CalculateSunColor() : void;
            NormalizedSunAngle(Angle: $Ref<number>) : void;
            SunMobility() : void;
            /*
             *Construction script, the place to spawn components and do other setup.
             *@note Name used in CreateBlueprint function
             */
            UserConstructionScript() : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_LightStudio_C;
            static Load(InName: string): BP_LightStudio_C;
        
            __tid_BP_LightStudio_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 6A1AE04E46BB2DCE8E8DA5B318ECB60F
    namespace Game.StarterContent.Blueprints.Blueprint_WallSconce {
        class Blueprint_WallSconce_C extends UE.Actor {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            SM_Lamp_Wall: UE.StaticMeshComponent;
            PointLight2: UE.SpotLightComponent;
            Scene1: UE.SceneComponent;
            Brightness: number;
            Color: UE.LinearColor;
            ["Inner Cone Angle"]: number;
            ["Outer Cone Angle"]: number;
            /*
             *Construction script, the place to spawn components and do other setup.
             *@note Name used in CreateBlueprint function
             */
            UserConstructionScript() : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): Blueprint_WallSconce_C;
            static Load(InName: string): Blueprint_WallSconce_C;
        
            __tid_Blueprint_WallSconce_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 62110038444C84D1EC760AB254B78A07
    namespace Game.StarterContent.Blueprints.Blueprint_Effect_Steam {
        class Blueprint_Effect_Steam_C extends UE.Actor {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            ["Steam AUdio"]: UE.AudioComponent;
            P_Steam_Lit: UE.ParticleSystemComponent;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): Blueprint_Effect_Steam_C;
            static Load(InName: string): Blueprint_Effect_Steam_C;
        
            __tid_Blueprint_Effect_Steam_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 0D94FA604928B24E62003083BA722E3C
    namespace Game.StarterContent.Blueprints.Blueprint_Effect_Sparks {
        class Blueprint_Effect_Sparks_C extends UE.Actor {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            ["Sparks Audio"]: UE.AudioComponent;
            Sparks: UE.ParticleSystemComponent;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): Blueprint_Effect_Sparks_C;
            static Load(InName: string): Blueprint_Effect_Sparks_C;
        
            __tid_Blueprint_Effect_Sparks_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 2678356F40E4E16306BDD687933AE2D1
    namespace Game.StarterContent.Blueprints.Blueprint_Effect_Smoke {
        class Blueprint_Effect_Smoke_C extends UE.Actor {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            ["Smoke Audio"]: UE.AudioComponent;
            P_Smoke: UE.ParticleSystemComponent;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): Blueprint_Effect_Smoke_C;
            static Load(InName: string): Blueprint_Effect_Smoke_C;
        
            __tid_Blueprint_Effect_Smoke_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: A0AD22D447F99B83A9A31C9B9426B5C0
    namespace Game.StarterContent.Blueprints.Blueprint_Effect_Fire {
        class Blueprint_Effect_Fire_C extends UE.Actor {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            ["Fire Audio"]: UE.AudioComponent;
            P_Fire: UE.ParticleSystemComponent;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): Blueprint_Effect_Fire_C;
            static Load(InName: string): Blueprint_Effect_Fire_C;
        
            __tid_Blueprint_Effect_Fire_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 862A26E84A42F13FB193AC87521ABCE8
    namespace Game.StarterContent.Blueprints.Blueprint_Effect_Explosion {
        class Blueprint_Effect_Explosion_C extends UE.Actor {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            ["Explosion Audio"]: UE.AudioComponent;
            P_Explosion: UE.ParticleSystemComponent;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): Blueprint_Effect_Explosion_C;
            static Load(InName: string): Blueprint_Effect_Explosion_C;
        
            __tid_Blueprint_Effect_Explosion_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 3ED9339D48F77B941FED039C0731A0BB
    namespace Game.StarterContent.Blueprints.Blueprint_CeilingLight {
        class Blueprint_CeilingLight_C extends UE.Actor {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            SM_Lamp_Ceiling: UE.StaticMeshComponent;
            PointLight1: UE.PointLightComponent;
            Scene1: UE.SceneComponent;
            Brightness: number;
            Color: UE.LinearColor;
            ["Source Radius"]: number;
            /*
             *Construction script, the place to spawn components and do other setup.
             *@note Name used in CreateBlueprint function
             */
            UserConstructionScript() : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): Blueprint_CeilingLight_C;
            static Load(InName: string): Blueprint_CeilingLight_C;
        
            __tid_Blueprint_CeilingLight_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: FEF8D1DD49D0DDF5893C9287111D817D
    namespace Game.BluePrints.Test.BP_Test {
        class BP_Test_C extends UE.Actor {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            UberGraphFrame: UE.PointerToUberGraphFrame;
            Sphere: UE.StaticMeshComponent;
            Scene: UE.SceneComponent;
            DefaultSceneRoot: UE.SceneComponent;
            ExecuteUbergraph_BP_Test(EntryPoint: number) : void;
            Fun1() : void;
            Fun2() : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_Test_C;
            static Load(InName: string): BP_Test_C;
        
            __tid_BP_Test_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 11C52C924F148A694071FD909E9616B4
    namespace Game.BluePrints.Character.BP_BaseCharacter {
        class BP_BaseCharacter_C extends UE.BaseCharacter {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            UberGraphFrame: UE.PointerToUberGraphFrame;
            ExecuteUbergraph_BP_BaseCharacter(EntryPoint: number) : void;
            /*
             *Event when play begins for this actor.
             */
            ReceiveBeginPlay() : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_BaseCharacter_C;
            static Load(InName: string): BP_BaseCharacter_C;
        
            __tid_BP_BaseCharacter_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 5C7852034D61A0B8C56A18ADC30A19CC
    namespace Game.BluePrints.Character.Player.BP_Player {
        class BP_Player_C extends UE.Game.BluePrints.Character.BP_BaseCharacter.BP_BaseCharacter_C {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            UberGraphFrame: UE.PointerToUberGraphFrame;
            Camera: UE.CameraComponent;
            SpringArm: UE.SpringArmComponent;
            LookCameraLine_Time_E2604BD340D43B16DB00B9849B380DCE: number;
            LookCameraLine__Direction_E2604BD340D43B16DB00B9849B380DCE: UE.ETimelineDirection;
            LookCameraLine: UE.TimelineComponent;
            BP_PlayerController: UE.Game.BluePrints.Character.Player.BP_PlayerController.BP_PlayerController_C;
            ExecuteUbergraph_BP_Player(EntryPoint: number) : void;
            InpActEvt_IA_Jump_K2Node_EnhancedInputActionEvent_2(ActionValue: UE.InputActionValue, ElapsedTime: number, TriggeredTime: number, SourceAction: $Nullable<UE.InputAction>) : void;
            InpActEvt_IA_Look_K2Node_EnhancedInputActionEvent_1(ActionValue: UE.InputActionValue, ElapsedTime: number, TriggeredTime: number, SourceAction: $Nullable<UE.InputAction>) : void;
            InpActEvt_IA_Move_K2Node_EnhancedInputActionEvent_0(ActionValue: UE.InputActionValue, ElapsedTime: number, TriggeredTime: number, SourceAction: $Nullable<UE.InputAction>) : void;
            InpActEvt_One_K2Node_InputKeyEvent_0(Key: UE.Key) : void;
            /*
             *来回看
             */
            Look(ActionValue: UE.Vector2D) : void;
            LookCamera(OpenLook: boolean) : void;
            LookCameraLine__FinishedFunc() : void;
            LookCameraLine__UpdateFunc() : void;
            /*
             *移动
             */
            Move(ActionValue: UE.Vector2D) : void;
            /*
             *Event when play begins for this actor.
             */
            ReceiveBeginPlay() : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_Player_C;
            static Load(InName: string): BP_Player_C;
        
            __tid_BP_Player_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 1FE9864E492231AD512B8C803925ED52
    namespace Game.BluePrints.Character.Enemy.BP_Enemy {
        class BP_Enemy_C extends UE.Game.BluePrints.Character.BP_BaseCharacter.BP_BaseCharacter_C {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_Enemy_C;
            static Load(InName: string): BP_Enemy_C;
        
            __tid_BP_Enemy_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 36AB8BA24C466BDD1445B69BB887D089
    namespace Game.ParagonShinbi.Characters.Heroes.Shinbi.Shinbi_AnimBlueprint {
        class AnimBlueprintGeneratedMutableData extends UE.AnimBlueprintMutableData {
            constructor();
            constructor(__FloatProperty: number, __BoolProperty_0: boolean, __FloatProperty_1: number, __FloatProperty_2: number);
            __FloatProperty: number;
            __BoolProperty_0: boolean;
            __FloatProperty_1: number;
            __FloatProperty_2: number;
            /**
             * @deprecated use StaticStruct instead.
             */
            static StaticClass(): ScriptStruct;
            static StaticStruct(): ScriptStruct;
            __tid_AnimBlueprintGeneratedMutableData_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 36AB8BA24C466BDD1445B69BB887D089
    namespace Game.ParagonShinbi.Characters.Heroes.Shinbi.Shinbi_AnimBlueprint {
        class Shinbi_AnimBlueprint_C extends UE.AnimInstance {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            UberGraphFrame: UE.PointerToUberGraphFrame;
            __AnimBlueprintMutables: UE.Game.ParagonShinbi.Characters.Heroes.Shinbi.Shinbi_AnimBlueprint.AnimBlueprintGeneratedMutableData;
            AnimBlueprintExtension_PropertyAccess: UE.AnimSubsystemInstance;
            AnimBlueprintExtension_Base: UE.AnimSubsystemInstance;
            AnimGraphNode_Root: UE.AnimNode_Root;
            AnimGraphNode_TransitionResult_10: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_9: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_8: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_7: UE.AnimNode_TransitionResult;
            AnimGraphNode_SequencePlayer_6: UE.AnimNode_SequencePlayer;
            AnimGraphNode_UseCachedPose_6: UE.AnimNode_UseCachedPose;
            AnimGraphNode_ApplyAdditive: UE.AnimNode_ApplyAdditive;
            AnimGraphNode_StateResult_9: UE.AnimNode_StateResult;
            AnimGraphNode_TransitionResult_6: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_5: UE.AnimNode_TransitionResult;
            AnimGraphNode_SequencePlayer_5: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_8: UE.AnimNode_StateResult;
            AnimGraphNode_SequencePlayer_4: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_7: UE.AnimNode_StateResult;
            AnimGraphNode_SequencePlayer_3: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_6: UE.AnimNode_StateResult;
            AnimGraphNode_StateMachine_2: UE.AnimNode_StateMachine;
            AnimGraphNode_StateResult_5: UE.AnimNode_StateResult;
            AnimGraphNode_UseCachedPose_5: UE.AnimNode_UseCachedPose;
            AnimGraphNode_StateResult_4: UE.AnimNode_StateResult;
            AnimGraphNode_StateMachine_1: UE.AnimNode_StateMachine;
            AnimGraphNode_Slot: UE.AnimNode_Slot;
            AnimGraphNode_SaveCachedPose_3: UE.AnimNode_SaveCachedPose;
            AnimGraphNode_UseCachedPose_4: UE.AnimNode_UseCachedPose;
            AnimGraphNode_TransitionResult_4: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_3: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_2: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult_1: UE.AnimNode_TransitionResult;
            AnimGraphNode_TransitionResult: UE.AnimNode_TransitionResult;
            AnimGraphNode_SequencePlayer_2: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_3: UE.AnimNode_StateResult;
            AnimGraphNode_SequencePlayer_1: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult_2: UE.AnimNode_StateResult;
            AnimGraphNode_BlendSpacePlayer: UE.AnimNode_BlendSpacePlayer;
            AnimGraphNode_StateResult_1: UE.AnimNode_StateResult;
            AnimGraphNode_SequencePlayer: UE.AnimNode_SequencePlayer;
            AnimGraphNode_StateResult: UE.AnimNode_StateResult;
            AnimGraphNode_StateMachine: UE.AnimNode_StateMachine;
            AnimGraphNode_SaveCachedPose_2: UE.AnimNode_SaveCachedPose;
            AnimGraphNode_SaveCachedPose_1: UE.AnimNode_SaveCachedPose;
            AnimGraphNode_LayeredBoneBlend: UE.AnimNode_LayeredBoneBlend;
            AnimGraphNode_UseCachedPose_3: UE.AnimNode_UseCachedPose;
            AnimGraphNode_UseCachedPose_2: UE.AnimNode_UseCachedPose;
            AnimGraphNode_BlendListByBool: UE.AnimNode_BlendListByBool;
            AnimGraphNode_UseCachedPose_1: UE.AnimNode_UseCachedPose;
            AnimGraphNode_SaveCachedPose: UE.AnimNode_SaveCachedPose;
            AnimGraphNode_LocalToComponentSpace: UE.AnimNode_ConvertLocalToComponentSpace;
            AnimGraphNode_LegIK: UE.AnimNode_LegIK;
            AnimGraphNode_ComponentToLocalSpace: UE.AnimNode_ConvertComponentToLocalSpace;
            AnimGraphNode_RotationOffsetBlendSpace: UE.AnimNode_RotationOffsetBlendSpace;
            AnimGraphNode_UseCachedPose: UE.AnimNode_UseCachedPose;
            Speed: number;
            IsInAir: boolean;
            Pitch: number;
            Roll: number;
            Yaw: number;
            RotationLastTick: UE.Rotator;
            YawDelta: number;
            IsAccelerating: boolean;
            Character: UE.Object;
            isAttacking: boolean;
            CurrentAttack: number;
            FullBody: boolean;
            AnimGraph(AnimGraph: $Ref<UE.PoseLink>) : void;
            AnimNotify_ResetCombo() : void;
            AnimNotify_SaveAttack() : void;
            Attacking_Event_0() : void;
            /*
             *Executed when begin play is called on the owning component
             */
            BlueprintBeginPlay() : void;
            /*
             *Executed when the Animation is initialized
             */
            BlueprintInitializeAnimation() : void;
            /*
             *Executed when the Animation is updated
             */
            BlueprintUpdateAnimation(DeltaTimeX: number) : void;
            EvaluateGraphExposedInputs_ExecuteUbergraph_Shinbi_AnimBlueprint_AnimGraphNode_BlendListByBool_AADA097749B3F5C14440468E0CAC7DB5() : void;
            EvaluateGraphExposedInputs_ExecuteUbergraph_Shinbi_AnimBlueprint_AnimGraphNode_BlendSpacePlayer_2FB5B9014818369DCF7914A3B0192D60() : void;
            EvaluateGraphExposedInputs_ExecuteUbergraph_Shinbi_AnimBlueprint_AnimGraphNode_TransitionResult_11349F5F446BFB5AD96066BC3B5996E4() : void;
            ExecuteUbergraph_Shinbi_AnimBlueprint(EntryPoint: number) : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): Shinbi_AnimBlueprint_C;
            static Load(InName: string): Shinbi_AnimBlueprint_C;
        
            __tid_Shinbi_AnimBlueprint_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 36AB8BA24C466BDD1445B69BB887D089
    namespace Game.ParagonShinbi.Characters.Heroes.Shinbi.Shinbi_AnimBlueprint {
        class AnimBlueprintGeneratedConstantData extends UE.AnimBlueprintConstantData {
            constructor();
            constructor(__NameProperty_285: string, __FloatProperty_286: number, __NameProperty_287: string, __FloatProperty_288: number, __NameProperty_289: string, __NameProperty_290: string, __NameProperty_291: string, __NameProperty_292: string, __NameProperty_293: string, __FloatProperty_294: number, __NameProperty_295: string, __IntProperty_296: number, __FloatProperty_297: number, __NameProperty_298: string, __IntProperty_299: number, __EnumProperty_300: UE.EAnimSyncMethod, __NameProperty_301: string, __NameProperty_302: string, __IntProperty_303: number, __StructProperty_304: UE.InputScaleBiasClampConstants, __NameProperty_305: string, __IntProperty_306: number, __BlendProfile_307: UE.BlendProfile, __CurveFloat_308: UE.CurveFloat, __EnumProperty_309: UE.EAlphaBlendOption, __EnumProperty_310: UE.EBlendListTransitionType, __ArrayProperty_311: TArray<number>, __FloatProperty_312: number, __BoolProperty_313: boolean, __FloatProperty_314: number, __BoolProperty_315: boolean, __EnumProperty_316: UE.EAnimSyncMethod, __ByteProperty_317: UE.EAnimGroupRole, __NameProperty_318: string, __StructProperty_319: UE.AnimNodeFunctionRef, AnimBlueprintExtension_PropertyAccess: UE.AnimSubsystem_PropertyAccess, AnimBlueprintExtension_Base: UE.AnimSubsystem_Base);
            __NameProperty_285: string;
            __FloatProperty_286: number;
            __NameProperty_287: string;
            __FloatProperty_288: number;
            __NameProperty_289: string;
            __NameProperty_290: string;
            __NameProperty_291: string;
            __NameProperty_292: string;
            __NameProperty_293: string;
            __FloatProperty_294: number;
            __NameProperty_295: string;
            __IntProperty_296: number;
            __FloatProperty_297: number;
            __NameProperty_298: string;
            __IntProperty_299: number;
            __EnumProperty_300: UE.EAnimSyncMethod;
            __NameProperty_301: string;
            __NameProperty_302: string;
            __IntProperty_303: number;
            __StructProperty_304: UE.InputScaleBiasClampConstants;
            __NameProperty_305: string;
            __IntProperty_306: number;
            __BlendProfile_307: UE.BlendProfile;
            __CurveFloat_308: UE.CurveFloat;
            __EnumProperty_309: UE.EAlphaBlendOption;
            __EnumProperty_310: UE.EBlendListTransitionType;
            __ArrayProperty_311: TArray<number>;
            __FloatProperty_312: number;
            __BoolProperty_313: boolean;
            __FloatProperty_314: number;
            __BoolProperty_315: boolean;
            __EnumProperty_316: UE.EAnimSyncMethod;
            __ByteProperty_317: UE.EAnimGroupRole;
            __NameProperty_318: string;
            __StructProperty_319: UE.AnimNodeFunctionRef;
            AnimBlueprintExtension_PropertyAccess: UE.AnimSubsystem_PropertyAccess;
            AnimBlueprintExtension_Base: UE.AnimSubsystem_Base;
            /**
             * @deprecated use StaticStruct instead.
             */
            static StaticClass(): ScriptStruct;
            static StaticStruct(): ScriptStruct;
            __tid_AnimBlueprintGeneratedConstantData_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 8C706BE34291519400CFCEA638577998
    namespace Game.ParagonShinbi.Characters.Heroes.Shinbi.ShinbiPlayerCharacter {
        class ShinbiPlayerCharacter_C extends UE.Character {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            UberGraphFrame: UE.PointerToUberGraphFrame;
            FollowCamera: UE.CameraComponent;
            CameraBoom: UE.SpringArmComponent;
            BaseTurnRate: number;
            BaseLookUpRate: number;
            Attacking: $MulticastDelegate<() => void>;
            SaveAttack: boolean;
            IsAttacking: boolean;
            AttackCount: number;
            Attacking__DelegateSignature() : void;
            ComboAttackSave() : void;
            ExecuteUbergraph_ShinbiPlayerCharacter(EntryPoint: number) : void;
            InpActEvt_Gamepad_FaceButton_Left_K2Node_InputKeyEvent_0(Key: UE.Key) : void;
            InpActEvt_LeftMouseButton_K2Node_InputKeyEvent_1(Key: UE.Key) : void;
            InpTchEvt_Pressed(FingerIndex: UE.ETouchIndex, Location: UE.Vector) : void;
            InpTchEvt_Released(FingerIndex: UE.ETouchIndex, Location: UE.Vector) : void;
            ResetCombo() : void;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): ShinbiPlayerCharacter_C;
            static Load(InName: string): ShinbiPlayerCharacter_C;
        
            __tid_ShinbiPlayerCharacter_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: 1F62C9E4484C2817195C7A8DAAA72F55
    namespace Game.BluePrints.Main.BP_GameMode {
        class BP_GameMode_C extends UE.GameModeBase {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            DefaultSceneRoot: UE.SceneComponent;
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_GameMode_C;
            static Load(InName: string): BP_GameMode_C;
        
            __tid_BP_GameMode_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
// __TYPE_DECL_START: D05A7C1C40D1F2DD25726494CCDFA9FD
    namespace Game.BluePrints.Character.Player.BP_PlayerController {
        class BP_PlayerController_C extends UE.PlayerController {
            constructor(Outer?: Object, Name?: string, ObjectFlags?: number);
            static StaticClass(): Class;
            static Find(OrigInName: string, Outer?: Object): BP_PlayerController_C;
            static Load(InName: string): BP_PlayerController_C;
        
            __tid_BP_PlayerController_C_0__: boolean;
        }
        
    }

// __TYPE_DECL_END
}
