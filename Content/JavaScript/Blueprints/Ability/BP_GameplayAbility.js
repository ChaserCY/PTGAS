"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BP_GameplayAbility = void 0;
const UE = require("ue");
const mixin_1 = require("../../mixin");
//需要导入mixin 模块
//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
//import {xxxx} from "../xxxx";
const AssetPath = "/Game/BluePrints/Ability/BP_GameplayAbility.BP_GameplayAbility_C";
let BP_GameplayAbility = 
//有继承：export class BP_GameplayAbility extends xxxx implements BP_GameplayAbility { }
class BP_GameplayAbility {
    //开始的UI的CD
    StartUI_CD() {
        this.PlayerController = UE.GameplayStatics.GetPlayerController(this, 0);
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
BP_GameplayAbility = __decorate([
    (0, mixin_1.default)(AssetPath)
    //有继承：export class BP_GameplayAbility extends xxxx implements BP_GameplayAbility { }
], BP_GameplayAbility);
exports.BP_GameplayAbility = BP_GameplayAbility;
//# sourceMappingURL=BP_GameplayAbility.js.map