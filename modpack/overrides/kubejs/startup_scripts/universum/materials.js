// Custom SGC materials: Trinium and Naquadria
// Trinium  — lightweight, extremely strong metal from the SGC universe
// Naquadria — unstable isotope of Naquadah; solid that can be liquefied

StartupEvents.registry('item', event => {
    // Bismuth — mined in Netu, used for Polonium production
    event.create('universum:raw_bismuth').texture('universum:item/raw_bismuth')
    event.create('universum:bismuth_ingot').texture('universum:item/bismuth_ingot')
    event.create('universum:bismuth_dust').texture('universum:item/bismuth_dust')

    // Trinium
    event.create('universum:raw_trinium').texture('universum:item/raw_trinium')
    event.create('universum:trinium_ingot').texture('universum:item/trinium_ingot')

    // Naquadria
    event.create('universum:naquadria').texture('universum:item/naquadria')

    // Naquadah Plate — compressed naquadah for Turbo Machine Hull
    event.create('universum:naquadah_plate').texture('universum:item/naquadah_plate')

    // Ancient Coordinates — written book reward for completing the endgame
    event.create('universum:ancient_coordinates')
        .texture('universum:item/ancient_coordinates')
        .maxStackSize(1)
})

StartupEvents.registry('fluid', event => {
    // Liquid Naquadria — naquadria dissolved into fluid form, used in advanced recipes
    event.create('universum:liquid_naquadria')
        .displayName('Liquid Naquadria')
        .stillTexture('universum:fluid/liquid_naquadria_still')
        .flowingTexture('universum:fluid/liquid_naquadria_flow')

})

StartupEvents.registry('block', event => {
    // Bismuth ores
    event.create('universum:bismuth_ore')
        .requiresTool()
        .hardness(3.0)
        .resistance(4.5)
        .texture('universum:block/bismuth_ore')

    event.create('universum:deepslate_bismuth_ore')
        .requiresTool()
        .hardness(4.5)
        .resistance(4.5)
        .texture('universum:block/deepslate_bismuth_ore')

    // Trinium ores
    event.create('universum:trinium_ore')
        .requiresTool()
        .hardness(4.5)
        .resistance(6.0)
        .texture('universum:block/trinium_ore')

    event.create('universum:deepslate_trinium_ore')
        .requiresTool()
        .hardness(6.0)
        .resistance(6.0)
        .texture('universum:block/deepslate_trinium_ore')

    // Naquadria ores
    event.create('universum:naquadria_ore')
        .requiresTool()
        .hardness(5.0)
        .resistance(6.0)
        .texture('universum:block/naquadria_ore')

    event.create('universum:deepslate_naquadria_ore')
        .requiresTool()
        .hardness(7.0)
        .resistance(6.0)
        .texture('universum:block/deepslate_naquadria_ore')
})
