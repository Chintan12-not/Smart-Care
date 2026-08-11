with open(r"c:\Users\lenovo\Documents\Smart Care\src\app\admin\page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

depth = 0
for idx, line in enumerate(lines):
    # Ignore string contents simplified
    o = line.count('{')
    c = line.count('}')
    depth += (o - c)
    if o != c:
        print(f"Line {idx+1} (depth={depth}): {line.strip()[:60]}")
