"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BP_PlayerController = void 0;
const UE = require("ue");
const mixin_1 = require("../../../mixin");
const AssetPath = "/Game/BluePrints/Character/Player/BP_PlayerController.BP_PlayerController_C";
const MeleeTag = new UE.GameplayTag("Ability.Melee");
let BP_PlayerController = class BP_PlayerController {
    ReceiveBeginPlay() {
        this.BP_Player = UE.GameplayStatics.GetPlayerCharacter(this, 0);
    }
    //普通攻击(重写编辑器里的同名函数)
    Melee() {
        if (this.BP_Player) {
            this.BP_Player.ActivateAbility(MeleeTag);
            //对应BP_BaseCharacter.ts里的ActivateAbility方法，传入一个GameplayTag参数
        }
    }
};
BP_PlayerController = __decorate([
    (0, mixin_1.default)(AssetPath)
], BP_PlayerController);
exports.BP_PlayerController = BP_PlayerController;
//# sourceMappingURL=BP_PlayerController.js.map