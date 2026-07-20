import * as fs from 'fs';// 文件系统模块，用于读写文件
import * as path from 'path';// 路径处理模块，用于拼接、解析路径  

const BlueprintsDir = path.join(__dirname, './Blueprints');
const MainGameFile = path.join(__dirname, './MainGame.ts');
//__dirname,它表示当前正在执行的脚本文件所在的目录的绝对路径。
//path.join() 路径拼接

// 递归获取目录下所有 .ts 文件 ，接收一个目录路径，返回该目录下所有 .ts 文件的绝对路径数组
function getAllTsFiles(dir: string): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    // readdirSync 同步读取目录内容,返回特殊结构体
    // withFileTypes: true 返回 Dirent 对象，可以区分文件和文件夹
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // 如果是文件夹
        if (entry.isDirectory()) {
            //递归调用此函数
            results.push(...getAllTsFiles(fullPath));
            // ... 在这里就是把递归返回的数组拆开逐个塞进去，避免产生嵌套数组
        }
        //指定文件后缀名
        else if (entry.name.endsWith('.ts')) {
            results.push(fullPath);
        }
    }
    return results;
}

// 生成 import 语句
function makeImportStatement(filePath: string): string {
    //计算相对于__dirname的路径
    const relativePath = path.relative(__dirname, filePath).replace(/\\/g, '/').replace(/\.ts$/, '');
    return `import "./${relativePath}";`;
}

//同步读取MainGame.ts文件内容
const mainGameContent = fs.readFileSync(MainGameFile, 'utf8');
const tsFiles = getAllTsFiles(BlueprintsDir);

let added = 0;
let skipped = 0;
const appendLines: string[] = [];

for (const file of tsFiles) {
    const importStatement = makeImportStatement(file);
    if (mainGameContent.includes(importStatement)) {
        console.log(`[skip] ${importStatement}`);
        skipped++;
    } else {
        console.log(`[add]  ${importStatement}`);
        appendLines.push(importStatement);
        added++;
    }
}

if (appendLines.length > 0) {
    fs.appendFileSync(MainGameFile, '\n' + appendLines.join('\n') + '\n');
    // appendFileSync 同步追加写入
    // join('\n') 把数组用换行符连接成一个字符串(字符串数组->单字符串)，拆解数组
    // 前后各加一个 \n 确保和原有内容之间有空行分隔
    console.log(`\nDone: added ${added}, skipped ${skipped}`);
} else {
    console.log(`\nDone: all imports already exist, nothing to add.`);
}