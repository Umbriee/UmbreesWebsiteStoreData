window.onload = function() {
	const searchInput = document.getElementById("searchInput");
	const nodeListDiv = document.getElementById("nodeList");
	const nodeDetailsDiv = document.getElementById("nodeDetails");
	const nodeSelectText = document.getElementById("selectANode");
	nodeSelectText.innerHTML = '<div class="section"><h2>Select A Node To Begin</h2></div>';

	const wrapper = document.getElementById("techwebContent-wrapper");
	const current = document.getElementById("techwebContent");
	
	let nodes = [];
	let nodeMap = {};
	const tierLookup = {
		TECHWEB_TIER_1_POINTS:	40,
		TECHWEB_TIER_2_POINTS:	80,
		TECHWEB_TIER_3_POINTS:	120,
		TECHWEB_TIER_4_POINTS:	160,
		TECHWEB_TIER_5_POINTS:	200
	};
	const experimentLookup = { // Another set of a bunch of stuff I should probably setup as a json fetch. Hell, I might make all of the lookup a seperate fetch..
		"/datum/experiment/scanning/random/mecha_equipped_scan": { 
			name: "Exosuit Materials: Load Strain Test",
			desc: "Scan an Exosuit / Mech. You may find one or create one by robotics. Follow the <a href='/departments/science/ripley-aplu-construction/'>RIPLEY APLU Construction</a> guide for more info regarding construction."
		},
		"/datum/experiment/scanning/points/machinery_tiered_scan/tier2_any": {
			name: "Upgraded Stock Parts Benchmark",
			desc: "Scan a machine with tier 2 or above parts in it. This can be done with grabbing a RPED(Rapid Part Exchange Device) loading it with needed parts and locating a machine you wish to upgrade. Grab a screwdriver and open it up, tap the RPED onto it, close it back. And scan it. Repeat until happy."
		},
		"/datum/experiment/scanning/points/machinery_tiered_scan/tier3_any": {
			name: "Upgraded Stock Parts Benchmark",
			desc: "Scan a machine with tier 3 or above parts in it. This can be done with grabbing a RPED(Rapid Part Exchange Device), though a bluespace one, if you can get either, is always reccomended, loading it with needed parts and locating a machine you wish to upgrade. Grab a screwdriver and open it up, tap the RPED onto it, close it back. And scan it. Repeat until happy."
		},
		"/datum/experiment/scanning/points/machinery_tiered_scan/tier4_any": {
			name: "Upgraded Stock Parts Benchmark",
			desc: "Scan a machine with tier 4 or above parts in it. This can be done with grabbing a RPED(Rapid Part Exchange Device), though a bluespace one, if you can get either, is always reccomended, loading it with needed parts and locating a machine you wish to upgrade. Grab a screwdriver and open it up, tap the RPED onto it, close it back. And scan it. Repeat until happy."
		},
		"/datum/experiment/scanning/random/artifact_destruction": {
			name: "Artifact Analysis",
			desc: "Destructively analyze several small artifact research samples to assess their exotic molecular properties."
		},
		"/datum/experiment/scanning/bluespace_crystal": {
			name: "Bluespace Crystal Analysis",
			desc: "Destructively analyze a bluespace crystal to examine it's exotic molecular shape."
		},
		"/datum/experiment/scanning/points/easy_cytology": {
			name: "Basic Cytology Scanning Experiment",
			desc: "After all, a good scientist needs a test subject. Either go to the bar or maints to find any of the applicable; mothroach, mice, rats, or other small vermin stated in the experiscanner."
		},
		"/datum/experiment/scanning/points/slime_scanning": {
			name: "Slime Scanning Experiment",
			desc: "Scan a slime or their core. Can be done if you head to xenobiology, of course."
		},
		"/datum/experiment/scanning/points/basic_engi_rig": {
			name: "Basic Engineering Suit Scans",
			desc: "Scan 2 of either a engineering voidsuit, HAZMAT voidsuit, atmos voidsuit, or construction voidsuit. Ask Engineering if they can lend you one to touch your scanner to."
		},
		"/datum/experiment/scanning/points/basic_sec_rig": {
			name: "Basic Security Suit Scans",
			desc: "Scan 2 of either a security voidsuit, crowd control voidsuit, or exploration voidsuit. Ask sec if you can bring your obviously camera shapped scanner and get sec suit secrets."
		},
		"/datum/experiment/scanning/points/basic_med_rig": {
			name: "Basic Medical Suit Scans",
			desc: "Scan 2 of either a medical voidsuit, emergency medical response voidsuit, or a biohazard voidsuit. Ask Medical for any if they have."
		},
		"/datum/experiment/scanning/points/basic_min_rig": {
			name: "Basic Mining Suit Scans",
			desc: "Scan 2 of either a mining voidsuit or frontier mining voidsuit. Ask cargo if they can lend you one to sniff with your scanner."
		},
		"/datum/experiment/scanning/points/basic_sci_rig": {
			name: "Basic Research Suit Scans",
			desc: "Scan 4 of either a Anomaly suit, Excavation suit, Heat Adapted Excavation suit, bomb suit, or bio suit. Hey, you're apart of sci. And bio suits are just about everywhere in xenobio. If not you can go to xenoarch for one of the first 3 options. Dunno about a bomb suit. Ask Sec if you want that one."
		},
		"/datum/experiment/scanning/people/big_or_smol": {
			name: "Big or small",
			desc: "Scan unique individuals with a size bigger than 125% or smaller than 75%. Look around or scan yourself if you fit the bill! This is virgo, there's gotta be a mi/macro around somewhere.. Behind you?"
		},
		"/datum/experiment/scanning/people/hurt_medigun": {
			name: "Medigun",
			desc: "Scan an individual that doesn't have a full healthy meter! Can be more easily visible with a hud that reports back a persons 'healthly' suit value."
		},
		"/datum/experiment/physical/teleporting": {
			name: "Teleporation Basics",
			desc: "Teleport an object to telescience by using telescience! -- If you are on the Adephagia / Teather I am sorry you must build telescience equipment. Otherwise you may use the Stellar Delights Virgo-2 Aerostat telescience thats south and to the east relative to the exit Quantum Pad!"
		},
		"/datum/experiment/scanning/random/janitor_trash": {
			name: "Station Hygiene Inspection",
			desc: "Go into maints and scan some spilled oil to learn its secrets. Or blood. Your choice. Please do not be the reason to blood is all I ask.."
		}
	};
	const departmentLookup = {
		CHANNEL_SCIENCE:		"<span class='dept science'>Science</span>",
		CHANNEL_ENGINEERING:	"<span class='dept engineering'>Engineering</span>",
		CHANNEL_MEDICAL:		"<span class='dept medical'>Medical</span>",
		CHANNEL_SECURITY:		"<span class='dept security'>Security</span>",
		CHANNEL_SUPPLY:			"<span class='dept cargo'>Cargo</span>",
		CHANNEL_COMMAND:		"<span class='dept command'>Command</span>",
		CHANNEL_SERVICE:		"<span class='dept service'>Service</span>",
		CHANNEL_COMMON:			"<span class='dept common'>Common</span>"
	};
	fetch("https://umbriee.github.io/UmbreesWebsiteStoreData/resources/parsedInfo/origin_tech_items.json").then(r => r.json()).then(data => {
		nodes = Array.isArray(data) ? data : data.nodes;
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
			item.onclick = function(){
				document.querySelectorAll(".nodeItem").forEach(e => e.classList.remove("active"));
				item.classList.add("active");
				showNode(n);
			};
			nodeListDiv.appendChild(item);
		});
	}
	function showNode(node) {
		const chain = getPrereqChain(node);
		let totalCost = 0;
		let firstCost = getCost(node);
		let starter = (node.starting_node === true);
		chain.forEach(n => {totalCost += getCost(n);});
		let html = `<div class="section"><h1>Node Data:</h1>`;
		{ // Name Desc
			html += `<div class="section">
				<h2>${node.display_name}</h2>
				<p>${node.description || ""}</p>`
			if (starter) {html += `<h5>[*Node Starts Unlocked]</h5>`;}
			html += `
			</div>`;
		}
		{ // Department
			if (node.announce_channels && node.announce_channels.length > 0) {
				html += `<div class="section"><h3>Department(s):</h3>`;
				node.announce_channels.forEach(ch => {html += (departmentLookup[ch] || ch) + " ";
				});
				html += `
				</div>`;
			}
		}
		if (!starter) { if (totalCost > 0) { // Research cost, Requirement Tree
			html += `<div class="section"><h3>Research Cost: <span class="cost">${firstCost}</span></h3></div>`;}
			{ // Requirement Tree
				html += `<div class="section"><h3>Requirement Tree:</h3>`;
				if (totalCost > 0) {html += `<h5>Total cost: <span class="cost">${totalCost}</span></h5>`;}
				html += `<ul>${renderPrereqTree(node)}</ul></div>`; // Todo: able to click on these to go to their respective node.
			}
		}
		{ // Required Experiments
			if (node.required_experiments) {
				html += `<div class="section"><h3>Required Experiments:</h3><ul>`;
				node.required_experiments.forEach(experimentPath => {
					const lookup = experimentLookup[experimentPath];
					const experimentName = lookup ? lookup.name : experimentPath;
					const experimentDesc = lookup ? lookup.desc : "[NODATAFOUND]";
					html += `<li><details><summary>${experimentName}</summary><p style="text-indent: 2em;">${experimentDesc}</p></details></li>`;
				}); // Could use a lookup check as half of them look like "/datum/experiment/scanning/random/mecha_equipped_scan" or so.
				html += `</ul></div>`;
			}
		}
		{ // Unlocks Tech
			if (node.children.length > 0) {
				html += `<div class="section"><h3>Unlocks ${(node.children.length)} Tech Nodes:</h3><ul>`;
				node.children.forEach(c => {
					html += `<li>${c.display_name}</li>`; // Clickable text to go to this node.
				});
				html += `</ul></div>`;
			}
		}
		{ // Discounts
			if (node.discount_experiments && Object.keys(node.discount_experiments).length > 0) {
				html += `<div class="section"><h3>Discount Experiments:</h3><ul>`;
				Object.entries(node.discount_experiments).forEach(([experimentPath, tierKey]) => {
					const lookup = experimentLookup[experimentPath];
					const experimentName = lookup ? lookup.name : experimentPath;
					const experimentDesc = lookup ? lookup.desc : "[NODATAFOUND]";
					const refund = tierLookup[tierKey] || 0;
					html += `<li><details><summary>Doing '${experimentName}' refunds <span class="cost">${refund}</span> research points.</summary><p style="text-indent: 2em;">${experimentDesc}</p></details></li>`;
				});
				html += `</ul></div>`;
			
			/*"discount_experiments": {
				"/datum/experiment/scanning/points/basic_med_rig": "TECHWEB_TIER_2_POINTS"
			},*/
			}
		}
		{ // Unlocks items
			/*if (node.design_ids && Object.keys(node.design_ids).length > 0) { // Hidden for now due to the items being itemID code stuff.
				const visibleItems = node.design_ids.filter(d => !d.startsWith("//"));
				if (visibleItems.length > 0) {
					html += `<div class="section"><h3>Unlocks ${(visibleItems.length)} Items</h3><span class='chat ooc'>(( OOC: Warning, these are formated with Item-ID's and has no current lookup!))</span><ul>`;
					visibleItems.forEach(d => {
						html += `<li>${d}</li>`;
					});
					html += `</ul></div>`;
				}
			}*/
		}
		html += `</div>`;
		{ // Anim and Visualizing finally
			const temp = current.cloneNode(false);
			temp.innerHTML = html;
			temp.removeAttribute("id");
			temp.classList.add("techwebContent-temp");
			wrapper.appendChild(temp);
			requestAnimationFrame(() => {
				temp.style.opacity = "1";
				temp.style.transform = "translateY(0)";
			});
			setTimeout(() => {
				current.innerHTML = html;
				wrapper.removeChild(temp);
			}, 250);
		}
		if (nodeSelectText) {nodeSelectText.remove();}
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
			"TECHWEB_POINT_TYPE_GENERIC": "TECHWEB_TIER_5_POINTS // Gives a string back, but this is used internally as a var for some numbers.
		},
		"announce_channels": [
			"CHANNEL_SCIENCE" // A channel to send the message to. Not used in game but the parser included it.
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