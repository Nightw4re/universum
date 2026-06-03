ServerEvents.loaded(event => {
  const server = event.server

  server.runCommandSilent('scoreboard objectives add universum_gate_bootstrap dummy')

  const gates = [
    {
      key: 'overworld',
      command: 'execute in minecraft:overworld run place structure sgjourney:stargate/milky_way/terra_stargate -1136 160 182'
    },
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
    const skipped = server.runCommandSilent(`execute if score #${gate.key} universum_gate_bootstrap matches 1 run say [Universum] Stargate bootstrap already ran for ${gate.key}`)
    if (skipped > 0) continue

    console.info(`[Universum] Stargate bootstrap running for ${gate.key}: ${gate.command}`)
    const result = server.runCommand(gate.command)
    console.info(`[Universum] Stargate bootstrap result for ${gate.key}: ${result}`)

    if (result > 0) {
      server.runCommandSilent(`scoreboard players set #${gate.key} universum_gate_bootstrap 1`)
    } else {
      console.warn(`[Universum] Stargate bootstrap did not place ${gate.key}; it will retry on the next server load.`)
    }
  }
})
