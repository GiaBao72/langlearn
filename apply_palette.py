#!/usr/bin/env python3
# apply_palette.py - Apply Modern Academic color palette to all TSX files

import os
import glob

# Define all replacements in order (more specific first)
REPLACEMENTS = [
    # Indigo -> Blue/custom
    ('bg-indigo-600', 'bg-[#2563EB]'),
    ('hover:bg-indigo-700', 'hover:bg-blue-700'),
    ('text-indigo-600', 'text-[#2563EB]'),
    ('border-indigo-600', 'border-blue-600'),
    ('border-indigo-500', 'border-blue-500'),
    ('border-indigo-400', 'border-blue-400'),
    ('border-indigo-300', 'border-blue-300'),
    ('border-indigo-200', 'border-blue-200'),
    ('border-indigo-100', 'border-blue-100'),
    ('border-indigo-', 'border-blue-'),
    ('hover:border-indigo-', 'hover:border-blue-'),
    ('focus:border-indigo-', 'focus:border-blue-'),
    ('bg-indigo-50', 'bg-blue-50'),
    ('bg-indigo-100', 'bg-blue-100'),
    ('bg-indigo-200', 'bg-blue-200'),
    ('text-indigo-200', 'text-blue-200'),
    ('text-indigo-500', 'text-blue-500'),
    ('text-indigo-300', 'text-blue-300'),
    ('text-indigo-400', 'text-blue-400'),
    ('text-indigo-100', 'text-blue-100'),
    ('text-indigo-700', 'text-blue-700'),
    ('text-indigo-800', 'text-blue-800'),
    ('text-indigo-900', 'text-blue-900'),
    # Catch-all remaining indigo -> blue
    ('indigo-', 'blue-'),
    # Slate text -> custom hex
    ('text-slate-900', 'text-[#334155]'),
    ('text-slate-800', 'text-[#334155]'),
    ('text-slate-700', 'text-[#334155]'),
    ('text-slate-600', 'text-[#334155]'),
    ('text-slate-500', 'text-[#64748B]'),
    ('text-slate-400', 'text-[#64748B]'),
    # Slate borders -> custom hex
    ('border-slate-200', 'border-[#E2E8F0]'),
    ('border-slate-100', 'border-[#E2E8F0]'),
    # bg-slate-50 -> keep (equivalent to #F8FAFC), but let's standardize
    # ('bg-slate-50', 'bg-[#F8FAFC]'),  # keeping slate-50 as is - equivalent
]

def apply_replacements(content):
    for old, new in REPLACEMENTS:
        content = content.replace(old, new)
    return content

def fix_accent_button_text(content):
    """Ensure buttons with bg-[#F5A623] or bg-amber- use text-[#334155] not text-white"""
    # Simple string approach: look for text-white near amber/F5A623
    # This is a targeted fix - replace text-white in amber button contexts
    # We do a basic replacement: if 'bg-[#F5A623]' and 'text-white' co-exist on same line, fix it
    lines = content.split('\n')
    result = []
    for line in lines:
        if ('bg-[#F5A623]' in line or 'bg-amber-' in line) and 'text-white' in line:
            line = line.replace('text-white', 'text-[#334155]')
        result.append(line)
    return '\n'.join(result)

# Find all TSX files
tsx_files = glob.glob('D:/AI/openclaw/.openclaw/workspace/langlearn/src/**/*.tsx', recursive=True)

modified_files = []
for filepath in tsx_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    
    modified = apply_replacements(original)
    modified = fix_accent_button_text(modified)
    
    if modified != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(modified)
        modified_files.append(filepath)
        print(f'  MODIFIED: {filepath}')
    else:
        print(f'  unchanged: {filepath}')

print(f'\nTotal files modified: {len(modified_files)}')
print('Modified files:')
for f in modified_files:
    print(f'  - {f}')
