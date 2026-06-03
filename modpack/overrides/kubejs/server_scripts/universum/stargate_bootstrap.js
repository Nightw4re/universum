ServerEvents.loaded(event => {
  const server = event.server

  server.runCommandSilent('scoreboard objectives add universum_gate_bootstrap dummy')

  const gates = [
    {
      key: 'netu',
      command: 'execute in universum:netu run place structure sgjourney:stargate/milky_way/pedestal/stargate_pedestal_cavum_tenebrae 0 80 0'
    },
    {
      key: 'oannes',
      command: 'execute in universum:oannes run place structure sgjourney:stargate/pegasus/outpost/lantean_outpost_ocean 0 64 0'
    },
    {
      key: 'niflheim',
      command: 'execute in universum:niflheim run place structure sgjourney:stargate/milky_way/pedestal/stargate_pedestal_snow 0 80 0'
    }
  ]

  for (const gate of gates) {
    server.runCommandSilent(`execute unless score #${gate.key} universum_gate_bootstrap matches 1 run ${gate.command}`)
    server.runCommandSilent(`scoreboard players set #${gate.key} universum_gate_bootstrap 1`)
  }
})
