"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BP_LaserActor = void 0;
const UE = require("ue");
const mixin_1 = require("../../../mixin");
const AssetPath = "/Game/BluePrints/Ability/_03Laser/BP_LaserActor.BP_LaserActor_C";
const LaserDamage = new UE.GameplayTag("Ability.Laser.Damage");
let BP_LaserActor = class BP_LaserActor {
    constructor() {
        this.GameplayEventData = null;
    }
    ReceiveBeginPlay() {
        this.HitActor.Empty();
        console.log("生成了激光Actor");
        this.EndPoint.OnComponentBeginOverlap.Add((...args) => this.EndPointOnBeginOverlap(...args));
        this.EndPoint.OnComponentEndOverlap.Add((...args) => this.EndPointOnEndOverlap(...args));
        UE.KismetSystemLibrary.K2_SetTimer(this, "LaserDamage", 0.25, true);
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
            this.GameplayEventData = new UE.GameplayEventData();
            this.GameplayEventData.EventTag = LaserDamage;
            this.GameplayEventData.Instigator = this.GetInstigator();
            this.GameplayEventData.TargetData = UE.AbilitySystemBlueprintLibrary.AbilityTargetDataFromActorArray(this.HitActor, true);
            UE.AbilitySystemBlueprintLibrary.SendGameplayEventToActor(this.Instigator, LaserDamage, this.GameplayEventData);
        }
    }
};
BP_LaserActor = __decorate([
    (0, mixin_1.default)(AssetPath)
], BP_LaserActor);
exports.BP_LaserActor = BP_LaserActor;
//# sourceMappingURL=BP_LaserActor.js.map