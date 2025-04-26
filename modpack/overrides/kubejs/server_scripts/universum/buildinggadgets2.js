// Visit the wiki for more info - https://kubejs.com/
console.info('Hello, World! (Loaded server example script)')


// disabled item
ItemEvents.modifyTooltips(event => {
	event.add('buildinggadgets2:gadget_exchanging', Text.red('---- Disabled ----'));
	event.add('buildinggadgets2:gadget_cut_paste', Text.red('---- Disabled ----'));
	event.add('buildinggadgets2:gadget_copy_paste', Text.red('---- Disabled ----'));
})