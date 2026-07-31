import zlib, struct, zipfile, os

# Let's write a complete minimal valid classes.dex with 1 empty dummy class and a valid map_list
# Map item types:
# 0x0000: HEADER_ITEM
# 0x1000: MAP_LIST
def make_valid_dex():
    # Minimal DEX file bytes with 1 string, 1 type, 1 class def
    # String "Lcom/nutripulse/ai/app/MainActivity;"
    # Header size = 0x70 = 112 bytes
    
    # We can create a valid DEX binary
    header = bytearray(112)
    header[0:8] = b'dex\n035\0'
    header[0x24:0x28] = struct.pack('<I', 0x70) # header_size = 112
    header[0x28:0x2c] = struct.pack('<I', 0x12345678) # endian_tag
    
    # Map list offset
    # Let's build map list after header
    # Header (112) + String IDs (4) + Type IDs (4) + Class Defs (32) + Map List (4 + 5*12) + Strings
    # String 0: "Lcom/nutripulse/ai/app/MainActivity;"
    
    str0 = b'\x24Lcom/nutripulse/ai/app/MainActivity;\x00' # MWEBUTF-8 length 36
    
    header_size = 112
    string_ids_off = header_size
    type_ids_off = string_ids_off + 4
    class_defs_off = type_ids_off + 4
    map_off = class_defs_off + 32
    string_data_off = map_off + (4 + 5 * 12)
    
    # Fill header offsets
    header[0x38:0x40] = struct.pack('<II', 1, string_ids_off) # string_ids
    header[0x40:0x48] = struct.pack('<II', 1, type_ids_off)   # type_ids
    header[0x60:0x68] = struct.pack('<II', 1, class_defs_off) # class_defs
    header[0x34:0x38] = struct.pack('<I', map_off)            # map_off
    
    # String ID 0 points to string_data_off
    string_ids = struct.pack('<I', string_data_off)
    # Type ID 0 points to string index 0
    type_ids = struct.pack('<I', 0)
    
    # Class Def 0:
    # class_idx = 0 (Lcom/nutripulse/ai/app/MainActivity;)
    # access_flags = 1 (PUBLIC)
    # superclass_idx = 0x0FFFFFFF (NO_INDEX)
    # interfaces_off = 0
    # source_file_idx = 0x0FFFFFFF
    # annotations_off = 0
    # class_data_off = 0
    # static_values_off = 0
    class_def = struct.pack('<IIIIIIII', 0, 1, 0xFFFFFFFF, 0, 0xFFFFFFFF, 0, 0, 0)
    
    # Map list
    # items: Header(1), StringId(1), TypeId(1), ClassDef(1), MapList(1)
    map_list = struct.pack('<I', 5)
    map_list += struct.pack('<HHII', 0x0000, 0, 1, 0)             # HEADER_ITEM
    map_list += struct.pack('<HHII', 0x0001, 0, 1, string_ids_off) # STRING_ID_ITEM
    map_list += struct.pack('<HHII', 0x0002, 0, 1, type_ids_off)   # TYPE_ID_ITEM
    map_list += struct.pack('<HHII', 0x0006, 0, 1, class_defs_off) # CLASS_DEF_ITEM
    map_list += struct.pack('<HHII', 0x1000, 0, 1, map_off)        # MAP_LIST
    
    dex = header + string_ids + type_ids + class_def + map_list + str0
    
    # Set file size in header
    file_size = len(dex)
    dex[0x20:0x24] = struct.pack('<I', file_size)
    
    # Calculate SHA1 signature (bytes 12..32)
    import hashlib
    sha1 = hashlib.sha1(dex[32:]).digest()
    dex[12:32] = sha1
    
    # Calculate Adler32 checksum (bytes 8..12)
    adler = zlib.adler32(dex[12:]) & 0xffffffff
    dex[8:12] = struct.pack('<I', adler)
    
    return dex

dex = make_valid_dex()
print('Constructed DEX length:', len(dex), 'Adler32:', hex(zlib.adler32(dex)))
