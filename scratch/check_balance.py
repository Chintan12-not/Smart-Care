import re

with open(r"c:\Users\lenovo\Documents\Smart Care\src\app\accessories\page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

content = "".join(lines[:657])

# Remove self-closing tags
no_self_close = re.sub(r'<div[^>]*/>', '', content)

open_div = len(re.findall(r'<div[\s>]', no_self_close))
close_div = len(re.findall(r'</div>', no_self_close))
print(f"Non-self-closing Divs: <div = {open_div}, </div> = {close_div}, Diff = {open_div - close_div}")

# Let's stack trace all opening and closing tags in line order
for idx, line in enumerate(lines[:657]):
    opens = len(re.findall(r'<div[\s>]', re.sub(r'<div[^>]*/>', '', line)))
    closes = len(re.findall(r'</div>', line))
    if opens != closes:
        print(f"Line {idx+1} (+{opens}/-{closes}): {line.strip()}")
