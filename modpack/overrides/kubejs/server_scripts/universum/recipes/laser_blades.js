// Visit the wiki for more info - https://kubejs.com/
console.info('kubeJS toLaserBlade [Register]');

function add_recipe(evt, data, id) {
	data.type = "powah:energizing";

	evt.custom(data)
		.id(`universum:energizing/${data.result.count}x_${id}`);
}

function get_ingredients(tagName, amount) {
	let ingredients = [];
	for(let item = 1;item <= amount; item++ ){
		ingredients.push({ tag: tagName });
	}

	return ingredients;
}

// ServerEvents.recipes(evt => {
// 	console.info('kubeJS toLaserBlade [Adding]');
	
// 	console.info('kubeJS toLaserBlade [Finished]');
// });
