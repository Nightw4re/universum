// SGJourney + PneumaticCraft → Modern Industrialization Electric Age gate
//
// Basic Machine Hull (LV hull): crafting table recipe, no naquadah required.
// Uses PnC Printed Circuit Board as the key component instead of MI Analog Circuit.
//
// Turbo Machine Hull (HV hull): assembler recipe extended to require Naquadah Plate,
// balancing late-game progression via SGJourney Naquadah.

ServerEvents.recipes(event => {
    // Remove original assembler recipe for basic_machine_hull
    event.remove({ id: 'modern_industrialization:electric_age/hull/lv_machine_hull_asbl' })
    event.remove({ id: 'modern_industrialization:assembler_generated/electric_age/hull/lv_machine_hull' })

    // Basic Machine Hull — crafting table, PnC Finished PCB required
    event.shaped('modern_industrialization:basic_machine_hull', [
        'CCC',
        'PBP',
        'CCC'
    ], {
        C: 'modern_industrialization:tin_cable',
        P: 'pneumaticcraft:printed_circuit_board',
        B: 'modern_industrialization:steel_machine_casing'
    })

    // Remove all original turbo_machine_hull and turbo_machine_casing recipes
    event.remove({ id: 'modern_industrialization:assembler_generated/electric_age/hull/turbo_machine_hull' })
    event.remove({ id: 'modern_industrialization:electric_age/hull/turbo_machine_hull_asbl' })
    event.remove({ id: 'modern_industrialization:assembler_generated/electric_age/casing/turbo_machine_casing' })
    event.remove({ id: 'modern_industrialization:electric_age/casing/turbo_machine_casing_asbl' })

    // Turbo Machine Casing — 8x Naquadah Plate + Advanced Machine Hull (in assembler)
    event.custom({
        type: 'modern_industrialization:assembler',
        eu: 8,
        duration: 200,
        item_inputs: [
            { amount: 8, item: 'universum:naquadah_plate' },
            { amount: 1, item: 'modern_industrialization:advanced_machine_hull' }
        ],
        item_outputs: [{ amount: 1, item: 'modern_industrialization:turbo_machine_casing' }]
    })

    // Turbo Machine Hull — assembler, requires Naquadah Plate for balance
    event.custom({
        type: 'modern_industrialization:assembler',
        eu: 8,
        duration: 200,
        item_inputs: [
            { amount: 2, item: 'modern_industrialization:sodium_battery' },
            { amount: 1, item: 'modern_industrialization:digital_circuit' },
            { amount: 1, item: 'modern_industrialization:turbo_machine_casing' },
            { amount: 3, item: 'modern_industrialization:aluminum_cable' },
            { amount: 2, item: 'universum:naquadah_plate' }
        ],
        item_outputs: [
            { amount: 1, item: 'modern_industrialization:turbo_machine_hull' }
        ]
    })

    // Naquadah Plate — MI Compressor (naquadah ingot → plate)
    event.custom({
        type: 'modern_industrialization:compressor',
        eu: 8,
        duration: 200,
        item_inputs: [{ amount: 1, item: 'sgjourney:naquadah' }],
        item_outputs: [{ amount: 1, item: 'universum:naquadah_plate' }]
    })
})
