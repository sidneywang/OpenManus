import PyInstaller.__main__
import os
import shutil

# 获取当前目录
current_dir = os.path.dirname(os.path.abspath(__file__))

# 创建必要的目录
dist_dir = os.path.join(current_dir, "electron-app", "dist")
python_dir = os.path.join(dist_dir, "python")
build_dir = os.path.join(dist_dir, "build")
spec_dir = os.path.join(dist_dir, "spec")

for dir_path in [dist_dir, python_dir, build_dir, spec_dir]:
    os.makedirs(dir_path, exist_ok=True)

# 清理旧的构建文件
for dir_path in [build_dir, spec_dir]:
    if os.path.exists(dir_path):
        shutil.rmtree(dir_path)
    os.makedirs(dir_path)

add_data = f'{os.path.join(current_dir, "app")}{os.pathsep}app'
config_data = f'{os.path.join(current_dir, "config")}{os.pathsep}config'

try:
    PyInstaller.__main__.run([
        'run_flow.py',
        '--onefile',
        '--name=run_flow',
        f'--add-data={add_data}',
        f'--add-data={config_data}',
        '--hidden-import=app.agent.manus',
        '--hidden-import=app.flow.flow_factory',
        '--hidden-import=tiktoken',
        '--hidden-import=openai',
        '--hidden-import=boto3',
        '--clean',
        '--noconfirm',
        f'--distpath={python_dir}',
        f'--workpath={build_dir}',
        f'--specpath={spec_dir}',
    ])
    print("Python 打包完成！")
except Exception as e:
    print(f"打包过程中出错: {str(e)}")
    raise
