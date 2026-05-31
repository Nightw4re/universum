// Recipes for custom SGC materials: Trinium and Naquadria

ServerEvents.recipes(event => {

    // --- Trinium ---

    // --- Bismuth ---

    // Smelting raw bismuth → bismuth ingot
    event.smelting('universum:bismuth_ingot', 'universum:raw_bismuth').xp(0.7).cookingTime(200)
    event.blasting('universum:bismuth_ingot', 'universum:raw_bismuth').xp(0.7).cookingTime(100)

    // Bismuth ingot → bismuth dust via MI Macerator
    event.custom({
        type: 'modern_industrialization:macerator',
        eu: 2,
        duration: 200,
        item_inputs: [{ amount: 1, item: 'universum:bismuth_ingot' }],
        item_outputs: [{ amount: 1, item: 'universum:bismuth_dust' }]
    })

    // Flax -> string and straw via MI Macerator / Crusher.
    event.custom({
        type: 'modern_industrialization:macerator',
        eu: 2,
        duration: 200,
        item_inputs: [{ amount: 2, item: 'culturaldelights:flax' }],
        item_outputs: [
            { amount: 3, item: 'minecraft:string' },
            { amount: 2, item: 'modern_industrialization:straw' }
        ]
    })

    // Crusher variant for the same flax processing path.
    event.custom({
        type: 'modern_industrialization:crusher',
        eu: 2,
        duration: 200,
        item_inputs: [{ amount: 2, item: 'culturaldelights:flax' }],
        item_outputs: [
            { amount: 3, item: 'minecraft:string' },
            { amount: 2, item: 'modern_industrialization:straw' }
        ]
    })

    // --- Trinium ---

    // Smelting raw trinium → trinium ingot
    event.smelting('universum:trinium_ingot', 'universum:raw_trinium').xp(1.0).cookingTime(400)
    event.blasting('universum:trinium_ingot', 'universum:raw_trinium').xp(1.0).cookingTime(200)

    // Trinium iris — sgjourney has no default recipe for this, so no removal needed
    event.shaped('sgjourney:trinium_iris', [
        'TAT',
        'AXA',
        'TAT'
    ], {
        T: 'universum:trinium_ingot',
        A: 'sgjourney:naquadah_alloy',
        X: 'sgjourney:classic_stargate_chevron_block'
    })

    // --- Naquadria ---

    // Naquadah → Naquadria via MI Implosion Compressor
    // Naquadria is a high-energy unstable isotope of Naquadah — requires extreme pressure to synthesize.
    event.custom({
        type: 'modern_industrialization:implosion_compressor',
        eu: 2,
        duration: 200,
        item_inputs: [
            { amount: 4, item: 'sgjourney:naquadah' },
            { amount: 1, item: 'modern_industrialization:industrial_tnt' },
            { amount: 4, tag: 'c:nuggets/stainless_steel' }
        ],
        item_outputs: [{ amount: 1, item: 'universum:naquadria' }]
    })

    // Bismuth Dust + Uranium Dust → Polonium Pellet via MI Centrifuge
    // This is our replacement for the inaccessible Mekanism PRC route.
    event.custom({
        type: 'modern_industrialization:centrifuge',
        eu: 32,
        duration: 400,
        item_inputs: [
            { amount: 4, item: 'universum:bismuth_dust' },
            { amount: 2, item: 'modern_industrialization:uranium_dust' }
        ],
        item_outputs: [{ amount: 1, item: 'mekanism:pellet_polonium' }]
    })

    // MI plutonium dust -> Mekanism plutonium pellet.
    // This replaces the unusable nuclear-waste route for plutonium pellets.
    event.custom({
        type: 'modern_industrialization:centrifuge',
        eu: 64,
        duration: 200,
        item_inputs: [{ amount: 1, item: 'modern_industrialization:plutonium_dust' }],
        item_outputs: [{ amount: 1, item: 'mekanism:pellet_plutonium' }]
    })

    // Pellet -> chemical conversion for the SPS chain.
    event.remove({ id: 'mekanism:processing/lategame/polonium' })
    event.custom({
        type: 'mekanism:chemical_conversion',
        input: { item: 'mekanism:pellet_polonium' },
        output: { amount: 1000, id: 'mekanism:polonium' }
    })

    event.remove({ id: 'mekanism:processing/lategame/plutonium' })
    event.custom({
        type: 'mekanism:chemical_conversion',
        input: { item: 'mekanism:pellet_plutonium' },
        output: { amount: 1000, id: 'mekanism:plutonium' }
    })

    // We do not have a generators-based nuclear waste chain, so keep plutonium out of the old route.
    event.remove({ id: 'mekanism:processing/lategame/polonium_pellet/from_reaction' })
    event.remove({ id: 'mekanism:processing/lategame/plutonium_pellet/from_reaction' })

    // Naquadria + Sulfuric Acid + Liquid Naquadah â†’ Liquid Naquadria via MI Chemical Reactor
    event.custom({
        type: 'modern_industrialization:chemical_reactor',
        eu: 512,
        duration: 200,
        item_inputs: [{ amount: 1, item: 'universum:naquadria' }],
        fluid_inputs: [
            { amount: 1000, fluid: 'modern_industrialization:sulfuric_acid' },
            { amount: 1000, fluid: 'sgjourney:liquid_naquadah' }
        ],
        fluid_outputs: [{ amount: 250, fluid: 'universum:liquid_naquadria' }]
    })

    // --- MekaSuit Energy Unit ---
    // Liquid Naquadria is the unstable but extremely energetic form used in SGC for shields.
    // Adding it as requirement for the MekaSuit Energy Unit module (energy shield upgrade).
    event.remove({ output: 'mekanism:module_energy_unit' })
    event.shaped('mekanism:module_energy_unit', [
        'ANA',
        'APA',
        'HHH'
    ], {
        A: '#c:alloys/advanced',
        N: 'universum:liquid_naquadria_bucket',
        H: 'mekanism:hdpe_sheet',
        P: 'mekanism:module_base',
    })

    // Liquid Naquadria → Naquadria via MI Vacuum Freezer (solidification by freezing)
    event.custom({
        type: 'modern_industrialization:vacuum_freezer',
        eu: 64,
        duration: 200,
        fluid_inputs: [{ amount: 1000, fluid: 'universum:liquid_naquadria' }],
        item_outputs: [{ amount: 1, item: 'universum:naquadria' }]
    })

    // --- MekaSuit ---
    // MekaSuit is the true high-end armor tier, so it should take the Advanced AE Quantum Armor as a base.
    const mekaSuitPieces = [
        { id: 'mekanism:mekasuit_helmet',     base: 'advanced_ae:quantum_helmet' },
        { id: 'mekanism:mekasuit_bodyarmor',  base: 'advanced_ae:quantum_chestplate' },
        { id: 'mekanism:mekasuit_pants',      base: 'advanced_ae:quantum_leggings' },
        { id: 'mekanism:mekasuit_boots',      base: 'advanced_ae:quantum_boots' }
    ]
    mekaSuitPieces.forEach(piece => {
        event.remove({ output: piece.id })
        event.shaped(piece.id, [
            'LQL',
            'Q#Q',
            'LQL'
        ], {
            L: 'universum:liquid_naquadria_bucket',
            Q: 'sgjourney:naquadah',
            '#': piece.base
        })
    })

})
