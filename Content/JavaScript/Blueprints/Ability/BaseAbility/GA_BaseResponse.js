"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GA_BaseResponse = void 0;
const mixin_1 = require("../../../mixin");
const AssetPath = "/Game/BluePrints/Ability/BaseAbility/GA_BaseResponse.GA_BaseResponse_C";
let GA_BaseResponse = class GA_BaseResponse {
    //这是 GA（Gameplay Ability） 的激活入口函数，对应 C++ 中的 ActivateAbility。
    k2_ActivateAbility() {
        this.K2_CommitAbilityCost(); //触发编辑器里绑定的那个Cast类(新建的)
    }
};
GA_BaseResponse = __decorate([
    (0, mixin_1.default)(AssetPath)
], GA_BaseResponse);
exports.GA_BaseResponse = GA_BaseResponse;
//# sourceMappingURL=GA_BaseResponse.js.map