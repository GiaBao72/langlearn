import os

pages = [
    'src/app/blog/[slug]/page.tsx',
    'src/app/courses/page.tsx',
    'src/app/courses/[id]/page.tsx',
    'src/app/dashboard/page.tsx',
    'src/app/admin/page.tsx',
    'src/app/admin/courses/page.tsx',
    'src/app/admin/blog/page.tsx',
]

for path in pages:
    if not os.path.exists(path):
        print(f'SKIP (not found): {path}')
        continue
    with open(path, encoding='utf-8') as f:
        content = f.read()
    if 'force-dynamic' in content:
        print(f'SKIP (already): {path}')
        continue
    lines = content.split('\n')
    last_import = 0
    for i, line in enumerate(lines):
        if line.startswith('import '):
            last_import = i
    dynamic_line = "\nexport const dynamic = 'force-dynamic'"
    lines.insert(last_import + 1, dynamic_line)
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f'FIXED: {path}')
