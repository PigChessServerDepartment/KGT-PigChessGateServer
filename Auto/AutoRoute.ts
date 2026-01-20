import fs from 'fs';
import path from 'path';
import readline from 'readline';

// 创建命令行交互接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 定义路由类型
interface RouteConfig {
  fileName: string;
  routeName: string;
  routePath: string;
  routeContent: string;
}

interface ModelConfig {
  fileName: string;
  modelName: string;
  modelContent: string;
}

const modelConfigs: { [key: string]: ModelConfig } = {
  model: {
    fileName: 'Model.ts',
    modelName: 'Model',
    modelContent: 
    `export interface Res {}
    export interface Req {}
    `
  }
};

// 路由映射配置
const routeConfigs: { [key: string]: RouteConfig } = {
  pigchessadmin: {
    fileName: 'PigChessAdminRoute.ts',
    routeName: 'PigChessAdminRoute',
    routePath: '/PigChessAdmin/',
    routeContent: 
    `PigChessAdminRoute.post('/PigChessAdmin/', async(req:Request, res:Response) => {
        const reqbody=req.body as Model.Req;
        const resbody:Model.Res={
        }
        let defer:Defer=new Defer(()=>{
            res.send(JSON.stringify(resbody));
        })
});`
  },
  pigchessapi: {
    fileName: 'PigChessApiRoute.ts',
    routeName: 'PigChessApiRoute',
    routePath: '/PigChessApiRoute/',
    routeContent: 
    `PigChessApiRoute.post('/PigChessApiRoute/', async(req:Request, res:Response) => {
        const reqbody=req.body as Model.Req;
        const resbody:Model.Res={
        }
        let defer:Defer=new Defer(()=>{
            res.send(JSON.stringify(resbody));
        })
});`
  }
};

/**
 * 在指定目录中查找文件
 * @param fileName 要查找的文件名
 * @param searchDirs 要搜索的目录数组
 * @returns 文件路径或null
 */
function findFileInDirs(fileName: string, searchDirs: string[]): string | null {
  for (const dir of searchDirs) {
    try {
      if (fs.existsSync(dir)) {
        const filePath = path.join(dir, fileName);
        if (fs.existsSync(filePath)) {
          return filePath;
        }
      }
    } catch (error) {
      console.error(`搜索目录 ${dir} 时出错:`, error);
    }
  }
  
  // 如果没找到，尝试递归搜索
  return findFileRecursive(fileName, process.cwd());
}

/**
 * 递归查找文件
 * @param fileName 文件名
 * @param startPath 起始路径
 * @returns 文件路径或null
 */
function findFileRecursive(fileName: string, startPath: string): string | null {
  try {
    const items = fs.readdirSync(startPath);
    
    for (const item of items) {
      const fullPath = path.join(startPath, item);
      
      try {
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // 跳过 node_modules 等目录
          if (item === 'node_modules' || item === '.git' || item.startsWith('.')) {
            continue;
          }
          
          const result = findFileRecursive(fileName, fullPath);
          if (result) return result;
        } else if (item === fileName) {
          return fullPath;
        }
      } catch (err) {
        // 跳过无法访问的目录/文件
        continue;
      }
    }
  } catch (error) {
    console.error(`递归搜索 ${startPath} 时出错:`, error);
  }
  
  return null;
}

/**
 * 向文件末尾添加内容
 * @param filePath 文件路径
 * @param content 要添加的内容
 */
function appendToFile(filePath: string, content: string): void {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.log(`❌ 文件不存在: ${filePath}`);
      return;
    }
    
    // 读取原文件内容
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // 获取当前时间
    const now = new Date();
    const timestamp = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  .toISOString()
  .replace('T', ' ')
  .split('.')[0];

    // 添加注释分隔符和新内容
    const separator = `\n// ================================================
// 自动添加 - ${timestamp}
// ================================================\n`;
    
    // 确保文件末尾有换行
    const trimmedContent = fileContent.trim();
    const newContent = trimmedContent + separator + content + '\n';
    
    // 写回文件
    fs.writeFileSync(filePath, newContent, 'utf-8');
    
    console.log(`✅ 成功向 ${path.basename(filePath)} 添加新的POST路由`);
    console.log('📁 文件位置:', filePath);
    console.log('📝 添加的内容:');
    console.log(content);
  } catch (error: any) {
    console.error(`❌ 写入文件 ${filePath} 时出错:`, error.message);
  }
}
/**
 * 处理Model添加
 * @param modelname model名称
 */
function handleModelAddition(modelname: string): void {
    // const normalizedKey = modelname.toLowerCase();
    const config = modelConfigs["model"];
    
    if (!config) {
      console.log('📋 支持的 Model 关键字:');
      console.log('  - Model');
      return;
    }
    
    console.log(`🔍 正在查找文件: ${config.fileName}`)
    // 优先搜索的目录（根据你的项目结构）
    // 这里假设 Model 文件在当前目录下的 Model 目录中
    const searchDirs = [
      path.join(process.cwd(), '../Model'),
    ];
    const filePath = findFileInDirs(config.fileName, searchDirs);
    if (!filePath) {
        console.log(`❌ 未找到文件 ${config.fileName}`);
        console.log('🔍 搜索过的目录:');
        searchDirs.forEach(dir => {
            console.log(`  - ${dir} (${fs.existsSync(dir) ? '存在' : '不存在'})`);
        });
        console.log('\n💡 建议:');
        console.log('  1. 确保文件在当前目录或子目录中');
        console.log('  2. 检查文件名是否正确');
        console.log('  3. 确保有读取权限');
        return;
    }

    console.log(`✅ 找到文件: ${filePath}`);
      console.log(`✅ 找到文件: ${filePath}`);
  let content:string="export interface "+modelname+ "Req {\n    id:HttpId;\n}\n"
  +"export interface " +modelname+ "Res {\n    id:HttpId;\n    error:ErrorCode;\n}"
    // 向文件添加Model
    appendToFile(filePath, content);
}

/**
 * 处理路由添加
 * @param routeKey 路由关键字
 */
function handleRouteAddition(routeKey: string): void {
  // 将输入转换为小写以便匹配
  const normalizedKey = routeKey.toLowerCase();
  const configKey = normalizedKey === 'pigchessadminroute' ? 'pigchessadmin' : 
                   normalizedKey === 'pigchessapiroute' ? 'pigchessapi' : 
                   normalizedKey;
  
  const config = routeConfigs[configKey];
  
  if (!config) {
    console.log(`❌ 未找到 ${routeKey} 的配置`);
    console.log('📋 支持的路由关键字:');
    console.log('  - PigChessAdminRoute 或 pigchessadmin');
    console.log('  - PigChessApiRoute 或 pigchessapi');
    return;
  }
  
  console.log(`🔍 正在查找文件: ${config.fileName}`);
  
  // 优先搜索的目录（根据你的项目结构）
  const searchDirs = [
    path.join(process.cwd(), '../Route'),
  ];
  
  // 查找目标文件
  const filePath = findFileInDirs(config.fileName, searchDirs);
  
  if (!filePath) {
    console.log(`❌ 未找到文件 ${config.fileName}`);
    console.log('🔍 搜索过的目录:');
    searchDirs.forEach(dir => {
      console.log(`  - ${dir} (${fs.existsSync(dir) ? '存在' : '不存在'})`);
    });
    console.log('\n💡 建议:');
    console.log('  1. 确保文件在当前目录或子目录中');
    console.log('  2. 检查文件名是否正确');
    console.log('  3. 确保有读取权限');
    return;
  }
  
  console.log(`✅ 找到文件: ${filePath}`);

  // 向文件添加路由
  appendToFile(filePath, config.routeContent);
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('🚀 路由自动添加工具');
  console.log('='.repeat(50));
  console.log('📁 当前工作目录:', process.cwd());
  console.log('='.repeat(50));
  
  // 从命令行参数获取路由关键字
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // 命令行模式
    const routeKey = args[0];
    handleRouteAddition(routeKey);
  } else {
    // 交互模式
    console.log('📋 支持的路由:');
    console.log('  1. PigChessAdminRoute (输入: pigchessadmin 或 1)');
    console.log('  2. PigChessApiRoute (输入: pigchessapi 或 2)');
    console.log('='.repeat(50));
    
    const askQuestion = () => {
    rl.question('请输入 r 添加路由,输入m添加Model,或输入 q 退出: ', (firstInput) => {
    const trimmedFirstInput = firstInput.trim().toLowerCase();
    
    if (trimmedFirstInput === 'q' || trimmedFirstInput === 'quit') {
      console.log('👋 再见！');
      rl.close();
      return;
    }
    
    if (trimmedFirstInput === 'r') {
      // 进入路由选择模式
      rl.question('请选择路由 (输入 1 或 2):\n  1. PigChessAdminRoute\n  2. PigChessApiRoute\n请选择: ', (routeInput) => {
        const trimmedRouteInput = routeInput.trim().toLowerCase();
        let routeKey: string;
        
        if (trimmedRouteInput === '1' || trimmedRouteInput === 'admin') {
          routeKey = 'pigchessadmin';
          console.log('✅ 选择: PigChessAdminRoute');
        } else if (trimmedRouteInput === '2' || trimmedRouteInput === 'api') {
          routeKey = 'pigchessapi';
          console.log('✅ 选择: PigChessApiRoute');
        } else {
          console.log('❌ 无效选择，请输入 1 或 2');
          console.log('\n' + '='.repeat(50));
          askQuestion(); // 重新开始
          return;
        }
        
        handleRouteAddition(routeKey);
        
        // 继续询问
        console.log('\n' + '='.repeat(50));
        askQuestion();
      });
    } 
    else if(trimmedFirstInput === 'm')
    {
        console.log('📋 Model自动化添加');
        rl.question('请输入 Model 名称: ', (modelName) => {
            handleModelAddition(modelName);
            console.log('\n' + '='.repeat(50));
            askQuestion();
        });
    }
    else {
      console.log('❌ 请输入 r 添加路由,输入m添加Model,或输入 q 退出:');
      console.log('\n' + '='.repeat(50));
      askQuestion(); // 重新开始
    }
  });
};

    askQuestion();
  }
}

// 处理退出
rl.on('close', () => {
  console.log('👋 程序已退出');
  process.exit(0);
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  rl.close();
});

// 运行主函数
main().catch(error => {
  console.error('❌ 程序运行出错:', error);
  rl.close();
});