"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BP_GroundSelectTargetActor = void 0;
const UE = require("ue");
const mixin_1 = require("../../../mixin");
const AssetPath = "/Game/BluePrints/Ability/_04GroundBlast/BP_GroundSelectTargetActor.BP_GroundSelectTargetActor_C";
let BP_GroundSelectTargetActor = class BP_GroundSelectTargetActor {
    constructor() {
        this._rotationIntervalId = null;
    }
    ReceiveBeginPlay() {
        this.SetDecalSize();
        // this._rotationIntervalId = setInterval(()=>{
        //     this.UpdateLocation();
        // },1000*0.2);
    }
    ReceiveTick(DeltaSeconds) {
        this.Decal.K2_SetWorldLocation(this.GetPlayerLookAtPoint(), false, null, false);
    }
    //设置贴花大小
    SetDecalSize() {
        //this.SelectRadius = 150;
        this.Decal.DecalSize = new UE.Vector(100, this.SelectRadius, this.SelectRadius);
    }
    UpdateLocation() {
    }
};
BP_GroundSelectTargetActor = __decorate([
    (0, mixin_1.default)(AssetPath)
], BP_GroundSelectTargetActor);
exports.BP_GroundSelectTargetActor = BP_GroundSelectTargetActor;
//# sourceMappingURL=BP_GroundSelectTargetActor.js.map