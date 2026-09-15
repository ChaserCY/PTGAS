const esbuild = require('esbuild');

async function build() {
    try {
        await esbuild.build({
            entryPoints: ['./MainGame.ts'],           // 指向你当前的 MainGame.ts 入口
            bundle: true,                               // 开启打包合并
            outfile: '../Content/JavaScript/bundle.js', // 输出到同级目录下的 Content/JavaScript/bundle.js
            platform: 'node',                           // 平台设为 node
            format: 'cjs',                              // 模块化格式为 CommonJS
            sourcemap: true,                            // 生成 map
            external: ['ue', 'puerts'],                 // 排除 ue 和 puerts
        });
        console.log("----------------------------------------");
        console.log("[Esbuild] 成功打包为单文件: Content/JavaScript/bundle.js");
        console.log("----------------------------------------");
    } catch (error) {
        console.error("[Esbuild] 打包失败：", error);
        process.exit(1);
    }
}

build();