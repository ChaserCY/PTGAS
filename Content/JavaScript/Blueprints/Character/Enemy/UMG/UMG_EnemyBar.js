"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UMG_EnemyBar = void 0;
const UE = require("ue");
const mixin_1 = require("../../../../mixin");
//需要导入mixin 模块
//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
//import {xxxx} from "../xxxx";
const AssetPath = "/Game/BluePrints/Character/Enemy/UMG/UMG_EnemyBar.UMG_EnemyBar_C";
let UMG_EnemyBar = 
//有继承：export class UMG_EnemyBar extends xxxx implements UMG_EnemyBar { }
class UMG_EnemyBar {
    GetPercent() {
        return UE.KismetMathLibrary.FClamp(this.HP / this.Max_HP, 0, 1);
    }
    Get_BarText() {
        return `${this.HP}/${this.Max_HP}`;
        //给文本框的绑定函数返回显示字符串
    }
};
UMG_EnemyBar = __decorate([
    (0, mixin_1.default)(AssetPath)
    //有继承：export class UMG_EnemyBar extends xxxx implements UMG_EnemyBar { }
], UMG_EnemyBar);
exports.UMG_EnemyBar = UMG_EnemyBar;
//# sourceMappingURL=UMG_EnemyBar.js.map