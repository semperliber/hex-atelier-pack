// Pass 37: withhold vanilla duplication; leave ordinary item giving intact.
ItemEvents.entityInteracted('minecraft:amethyst_shard', event => {
  const allay = event.target
  if (allay.type !== 'minecraft:allay' || !allay.isDancing()) return

  // Vanilla's canDuplicate() is private. Its exact flag is saved as CanDuplicate.
  if (allay.nbt.getBoolean('CanDuplicate')) event.cancel()
})
