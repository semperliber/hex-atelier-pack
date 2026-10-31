// Hex Atelier: Hex Wright 2.0.0 loot scope (passes 21 and 39).
// Edit JSON before loot functions run: do not roll/stamp/release cut rewards.
// Keep surviving entries, rolls, conditions and functions verbatim. Remove a
// pool only after every entry is cut. No tags, discovery keys or saves change.
// Compiled Forge/display/remnant routes remain outside this hook (SELECTION39).

const HEX_ATELIER_FIXED_GEAR = [
  'eternal_war_hammer', 'eternal_battle_axe', 'eternal_great_sword',
  'eternal_odachi', 'eternal_scythe', 'eternal_wakizashi', 'eternal_bow',
  'starfall_bow', 'frostbite', 'king_of_purgatory', 'silver_starlight',
  'ring_of_negation', 'ring_of_reprisal', 'talisman_of_reprieve',
  'mantle_of_ascension', 'hat_of_ascension', 'cape_of_passage', 'hat_of_passage',
  'veilwalker_gem', 'cantor_gem', 'hexwarden_gem', 'augur_gem',
  'venator_crystal', 'domitor_gem',
  'veilwalker_netherite_chestplate', 'cantor_netherite_chestplate',
  'hexwarden_netherite_chestplate', 'augur_netherite_chestplate',
  'venator_netherite_chestplate', 'domitor_netherite_chestplate',
  'golem_power_orb', 'cat_power_orb', 'guardian_power_orb',
  'sanctuary_power_orb', 'teeth_power_orb', 'dust_power_orb', 'web_ball',
  'necromancer_sword', 'spider_bow', 'forge_hammer'
].map(id => 'hexwright:' + id)

;['crude', 'sound', 'fine', 'exquisite', 'masterwork'].forEach(grade => {
  ;['battle_axe', 'battle_hammer', 'duelist_short_sword', 'archer_great_bow'].forEach(item => {
    HEX_ATELIER_FIXED_GEAR.push('hexwright:' + grade + '_' + item)
  })
})

// Counts are entry leaves and emptied pools in the pinned release, not rolls.
// Ordinary keys and all three artifact-broom entries deliberately survive.
const HEX_ATELIER_CHEST_LOOT_CUTS = {
  'hexwright:boss_spoils': { items: ['hexwright:artifact_ruined_tablet'], entries: 1, pools: 1 },
  'hexwright:deep_dungeon': { items: HEX_ATELIER_FIXED_GEAR, entries: 40, pools: 11 },
  'hexwright:quartz_golem_wright': { items: HEX_ATELIER_FIXED_GEAR, entries: 35, pools: 3 },
  'hexwright:boss_artifacts': { items: HEX_ATELIER_FIXED_GEAR, orbs: true, artifactKey: true, entries: 19, pools: 0 },
  'hexwright:boss_spoils/ancient_golem': { items: ['hexwright:divinity'], entries: 1, pools: 1 },
  'hexwright:boss_spoils/cog_sentinel': { items: ['hexwright:absolution', 'hexwright:forge_hammer'], entries: 2, pools: 2 },
  'hexwright:boss_spoils/magnus': { items: ['hexwright:dragonborn_broadsword'], entries: 1, pools: 1 },
  'hexwright:boss_spoils/talus_knight': { items: ['hexwright:abyss_cleaver'], entries: 1, pools: 1 },
  'hexwright:boss_spoils/tower_skeleton': { items: ['hexwright:shadow_monarch', 'hexwright:necromancer_sword'], entries: 2, pools: 2 },
  'hexwright:boss_spoils/wither_storm': { items: ['hexwright:pestiferous', 'hexwright:spider_bow'], entries: 2, pools: 2 }
}

const HEX_ATELIER_ENTITY_LOOT_CUTS = {
  'hexwright:ancient_golem': { items: HEX_ATELIER_FIXED_GEAR, orbs: true, entries: 14, pools: 4 },
  'hexwright:cog_sentinel': { items: [], orbs: true, entries: 1, pools: 1 },
  'hexwright:corrupt_experiment': { items: [], orbs: true, entries: 1, pools: 1 },
  'hexwright:runestone_titan': { items: [], orbs: true, entries: 1, pools: 1 },
  'hexwright:wither_storm': { items: [], orbs: true, entries: 1, pools: 1 }
}

function hexAtelierEntryIsCut(entry, cut) {
  if (!entry.isJsonObject()) return false
  entry = entry.getAsJsonObject()
  if (!entry.has('type') || !entry.has('name')) return false
  let type = String(entry.get('type').getAsString())
  let name = String(entry.get('name').getAsString())
  if (type === 'minecraft:tag') return cut.orbs === true && name === 'hexwright:power_orbs'
  if (type !== 'minecraft:item') return false
  if (cut.items.indexOf(name) >= 0) return true
  if (cut.artifactKey !== true || name !== 'hexwright:vault_key' || !entry.has('functions')) return false
  // Exact upstream fresh-key payload, not grade-only ordinary/bound keys.
  let functions = entry.get('functions').getAsJsonArray()
  let fn = null
  for (let i = 0; i < functions.size(); i++) {
    fn = functions.get(i).getAsJsonObject()
    if (fn.has('function') && String(fn.get('function').getAsString()) === 'minecraft:set_nbt' &&
        fn.has('tag') && String(fn.get('tag').getAsString()) === '{Grade:"MASTERWORK",Artifact:1b}') return true
  }
  return false
}

function hexAtelierEditLoot(event, cuts) {
  Object.keys(cuts).forEach(id => {
    const cut = cuts[id]
    event.modify(id, table => {
      let removedEntries = 0
      let removedPools = 0
      let pool = null
      let entries = null
      let poolRemovedEntries = 0
      try {
        for (let i = table.pools.size() - 1; i >= 0; i--) {
          pool = table.pools.get(i).getAsJsonObject()
          if (!pool.has('entries')) continue
          entries = pool.get('entries').getAsJsonArray()
          poolRemovedEntries = 0
          for (let j = entries.size() - 1; j >= 0; j--) {
            if (hexAtelierEntryIsCut(entries.get(j), cut)) {
              // Gson overloads: explicit int avoids silent remove(JsonElement).
              entries['remove(int)'](j)
              removedEntries++
              poolRemovedEntries++
            }
          }
          if (poolRemovedEntries > 0 && entries.size() === 0) {
            table.pools['remove(int)'](i)
            removedPools++
          }
        }
      } catch (err) {
        // Failure leaves upstream or partially edited loot; never claim closed.
        console.error(`Hex Atelier loot scope: FAILED to edit ${id}; cut items may be obtainable: ${err}`)
        return
      }
      if (removedEntries !== cut.entries || removedPools !== cut.pools) {
        console.warn(`Hex Atelier loot scope: ${id}: removed ${removedEntries} entries/${removedPools} pools, expected ${cut.entries}/${cut.pools}; check the Hex Wright version`)
      } else {
        console.info(`Hex Atelier loot scope: ${id}: removed ${removedEntries} entries/${removedPools} pools`)
      }
    })
  })
}

// modify() creates missing tables, so skip both event sets without the mod.
if (Platform.isLoaded('hexwright')) {
  ServerEvents.chestLootTables(event => hexAtelierEditLoot(event, HEX_ATELIER_CHEST_LOOT_CUTS))
  ServerEvents.entityLootTables(event => hexAtelierEditLoot(event, HEX_ATELIER_ENTITY_LOOT_CUTS))
}
