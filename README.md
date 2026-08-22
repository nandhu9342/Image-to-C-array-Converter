# Image to C Array Converter for ESP32 TFT

A browser-based image conversion and code-generation tool for ESP32-based TFT display projects.

This project converts user-selected images into **RGB565 hexadecimal pixel data**, generates a corresponding C/C++ header file, and creates a complete Arduino-compatible ESP32 TFT project based on the selected ESP32 board, TFT display, resolution, orientation, and GPIO configuration.

The primary objective is to simplify the process of displaying custom images on SPI TFT displays using ESP32 microcontrollers without manually converting images or writing the display initialization code.



# Project Overview

Displaying custom images on an embedded TFT display normally requires several manual steps:

1. Resize the image to match the TFT resolution.
2. Convert the image into a suitable pixel format.
3. Convert RGB data into RGB565.
4. Generate a C/C++ array.
5. Store the image data in program memory.
6. Configure the TFT display driver.
7. Configure SPI pins.
8. Configure CS, DC and RST pins.
9. Write the Arduino display code.
10. Organize the generated `.ino` and `.h` files correctly.

This project automates the complete process.


# Connections 

| TFT DISPLAY | ESP32 BOARD | ABOUT |
|-------------|-------------|-------|
|     VCC     |     3.3V    | POWER SUPPLY |
|     GND     |    GND      | GROUND |
|     CS      |   GPIO15    |CHIP SELECT - YOU CAN BE CHANGE BY SETTINGS |
|     RST     |    GPTO2    | RESET - YOU CAN BE CHANGE BY SETTINGS |
|     DC      |    GPIO0    | DATA COMMAND - YOU CAN BE CHANGE BY SETTINGS |
|  MOSI/SDA   |   GPIO13    |DATA - USE DEFAULT MOSI/SDA PIN |
|   SCL/CLK   |   GPIO14    | CLOCK - USE DEFAULT SCL/SCK PIN |
|     LED     |    3.3V     |     BACKLIGHT            |





The user only needs to:

```text
Upload Image
      ↓
Select ESP32 Board
      ↓
Select TFT Display
      ↓
Configure GPIO Pins
      ↓
Generate Code
      ↓
Download Project
      ↓
Open in Arduino IDE
      ↓
Upload to ESP32
      ↓
Display Imag
