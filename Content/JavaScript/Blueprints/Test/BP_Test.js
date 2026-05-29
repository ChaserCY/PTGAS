"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BP_Test = void 0;
const UE = require("ue");
const mixin_1 = require("../../mixin"); //额外添加这一行使得10行不会报错@mixin(AssetPath)
const AssetPath = "/Game/BluePrints/Test/BP_Test.BP_Test_C"; //这里的路径必须和Content中的蓝图ACtor路径对应，并且.后面必须是BP_Test_C加个_C 
let BP_Test = class BP_Test {
    Fun1() {
        UE.KismetSystemLibrary.PrintString(this, "我是函数1", true, true, UE.LinearColor.Red, 2);
    }
    Fun2() {
        UE.KismetSystemLibrary.PrintString(this, "我是函数2", true, true, UE.LinearColor.Green, 2);
    }
    Fun3() {
        UE.KismetSystemLibrary.PrintString(this, "我是函数3，通过蓝图调用的", true, true, UE.LinearColor.Green, 2);
    }
};
BP_Test = __decorate([
    (0, mixin_1.default)(AssetPath)
], BP_Test);
exports.BP_Test = BP_Test;
//# sourceMappingURL=BP_Test.js.map