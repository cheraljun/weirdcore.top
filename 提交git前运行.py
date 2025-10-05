import shutil
from pathlib import Path

dirs = [p for p in Path('.').rglob('__pycache__') if p.is_dir()]

for d in dirs:
    try:
        shutil.rmtree(d)
        print(f'已删除: {d}')
    except:
        pass

print('清理完成！')