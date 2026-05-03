BlockEvents.rightClicked(event => {
  const id = String(event.block.id)

  if (!id.includes('dhd')) return

  const hasStage = event.player.stages.has('stargate')
  console.info(`[Universum] Stargate click: ${event.player.name.string} on ${id}, has stage=${hasStage}`)
  if (hasStage) return

  console.info(`[Universum] Blocked Stargate interaction for ${event.player.name.string} on ${id}`)
  event.player.tell(
    Text.red('You must complete ')
      .append(Text.gold('['))
      .append(
        Text.gold('Finding the 7th Chevron')
          .clickRunCommand('/ftbquests open_book 7F2A11C4D6B8E901')
      )
      .append(Text.gold(']'))
      .append(Text.red(' before you can use this Stargate.'))
  )
  event.cancel()
})
