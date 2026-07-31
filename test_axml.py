import struct, zlib, zipfile, os, hashlib

def build_utf16_string_pool(strings):
    offsets = []
    str_data = bytearray()
    for s in strings:
        offsets.append(len(str_data))
        encoded = s.encode('utf-16le')
        char_len = len(s)
        # Length in UTF-16: uint16 char_len
        str_data += struct.pack('<H', char_len)
        str_data += encoded
        str_data += struct.pack('<H', 0) # null terminator
        
    while len(str_data) % 4 != 0:
        str_data += b'\x00'
        
    num_strings = len(strings)
    offsets_bytes = b''.join([struct.pack('<I', off) for off in offsets])
    header_size = 28
    strings_start = header_size + len(offsets_bytes)
    total_size = strings_start + len(str_data)
    
    header = struct.pack('<HHIIIIII', 
        0x0001,        # RES_STRING_POOL_TYPE
        header_size,   # headerSize
        total_size,    # total size
        num_strings,   # stringCount
        0,             # styleCount
        0,             # flags (UTF-16)
        strings_start, # stringsStart
        0              # stylesStart
    )
    return header + offsets_bytes + str_data

# Test string pool creation
pool = build_utf16_string_pool(["android", "http://schemas.android.com/apk/res/android", "manifest"])
print('UTF16 String pool size:', len(pool))
