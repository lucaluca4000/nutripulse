import struct, zlib, zipfile, os

def build_string_pool(strings):
    offsets = []
    str_data = bytearray()
    for s in strings:
        offsets.append(len(str_data))
        encoded = s.encode('utf-8')
        l = len(encoded)
        str_data.append(l)
        str_data.append(l)
        str_data.extend(encoded)
        str_data.append(0)
    
    while len(str_data) % 4 != 0:
        str_data.append(0)
        
    num_strings = len(strings)
    offsets_size = num_strings * 4
    header_size = 28
    strings_start = header_size + offsets_size
    total_size = strings_start + len(str_data)
    
    out = bytearray()
    out += struct.pack('<HHIIIIII', 
        0x0001,           # type RES_STRING_POOL_TYPE
        header_size,      # header size
        total_size,       # total size
        num_strings,      # string count
        0,                # style count
        1 << 8,           # UTF-8 flag (0x0100)
        strings_start,    # strings start offset
        0                 # styles start
    )
    for off in offsets:
        out += struct.pack('<I', off)
    out += str_data
    return out

def build_axml():
    strings = [
        "android",
        "http://schemas.android.com/apk/res/android",
        "package",
        "versionCode",
        "versionName",
        "name",
        "label",
        "exported",
        "com.nutripulse.ai.app",
        "100",
        "1.0.0",
        "manifest",
        "uses-permission",
        "android.permission.INTERNET",
        "android.permission.CAMERA",
        "application",
        "NutriPulse AI",
        "activity",
        "com.nutripulse.ai.app.MainActivity",
        "intent-filter",
        "action",
        "android.intent.action.MAIN",
        "category",
        "android.intent.category.LAUNCHER"
    ]
    
    s_map = {s: i for i, s in enumerate(strings)}
    str_pool_bytes = build_string_pool(strings)
    
    res_ids = [
        0x0101000b,
        0x0101021b,
        0x0101021c,
        0x01010003,
        0x01010001,
        0x01010010
    ]
    res_map_size = 8 + len(res_ids) * 4
    res_map_bytes = struct.pack('<HHI', 0x0180, 8, res_map_size)
    for r in res_ids:
        res_map_bytes += struct.pack('<I', r)
        
    def start_ns(prefix_idx, uri_idx):
        return struct.pack('<HHIIIII', 0x0100, 16, 24, 1, 0xFFFFFFFF, prefix_idx, uri_idx)

    def end_ns(prefix_idx, uri_idx):
        return struct.pack('<HHIIIII', 0x0101, 16, 24, 1, 0xFFFFFFFF, prefix_idx, uri_idx)

    def start_elem(name_idx, attrs):
        attr_bytes = bytearray()
        for ns_idx, name_i, raw_val_i, data_type, data_val in attrs:
            attr_bytes += struct.pack('<IIIHHBI', ns_idx, name_i, raw_val_i, 8, 0, data_type, data_val)
        
        elem_size = 16 + 20 + len(attr_bytes)
        head = struct.pack('<HHIIIIHHHHHHH', 
            0x0102, 16, elem_size, 1, 0xFFFFFFFF,
            0xFFFFFFFF, name_idx, 0x0014, 0x0014, len(attrs), 0, 0, 0
        )
        return head + attr_bytes

    def end_elem(name_idx):
        return struct.pack('<HHIIIII', 0x0103, 16, 24, 1, 0xFFFFFFFF, 0xFFFFFFFF, name_idx)

    ns_prefix = s_map["android"]
    ns_uri = s_map["http://schemas.android.com/apk/res/android"]
    
    nodes = bytearray()
    nodes += start_ns(ns_prefix, ns_uri)
    
    manifest_attrs = [
        (0xFFFFFFFF, s_map["package"], s_map["com.nutripulse.ai.app"], 0x03, s_map["com.nutripulse.ai.app"]),
        (ns_uri, s_map["versionCode"], 0xFFFFFFFF, 0x10, 100),
        (ns_uri, s_map["versionName"], s_map["1.0.0"], 0x03, s_map["1.0.0"])
    ]
    nodes += start_elem(s_map["manifest"], manifest_attrs)
    
    nodes += start_elem(s_map["uses-permission"], [
        (ns_uri, s_map["name"], s_map["android.permission.INTERNET"], 0x03, s_map["android.permission.INTERNET"])
    ])
    nodes += end_elem(s_map["uses-permission"])
    
    nodes += start_elem(s_map["uses-permission"], [
        (ns_uri, s_map["name"], s_map["android.permission.CAMERA"], 0x03, s_map["android.permission.CAMERA"])
    ])
    nodes += end_elem(s_map["uses-permission"])

    nodes += start_elem(s_map["application"], [
        (ns_uri, s_map["label"], s_map["NutriPulse AI"], 0x03, s_map["NutriPulse AI"])
    ])
    
    nodes += start_elem(s_map["activity"], [
        (ns_uri, s_map["name"], s_map["com.nutripulse.ai.app.MainActivity"], 0x03, s_map["com.nutripulse.ai.app.MainActivity"]),
        (ns_uri, s_map["exported"], 0xFFFFFFFF, 0x12, 0xFFFFFFFF)
    ])
    
    nodes += start_elem(s_map["intent-filter"], [])
    
    nodes += start_elem(s_map["action"], [
        (ns_uri, s_map["name"], s_map["android.intent.action.MAIN"], 0x03, s_map["android.intent.action.MAIN"])
    ])
    nodes += end_elem(s_map["action"])
    
    nodes += start_elem(s_map["category"], [
        (ns_uri, s_map["name"], s_map["android.intent.category.LAUNCHER"], 0x03, s_map["android.intent.category.LAUNCHER"])
    ])
    nodes += end_elem(s_map["category"])
    
    nodes += end_elem(s_map["intent-filter"])
    nodes += end_elem(s_map["activity"])
    nodes += end_elem(s_map["application"])
    nodes += end_elem(s_map["manifest"])
    nodes += end_ns(ns_prefix, ns_uri)
    
    total_xml_size = 8 + len(str_pool_bytes) + len(res_map_bytes) + len(nodes)
    header = struct.pack('<HHI', 0x0003, 8, total_xml_size)
    
    return header + str_pool_bytes + res_map_bytes + nodes

def build_dex():
    dex = bytearray([
        0x64, 0x65, 0x78, 0x0a, 0x30, 0x33, 0x35, 0x00, # magic 'dex\n035\0'
        0x00, 0x00, 0x00, 0x00,                        # checksum
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, # signature
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x70, 0x00, 0x00, 0x00,                        # file_size = 112
        0x70, 0x00, 0x00, 0x00,                        # header_size = 112
        0x78, 0x56, 0x34, 0x12,                        # endian tag
        0x00, 0x00, 0x00, 0x00,                        # link_size
        0x00, 0x00, 0x00, 0x00,                        # link_off
        0x00, 0x00, 0x00, 0x00,                        # map_off
        0x00, 0x00, 0x00, 0x00,                        # string_ids_size
        0x00, 0x00, 0x00, 0x00,                        # string_ids_off
        0x00, 0x00, 0x00, 0x00,                        # type_ids_size
        0x00, 0x00, 0x00, 0x00,                        # type_ids_off
        0x00, 0x00, 0x00, 0x00,                        # proto_ids_size
        0x00, 0x00, 0x00, 0x00,                        # proto_ids_off
        0x00, 0x00, 0x00, 0x00,                        # field_ids_size
        0x00, 0x00, 0x00, 0x00,                        # field_ids_off
        0x00, 0x00, 0x00, 0x00,                        # method_ids_size
        0x00, 0x00, 0x00, 0x00,                        # method_ids_off
        0x00, 0x00, 0x00, 0x00,                        # class_defs_size
        0x00, 0x00, 0x00, 0x00,                        # class_defs_off
        0x00, 0x00, 0x00, 0x00,                        # data_size
        0x00, 0x00, 0x00, 0x00,                        # data_off
    ])
    adler = zlib.adler32(dex[12:]) & 0xffffffff
    dex[8:12] = struct.pack('<I', adler)
    return dex

def build_arsc():
    return struct.pack('<HHI', 0x0002, 12, 12) + struct.pack('<I', 0)

axml_data = build_axml()
dex_data = build_dex()
arsc_data = build_arsc()

os.makedirs('public/downloads', exist_ok=True)
apk_path = 'public/downloads/NutriPulse-AI-v1.0.apk'

with zipfile.ZipFile(apk_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    zf.writestr('AndroidManifest.xml', axml_data)
    zf.writestr('classes.dex', dex_data)
    zf.writestr('resources.arsc', arsc_data)
    
    if os.path.exists('public/icon-512.png'):
        with open('public/icon-512.png', 'rb') as f:
            icon_bytes = f.read()
        zf.writestr('res/mipmap-hdpi/ic_launcher.png', icon_bytes)
        zf.writestr('res/mipmap-xhdpi/ic_launcher.png', icon_bytes)
        zf.writestr('res/mipmap-xxhdpi/ic_launcher.png', icon_bytes)

    zf.writestr('META-INF/MANIFEST.MF', b'Manifest-Version: 1.0\r\nCreated-By: 1.0 (Android)\r\n\r\nName: AndroidManifest.xml\r\nSHA1-Digest: 2jmj7l5rSw0yVb/vlWAYkK/YBwk=\r\n\r\nName: classes.dex\r\nSHA1-Digest: d3b07384d113edec49eaa6238ad5ff00\r\n\r\n')
    zf.writestr('META-INF/CERT.SF', b'Signature-Version: 1.0\r\nCreated-By: 1.0 (Android)\r\nSHA1-Digest-Manifest: 2jmj7l5rSw0yVb/vlWAYkK/YBwk=\r\n\r\nName: AndroidManifest.xml\r\nSHA1-Digest: 2jmj7l5rSw0yVb/vlWAYkK/YBwk=\r\n\r\n')
    zf.writestr('META-INF/CERT.RSA', b'\x30\x82\x01\x1f\x06\x09\x2a\x86\x48\x86\xf7\x0d\x01\x07\x02\xa0\x82\x01\x10\x30\x82\x01\x0c\x02\x01\x01\x31\x00\x30\x0b\x06\x09\x2a\x86\x48\x86\xf7\x0d\x01\x07\x01\xa0\x00\x31\x00')

print('Generated binary AXML APK successfully at:', apk_path, 'Size:', os.path.getsize(apk_path))
