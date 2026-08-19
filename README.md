# ESP32 Image → C Array Converter

A browser-based tool that converts PNG/JPG/WEBP/BMP images into **RGB565 C arrays** for ESP32 TFT projects.

## Live site

After enabling GitHub Pages:

`https://YOUR-USERNAME.github.io/esp32-image-to-c-array/`

## v1.0.0 features

- Image upload / drag & drop
- Local browser-side processing
- RGB565 conversion
- ILI9341, ST7735 and ST7789 presets
- Custom width and height
- Fit / crop / stretch modes
- Rotation
- Optional RGB565 byte swapping
- Optional `PROGMEM`
- Memory-size estimate
- Live preview
- Copy generated C code
- Download `.h`
- Download a TFT_eSPI `.ino` example

## Privacy

Images are processed locally in the browser. The image is not uploaded to a backend server.

## GitHub Pages

1. Push these files to a public GitHub repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select `main` and `/ (root)`.
5. Save and wait for GitHub Pages to publish the site.

## Output

The converter generates an array similar to:

```cpp
#include <pgmspace.h>

const uint16_t image_rgb565[] PROGMEM = {
  0xFFFF, 0xF800, 0x07E0, 0x001F
};
```

For TFT_eSPI, the array can be drawn with:

```cpp
tft.pushImage(0, 0, 240, 320, image_rgb565);
```

## Notes

The v1.0.0 output is intended for RGB565-compatible TFT drawing APIs. The exact TFT controller setup and wiring are still configured in the Arduino display library.

## Roadmap

### v1.1
- More TFT controller presets
- Better orientation handling
- Optional C/C++ output formatting controls

### v1.2
- Complete Arduino sketch generator
- Adafruit_GFX support
- LovyanGFX support

### v2.0
- GIF/frame conversion
- Video → TFT frames
- Animation generation
- SD-card output
- Larger asset optimization

## License

MIT
