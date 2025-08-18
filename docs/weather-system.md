---
title: Weather System
---

# Weather System

## Overview
The weather system provides four weather types that affect dropper rates and droplet values globally across all servers.

## Weather Types

### 1. Clear Weather
- **Drop Rate**: 1x (normal)
- **Droplet Value**: 1x (normal)
- **Visual Effects**: Standard lighting

### 2. Cloudy Weather
- **Drop Rate**: 0.75x (reduced)
- **Droplet Value**: 1x (normal)
- **Visual Effects**: Dimmed lighting, increased fog

### 3. Rainy Weather
- **Drop Rate**: 0.5x (heavily reduced)
- **Droplet Value**: 2.5x (significantly boosted)
- **Visual Effects**: Rain particles, darker lighting, fog effects

### 4. Thunderstorm Weather
- **Drop Rate**: 0.5x (heavily reduced)
- **Droplet Value**: 2.5x (significantly boosted)
- **Lightning Strikes**: Random strikes that give 10x value boost to hit droplets
- **Visual Effects**: Rain particles, lightning bolts, thunder sounds, very dark lighting

## Global Synchronization
- Uses deterministic seed based on UTC time rounded to nearest hour
- Weather cycles every 5 minutes with different durations for each type
- All servers experience the same weather at the same time
- Prevents server-hopping abuse