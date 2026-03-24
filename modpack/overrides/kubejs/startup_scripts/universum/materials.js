// Custom SGC materials: Trinium and Naquadria
// Trinium  — lightweight, extremely strong metal from the SGC universe
// Naquadria — unstable isotope of Naquadah; solid that can be liquefied

StartupEvents.registry('item', event => {
    // Trinium
    event.create('universum:raw_trinium').texture('universum:item/raw_trinium')
    event.create('universum:trinium_ingot').texture('universum:item/trinium_ingot')
    event.create('universum:trinium_alloy').texture('universum:item/trinium_alloy')

    // Naquadria
    event.create('universum:naquadria').texture('universum:item/naquadria')
    event.create('universum:liquid_naquadria_bucket')
        .texture('universum:item/liquid_naquadria_bucket')
        .maxStackSize(1)
})

StartupEvents.registry('block', event => {
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
