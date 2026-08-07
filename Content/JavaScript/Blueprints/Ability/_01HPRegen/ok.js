"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = void 0;
//需要导入mixin 模块
//如果该蓝图继承自别的蓝图，还需要导入对应ts模块
//import {xxxx} from "../xxxx";
const AssetPath = "/Game/Blueprints/Ability/_01HPRegen/ok.ok_C";
let ok = 
//有继承：export class ok extends xxxx implements ok { }
class ok {
};
ok = __decorate([
    mixin(AssetPath)
    //有继承：export class ok extends xxxx implements ok { }
], ok);
exports.ok = ok;
//# sourceMappingURL=ok.js.map