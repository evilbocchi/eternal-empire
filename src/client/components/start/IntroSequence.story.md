# Intro Sequence Story

This story file provides a preview of the intro sequence where the player wakes up on the shore.

## Features

- **Camera Animation**: Moves through all waypoints (NewBeginningsCamera0-4)
- **Black Screen Fade**: Shows the dramatic black overlay that fades out
- **Player Animations**: Shows the sleeping animation and wake-up transition
- **Sound Effects**: Plays fabric rustle and jump sounds at appropriate times
- **Interactive Controls**: UI controls to play, reset, and adjust the sequence

## Controls

- **Auto Play**: Automatically plays the sequence when enabled
- **Show Black Overlay**: Toggles the black screen fade effect
- **Camera Speed**: Multiplier for sequence timing (1.0 = normal speed)
- **Reset Camera**: Resets the camera and player state

## Usage

1. Open UI Labs in Roblox Studio
2. Find "IntroSequence" in the story list
3. Use the controls to preview different aspects of the sequence
4. Adjust camera speed to slow down or speed up the animation for better preview

## Technical Details

- Uses the same waypoints as the actual intro sequence
- Preserves original camera state for restoration
- Handles player transparency and animation states
- Safe for development/preview (doesn't affect game state)