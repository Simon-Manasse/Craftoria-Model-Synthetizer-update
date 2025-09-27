ServerEvents.recipes(event => {
  const { model_synthesizer, assembler } = event.recipes.modern_industrialization;
  let dataModels = globalDataModels;

  event.resourceManager.getResourceStack(ID.mc('hostilenetworks:data_models')).forEach(resource => {
    let source = resource.source();

    source.listResources('server_data', 'hostilenetworks', 'data_models', (resLoc, io) => {
      let modelJson = bytesToJson(io.get().readAllBytes());
      let { entity, input, base_drop, fabricator_drops, sim_cost } = modelJson;
      let { namespace: entityNamespace, path: entityPath } = ID.mc(entity);

      if (dataModels[ID.mc(entity)]) return;
      if (!Platform.isLoaded(entityNamespace)) return;

      let modelLoc = `${resLoc.namespace}:${resLoc.path.replace('data_models/', '').replace('.json', '')}`;
      let euCost   = getNearestMultipleOfSixteen(sim_cost / 8);

      fabricator_drops.forEach(drop => {
        if (!Item.exists(drop.id)) return;
        let fake = model_synthesizer(euCost, 20 * 5)
        .itemIn(`hostilenetworks:data_model[hostilenetworks:data_model="${modelLoc}"]`, 0)
        .itemIn('minecraft:barrier')
        .itemOut(Item.of(drop.id, drop.count || 1));
        if (base_drop && Item.exists(base_drop.id)) {
          fake.itemOut(Item.of(base_drop.id, base_drop.count || 1), 0.99999);
        }
        fake.itemOut(`${Math.ceil(euCost / 8)}x ars_nouveau:greater_experience_gem`, 1);
        fake.id(`craftoria:mi/model_synthesizer/${entityPath}/${ID.path(drop.id)}/_fake`);
      });

      let recipe = model_synthesizer(euCost, 20 * 5)
      .itemIn(`hostilenetworks:data_model[hostilenetworks:data_model="${modelLoc}"]`, 0)
      .itemIn(input);

      // individual item drops per mob
      fabricator_drops.forEach(drop => {
        if (!Item.exists(drop.id)) return;
        recipe.itemOut(Item.of(drop.id, drop.count || 1), 0.5); // 50% chance each
      });

      // generalized prediction
      if (base_drop && Item.exists(base_drop.id)) {
        recipe.itemOut(Item.of(base_drop.id, base_drop.count || 1), 0.99999); // almost always
      }
      recipe.itemOut(`${Math.ceil(euCost / 8)}x ars_nouveau:greater_experience_gem`, 1); // always XP

      recipe.id(`craftoria:mi/model_synthesizer/${entityPath}/_all_drops`);
    });
  });

  for (let [entity, data] of Object.entries(dataModels)) {
    let { fabricatorDrops, baseDrop, simCost, input } = data;
    let { namespace: entityNamespace, path: entityPath } = ID.mc(entity);
    if (!Platform.isLoaded(entityNamespace)) continue;

    let modelData = entityNamespace === 'minecraft' ? entityPath : `${entityNamespace}/${entityPath}`;
    let euCost    = getNearestMultipleOfSixteen(simCost / 8);
    let inputMat  = Ingredient.of(input || 'hostilenetworks:prediction_matrix', 1);

    // --- Fake per-output recipes ---
    fabricatorDrops.forEach(drop => {
      if (drop.includes('#')) {
        Ingredient.of(drop).except('#almostunified:hide').itemIds.forEach(id => {
          let fake = model_synthesizer(euCost, 20 * 5)
          .itemIn(`hostilenetworks:data_model[hostilenetworks:data_model="hostilenetworks:${modelData}"]`, 0)
          .itemIn('minecraft:barrier')
          .itemOut(Item.of(id));
          if (Item.exists(baseDrop)) fake.itemOut(baseDrop, 0.99999);
          fake.itemOut(`${Math.ceil(euCost / 8)}x ars_nouveau:greater_experience_gem`, 1);
          fake.id(`craftoria:mi/model_synthesizer/${entityPath}/${ID.path(id)}/_fake`);
        });
      } else {
        let output = Item.of(drop);
        if (!Item.exists(output.id) || output.id === 'minecraft:air') return;
        let fake = model_synthesizer(euCost, 20 * 5)
        .itemIn(`hostilenetworks:data_model[hostilenetworks:data_model="hostilenetworks:${modelData}"]`, 0)
        .itemIn('minecraft:barrier')
        .itemOut(output);
        if (Item.exists(baseDrop)) fake.itemOut(baseDrop, 0.99999);
        fake.itemOut(`${Math.ceil(euCost / 8)}x ars_nouveau:greater_experience_gem`, 1);
        fake.id(`craftoria:mi/model_synthesizer/${entityPath}/${ID.path(output)}/_fake`);
      }
    });

    // --- Real combined recipe ---
    let recipe = model_synthesizer(euCost, 20 * 5)
    .itemIn(`hostilenetworks:data_model[hostilenetworks:data_model="hostilenetworks:${modelData}"]`, 0)
    .itemIn(inputMat);

    fabricatorDrops.forEach(drop => {
      if (drop.includes('#')) {
        Ingredient.of(drop).except('#almostunified:hide').itemIds.forEach(id => {
          recipe.itemOut(Item.of(id), 0.5); 
        });
      } else {
        let output = Item.of(drop);
        if (!Item.exists(output.id) || output.id === 'minecraft:air') return;
        recipe.itemOut(output, 0.5);
      }
    });

    if (Item.exists(baseDrop)) recipe.itemOut(baseDrop, 0.99999);
    recipe.itemOut(`${Math.ceil(euCost / 8)}x ars_nouveau:greater_experience_gem`, 1);

    recipe.id(`craftoria:mi/model_synthesizer/${entityPath}/_all_drops`);
  }

  function bytesToJson(bytes) {
    let json = '';
    for (let i = 0; i < bytes.length; i++) json += String.fromCharCode(bytes[i]);
    return JSON.parse(json);
  }
  function getNearestMultipleOfSixteen(number) {
    let multiple = Math.ceil(number / 16) * 16;
    if (multiple < 16) return 16;
    return multiple;
  }

  assembler(16, 200)
  .itemOut('mi_tweaks:model_synthesizer')
  .itemIn('8x hostilenetworks:sim_chamber')
  .itemIn('8x hostilenetworks:loot_fabricator')
  .itemIn('4x modern_industrialization:electronic_circuit')
  .itemIn('4x modern_industrialization:robot_arm')
  .itemIn('modern_industrialization:advanced_machine_hull')
  .id('craftoria:mi/assembler/model_synthesizer');
});
