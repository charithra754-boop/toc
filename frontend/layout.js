export function computeForceLayout(nodes, edges, options = {}) {
  const {
    iterations = 300,
    width = 800,
    height = 400,
    k = Math.sqrt((800 * 400) / (nodes.length || 1)), // optimal distance
    repulsion = 1.2, // Repulsion multiplier
    attraction = 0.8 // Attraction multiplier
  } = options;

  // Check if all nodes already have positions computed
  const alreadyLaidOut = nodes.length > 0 && nodes.every(n => n.x !== undefined && n.y !== undefined);
  if (alreadyLaidOut) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x);
      maxY = Math.max(maxY, n.y);
    });
    const padding = 60;
    const graphWidth = Math.max(1, maxX - minX);
    const graphHeight = Math.max(1, maxY - minY);
    return {
      nodes,
      width: graphWidth + padding * 2,
      height: graphHeight + padding * 2,
      viewBox: `0 0 ${graphWidth + padding * 2} ${graphHeight + padding * 2}`
    };
  }

  // Initialize random positions if not set
  nodes.forEach((n, i) => {
    if (n.x === undefined || n.y === undefined) {
      n.x = (Math.random() * 0.5 + 0.25) * width;
      n.y = (Math.random() * 0.5 + 0.25) * height;
    }
    n.dx = 0;
    n.dy = 0;
  });

  const k2 = k * k;
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Fix root/start node to the left side if possible
  const startNode = nodes.find(n => n.role === 'start' || n.start);
  if (startNode) {
    startNode.x = 100;
    startNode.y = height / 2;
  }

  for (let iter = 0; iter < iterations; iter++) {
    // 1. Calculate repulsive forces
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const u = nodes[i];
        const v = nodes[j];
        const dx = u.x - v.x;
        const dy = u.y - v.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) {
          dist = 0.01;
        }
        const force = (k2 / dist) * repulsion;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        u.dx += fx;
        u.dy += fy;
        v.dx -= fx;
        v.dy -= fy;
      }
    }

    // 2. Calculate attractive forces
    edges.forEach(e => {
      const u = nodeMap.get(e.from || e.source);
      const v = nodeMap.get(e.to || e.target);
      if (!u || !v || u === v) return; // ignore self-loops for force calc

      const dx = v.x - u.x;
      const dy = v.y - u.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) {
        dist = 0.01;
      }
      const force = (dist * dist / k) * attraction;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      u.dx += fx;
      u.dy += fy;
      v.dx -= fx;
      v.dy -= fy;
    });

    // 3. Gravity towards center to keep graph bounded
    const centerX = width / 2;
    const centerY = height / 2;
    nodes.forEach(u => {
      const dx = centerX - u.x;
      const dy = centerY - u.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        const force = (dist / k) * 0.05;
        u.dx += (dx / dist) * force;
        u.dy += (dy / dist) * force;
      }
    });

    // 4. Directional force: Push nodes to the right if there's a flow
    edges.forEach(e => {
      const u = nodeMap.get(e.from || e.source);
      const v = nodeMap.get(e.to || e.target);
      if (u && v && u !== v) {
        u.dx -= 0.5; // Slight push left for sources
        v.dx += 0.5; // Slight push right for targets
      }
    });

    // 5. Apply forces and cooling
    const temp = Math.max(1, (iterations - iter) / iterations * 50); // Temperature cooling
    nodes.forEach(u => {
      if (u === startNode) {
        u.dx = 0; u.dy = 0; // Keep start node fixed horizontally
        u.y += Math.max(-temp, Math.min(temp, u.dy)); // Allow slight vertical adjust
      } else {
        const dMag = Math.sqrt(u.dx * u.dx + u.dy * u.dy);
        if (dMag > 0) {
          u.x += (u.dx / dMag) * Math.min(dMag, temp);
          u.y += (u.dy / dMag) * Math.min(dMag, temp);
        }
      }
      u.dx = 0;
      u.dy = 0;
    });
  }

  // Final scale & translation to fit neatly
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(n => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x);
    maxY = Math.max(maxY, n.y);
  });

  const padding = 60;
  const graphWidth = Math.max(1, maxX - minX);
  const graphHeight = Math.max(1, maxY - minY);
  
  // Shift everything so minX, minY is at padding, padding
  nodes.forEach(n => {
    n.x = n.x - minX + padding;
    n.y = n.y - minY + padding;
  });

  return {
    nodes,
    width: graphWidth + padding * 2,
    height: graphHeight + padding * 2,
    viewBox: `0 0 ${graphWidth + padding * 2} ${graphHeight + padding * 2}`
  };
}

export function computeEdgePaths(nodes, edges, radius = 34) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const edgeGroups = new Map();

  // Group edges by their node pair (ignoring direction) to handle overlaps
  edges.forEach((e, i) => {
    const fromId = e.from || e.source;
    const toId = e.to || e.target;
    // Canonical key for the pair
    const key = [fromId, toId].sort().join('-');
    if (!edgeGroups.has(key)) edgeGroups.set(key, []);
    edgeGroups.get(key).push({ ...e, originalIndex: i, fromId, toId });
  });

  const paths = [];

  edgeGroups.forEach((group, key) => {
    const isSelfLoop = group[0].fromId === group[0].toId;
    const u = nodeMap.get(group[0].fromId);
    const v = nodeMap.get(group[0].toId);

    if (!u || !v) return;

    if (isSelfLoop) {
      // Spread self-loops around the top of the node
      group.forEach((e, i) => {
        const angleOff = (i - (group.length - 1) / 2) * 0.4; // Fan out
        const cx = u.x + Math.sin(angleOff) * radius * 1.5;
        const cy = u.y - radius * 1.5 - (i * 10);
        
        const pathD = `M ${u.x - radius * 0.5} ${u.y - radius * 0.8} C ${u.x - radius} ${cy}, ${u.x + radius} ${cy}, ${u.x + radius * 0.5} ${u.y - radius * 0.8}`;
        
        paths.push({
          ...e,
          pathD,
          labelX: cx,
          labelY: cy + 10
        });
      });
    } else {
      const dx = v.x - u.x;
      const dy = v.y - u.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / dist; // Normalized direction
      const ny = dy / dist;

      // Calculate how many edges go in each direction
      let uToV = 0;
      let vToU = 0;
      group.forEach(e => {
        if (e.fromId === u.id) e.dirIndex = uToV++;
        else e.dirIndex = vToU++;
      });

      const totalEdges = uToV + vToU;
      
      group.forEach(e => {
        const isForward = e.fromId === u.id;
        const source = isForward ? u : v;
        const target = isForward ? v : u;

        // If there's only 1 edge in total between these two nodes, draw it straight
        if (totalEdges === 1) {
          const sx = source.x + nx * radius * (isForward ? 1 : -1);
          const sy = source.y + ny * radius * (isForward ? 1 : -1);
          const ex = target.x - nx * radius * (isForward ? 1 : -1);
          const ey = target.y - ny * radius * (isForward ? 1 : -1);
          paths.push({
            ...e,
            pathD: `M ${sx} ${sy} L ${ex} ${ey}`,
            labelX: (source.x + target.x) / 2,
            labelY: (source.y + target.y) / 2 - 8
          });
          return;
        }

        // Multiple edges: curve them
        const curveDir = isForward ? 1 : -1;
        const indexOffset = e.dirIndex + 1; // 1, 2, 3...
        
        // Offset perpendicular to the line
        const px = -ny * curveDir;
        const py = nx * curveDir;
        
        const arcSpread = 30; // distance between parallel arcs
        const midOff = arcSpread * indexOffset - (isForward && vToU > 0 ? 0 : 15);
        
        const mx = (source.x + target.x) / 2 + px * midOff;
        const my = (source.y + target.y) / 2 + py * midOff;

        // Start and end points on the boundary of the nodes
        const sx = source.x + (mx - source.x) / Math.sqrt((mx - source.x)**2 + (my - source.y)**2) * radius;
        const sy = source.y + (my - source.y) / Math.sqrt((mx - source.x)**2 + (my - source.y)**2) * radius;
        
        const ex = target.x + (mx - target.x) / Math.sqrt((mx - target.x)**2 + (my - target.y)**2) * radius;
        const ey = target.y + (my - target.y) / Math.sqrt((mx - target.x)**2 + (my - target.y)**2) * radius;

        paths.push({
          ...e,
          pathD: `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`,
          labelX: mx,
          labelY: my - 5
        });
      });
    }
  });

  return paths;
}
