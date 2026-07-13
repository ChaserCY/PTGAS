"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BTT_FindPlayer = void 0;
const UE = require("ue");
const mixin_1 = require("../../../../mixin");
const AssetPath = "/Game/BluePrints/Character/Enemy/AI/BTT_FindPlayer.BTT_FindPlayer_C";
const BP_PlayerClass = UE.Class.Load("/Game/BluePrints/Character/Player/BP_Player.BP_Player_C");
let BTT_FindPlayer = class BTT_FindPlayer {
    ReceiveExecuteAI(OwnerController, ControlledPawn) {
        if (UE.BTFunctionLibrary.GetBlackboardValueAsActor(this, this.Player)) {
            this.TempPlayer = UE.BTFunctionLibrary.GetBlackboardValueAsActor(this, this.Player);
            this.ChackCharacter();
        }
        else {
            this.TempPlayer = UE.GameplayStatics.GetActorOfClass(this, BP_PlayerClass);
            this.ChackCharacter();
        }
    }
    ChackCharacter() {
        if (this.TempPlayer) {
            UE.BTFunctionLibrary.SetBlackboardValueAsObject(this, this.Player, this.TempPlayer);
            this.FinishExecute(true);
        }
        else {
            UE.BTFunctionLibrary.SetBlackboardValueAsObject(this, this.Player, null);
            this.FinishExecute(false);
        }
    }
};
BTT_FindPlayer = __decorate([
    (0, mixin_1.default)(AssetPath)
], BTT_FindPlayer);
exports.BTT_FindPlayer = BTT_FindPlayer;
//# sourceMappingURL=BTT_FindPlayer.js.map