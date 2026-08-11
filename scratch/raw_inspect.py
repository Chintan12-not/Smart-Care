import zipfile
import xml.etree.ElementTree as ET

file_path = r"c:\Users\lenovo\Documents\Smart Care\phone data\phone_models_10_brands.xlsx"
with zipfile.ZipFile(file_path, 'r') as z:
    print("All files in zip:", z.namelist())
    sheet1_xml = z.read('xl/worksheets/sheet1.xml').decode('utf-8')
    print("\nFirst 1000 chars of sheet1.xml:")
    print(sheet1_xml[:1000])
