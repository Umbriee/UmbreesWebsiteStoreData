<script>
	const canvas = document.getElementById('rGMapCanvas');
	const ctx = canvas.getContext('2d');
	const tooltip = document.getElementById('rGMapTooltip');
	const searchInput = document.getElementById('rGMapSearch');

	let nodes = [];
	let nodeMap = {};

	let scale = 1;
	let offsetX = 0;
	let offsetY = 0;
	let isDragging = false;
	let dragStart = {x:0, y:0};

	// Load your JSON
	fetch("https://raw.githubusercontent.com/Umbriee/UmbreesWebsiteStoreData/refs/heads/main/origin_tech_items.json")
		.then(r=>r.json())
		.then(data=>{
			nodes = Array.isArray(data) ? data : data.nodes;
			nodes.forEach(n=>nodeMap[n.id]=n);
			layoutNodes();
			draw();
		});

	// Layout in simple tree structure
	function layoutNodes() {
		const layers = {};
		function getDepth(n) {
			if(!n.prereq_ids || n.prereq_ids.length==0) return 0;
			return Math.max(...n.prereq_ids.map(pid=>nodeMap[pid]?getDepth(nodeMap[pid])+1:0));
		}

		nodes.forEach(n=>{
			n.depth = getDepth(n);
			if(!layers[n.depth]) layers[n.depth]=[];
			layers[n.depth].push(n);
		});

		const yStep = 160;
		const xStep = 260;
		for(const depth in layers){
			let x = 100;
			let y = 50 + yStep*depth;
			layers[depth].forEach(n=>{
				n.x = x;
				n.y = y;
				x += xStep;
			});
		}
	}

	// Drawing
	function draw(){
		ctx.save();
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.translate(offsetX, offsetY);
		ctx.scale(scale, scale);

		// draw connections
		ctx.strokeStyle = "#555";
		ctx.lineWidth = 2;
		nodes.forEach(n=>{
			if(n.prereq_ids){
				n.prereq_ids.forEach(pid=>{
					const pre=nodeMap[pid];
					if(pre) drawLine(pre,n);
				});
			}
		});

		// draw nodes
		nodes.forEach(drawNode);
		ctx.restore();
	}

	function drawLine(a,b){
		ctx.beginPath();
		ctx.moveTo(a.x+100, a.y+35);
		ctx.lineTo(b.x+100, b.y+35);
		ctx.stroke();
	}

	function drawNode(n){
		ctx.fillStyle = n.starting_node==="TRUE"?"orange":"#2b2b2b";
		ctx.strokeStyle="#999";
		ctx.lineWidth=2;
		ctx.beginPath();
		ctx.roundRect(n.x,n.y,200,70,10);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle="white";
		ctx.fillText(n.display_name||n.id, n.x+10, n.y+35);
	}

	// Pan and zoom
	canvas.addEventListener('mousedown', e=>{
		isDragging=true;
		dragStart.x=e.offsetX-offsetX;
		dragStart.y=e.offsetY-offsetY;
		canvas.style.cursor='grabbing';
	});
	canvas.addEventListener('mouseup', e=>{
		isDragging=false;
		canvas.style.cursor='grab';
	});
	canvas.addEventListener('mousemove', e=>{
		if(isDragging){
			offsetX=e.offsetX-dragStart.x;
			offsetY=e.offsetY-dragStart.y;
			draw();
			tooltip.style.display='none';
		} else {
			const mx=(e.offsetX-offsetX)/scale;
			const my=(e.offsetY-offsetY)/scale;
			const hoverNode = nodes.find(n=>mx>=n.x && mx<=n.x+200 && my>=n.y && my<=n.y+70);
			if(hoverNode){
				tooltip.innerText=hoverNode.description||"(No description)";
				tooltip.style.left=e.offsetX+10+'px';
				tooltip.style.top=e.offsetY+10+'px';
				tooltip.style.display='block';
			} else tooltip.style.display='none';
		}
	});
	canvas.addEventListener('wheel', e=>{
		e.preventDefault();
		const zoom=e.deltaY<0?1.1:0.9;
		scale*=zoom;
		scale=Math.max(0.3,Math.min(scale,4));
		draw();
	});

	// Resize
	window.addEventListener('resize', ()=>{
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		draw();
	});
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;

	// Simple search highlight
	searchInput.addEventListener('input', ()=>{
		const q = searchInput.value.toLowerCase();
		nodes.forEach(n=>{
			n.highlight = (n.display_name||"").toLowerCase().includes(q) || (n.id||"").toLowerCase().includes(q);
		});
		draw();
	});
</script>