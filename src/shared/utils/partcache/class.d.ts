export interface PartCache<T extends BasePart = BasePart> {
	/**
	 * Gets a part from the cache that isn't currently in use. If there are no more parts in the cache, it will send a warning to the output and add a new part to the cache.
	 */
	GetPart(): T;

	/**
	  * Returns a part to the cache after you're done using it. Automatically CFrames it to a location far away. This will throw an error if the part passed in to the function was not part of the cache's in-use list (either by passing in a part that has already been returned to the cache or a part that was never a member of the cache in the first place).
	  */
	ReturnPart(part: T): void;

	/**
	 * @deprecated
	 * Use PCache::ReturnPart instead.
	 */
	DestroyPart(part: T): void;

	/**
	 * Sets the parent of all cached parts to the specified instance. Errors if the parent is not an Instance, errors if the parent is nil, errors if the cached parts will not be a descendant of Workspace.
	 */
	SetCacheParent(Parent: Instance): void;

	/**
	 * Deletes all cached parts regardless of if they are in use or available, then removes the cache object itself. Attempting to call any methods or functions of the cache will throw an error.
	 */
	Dispose(): void;
}