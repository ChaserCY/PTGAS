"use strict";
// 监听Blueprints目录下的文件变化，并自动在MainGame.ts中添加相应的import语句
// npm install --save-dev @types/node   // 安装@types/node
// npm install chokidar                 // 安装chokidar
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chokidar_1 = __importDefault(require("chokidar"));
// Blueprints目录的路径
const BlueprintsDir = path.join(__dirname, './Blueprints');
// MainGame.ts文件的路径
const MainGameFile = path.join(__dirname, './MainGame.ts');
console.log(`Watching directory: ${BlueprintsDir}`);
console.log(`MainGame file: ${MainGameFile}`);
// 监听Blueprints目录下的文件变化
const watcher = chokidar_1.default.watch(BlueprintsDir, {
    persistent: true,
    ignoreInitial: true
});
watcher.on('add', (filePath) => {
    console.log(`Detected new file: ${filePath}`); // 调试日志
    const relativePath = path.relative(__dirname, filePath);
    const importStatement = `import "./${relativePath.replace(/\\/g, '/').replace(/\.ts$/, "")}";\n`;
    // 读取MainGame.ts文件内容
    fs.readFile(MainGameFile, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading MainGame.ts: ${err.message}`);
            return;
        }
        // 检查是否已经存在相同的import语句
        if (!data.includes(importStatement)) {
            // 在文件末尾添加新的import语句
            fs.appendFile(MainGameFile, importStatement, (err) => {
                if (err) {
                    console.error(`Error appending to MainGame.ts: ${err.message}`);
                    return;
                }
                console.log(`Added import for ${relativePath}`);
            });
        }
        else {
            console.log(`Import already exists for ${relativePath}`);
        }
    });
});
// 监听错误事件
watcher.on('error', (error) => {
    if (error instanceof Error) {
        console.error(`Watcher error: ${error.message}`);
    }
    else {
        console.error(`Watcher error: ${error}`);
    }
});
//# sourceMappingURL=FileWatcher.js.map