import json

with open(r"c:\Users\lenovo\Documents\Smart Care\scratch\parsed_phone_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for sheet_name, rows in data.items():
    print(f"=== Sheet: {sheet_name} ===")
    non_empty_rows = [r for r in rows if any(cell.strip() for cell in r if isinstance(cell, str))]
    print(f"Total non-empty rows: {len(non_empty_rows)}")
    for r in non_empty_rows[:20]:
        print(r)
