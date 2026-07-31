import struct, zlib, zipfile, os, hashlib

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
        0x0001,
        header_size,
        total_size,
        num_strings,
        0,
        0,
        strings_start,
        0
    )
    return header + offsets_bytes + str_data

def generate_binary_axml():
    # List of all strings used in AndroidManifest.xml
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
    
    # Resource Map for attribute name strings:
    # index 2: package (no res_id)
    # index 3: versionCode (0x0101021b)
    # index 4: versionName (0x0101021c)
    # index 5: name (0x01010003)
    # index 6: label (0x01010001)
    # index 7: exported (0x01010010)
    # index 8: hasCode (0x0101000a)
    
    res_ids = [0xFFFFFFFF] * len(strings)
    res_ids[3] = 0x0101021b
    res_ids[4] = 0x0101021c
    res_ids[5] = 0x01010003
    res_ids[6] = 0x01010001
    res_ids[7] = 0x01010010
    res_ids[8] = 0x0101000a
    
    res_map_bytes = struct.pack('<HHI', 0x0180, 8, 8 + len(res_ids) * 4) + b''.join([struct.pack('<I', r) for r in res_ids])
    
    # XML tree nodes helpers
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
    
    # <manifest package="com.nutripulse.ai.app" versionCode="100" versionName="1.0.0">
    manifest_attrs = [
        (0xFFFFFFFF, s_map["package"], s_map["com.nutripulse.ai.app"], 0x03, s_map["com.nutripulse.ai.app"]),
        (ns_uri, s_map["versionCode"], 0xFFFFFFFF, 0x10, 100),
        (ns_uri, s_map["versionName"], s_map["1.0.0"], 0x03, s_map["1.0.0"])
    ]
    nodes += start_elem(s_map["manifest"], manifest_attrs)
    
    # <uses-permission android:name="android.permission.INTERNET" />
    nodes += start_elem(s_map["uses-permission"], [
        (ns_uri, s_map["name"], s_map["android.permission.INTERNET"], 0x03, s_map["android.permission.INTERNET"])
    ])
    nodes += end_elem(s_map["uses-permission"])
    
    # <uses-permission android:name="android.permission.CAMERA" />
    nodes += start_elem(s_map["uses-permission"], [
        (ns_uri, s_map["name"], s_map["android.permission.CAMERA"], 0x03, s_map["android.permission.CAMERA"])
    ])
    nodes += end_elem(s_map["uses-permission"])

    # <application android:label="NutriPulse AI" android:hasCode="true">
    nodes += start_elem(s_map["application"], [
        (ns_uri, s_map["label"], s_map["NutriPulse AI"], 0x03, s_map["NutriPulse AI"]),
        (ns_uri, s_map["hasCode"], 0xFFFFFFFF, 0x12, 0xFFFFFFFF)
    ])
    
    # <activity android:name="com.nutripulse.ai.app.MainActivity" android:exported="true">
    nodes += start_elem(s_map["activity"], [
        (ns_uri, s_map["name"], s_map["com.nutripulse.ai.app.MainActivity"], 0x03, s_map["com.nutripulse.ai.app.MainActivity"]),
        (ns_uri, s_map["exported"], 0xFFFFFFFF, 0x12, 0xFFFFFFFF)
    ])
    
    # <intent-filter>
    nodes += start_elem(s_map["intent-filter"], [])
    
    # <action android:name="android.intent.action.MAIN" />
    nodes += start_elem(s_map["action"], [
        (ns_uri, s_map["name"], s_map["android.intent.action.MAIN"], 0x03, s_map["android.intent.action.MAIN"])
    ])
    nodes += end_elem(s_map["action"])
    
    # <category android:name="android.intent.category.LAUNCHER" />
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

axml = generate_binary_axml()
print('Full Binary AXML Size:', len(axml))
