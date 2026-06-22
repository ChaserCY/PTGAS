"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GA_Melee = void 0;
const mixin_1 = require("../../../mixin");
const AssetPath = "/Game/BluePrints/Ability/_00Melee/GA_Melee.GA_Melee_C";
let GA_Melee = 
//有继承：export class GA_Melee extends xxxx implements GA_Melee { }
class GA_Melee {
    K2_ActivateAbility() {
        console.log("普通攻击生效");
        this.K2_CommitAbility();
    }
};
GA_Melee = __decorate([
    (0, mixin_1.default)(AssetPath)
    //有继承：export class GA_Melee extends xxxx implements GA_Melee { }
], GA_Melee);
exports.GA_Melee = GA_Melee;
//# sourceMappingURL=GA_Melee.js.map