// Universum — Progression Gate Tooltips
//
// Tooltips on gated items so players know what's required without reading quests.
// Shown in JEI and crafting table.

ItemEvents.modifyTooltips(event => {

    // MI Electric Age gate — Basic Machine Hull
    event.add('modern_industrialization:basic_machine_hull', Text.gold('⚠ Requires: PnC Printed Circuit Board'))
    event.add('modern_industrialization:basic_machine_hull', Text.gray('→ Travel through the Stargate to Abydos and build the PnC Pressure Chamber'))

    // IF machines — locked behind Chulak
    event.add('industrialforegoing:plant_sower', Text.gold('⚠ Requires: Jaffa Bio-Tech (Chulak)'))
    event.add('industrialforegoing:plant_sower', Text.gray('→ Travel through the Milky Way Stargate to Chulak'))

    event.add('industrialforegoing:plant_gatherer', Text.gold('⚠ Requires: Jaffa Bio-Tech (Chulak)'))
    event.add('industrialforegoing:plant_gatherer', Text.gray('→ Travel through the Milky Way Stargate to Chulak'))

    event.add('industrialforegoing:animal_rancher', Text.gold('⚠ Requires: Jaffa Bio-Tech (Chulak)'))
    event.add('industrialforegoing:animal_rancher', Text.gray('→ Travel through the Milky Way Stargate to Chulak'))

    event.add('industrialforegoing:mob_crusher', Text.gold('⚠ Requires: Jaffa Bio-Tech (Chulak)'))
    event.add('industrialforegoing:mob_crusher', Text.gray('→ Travel through the Milky Way Stargate to Chulak'))

    event.add('industrialforegoing:laser_drill', Text.gold('⚠ Requires: Jaffa Bio-Tech (Chulak)'))
    event.add('industrialforegoing:laser_drill', Text.gray('→ Naquadah Extraction Rig — unlock via Chulak quests'))

    // HNN — locked behind IF
    event.add('hostilenetworks:blank_data_model', Text.gold('⚠ Requires: IF Mob Crusher first'))
    event.add('hostilenetworks:blank_data_model', Text.gray('→ Unlock Industrial Foregoing via Chulak (Stargate)'))
})
