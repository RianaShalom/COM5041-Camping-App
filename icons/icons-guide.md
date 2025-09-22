# Weather Icons Guide

This document shows the mapping between WMO weather codes and weather icons used in the camping app.

## Weather Code Mappings

### Clear/Sunny Conditions
- **0** → `clear@4x.png` (Clear sky)
- **1** → `mostly-clear@4x.png` (Mainly clear)
- **2** → `partly-cloudy@4x.png` (Partly cloudy)

### Cloudy Conditions
- **3** → `overcast@4x.png` (Overcast)

### Fog
- **45** → `fog@4x.png` (Fog)
- **48** → `rime-fog@4x.png` (Depositing rime fog)

### Drizzle
- **51** → `light-drizzle@4x.png` (Drizzle: Light intensity)
- **53** → `moderate-drizzle@4x.png` (Drizzle: Moderate intensity)
- **55** → `dense-drizzle@4x.png` (Drizzle: Dense intensity)
- **56** → `light-freezing-drizzle@4x.png` (Freezing Drizzle: Light intensity)
- **57** → `dense-freezing-drizzle@4x.png` (Freezing Drizzle: Dense intensity)

### Rain
- **61** → `light-rain@4x.png` (Rain: Slight intensity)
- **63** → `moderate-rain@4x.png` (Rain: Moderate intensity)
- **65** → `heavy-rain@4x.png` (Rain: Heavy intensity)
- **66** → `light-freezing-rain@4x.png` (Freezing Rain: Light intensity)
- **67** → `heavy-freezing-rain@4x.png` (Freezing Rain: Heavy intensity)

### Snow
- **71** → `slight-snowfall@4x.png` (Snow fall: Slight intensity)
- **73** → `moderate-snowfall@4x.png` (Snow fall: Moderate intensity)
- **75** → `heavy-snowfall@4x.png` (Snow fall: Heavy intensity)
- **77** → `snowflake@4x.png` (Snow grains)

### Rain Showers
- **80** → `light-rain@4x.png` (Rain showers: Slight)
- **81** → `moderate-rain@4x.png` (Rain showers: Moderate)
- **82** → `heavy-rain@4x.png` (Rain showers: Violent)

### Snow Showers
- **85** → `slight-snowfall@4x.png` (Snow showers: Slight)
- **86** → `heavy-snowfall@4x.png` (Snow showers: Heavy)

### Thunderstorms
- **95** → `thunderstorm@4x.png` (Thunderstorm: Slight or moderate)
- **96** → `thunderstorm-with-hail@4x.png` (Thunderstorm with slight hail)
- **99** → `thunderstorm-with-hail@4x.png` (Thunderstorm with heavy hail)

### Default Fallback
- **Any unmapped code** → `clear@4x.png` (fallback)

---

## Notes

- Weather codes are based on WMO (World Meteorological Organization) weather interpretation codes
- Icons are provided by the OpenMeteo API weather service
- All icons are in 4x resolution (@4x.png)
- Icons are displayed at 20x20 pixels in the web interface

## Usage

The weather icons are automatically displayed in the camping app when viewing saved campsites. The app fetches weather data from OpenMeteo and maps the weather codes to the appropriate icons for visual display.
