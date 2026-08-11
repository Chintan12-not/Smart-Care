import zipfile
import xml.etree.ElementTree as ET
import json
import os

def parse_xlsx(file_path):
    with zipfile.ZipFile(file_path, 'r') as z:
        # Load shared strings
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            ss_tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in ss_tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                text = "".join([t.text for t in si.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t') if t.text])
                shared_strings.append(text)
        
        # Load workbook sheet names
        wb_tree = ET.fromstring(z.read('xl/workbook.xml'))
        sheets = []
        for sheet in wb_tree.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheet'):
            name = sheet.attrib.get('name')
            r_id = sheet.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
            sheets.append((name, r_id))
            
        # Parse sheets
        result = {}
        for idx, (name, r_id) in enumerate(sheets):
            sheet_file = f'xl/worksheets/sheet{idx + 1}.xml'
            if sheet_file not in z.namelist():
                sheet_files = [f for f in z.namelist() if f.startswith('xl/worksheets/sheet')]
                sheet_file = sheet_files[idx]
            
            s_tree = ET.fromstring(z.read(sheet_file))
            rows_data = []
            for row in s_tree.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
                row_cells = []
                for cell in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                    val = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    t = cell.attrib.get('t')
                    if val is not None and val.text is not None:
                        v_str = val.text
                        if t == 's' and int(v_str) < len(shared_strings):
                            v_str = shared_strings[int(v_str)]
                        row_cells.append(v_str)
                    else:
                        row_cells.append("")
                if any(row_cells):
                    rows_data.append(row_cells)
            result[name] = rows_data
        return result

data = parse_xlsx(r"c:\Users\lenovo\Documents\Smart Care\phone data\phone_models_10_brands.xlsx")
out_path = r"c:\Users\lenovo\Documents\Smart Care\scratch\parsed_phone_data.json"
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Parsed sheets successfully:", list(data.keys()))
for k, v in data.items():
    print(f"Sheet '{k}': {len(v)} rows. Sample row 0: {v[0] if v else 'Empty'}")
