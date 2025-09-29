export default function isPlacedItemUnusable(modelInfo: InstanceInfo): boolean {
    return modelInfo.Broken === true || modelInfo.Maintained === false;
}
