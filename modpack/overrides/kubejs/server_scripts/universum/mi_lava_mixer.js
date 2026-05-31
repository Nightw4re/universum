ServerEvents.recipes(event => {
    event.remove({ id: 'modern_industrialization:vanilla_recipes/mixer/lava' })

    // Bronze/Steel/Electric Mixer: cobblestone -> lava
    event.recipes.modern_industrialization.mixer(2, 1250)
        .itemIn('16x minecraft:cobblestone')
        .fluidIn('16000x minecraft:lava', 0)
        .fluidOut('4000x minecraft:lava')
        .id('kubejs:mi_lava_from_cobblestone_batch_16')

    // Electric Mixer: stone -> lava
    event.recipes.modern_industrialization.mixer(32, 1250)
        .itemIn('16x minecraft:stone')
        .fluidIn('16000x minecraft:lava', 0)
        .fluidOut('8000x minecraft:lava')
        .id('kubejs:mi_lava_from_stone_batch_16')
})