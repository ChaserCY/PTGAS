"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BP_AIController = void 0;
const UE = require("ue");
const mixin_1 = require("../../../mixin");
const AssetPath = "/Game/BluePrints/Character/Enemy/BP_AIController.BP_AIController_C";
const BT_Tree = UE.BehaviorTree.Load("/Game/BluePrints/Character/Enemy/AI/BT_Tree.BT_Tree");
let BP_AIController = class BP_AIController {
    ReceiveBeginPlay() {
        this.RunBehaviorTree(BT_Tree);
    }
};
BP_AIController = __decorate([
    (0, mixin_1.default)(AssetPath)
], BP_AIController);
exports.BP_AIController = BP_AIController;
//# sourceMappingURL=BP_AIController.js.map