// SGJourney + PneumaticCraft → Modern Industrialization Electric Age gate
//
// The Basic Machine Hull (LV hull) is the bottleneck item for entering MI Electric Age.
// Recipe requires:
//   - 2x sgjourney:refined_naquadah  → forces SGJourney midgame progression
//   - 1x pneumaticcraft:printed_circuit_board → forces PnC Assembly System setup
//
// See also: pnc_mi_bridge.js for the Printed Circuit Board recipe

ServerEvents.recipes(event => {
    // Remove the original MI assembler recipe for basic_machine_hull by exact ID
    event.remove({ id: 'modern_industrialization:electric_age/hull/lv_machine_hull_asbl' })

    // Re-add with Refined Naquadah + PnC Printed Circuit Board requirement
    event.custom({
        type: 'modern_industrialization:assembler',
        eu: 8,
        duration: 200,
        item_inputs: [
            { amount: 1, item: 'modern_industrialization:analog_circuit' },
            { amount: 3, item: 'modern_industrialization:tin_cable' },
            { amount: 2, item: 'modern_industrialization:redstone_battery' },
            { amount: 1, item: 'modern_industrialization:steel_machine_casing' },
            { amount: 2, item: 'sgjourney:refined_naquadah' },
            { amount: 1, item: 'pneumaticcraft:printed_circuit_board' }
        ],
        item_outputs: [
            { amount: 1, item: 'modern_industrialization:basic_machine_hull' }
        ]
    })
})
