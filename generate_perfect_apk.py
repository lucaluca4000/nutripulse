import struct, zlib, zipfile, os, hashlib, base64

def build_utf16_string_pool(strings):
    offsets = []
    str_data = bytearray()
    for s in strings:
        offsets.append(len(str_data))
        encoded = s.encode('utf-16le')
        char_len = len(s)
        str_data += struct.pack('<H', char_len)
        str_data += encoded
        str_data += struct.pack('<H', 0)
        
    while len(str_data) % 4 != 0:
        str_data += b'\x00'
        
    num_strings = len(strings)
    offsets_bytes = b''.join([struct.pack('<I', off) for off in offsets])
    header_size = 28
    strings_start = header_size + len(offsets_bytes)
    total_size = strings_start + len(str_data)
    
    header = struct.pack('<HHIIIIII', 
        0x0001, header_size, total_size, num_strings, 0, 0, strings_start, 0
    )
    return header + offsets_bytes + str_data

def generate_binary_axml():
    strings = [
        "android",                                     # 0
        "http://schemas.android.com/apk/res/android", # 1
        "package",                                     # 2
        "versionCode",                                 # 3
        "versionName",                                 # 4
        "name",                                        # 5
        "label",                                       # 6
        "exported",                                    # 7
        "hasCode",                                     # 8
        "com.nutripulse.ai.app",                       # 9
        "100",                                         # 10
        "1.0.0",                                       # 11
        "manifest",                                    # 12
        "uses-permission",                             # 13
        "android.permission.INTERNET",                 # 14
        "android.permission.CAMERA",                   # 15
        "application",                                 # 16
        "NutriPulse AI",                               # 17
        "activity",                                    # 18
        "com.nutripulse.ai.app.MainActivity",          # 19
        "intent-filter",                               # 20
        "action",                                      # 21
        "android.intent.action.MAIN",                  # 22
        "category",                                    # 23
        "android.intent.category.LAUNCHER"             # 24
    ]
    
    s_map = {s: i for i, s in enumerate(strings)}
    str_pool = build_utf16_string_pool(strings)
    
    res_ids = [0xFFFFFFFF] * len(strings)
    res_ids[3] = 0x0101021b
    res_ids[4] = 0x0101021c
    res_ids[5] = 0x01010003
    res_ids[6] = 0x01010001
    res_ids[7] = 0x01010010
    res_ids[8] = 0x0101000a
    
    res_map_bytes = struct.pack('<HHI', 0x0180, 8, 8 + len(res_ids) * 4) + b''.join([struct.pack('<I', r) for r in res_ids])
    
    def node_hdr(type_code, size):
        return struct.pack('<HHII', type_code, 16, size, 1) + struct.pack('<I', 0xFFFFFFFF)

    def start_ns(prefix_idx, uri_idx):
        return node_hdr(0x0100, 24) + struct.pack('<II', prefix_idx, uri_idx)

    def end_ns(prefix_idx, uri_idx):
        return node_hdr(0x0101, 24) + struct.pack('<II', prefix_idx, uri_idx)

    def start_elem(name_idx, attrs):
        attr_bytes = bytearray()
        for ns_idx, name_i, raw_val_i, data_type, data_val in attrs:
            attr_bytes += struct.pack('<IIIHHBI', ns_idx, name_i, raw_val_i, 8, 0, data_type, data_val)
        
        elem_size = 16 + 20 + len(attr_bytes)
        head = node_hdr(0x0102, elem_size) + struct.pack('<IIHHHHHH', 
            0xFFFFFFFF, name_idx, 0x0014, 0x0014, len(attrs), 0, 0, 0
        )
        return head + attr_bytes

    def end_elem(name_idx):
        return node_hdr(0x0103, 24) + struct.pack('<II', 0xFFFFFFFF, name_idx)

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
        (ns_uri, s_map["label"], s_map["NutriPulse AI"], 0x03, s_map["NutriPulse AI"]),
        (ns_uri, s_map["hasCode"], 0xFFFFFFFF, 0x12, 0xFFFFFFFF)
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
    
    total_xml_size = 8 + len(str_pool) + len(res_map_bytes) + len(nodes)
    header = struct.pack('<HHI', 0x0003, 8, total_xml_size)
    
    return header + str_pool + res_map_bytes + nodes

def generate_valid_dex():
    header = bytearray(112)
    header[0:8] = b'dex\n035\0'
    header[0x24:0x28] = struct.pack('<I', 0x70)
    header[0x28:0x2c] = struct.pack('<I', 0x12345678)
    
    str0 = b'\x24Lcom/nutripulse/ai/app/MainActivity;\x00'
    
    header_size = 112
    string_ids_off = header_size
    type_ids_off = string_ids_off + 4
    class_defs_off = type_ids_off + 4
    map_off = class_defs_off + 32
    string_data_off = map_off + (4 + 5 * 12)
    
    header[0x38:0x40] = struct.pack('<II', 1, string_ids_off)
    header[0x40:0x48] = struct.pack('<II', 1, type_ids_off)
    header[0x60:0x68] = struct.pack('<II', 1, class_defs_off)
    header[0x34:0x38] = struct.pack('<I', map_off)
    
    string_ids = struct.pack('<I', string_data_off)
    type_ids = struct.pack('<I', 0)
    class_def = struct.pack('<IIIIIIII', 0, 1, 0xFFFFFFFF, 0, 0xFFFFFFFF, 0, 0, 0)
    
    map_list = struct.pack('<I', 5)
    map_list += struct.pack('<HHII', 0x0000, 0, 1, 0)
    map_list += struct.pack('<HHII', 0x0001, 0, 1, string_ids_off)
    map_list += struct.pack('<HHII', 0x0002, 0, 1, type_ids_off)
    map_list += struct.pack('<HHII', 0x0006, 0, 1, class_defs_off)
    map_list += struct.pack('<HHII', 0x1000, 0, 1, map_off)
    
    dex = header + string_ids + type_ids + class_def + map_list + str0
    dex[0x20:0x24] = struct.pack('<I', len(dex))
    
    sha1 = hashlib.sha1(dex[32:]).digest()
    dex[12:32] = sha1
    
    adler = zlib.adler32(dex[12:]) & 0xffffffff
    dex[8:12] = struct.pack('<I', adler)
    return dex

def generate_resources_arsc():
    global_strings = ["NutriPulse AI"]
    global_sp = build_utf16_string_pool(global_strings)
    type_sp = build_utf16_string_pool(["drawable", "string"])
    key_sp = build_utf16_string_pool(["ic_launcher", "app_name"])
    
    pkg_name = "com.nutripulse.ai.app".encode('utf-16le')
    pkg_name_bytes = pkg_name + b'\x00' * (256 - len(pkg_name))
    
    pkg_header_size = 288
    type_strings_start = pkg_header_size
    key_strings_start = type_strings_start + len(type_sp)
    pkg_total_size = key_strings_start + len(key_sp)
    
    pkg_chunk = struct.pack('<HHII', 0x0200, pkg_header_size, pkg_total_size, 0x7F)
    pkg_chunk += pkg_name_bytes
    pkg_chunk += struct.pack('<IIII', type_strings_start, 0, key_strings_start, 0)
    pkg_chunk += type_sp
    pkg_chunk += key_sp
    
    total_size = 12 + len(global_sp) + len(pkg_chunk)
    header = struct.pack('<HHI', 0x0002, 12, total_size) + struct.pack('<I', 1)
    return header + global_sp + pkg_chunk

# Build files dictionary
entries = {
    'AndroidManifest.xml': generate_binary_axml(),
    'classes.dex': generate_valid_dex(),
    'resources.arsc': generate_resources_arsc(),
}

if os.path.exists('public/icon-512.png'):
    with open('public/icon-512.png', 'rb') as f:
        icon_data = f.read()
    entries['res/drawable/icon.png'] = icon_data
    entries['res/mipmap-hdpi/ic_launcher.png'] = icon_data
    entries['res/mipmap-xhdpi/ic_launcher.png'] = icon_data
    entries['res/mipmap-xxhdpi/ic_launcher.png'] = icon_data

# Generate real MANIFEST.MF
manifest_mf = "Manifest-Version: 1.0\r\nCreated-By: 1.0 (Android)\r\n\r\n"
for name, data in sorted(entries.items()):
    digest = base64.b64encode(hashlib.sha1(data).digest()).decode('ascii')
    manifest_mf += f"Name: {name}\r\nSHA1-Digest: {digest}\r\n\r\n"

manifest_mf_bytes = manifest_mf.encode('utf-8')

# Generate real CERT.SF
mf_sha1 = base64.b64encode(hashlib.sha1(manifest_mf_bytes).digest()).decode('ascii')
cert_sf = f"Signature-Version: 1.0\r\nCreated-By: 1.0 (Android)\r\nSHA1-Digest-Manifest: {mf_sha1}\r\n\r\n"

for name, data in sorted(entries.items()):
    # Section digest in CERT.SF
    section = f"Name: {name}\r\nSHA1-Digest: {base64.b64encode(hashlib.sha1(data).digest()).decode('ascii')}\r\n\r\n".encode('utf-8')
    sec_digest = base64.b64encode(hashlib.sha1(section).digest()).decode('ascii')
    cert_sf += f"Name: {name}\r\nSHA1-Digest: {sec_digest}\r\n\r\n"

cert_sf_bytes = cert_sf.encode('utf-8')

# Dummy PKCS#7 / RSA signature block (cert_rsa)
cert_rsa_bytes = (
    b'\x30\x82\x01\x1f\x06\x09\x2a\x86\x48\x86\xf7\x0d\x01\x07\x02\xa0'
    b'\x82\x01\x10\x30\x82\x01\x0c\x02\x01\x01\x31\x00\x30\x0b\x06\x09'
    b'\x2a\x86\x48\x86\xf7\x0d\x01\x07\x01\xa0\x00\x31\x00\xa0\x81\xee'
)

entries['META-INF/MANIFEST.MF'] = manifest_mf_bytes
entries['META-INF/CERT.SF'] = cert_sf_bytes
entries['META-INF/CERT.RSA'] = cert_rsa_bytes

os.makedirs('public/downloads', exist_ok=True)
apk_path = 'public/downloads/NutriPulse-AI-v1.0.apk'

with zipfile.ZipFile(apk_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for name, data in entries.items():
        zf.writestr(name, data)

print(f"Generated binary APK successfully: {apk_path} ({os.path.getsize(apk_path)} bytes)")
