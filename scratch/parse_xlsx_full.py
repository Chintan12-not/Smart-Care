import zipfile
import xml.etree.ElementTree as ET
import json
import os

def parse_full_xlsx(file_path):
    with zipfile.ZipFile(file_path, 'r') as z:
        # Load shared strings
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            ss_tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in ss_tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                text = "".join([t.text for t in si.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t') if t.text])
                shared_strings.append(text)
        
        # Load workbook sheets
        wb_tree = ET.fromstring(z.read('xl/workbook.xml'))
        sheets = []
        for sheet in wb_tree.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheet'):
            name = sheet.attrib.get('name')
            r_id = sheet.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
            sheets.append((name, r_id))
            
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
                    val_elem = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    inline_elem = cell.find('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                    t = cell.attrib.get('t')
                    
                    cell_value = ""
                    if t == 's' and val_elem is not None and val_elem.text is not None:
                        idx_ss = int(val_elem.text)
                        if idx_ss < len(shared_strings):
                            cell_value = shared_strings[idx_ss]
                    elif t == 'inlineStr' and inline_elem is not None and inline_elem.text:
                        cell_value = inline_elem.text
                    elif val_elem is not None and val_elem.text:
                        cell_value = val_elem.text
                    elif inline_elem is not None and inline_elem.text:
                        cell_value = inline_elem.text
                        
                    row_cells.append(cell_value)
                rows_data.append(row_cells)
            result[name] = rows_data
        return result, shared_strings

data, shared_strings = parse_full_xlsx(r"c:\Users\lenovo\Documents\Smart Care\phone data\phone_models_10_brands.xlsx")

print(f"Total Shared Strings: {len(shared_strings)}")
print("First 30 Shared Strings:")
for i, s in enumerate(shared_strings[:30]):
    print(f"  [{i}]: {s}")

out_path = r"c:\Users\lenovo\Documents\Smart Care\scratch\full_excel_dump.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump({"sheets": data, "shared_strings": shared_strings}, f, indent=2, ensure_ascii=False)

print("Saved to", out_path)
