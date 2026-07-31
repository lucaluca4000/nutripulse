import struct

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

def build_resources_arsc():
    # Global string pool (empty or contains app name)
    global_strings = ["NutriPulse AI"]
    global_sp = build_utf16_string_pool(global_strings)
    
    # Package chunk
    # Type string pool ("drawable", "string")
    type_sp = build_utf16_string_pool(["drawable", "string"])
    # Key string pool ("ic_launcher", "app_name")
    key_sp = build_utf16_string_pool(["ic_launcher", "app_name"])
    
    pkg_name = "com.nutripulse.ai.app".encode('utf-16le')
    pkg_name_bytes = pkg_name + b'\x00' * (256 - len(pkg_name))
    
    pkg_header_size = 288
    type_strings_start = pkg_header_size
    key_strings_start = type_strings_start + len(type_sp)
    
    pkg_total_size = key_strings_start + len(key_sp)
    
    pkg_chunk = struct.pack('<HHII', 0x0200, pkg_header_size, pkg_total_size, 0x7F) # type 0x0200 RES_TABLE_PACKAGE_TYPE
    pkg_chunk += pkg_name_bytes
    pkg_chunk += struct.pack('<IIII', type_strings_start, 0, key_strings_start, 0)
    pkg_chunk += type_sp
    pkg_chunk += key_sp
    
    total_size = 12 + len(global_sp) + len(pkg_chunk)
    header = struct.pack('<HHI', 0x0002, 12, total_size) + struct.pack('<I', 1)
    
    return header + global_sp + pkg_chunk

arsc = build_resources_arsc()
print('Binary resources.arsc size:', len(arsc))
