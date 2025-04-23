// Visit the wiki for more info - https://kubejs.com/
console.info('kubeJS Powah! [Register]');

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

ServerEvents.recipes(evt => {
	console.info('kubeJS Powah! [Adding]');

	for (let i = 2; i < 7; i++) {
		add_recipe(evt, { energy: i*15000, ingredients: get_ingredients('c:raw_materials/uraninite', i), result: { count: i*2, id: 'powah:uraninite' } }, 'uraninite_from_raw');
	}
	add_recipe(evt, { energy: 30000, ingredients: get_ingredients('c:ices/blue', 4), result: { count: 2, id: 'powah:dry_ice' } }, 'dry_ice');
    add_recipe(evt, { energy: 45000, ingredients: get_ingredients('c:ices/blue', 6), result: { count: 3, id: 'powah:dry_ice' } }, 'dry_ice');
	
	console.info('kubeJS Powah! [Finished]');
});