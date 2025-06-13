const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

// 确保配置文件存在
function ensureConfigExists() {
  const configDir = path.join(__dirname, 'dist', 'python', 'config');
  const configFile = path.join(configDir, 'config.json');

  // 创建配置目录（如果不存在）
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // 如果配置文件不存在，创建默认配置
  if (!fs.existsSync(configFile)) {
    const defaultConfig = {
      "openai": {
        "api_key": "",
        "model": "gpt-4-turbo-preview"
      },
      "anthropic": {
        "api_key": "",
        "model": "claude-3-opus-20240229"
      },
      "logging": {
        "level": "INFO",
        "file": "app.log"
      }
    };

    fs.writeFileSync(configFile, JSON.stringify(defaultConfig, null, 2));
    console.log('已创建默认配置文件');
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // 在开发环境中禁用 web 安全性
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  ensureConfigExists();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 添加 Python 调用处理
ipcMain.handle('run-python-flow', async (event, prompt) => {
  return new Promise((resolve, reject) => {
    console.log('开始执行 Python 流程:', prompt);

    // 检查 Python 可执行文件是否存在
    const pythonPath = path.join(__dirname, 'dist', 'python', 'run_flow');
    console.log('Python 路径:', pythonPath);

    try {
      if (!fs.existsSync(pythonPath)) {
        throw new Error(`Python 可执行文件不存在: ${pythonPath}`);
      }
      console.log('Python 可执行文件存在');
    } catch (error) {
      console.error('检查 Python 可执行文件失败:', error);
      reject(error);
      return;
    }

    const options = {
      mode: 'text',
      pythonPath: pythonPath,
      args: [JSON.stringify(prompt)]
    };

    console.log('启动 Python 进程，参数:', options.args);

    const pythonProcess = spawn(pythonPath, options.args, {
      cwd: path.join(__dirname, 'dist', 'python'),
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1' // 禁用 Python 输出缓冲
      }
    });

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      const log = data.toString();
      output += log;
      console.log('Python 输出:', log);
      // 发送日志到渲染进程
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('python-log', {
          type: 'info',
          message: log.trim()
        });
      } else {
        console.error('mainWindow 或 webContents 未定义');
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      const log = data.toString();
      error += log;
      console.log('Python 错误:', log);
      // 发送错误日志到渲染进程
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('python-log', {
          type: 'error',
          message: log.trim()
        });
      } else {
        console.error('mainWindow 或 webContents 未定义');
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('启动 Python 进程失败:', err);
      reject(err);
    });

    pythonProcess.on('close', (code) => {
      console.log('Python 进程退出，代码:', code);
      if (code !== 0) {
        const errorMessage = `Python process exited with code ${code}: ${error}`;
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('python-log', {
            type: 'error',
            message: errorMessage
          });
        }
        reject(new Error(errorMessage));
      } else {
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('python-log', {
            type: 'success',
            message: '执行完成'
          });
        }
        resolve(output);
      }
    });
  });
});
