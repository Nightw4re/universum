FTBQuestsEvents.completed('7F2A11C4D6B8E901', event => {
  console.info(`[Universum] Quest completed: 7F2A11C4D6B8E901 by ${event.player.name.string}`)
  event.player.stages.add('stargate')
  event.player.tell('The seventh symbol is solved. Stargate access is now available.')
})
