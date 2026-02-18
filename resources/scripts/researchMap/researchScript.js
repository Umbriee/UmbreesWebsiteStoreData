/*
// Average json 'node'
{
	{
		"_file": "biology_nodes.dm",
		"_path": "/datum/techweb_node/botany_equip",
		"_line": 82,
		"subtype": "botany_equip",
		"id": "TECHWEB_NODE_BOTANY_EQUIP",
		"starting_node": true,
		"display_name": "Botany Equipment",
		"description": "Essential tools for maintaining onboard gardens, supporting plant growth in the unique environment of the space station.",
		"design_ids": [
			"plant_analyzer",
			"//seed_extractor", // These are technically hidden ingame but my parser included them. Womp womp.
			"//watering_can",
			"//spade",
			"//cultivator",
			"//secateurs",
			"//hatchet"
		],
		"hidden": "FALSE",
		"experimental": "FALSE",
		"category": "Misc",
		"show_on_wiki": "TRUE"
	}, 
	{ // Average json non-starter node
		"_file": "mech_nodes.dm",
		"_path": "/datum/techweb_node/mech_equip_bluespace",
		"_line": 327,
		"subtype": "mech_equip_bluespace",
		"id": "TECHWEB_NODE_MECH_EQUIP_BLUESPACE",
		"display_name": "Bluespace Exosuit Equipment",
		"description": "An array of equipment empowered by bluespace, providing unmatched mobility and utility.",
		"prereq_ids": [
			"TECHWEB_NODE_MECH_INFILTRATOR",
			"TECHWEB_NODE_BLUESPACE_TRAVEL"
		],
		"design_ids": [
			"mech_gravcatapult",
			"mech_teleporter",
			"mech_wormhole_gen",
			"mech_storage_bs",
			"titan_armour"
		],
		"research_costs": {
			"TECHWEB_POINT_TYPE_GENERIC": "TECHWEB_TIER_5_POINTS // Gives a string back, but this is used internally as a var for some numbers. Will have to lookup what they are exactly. But it seems like they only use 1-5. Will have to make a lookup table.
		},
		"announce_channels": [
			"CHANNEL_SCIENCE" // A channel to send the message to. Not used in our game but the parser included it.
		],
		"hidden": "FALSE",
		"experimental": "FALSE",
		"starting_node": "FALSE",
		"category": "Misc",
		"show_on_wiki": "TRUE"
		
		"required_experiments": [ // An experiment needed to be done to unlock. Strings as vars. Will have to make a lookup table.
			"/datum/experiment/scanning/points/machinery_tiered_scan/tier2_any"
		],
	}
	{
		...
	},
}
*/
window.onload = function() {
	const searchInput = document.getElementById("searchInput");
	const nodeListDiv = document.getElementById("nodeList");
	const nodeDetailsDiv = document.getElementById("nodeDetails");
	const nodeSelectText = document.getElementById("selectANode");
	nodeSelectText.innerHTML = '<h2>Select a node</h2>';
	
	let nodes = [];
	let nodeMap = {};
	const tierLookup = {
		TECHWEB_TIER_1_POINTS: 40,
		TECHWEB_TIER_2_POINTS: 80,
		TECHWEB_TIER_3_POINTS: 120,
		TECHWEB_TIER_4_POINTS: 160,
		TECHWEB_TIER_5_POINTS: 200
	};
	const experimentLookup = {
		"/datum/experiment/scanning/random/mecha_equipped_scan": { // Technically another set of a bunch of stuff I would probably need to setup as a json fetch. Hell, I might make all of the lookup a seperate fetch..
			name: "Exosuit Materials: Load Strain Test",
			desc: "Exosuit equipment places unique strain upon the structure of the vehicle. Scan exosuits you have assembled from your exosuit fabricator and fully equipped to accelerate our structural stress simulations."
		}
	};
	const departmentLookup = {
		CHANNEL_SCIENCE: "Science",
		CHANNEL_ENGINEERING: "Engineering",
		CHANNEL_MEDICAL: "Medical",
		CHANNEL_SECURITY: "Security",
		CHANNEL_SUPPLY: "Cargo",
		CHANNEL_COMMAND: "Command",
		CHANNEL_SERVICE: "Service",
		CHANNEL_COMMON: "Common"
	};
	fetch("https://umbriee.github.io/UmbreesWebsiteStoreData/resources/parsedInfo/origin_tech_items.json").then(r => r.json()).then(data => {
		nodes = Array.isArray(data) ? data : data.nodes;
		// Build lookup + parent/child links
		nodes.forEach(n => {
			nodeMap[n.id] = n;
			n.parents = [];
			n.children = [];
		});
		nodes.forEach(n => {
			if (n.prereq_ids) {
				n.prereq_ids.forEach(pid => {
					const parent = nodeMap[pid];
					if (parent) {
						n.parents.push(parent);
						parent.children.push(n);
					}
				});
			}
		});
		renderList(nodes);
	});
	function renderList(list) {
		nodeListDiv.innerHTML = "";
		const starters = list.filter(n => n.starting_node === true || n.starting_node === "TRUE");
		const others = list.filter(n => !starters.includes(n));
		const sorted = [...starters, ...others];
		sorted.forEach(n => {
			const item = document.createElement("div");
			item.className = "nodeItem";
			let label = n.display_name;
			if (starters.includes(n)) {
				label = "* " + label;
			}
			item.textContent = label;
			item.onclick = () => showNode(n);
			nodeListDiv.appendChild(item);
		});
	}
	function showNode(node) {
		const chain = getPrereqChain(node);
		let totalCost = 0;
		let firstCost = getCost(node);
		let starter = (node.starting_node === true); //bool
		chain.forEach(n => {totalCost += getCost(n);});
		let html = "";
		{ // Name Desc
			html += `<div class="section">
				<h2>${node.display_name}</h2>
				<p>${node.description || ""}</p>
			</div>`;
			}
		{ // TotalCost
			if (totalCost > 0) {
				html += `<div class="section"><h3>Research Cost:</h3><p>${firstCost}</p></div>`;
			}
		}
		{ // Department
			if (node.announce_channels && node.announce_channels.length > 0) {
				html += `<div class="section"><h3>Department(s):</h3>`;
				node.announce_channels.forEach(ch => {html += (departmentLookup[ch] || ch) + ", "; // Had the idea to make it color coded dependent on departments. But there can be multiple. So I may make it mix their colors together if there is a department and try to figure out the best way to organize them color wise in the node list.
				});
			}
		}
		if (starter) {html += `<div class="section"><h4>[Node Starts Unlocked]</h4>`;} else { if (totalCost > 0) {html += `<div class="section"><h3>Research Cost: ${firstCost}</h3></div>`;}}// Node unlocked
		{ // Requirement Tree
			html += `<div class="section"><h3>Requirement Tree:</h3>`;
			if (totalCost > 0) {html += `<p>Total cost: ${totalCost}</p>`;}
			html += `<ul>${renderPrereqTree(node)}</ul></div>`; // able to click on these to go to their node. Also make it easier to see when two nodes are required with maybe ascii tree formatting to get lines?
		}
		{ // Required Experiments
			if (node.required_experiments) {
				html += `<div class="section"><h3>Required Experiments:</h3>`;
				node.required_experiments.forEach(experimentPath => {
					const lookup = experimentLookup[experimentPath];
					const experimentName = lookup ? lookup.name : experimentPath;
					const experimentDesc = lookup ? lookup.desc : experimentPath;
					html += `<li>${experimentName} - ${experimentDesc}</li>`;
				}); // Could use a lookup check as half of them look like "/datum/experiment/scanning/random/mecha_equipped_scan" or so.
			}
		}
		{ // Unlocks Tech
			if (node.children.length > 0) {
				html += `<div class="section"><h3>Unlocks Tech Nodes:</h3>`;
				node.children.forEach(c => {
					html += `<li>${c.display_name}</li>`; // Clickable text to go to this node.
				});
			}
		}
		{ // Discounts
			if (node.discount_experiments && node.discount_experiments.length > 0) { // Can't figure out how to make this appear.
				html += `<div class="section"><h3>Discount Experiments:</h3>`;
				Object.entries(node.discount_experiments).forEach(([experimentPath, tierKey]) => {
					const experimentName = experimentLookup[experimentPath] || experimentPath;
					const refund = tierLookup[tierKey] || 0;
					html += `<li>Doing ${experimentName} refunds ${refund} research points.</li>`;
				});
				html += `</ul></div>`;
			
			/*"discount_experiments": {
				"/datum/experiment/scanning/points/basic_med_rig": "TECHWEB_TIER_2_POINTS"
			},*/
			}
		}
		{// Unlocks items
			/*if (node.design_ids) { // Hidden for now due to the items being itemID code stuff.
				const visibleItems = node.design_ids.filter(d => !d.startsWith("//"));
				if (visibleItems.length > 0) {
					html += `<div class="section"><h3>Unlocks Items</h3><ul>`;
					visibleItems.forEach(d => {
						html += `<li>${d}</li>`;
					});
					html += `</ul></div>`;
				}
			}
			*/
		}
		nodeDetailsDiv.innerHTML = html;
		if (nodeSelectText) {
			nodeSelectText.remove();
		}
		// console.log("discount_experiments",node)
	}
	function renderPrereqTree(node, visited = new Set()) {
		if (visited.has(node.id)) return "";
		visited.add(node.id);
		let html = "<li>";
		html += node.display_name;
		if (node.parents.length > 0) {
			html += "<ul>";
			node.parents.forEach(parent => {
				html += renderPrereqTree(parent, visited);
			});
			html += "</ul>";
		}
		html += "</li>";
		return html;
	}
	function getPrereqChain(node, visited = new Set()) {
		if (visited.has(node.id)) return [];
		visited.add(node.id);
		let chain = [];
		node.parents.forEach(parent => {
			chain = chain.concat(getPrereqChain(parent, visited));
		});
		chain.push(node);
		return chain;
	}
	function getCost(node) {
		if (!node.research_costs) return -1;
		const value = Object.values(node.research_costs)[0];
		return tierLookup[value] || 0;
	}
	searchInput.addEventListener("input", () => {
		const q = searchInput.value.toLowerCase();
		const filtered = nodes.filter(n =>
			(n.display_name || "").toLowerCase().includes(q) ||
			(n.id || "").toLowerCase().includes(q)
		);
		renderList(filtered);
	});
};