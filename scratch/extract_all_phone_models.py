import zipfile
import xml.etree.ElementTree as ET
import json
import os

file_path = r"c:\Users\lenovo\Documents\Smart Care\phone data\phone_models_10_brands.xlsx"

with zipfile.ZipFile(file_path, 'r') as z:
    sheet1_xml = z.read('xl/worksheets/sheet1.xml')
    tree = ET.fromstring(sheet1_xml)
    
    rows = []
    for row in tree.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
        row_dict = {}
        for c in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
            col_ref = c.attrib.get('r', '')
            col_letter = "".join([char for char in col_ref if char.isalpha()])
            
            # get value
            t = c.attrib.get('t')
            val = ""
            if t == 'inlineStr':
                is_elem = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}is')
                if is_elem is not None:
                    t_elem = is_elem.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                    if t_elem is not None and t_elem.text:
                        val = t_elem.text
            else:
                v_elem = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                if v_elem is not None and v_elem.text:
                    val = v_elem.text
            
            row_dict[col_letter] = val
        if row_dict:
            rows.append(row_dict)

# Format into brand -> models list structure
# Header is row 0: A=ID, B=Brand, C=Model, D=Series
headers = rows[0]
print("Header:", headers)

models_list = []
brands_set = set()
brand_models_map = {}

for r in rows[1:]:
    brand = r.get('B', '').strip()
    model = r.get('C', '').strip()
    series = r.get('D', '').strip()
    model_id = r.get('A', '').strip()
    
    if brand and model:
        brands_set.add(brand)
        if brand not in brand_models_map:
            brand_models_map[brand] = []
        brand_models_map[brand].append({
            "id": model_id,
            "name": model,
            "series": series
        })
        models_list.append({
            "id": model_id,
            "brand": brand,
            "name": model,
            "series": series
        })

print(f"Total Brands: {len(brands_set)} -> {sorted(list(brands_set))}")
print(f"Total Models: {len(models_list)}")

for b, mods in brand_models_map.items():
    print(f"  Brand '{b}': {len(mods)} models (e.g. {mods[0]['name']}, {mods[1]['name'] if len(mods)>1 else ''})")

# Save structured JSON directly into src/data/phoneModels.json
out_file = r"c:\Users\lenovo\Documents\Smart Care\src\data\phoneModels.json"
os.makedirs(os.path.dirname(out_file), exist_ok=True)

final_data = {
    "brands": sorted(list(brands_set)),
    "brandModels": brand_models_map,
    "allModels": models_list
}

with open(out_file, "w", encoding="utf-8") as f:
    json.dump(final_data, f, indent=2, ensure_ascii=False)

print(f"Successfully wrote data to {out_file}")
