import os
import shutil
import subprocess
import re

def parse_requirements(requirements_file):
    """解析 requirements.txt 文件，返回包名列表"""
    packages = []
    with open(requirements_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                # 移除版本号和其他选项
                package = re.split(r'[~=<>!]', line)[0].strip()
                packages.append(package)
    return packages

def main():
    # 设置必要的目录
    python_dir = os.path.join("electron-app", "dist", "python")
    os.makedirs(python_dir, exist_ok=True)

    # 清理旧的构建文件
    if os.path.exists("build"):
        shutil.rmtree("build")
    if os.path.exists("dist"):
        shutil.rmtree("dist")
    if os.path.exists("run_flow.spec"):
        os.remove("run_flow.spec")

    # 从 requirements.txt 获取依赖
    dependencies = parse_requirements("requirements.txt")

    # 构建 hidden-imports 参数
    hidden_imports = []
    for dep in dependencies:
        hidden_imports.append(f"--hidden-import={dep}")

    # 添加额外的必要导入
    extra_imports = [
        "--hidden-import=uvicorn.logging",
        "--hidden-import=uvicorn.loops",
        "--hidden-import=uvicorn.loops.auto",
        "--hidden-import=uvicorn.protocols",
        "--hidden-import=uvicorn.protocols.http",
        "--hidden-import=uvicorn.protocols.http.auto",
        "--hidden-import=uvicorn.protocols.websockets",
        "--hidden-import=uvicorn.protocols.websockets.auto",
        "--hidden-import=uvicorn.lifespan",
        "--hidden-import=uvicorn.lifespan.on",
    ]
    hidden_imports.extend(extra_imports)

    # 构建 PyInstaller 命令
    pyinstaller_cmd = [
        "pyinstaller",
        "--onefile",
        "--clean",
        "--noconfirm",
        "--distpath", python_dir,
        "--workpath", "build",
        "--specpath", ".",
        "--name", "run_flow",
        *hidden_imports,
        "run_flow.py"
    ]

    # 执行 PyInstaller 命令
    subprocess.run(pyinstaller_cmd, check=True)

    # 设置可执行权限
    executable_path = os.path.join("electron-app", "dist", "python", "run_flow")
    os.chmod(executable_path, 0o755)

    print("Python 打包完成！")

if __name__ == "__main__":
    main()
