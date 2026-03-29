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

    // --- Polonium ---

    // Bismuth Dust + Uranium Dust → Polonium Pellet via MI Centrifuge
    // Models nuclear transmutation of Bismuth-209 via neutron bombardment.
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

    // --- SPS Casing ---
    // Trinium Ingot replaces HDPE sheet as structural reinforcement (SPS requires extreme durability).
    event.remove({ id: 'mekanism:sps_casing' })
    event.shaped('mekanism:sps_casing', [
        'TAT',
        'A#A',
        'TAT'
    ], {
        T: 'universum:trinium_ingot',
        A: '#c:pellets/polonium',
        '#': '#c:pellets/plutonium'
    })

    // --- MekaSuit armor ---
    // Trinium Ingot added as structural core: replaces the side HDPE sheet slots in the armor recipe.
    const mekasuitPieces = [
        { id: 'mekanism:mekasuit_helmet',    base: 'minecraft:netherite_helmet' },
        { id: 'mekanism:mekasuit_bodyarmor', base: 'minecraft:netherite_chestplate' },
        { id: 'mekanism:mekasuit_pants',     base: 'minecraft:netherite_leggings' },
        { id: 'mekanism:mekasuit_boots',     base: 'minecraft:netherite_boots' }
    ]
    mekasuitPieces.forEach(piece => {
        event.remove({ id: piece.id })
        event.shaped(piece.id, [
            'PCP',
            'T#T',
            'AEA'
        ], {
            P: 'mekanism:hdpe_sheet',
            C: '#c:circuits/ultimate',
            T: 'universum:trinium_ingot',
            '#': piece.base,
            A: '#c:pellets/polonium',
            E: 'mekanism:basic_induction_cell'
        })
    })

    // --- MekaSuit Energy Unit ---
    // Naquadria is an unstable but extremely energetic form of Naquadah — used in SGC for shields.
    // Adding it as requirement for the MekaSuit Energy Unit module (energy shield upgrade).
    event.remove({ output: 'mekanism:module_energy_unit' })
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

    // --- Advanced AE Quantum Armor ---
    // Quantum Armor requires Naquadah (structural lattice) and Naquadria (energy core).
    const quantumArmorPieces = [
        { id: 'advanced_ae:quantum_helmet',    base: 'mekanism:mekasuit_helmet' },
        { id: 'advanced_ae:quantum_chestplate', base: 'mekanism:mekasuit_bodyarmor' },
        { id: 'advanced_ae:quantum_leggings',  base: 'mekanism:mekasuit_pants' },
        { id: 'advanced_ae:quantum_boots',     base: 'mekanism:mekasuit_boots' }
    ]
    quantumArmorPieces.forEach(piece => {
        event.remove({ output: piece.id })
        event.shaped(piece.id, [
            'NQN',
            'Q#Q',
            'NQN'
        ], {
            N: 'sgjourney:naquadah',
            Q: 'universum:naquadria',
            '#': piece.base
        })
    })

})
