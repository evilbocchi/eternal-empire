# Quest Snapshot System

The quest snapshot system provides automatic restoration of world instances to their original state when quests are hot reloaded in Studio. This prevents quests from leaving permanent changes to the game world during development.

## Overview

When developing quests that manipulate instances in the world (changing transparency, positions, enabling/disabling components, etc.), you want those changes to be reverted when you hot reload the quest. The snapshot system automatically captures the state of instances before modification and restores them during cleanup.

## How It Works

1. **Snapshot Capture**: When `eatSnapshot()` is called on an instance, the system captures the current values of its properties
2. **Janitor Integration**: The snapshot restoration is registered with the janitor cleanup system via `eat()`
3. **Hot Reload**: When quests are hot reloaded, the janitor is destroyed, which triggers snapshot restoration
4. **Automatic Property Detection**: The system automatically determines which properties to snapshot based on instance type

## Usage

### Basic Usage

Import `eatSnapshot` from the eat module and call it on any instance you plan to modify:

```typescript
import { eatSnapshot } from "shared/hamster/eat";

// Snapshot an instance before modifying it
const myPart = workspace.WaitForChild("MyPart") as BasePart;
eatSnapshot(myPart);
myPart.Transparency = 0.5;
myPart.CanCollide = false;
```

When the janitor is cleaned up (during hot reload), `myPart` will be restored to its original transparency and collision state.

### Quest Integration

The most common use case is in quest `onInit()` and stage `onReached()` callbacks:

```typescript
export = new Quest(script.Name)
    .setName("Example Quest")
    .onInit(() => {
        // Snapshot instances in initialization
        const effect = workspace.FindFirstChild("SpecialEffect") as BasePart;
        eatSnapshot(effect);
        effect.Transparency = 1; // Hide it initially
    })
    .addStage(
        new Stage()
            .setDescription("Do something")
            .onReached((stage) => {
                const prompt = someModel.FindFirstChild("ProximityPrompt") as ProximityPrompt;
                eatSnapshot(prompt);
                prompt.Enabled = true;
                
                return () => {
                    // Stage cleanup - snapshots will be restored automatically
                };
            })
    );
```

### Custom Property Selection

By default, the system snapshots common properties based on instance type:

- **BasePart**: CFrame, Transparency, CanCollide, Anchored, Color
- **Decal**: Texture, Transparency
- **ParticleEmitter/Beam**: Enabled
- **PointLight**: Brightness, Range, Color, Enabled
- **ProximityPrompt**: Enabled

You can specify custom properties to snapshot:

```typescript
eatSnapshot(myPart, ["CFrame", "Size", "BrickColor"]);
```

## Example: ToTheVillage Quest

The ToTheVillage quest demonstrates snapshot usage:

```typescript
import { eatSnapshot } from "shared/hamster/eat";

const instantWinEffects = new Array<BasePart>();
// ... populate array

export = new Quest(script.Name)
    .onInit(() => {
        // Snapshot all instances that will be modified during the quest
        for (const effect of instantWinEffects) {
            eatSnapshot(effect);
            effect.Transparency = 1;
        }
        eatSnapshot(explosionEffect);
        explosionEffect.Enabled = false;
        
        eatSnapshot(instantWinBlock);
        hideInstantWinBlock();
        instantWinBlock.CanCollide = false;
    })
    .addStage(
        new Stage()
            .onReached((stage) => {
                const proximityPrompt = cauldron.WaitForChild("ProximityPrompt") as ProximityPrompt;
                eatSnapshot(proximityPrompt);
                proximityPrompt.Enabled = true;
                // ... rest of stage logic
            })
    );
```

## Direct Snapshot API

For advanced use cases, you can use the snapshot module directly:

```typescript
import { captureSnapshot, restoreSnapshot, restoreAllSnapshots } from "shared/hamster/snapshot";

// Manually capture a snapshot
const snapshot = captureSnapshot(myInstance);

// Manually restore a specific snapshot
restoreSnapshot(snapshot);

// Restore all registered snapshots (called automatically during hot reload)
restoreAllSnapshots();
```

## Best Practices

1. **Call Early**: Call `eatSnapshot()` before modifying an instance's properties
2. **One Per Instance**: You only need to call `eatSnapshot()` once per instance - all subsequent modifications will be reverted
3. **Initialization**: Place `eatSnapshot()` calls in quest `onInit()` for instance modifications that persist across all stages
4. **Stage-Specific**: Place `eatSnapshot()` calls in stage `onReached()` for modifications specific to that stage
5. **No Manual Cleanup**: Don't manually restore snapshots in cleanup functions - the system handles this automatically

## Limitations

- Snapshots only capture property values, not structural changes (adding/removing children)
- Instances that are destroyed during quest execution cannot be restored
- Parent changes are not tracked by default - specify "Parent" in the properties array if needed
- Snapshots are stored in memory - avoid snapshotting thousands of instances at once

## Technical Details

The snapshot system integrates with three key components:

1. **`snapshot.ts`**: Core snapshot capture and restoration logic
2. **`eat.ts`**: Janitor integration via `eatSnapshot()` function  
3. **`Quest.ts`**: Automatic restoration during hot reload via `restoreAllSnapshots()`

When `Quest.HOT_RELOADER.load()` is called, it first calls `restoreAllSnapshots()` to revert all world changes, then initializes the new quest instances.
