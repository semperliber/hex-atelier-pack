// Hex Atelier: the Research Table remains registered for possible later study use.
// Gem armour is a data-loaded special recipe with a dynamic/empty declared
// result. Remove by recipe ID; output matching does not identify its six sets.
// Essence Forge's compiled WorktableRecipes list is not a recipe-manager input.
ServerEvents.recipes(event => {
  event.remove({ id: 'hexwright:machines/wright_research_table' })
  event.remove({ id: 'hexwright:armour/gem_armour' })
  // Book-display crafts require structure void, but still output cut armour.
  event.remove({ id: 'hexwright:armour/book_display_boots' })
  event.remove({ id: 'hexwright:armour/book_display_chestplate' })
  event.remove({ id: 'hexwright:armour/book_display_helmet' })
  event.remove({ id: 'hexwright:armour/book_display_leggings' })
})
