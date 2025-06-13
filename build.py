import os
import shutil
import subprocess
import sys
from pathlib import Path

def build():
    # 先安装所有依赖
    import subprocess
    print('正在安装 requirements.txt 里的依赖...')
    subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], check=True)

    # 清理旧的构建文件
    if os.path.exists("build"):
        shutil.rmtree("build")
    if os.path.exists("dist"):
        shutil.rmtree("dist")
    if os.path.exists("run_flow.spec"):
        os.remove("run_flow.spec")

    # 获取 NLTK 数据路径
    import nltk
    nltk_data_path = os.path.expanduser("~/nltk_data")

    # 构建命令
    cmd = [
        "pyinstaller",
        "--noconfirm",
        "--onefile",
        "--clean",
        "--add-data", f"{nltk_data_path}:nltk_data",
        "--hidden-import", "nltk",
        "--hidden-import", "nltk.collocations",
        "--hidden-import", "nltk.metrics",
        "--hidden-import", "nltk.metrics.association",
        "--hidden-import", "scipy",
        "--hidden-import", "scipy.stats",
        "--hidden-import", "scipy.spatial",
        "--hidden-import", "scipy.spatial.transform",
        "--hidden-import", "scipy.spatial.transform._rotation",
        "--hidden-import", "tiktoken",
        "--hidden-import", "tiktoken.core",
        "--hidden-import", "tiktoken.registry",
        "--hidden-import", "tiktoken.model",
        "run_flow.py"
    ]

    # 执行构建
    subprocess.run(cmd, check=True)

    # 创建目标目录
    target_dir = Path("electron-app/dist/python")
    target_dir.mkdir(parents=True, exist_ok=True)

    # 复制可执行文件
    shutil.copy("dist/run_flow", target_dir / "run_flow")

    # 复制配置文件
    config_dir = target_dir / "config"
    config_dir.mkdir(exist_ok=True)
    shutil.copy("config/config.toml", config_dir / "config.toml")

    # 为 dist 目录也创建配置文件
    dist_config_dir = Path("dist/config")
    dist_config_dir.mkdir(exist_ok=True)
    shutil.copy("config/config.toml", dist_config_dir / "config.toml")

    print("Python 打包完成！")

if __name__ == "__main__":
    build()
