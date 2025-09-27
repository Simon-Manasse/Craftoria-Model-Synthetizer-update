# Craftoria-Model-Synthetizer-update
We’ve been playing Craftoria for a while and came across a system that felt ambiguous and difficult to understand. Together with u/Rumfuzz, we discovered some interesting and undocumented features of this modpack.

# What u/Rumfuzz found

To build the machine, first craft the base controller block and the surrounding blocks shown in the recipe. Then hold a wrench in your off-hand to see the ghost structure of the multiblock, and fill it in. Once complete, add an LV or MV energy input hatch and the necessary item input/output hatches (the game will show you the correct spots when you hold them).

It should look something like this:

<img width="1920" height="1200" alt="image" src="https://github.com/user-attachments/assets/bb3f8a3b-f2cf-4b97-a2f2-e64d74fbd1ba" />

<img width="431" height="459" alt="image" src="https://github.com/user-attachments/assets/36ac078f-84ee-4fce-b0ae-d1798f682291" />

<img width="1920" height="1200" alt="image" src="https://github.com/user-attachments/assets/b117a770-48b1-4fc6-ac07-a714b15d3dd6" />

(Example of MV power connection)

When powered with LV, the machine will only work up to 256 EU/t, so you can only use models with requirements at or below that. For higher models (like the Enderman), you’ll need to switch to MV power with an MV energy input and MV cables.

Upgrades are essential — without them, you won’t be able to run most models. Each basic upgrade adds +2 EU/t, so 48 basic upgrades = +96 EU/t, which is enough for mid-tier models like Enderman and Evoker.

For the strongest models, you do not need to go above MV. With MV power plus 30 advanced upgrades (+480 EU/t) the machine can reach 4086 EU/t, which is enough to run every model in the game, including the Ender Dragon.

# How we changed the system
After experimenting for a while, we discovered that the models weren’t dropping any of the additional items listed in the recipes. Looking into the [code](https://github.com/TeamAOF/Craftoria), we found that the Analyzer model only called the first item from the loot table, ignoring the rest.

To fix this, we implemented a system that checks all recipes and possible drops for every model. With this change, you now have a chance to receive every item from the loot table. You can’t choose which specific item you get, but it’s a fair tradeoff when processing models in bulk.

The drop rates are based on rarity: the rarer an item is, the less often you’ll obtain it. While the general predictions aren’t guaranteed, the experience drops always are.

To enable this, simply replace your file at
`Craftoria/kubejs/server_scripts/Mods/ModernIndustrialization/CustomMachines/ModelSynthesizer.js`
with the updated version provided above. This ensures that all items are obtainable according to their rarity.

# How the output looks like

(using 64 prediction matricies with Ender Dragon model)

<img width="638" height="161" alt="image" src="https://github.com/user-attachments/assets/295251da-165e-4902-a754-55eb90ccd7a9" />

# How the recipies look like (by u/Rumfuzz)

The crafting recipies with the barrier blocks are there so they are unobtainable (player can't choose them) but they still provide a way to look at all the possible drops.

<img width="904" height="1149" alt="image" src="https://github.com/user-attachments/assets/78e84a95-1f1c-478f-864c-baa4a1758e8b" />
