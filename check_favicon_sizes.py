#!/usr/bin/env python3

import os
from PIL import Image

def check_favicon_sizes(folder_path):
    """Check the dimensions of favicon images in the specified folder."""
    favicon_sizes = {
        'favicon.ico': 'Variable (usually 16x16, 32x32, 48x48)',
        'favicon-16x16.png': '16x16',
        'favicon-32x32.png': '32x32',
        'favicon-48x48.png': '48x48',
        'favicon-60x60.png': '60x60',
        'favicon-128x128.png': '128x128',
        'favicon-192x192.png': '192x192',
        'favicon-256x256.png': '256x256',
        'favicon-512x512.png': '512x512',
        'apple-touch-icon.png': '180x180',
        'android-chrome-192x192.png': '192x192',
        'android-chrome-512x512.png': '512x512',
    }
    
    results = {}
    
    for filename in os.listdir(folder_path):
        if filename.endswith(('.png', '.ico')):
            filepath = os.path.join(folder_path, filename)
            try:
                if filename.endswith('.ico'):
                    # Handle ICO files (ICO format can contain multiple images)
                    img = Image.open(filepath)
                    width, height = img.size
                    results[filename] = f"{width}x{height} (ICO format, may contain multiple images)"
                else:
                    img = Image.open(filepath)
                    width, height = img.size
                    results[filename] = f"{width}x{height}"
            except Exception as e:
                results[filename] = f"Error: {str(e)}"
    
    return results

if __name__ == "__main__":
    folder_path = r"d:\software tools\dizi-store\public\icons"
    favicon_results = check_favicon_sizes(folder_path)
    
    print("Favicon Size Report:")
    print("-" * 40)
    for filename, size in favicon_results.items():
        print(f"{filename}: {size}")
        
    print("-" * 40)
    print("Expected Sizes:")
    for filename, expected_size in favicon_sizes.items():
        print(f"{filename}: {expected_size}")