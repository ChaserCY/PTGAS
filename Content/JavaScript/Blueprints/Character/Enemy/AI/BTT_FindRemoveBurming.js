"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BTT_FindRemoveBurming = void 0;
const UE = require("ue");
const mixin_1 = require("../../../../mixin");
const AssetPath = "/Game/BluePrints/Character/Enemy/AI/BTT_FindRemoveBurming.BTT_FindRemoveBurming_C";
const RemoveBuffClass = UE.Class.Load("/Game/BluePrints/Ability/_05FireBlast/BP_RemoveBurming.BP_RemoveBurming_C");
let BTT_FindRemoveBurming = class BTT_FindRemoveBurming {
    ReceiveExecuteAI(OwnerController, ControlledPawn) {
        const BurmingActor = UE.GameplayStatics.GetActorOfClass(this, RemoveBuffClass);
        if (BurmingActor) {
            UE.BTFunctionLibrary.SetBlackboardValueAsVector(this, this.Location, BurmingActor.K2_GetActorLocation());
            this.FinishExecute(true);
        }
        else {
            this.FinishExecute(false);
        }
    }
};
BTT_FindRemoveBurming = __decorate([
    (0, mixin_1.default)(AssetPath)
], BTT_FindRemoveBurming);
exports.BTT_FindRemoveBurming = BTT_FindRemoveBurming;
//# sourceMappingURL=BTT_FindRemoveBurming.js.map