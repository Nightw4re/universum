// Listen to item registry event
StartupEvents.registry('item', event => {  
    event.create('universum:sculk_dust').texture('universum:item/sculk_dust')
    event.create('universum:enriched_echo_crystal').texture('universum:item/enriched_sculk')
    event.create('universum:cleared_sculk_lens').texture('universum:item/cleared_sculk_lens')
    event.create('universum:component_can').texture('universum:item/component_can')
  })