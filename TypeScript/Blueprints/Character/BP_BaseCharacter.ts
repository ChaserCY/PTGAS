import * as UE from "ue";

import mixin from "../../mixin";
import {$Nullable} from "puerts";

const AssetPath = "/Game/BluePrints/Character/BP_BaseCharacter.BP_BaseCharacter_C";

//导入被动回复的GA蓝图文件
const GA_BaseResponseClass = UE.Class.Load("/Game/BluePrints/Ability/BaseAbility/GA_BaseResponse.GA_BaseResponse_C");

//导入普通攻击的GA蓝图文件
const GA_MeleeClass = UE.Class.Load("/Game/BluePrints/Ability/_00Melee/GA_Melee.GA_Melee_C");

//命中标签
const MeleeHitTag = new UE.GameplayTag("Ability.Melee.HitEvent");


export interface BP_BaseCharacter extends UE.Game.BluePrints.Character.BP_BaseCharacter.BP_BaseCharacter_C{
}

@mixin(AssetPath)
export class BP_BaseCharacter implements BP_BaseCharacter {
    
    ReceiveBeginPlay(){
        this.InitAbility();
        this.InitBind();
    }
    
    //初始化技能
    InitAbility(){
        if(GA_BaseResponseClass){
            this.AbilitySystemComponent.K2_GiveAbilityAndActivateOnce(GA_BaseResponseClass);
            //调用蓝图对象的ASC组件的"GiveAbilityAndActivateOnce"节点
        }
        //GAS 提供的蓝图节点方法
        //     - 给予该角色这个能力(Gameplay类)
        //     - 立即激活一次该能力（执行 ActivateAbility 逻辑）
        //     - 执行完后移除这个能力（不会保留在能力列表里）
        //   - 用途：适用于一次性效果，比如受击反馈、出生特效、被动触发等
        
        if(GA_MeleeClass){
            this.AbilitySystemComponent.K2_GiveAbility(GA_MeleeClass);
        }
        
    }
    
    //激活技能
    ActivateAbility(AbilityTay:UE.GameplayTag){
        this.AbilitySystemComponent.TryActivateAbilitiesByTag(this.GetAbilityTag(AbilityTay));
        
    }
    
    //获取技能标签
    GetAbilityTag(AbilityTay:UE.GameplayTag):UE.GameplayTagContainer{
        return UE.BlueprintGameplayTagLibrary.MakeGameplayTagContainerFromTag(AbilityTay as UE.GameplayTag);
    }
    
    
    
    InitBind(){
        this.HPChanged.Add((...args)=> this.HPChangedEvent(...args));
        //- this.HPChanged：一个 多播委托（Multicast Delegate），当 HP 变化时触发
        //   - .Add(...)：向这个委托注册一个监听函数
        //   - (...args) => this.HPChangedEvent(...args)：箭头函数，将所有参数透传给 HPChangedEvent 方法
        this.MPChanged.Add((...args)=> this.MPChangedEvent(...args));
        this.SPChanged.Add((...args)=> this.SPChangedEvent(...args));
        
        this.DamageBox.OnComponentBeginOverlap.Add((...args)=> this.WeaponOverlop(...args));
        
    }
    
    WeaponOverlop(OverlappedComponent: $Nullable<UE.PrimitiveComponent>, OtherActor: $Nullable<UE.Actor>, OtherComp: $Nullable<UE.PrimitiveComponent>, OtherBodyIndex: number, bFromSweep: boolean, SweepResult: UE.HitResult)
    {
        if(this == OtherActor) return;
        
        if(!this.HitActor.Contains(OtherActor)){
            
            this.HitActor.Add(OtherActor);
            //这个数组存起来，保证每次平A只会命中一次
            
            UE.KismetSystemLibrary.PrintString(
                this,
                `${this.GetName()}击中了->${OtherActor.GetName()}`,
                true,
                true,
                UE.LinearColor.Green,
                5.0
            );
            
            const GameplayEventData = new UE.GameplayEventData();
            GameplayEventData.EventTag = MeleeHitTag;
            GameplayEventData.Instigator = this;
            GameplayEventData.Target = OtherActor;
            UE.AbilitySystemBlueprintLibrary.SendGameplayEventToActor(this,MeleeHitTag,GameplayEventData);
            
        }
        
    }
    
    //开始伤害(蒙太奇通知)
    BeginDamage() {
        this.HitActor.Empty();
        
        this.DamageBox.SetCollisionEnabled(UE.ECollisionEnabled.QueryOnly);
        
    }

    EndDamage() {
        this.HitActor.Empty();
        this.DamageBox.SetCollisionEnabled(UE.ECollisionEnabled.NoCollision);
    }

    protected HPChangedEvent(Value:number){
        // UE.KismetSystemLibrary.PrintString(this, Value.toString(),true,true,UE.LinearColor.Green);
        // - 当 HP 变化时被调用，Value 是新的 HP 值
        //   - UE.KismetSystemLibrary.PrintString：在屏幕上打印字符串（对应蓝图中的 Print String 节点）
        //     - 参数依次是：WorldContext、字符串、是否打印到屏幕、是否打印到日志、颜色
    }

    protected MPChangedEvent(Value:number){
        // UE.KismetSystemLibrary.PrintString(this, Value.toString(),true,true,UE.LinearColor.Green);
    }

    protected SPChangedEvent(Value:number){
        // UE.KismetSystemLibrary.PrintString(this, Value.toString(),true,true,UE.LinearColor.Green);
    }
    
}