// Recipes for custom SGC materials: Trinium and Naquadria

ServerEvents.recipes(event => {

    // --- Trinium ---

    // Smelting raw trinium → trinium ingot
    event.smelting('universum:trinium_ingot', 'universum:raw_trinium').xp(1.0).cookingTime(400)
    event.blasting('universum:trinium_ingot', 'universum:raw_trinium').xp(1.0).cookingTime(200)

    // Trinium alloy: trinium ingot + naquadah + naquadah alloy → 2 trinium alloy
    // (Requires Mid-game SGJourney progression to have naquadah)
    event.shaped('2x universum:trinium_alloy', [
        'TNA',
        'NAN',
        'ATN'
    ], {
        T: 'universum:trinium_ingot',
        N: 'sgjourney:naquadah',
        A: 'sgjourney:naquadah_alloy'
    })

    // Trinium iris — sgjourney has no default recipe for this, so no removal needed
    event.shaped('sgjourney:trinium_iris', [
        'TAT',
        'AXA',
        'TAT'
    ], {
        T: 'universum:trinium_alloy',
        A: 'sgjourney:naquadah_alloy',
        X: 'sgjourney:classic_stargate_chevron_block'
    })

    // --- Naquadria ---

    // --- MekaSuit Energy Unit ---
    // Naquadria is an unstable but extremely energetic form of Naquadah — used in SGC for shields.
    // Adding it as requirement for the MekaSuit Energy Unit module (energy shield upgrade).
    event.remove({ id: 'mekanism:module_energy_unit' })
    event.shaped('mekanism:module_energy_unit', [
        'ANA',
        'APA',
        'HHH'
    ], {
        A: '#c:alloys/advanced',
        N: 'universum:naquadria',
        H: 'mekanism:hdpe_sheet',
        P: 'mekanism:module_base',
    })

    // Naquadria cannot be smelted normally — it must be liquefied via MI Chemical Reactor
    // Naquadria → Liquid Naquadria (bucket): using MI's chemical_reactor
    // MI fluid output recipes use the custom_machine type via Modern Industrialization KubeJS API
    event.custom({
        type: 'modern_industrialization:chemical_reactor',
        eu: 512,
        duration: 200,
        item_inputs: [{ amount: 1, item: 'universum:naquadria' }],
        item_outputs: [{ amount: 1, item: 'universum:liquid_naquadria_bucket' }]
    })

    // Liquid Naquadria → Naquadria (solidification via MI Distillery or simple crafting)
    event.shapeless('universum:naquadria', ['universum:liquid_naquadria_bucket'])

})
