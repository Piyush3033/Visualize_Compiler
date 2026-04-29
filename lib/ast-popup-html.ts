/**
 * Enhanced AST Popup HTML Generator
 * Provides modern, feature-rich visualization with color-coded nodes, search, and advanced interactions
 */

export function generateASTPopupHTML(astData: any, colorMap: Record<string, string>): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Advanced AST Visualizer - C/C++/Java/Python</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        body {
          background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f172a 100%);
          color: #e2e8f0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto Mono', sans-serif;
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        
        /* Header Styles */
        .header {
          background: rgba(10, 14, 39, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(100, 116, 139, 0.2);
          padding: 14px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .header-left {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .header-title h1 {
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 50%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          letter-spacing: -0.5px;
        }
        
        .header-title p {
          font-size: 11px;
          color: #94a3b8;
          margin: 2px 0 0;
        }
        
        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #64748b;
        }
        
        .breadcrumbs span {
          opacity: 0.6;
        }
        
        /* Search Bar */
        .search-container {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(51, 65, 85, 0.3);
          border: 1px solid rgba(100, 116, 139, 0.2);
          border-radius: 6px;
          padding: 6px 12px;
          flex: 0 1 220px;
        }
        
        .search-container input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #e2e8f0;
          font-size: 12px;
        }
        
        .search-container input::placeholder {
          color: #64748b;
        }
        
        /* Controls */
        .controls {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .control-group {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 0 12px;
          border-right: 1px solid rgba(100, 116, 139, 0.2);
        }
        
        .control-group:last-child {
          border-right: none;
          padding-right: 0;
        }
        
        button {
          padding: 6px 12px;
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 5px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        button:hover {
          background: rgba(59, 130, 246, 0.25);
          border-color: rgba(59, 130, 246, 0.5);
          transform: translateY(-1px);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        button.active {
          background: rgba(59, 130, 246, 0.4);
          border-color: #60a5fa;
          color: #e0e7ff;
        }
        
        .zoom-display {
          font-size: 11px;
          color: #94a3b8;
          min-width: 45px;
          text-align: center;
        }
        
        /* Main Container */
        .main-container {
          flex: 1;
          display: flex;
          overflow: hidden;
          gap: 0;
          background: linear-gradient(135deg, #0f172a 0%, #1a1f3a 50%, #0a0e27 100%);
        }
        
        /* Canvas Container - Fullscreen */
        .canvas-section {
          flex: 1;
          background: linear-gradient(135deg, #0f1729 0%, #1a2038 50%, #0d1627 100%);
          overflow: auto;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 20px;
          position: relative;
          cursor: grab;
        }
        
        .canvas-section.dragging {
          cursor: grabbing;
        }
        
        .canvas-wrapper {
          position: relative;
          background: radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.03) 50%, transparent 100%),
                      linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 50%, rgba(15, 23, 42, 0.9) 100%);
          border: 1px solid rgba(100, 116, 139, 0.2);
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          will-change: transform;
          display: inline-block;
          min-width: 400px;
          min-height: 300px;
        }
        
        /* Canvas Section Styling */
        .canvas-section {
          background: linear-gradient(135deg, #0f172a 0%, #1a2038 50%, #0d1627 100%);
        }
        
        svg {
          display: block;
          width: 100%;
          height: auto;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          background: url('data:image/svg+xml,<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(71,85,105,0.05)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="rgba(15,23,42,0.5)"/><rect width="100%" height="100%" fill="url(%23grid)" /></svg>');
        }
        
        .tree-node {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }
        
        .tree-node:hover {
          filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.4)) brightness(1.15);
        }

        
        /* Responsive */
        @media (max-width: 1200px) {
          .search-container {
            flex: 0 1 180px;
          }
        }
        
        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .header-left {
            width: 100%;
          }
          
          .controls {
            width: 100%;
          }
          
          .breadcrumbs {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-left">
          <div class="header-title">
            <h1>Advanced AST Visualizer</h1>
            <p>C | C++ | Java | Python | TypeScript</p>
          </div>
          <div class="breadcrumbs">
            <span id="nodeCount">Nodes: 0</span>
            <span>•</span>
            <span id="depthInfo">Depth: 0</span>
          </div>
        </div>
        <div class="search-container">
          <span>🔍</span>
          <input type="text" id="searchInput" placeholder="Search nodes..." />
        </div>
        <div class="controls">
          <div class="control-group">
            <button id="zoomOutBtn" title="Zoom Out (−)">−</button>
            <span class="zoom-display" id="zoomLevel">100%</span>
            <button id="zoomInBtn" title="Zoom In (+)">+</button>
          </div>
          <div class="control-group">
            <button id="fitBtn" title="Fit to Screen">Fit</button>
            <button id="resetBtn" title="Reset View">Reset</button>
          </div>
          <button title="Close Window" onclick="window.close()">✕</button>
        </div>
      </div>
      
      <div class="main-container">
        <div class="canvas-section" id="canvasSection">
          <div class="canvas-wrapper" id="canvasWrapper">
            <svg id="astCanvas" width="1000" height="700"></svg>
          </div>
        </div>
      </div>
      
      <script>
        // ============= Data & Configuration =============
        const astData = ${JSON.stringify(astData)};
        const colorMap = ${JSON.stringify(colorMap)};
        
        let currentZoom = 1;
        let panX = 0;
        let panY = 0;
        const MIN_ZOOM = 0.3;
        const MAX_ZOOM = 4;
        const ZOOM_STEP = 0.15;
        
        // ============= Utility Functions =============
        function getNodeColor(type) {
          return colorMap[type] || '#64748b';
        }
        
        // ============= Zoom & Pan Controls =============
        function zoomIn() {
          if (currentZoom < MAX_ZOOM) {
            currentZoom = Math.min(MAX_ZOOM, currentZoom + ZOOM_STEP);
            applyTransform();
          }
        }
        
        function zoomOut() {
          if (currentZoom > MIN_ZOOM) {
            currentZoom = Math.max(MIN_ZOOM, currentZoom - ZOOM_STEP);
            applyTransform();
          }
        }
        
        function applyTransform() {
          const wrapper = document.getElementById('canvasWrapper');
          wrapper.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${currentZoom})\`;
          wrapper.style.transformOrigin = '0 0';
          document.getElementById('zoomLevel').textContent = Math.round(currentZoom * 100) + '%';
        }
        
        function fitToScreen() {
          const wrapper = document.getElementById('canvasWrapper');
          const section = document.getElementById('canvasSection');
          const svg = document.getElementById('astCanvas');
          
          // Get SVG dimensions
          const svgWidth = parseInt(svg.getAttribute('width'), 10);
          const svgHeight = parseInt(svg.getAttribute('height'), 10);
          const targetWidth = section.clientWidth - 40;
          const targetHeight = section.clientHeight - 40;
          
          if (svgWidth > 0 && svgHeight > 0) {
            // Calculate zoom to fit the entire tree in viewport
            currentZoom = Math.min(
              targetWidth / svgWidth,
              targetHeight / svgHeight
            );
          } else {
            currentZoom = 1;
          }
          
          currentZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom));
          panX = (targetWidth - svgWidth * currentZoom) / 2 + 20;
          panY = (targetHeight - svgHeight * currentZoom) / 2 + 20;
          applyTransform();
        }
        
        function resetView() {
          currentZoom = 1;
          panX = 0;
          panY = 0;
          applyTransform();
        }
        
        // ============= Pan & Drag Controls =============
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let dragStartPanX = 0;
        let dragStartPanY = 0;
        
        const canvasSection = document.getElementById('canvasSection');
        const canvasWrapper = document.getElementById('canvasWrapper');
        
        canvasSection.addEventListener('mousedown', (e) => {
          isDragging = true;
          dragStartX = e.clientX;
          dragStartY = e.clientY;
          dragStartPanX = panX;
          dragStartPanY = panY;
          canvasSection.classList.add('dragging');
        });
        
        document.addEventListener('mousemove', (e) => {
          if (isDragging) {
            const deltaX = e.clientX - dragStartX;
            const deltaY = e.clientY - dragStartY;
            panX = dragStartPanX + deltaX;
            panY = dragStartPanY + deltaY;
            applyTransform();
          }
        });
        
        document.addEventListener('mouseup', () => {
          isDragging = false;
          canvasSection.classList.remove('dragging');
        });
        
        // ============= Pinch Zoom & Mouse Wheel Zoom =============
        canvasSection.addEventListener('wheel', (e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            const oldZoom = currentZoom;
            currentZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + delta));
            
            // Zoom towards mouse position
            const rect = canvasSection.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const zoomRatio = currentZoom / oldZoom;
            panX = mouseX - (mouseX - panX) * zoomRatio;
            panY = mouseY - (mouseY - panY) * zoomRatio;
            
            applyTransform();
          }
        }, { passive: false });
        
        // ============= Touch Pinch Zoom =============
        let lastTouchDistance = 0;
        
        canvasSection.addEventListener('touchstart', (e) => {
          if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dx = touch2.clientX - touch1.clientX;
            const dy = touch2.clientY - touch1.clientY;
            lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
          }
        });
        
        canvasSection.addEventListener('touchmove', (e) => {
          if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dx = touch2.clientX - touch1.clientX;
            const dy = touch2.clientY - touch1.clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (lastTouchDistance > 0) {
              const ratio = distance / lastTouchDistance;
              const zoomDelta = (ratio - 1) * ZOOM_STEP * 5;
              currentZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + zoomDelta));
              applyTransform();
            }
            lastTouchDistance = distance;
          }
        }, { passive: false });
        
        // ============= SVG Rendering with Enhanced Styling =============
        function drawSVGTree() {
          const svg = document.getElementById('astCanvas');
          const nodeWidth = 90;
          const nodeHeight = 60;
          const verticalGap = 120;
          const minHorizontalGap = 140;
          
          let nodeCount = 0;
          const nodes = [];
          const edges = [];
          
          function assignIds(node, depth = 0) {
            if (!node) return null;
            const id = nodeCount++;
            const nodeInfo = { id, node, depth, x: 0, y: 0 };
            nodes.push(nodeInfo);
            
            if (node.children && node.children.length > 0) {
              node.children.forEach(child => {
                const childId = assignIds(child, depth + 1);
                if (childId !== null) {
                  edges.push({ from: id, to: childId });
                }
              });
            }
            return id;
          }
          
          assignIds(astData);
          
          const levelGroups = {};
          nodes.forEach(node => {
            if (!levelGroups[node.depth]) levelGroups[node.depth] = [];
            levelGroups[node.depth].push(node);
          });
          
          let maxWidth = 0;
          const depths = Object.keys(levelGroups).map(Number).sort((a, b) => a - b);
          
          // Calculate maximum width needed
          depths.forEach(depth => {
            const levelNodes = levelGroups[depth];
            const levelWidth = levelNodes.length * (nodeWidth + minHorizontalGap);
            maxWidth = Math.max(maxWidth, levelWidth);
          });
          
          // Position nodes with proper centering
          const baseWidth = maxWidth + 200; // Add padding for margins
          depths.forEach(depth => {
            const levelNodes = levelGroups[depth];
            const levelWidth = levelNodes.length * (nodeWidth + minHorizontalGap);
            const startX = (baseWidth - levelWidth) / 2;
            levelNodes.forEach((node, index) => {
              node.x = startX + index * (nodeWidth + minHorizontalGap) + nodeWidth / 2;
              node.y = 100 + depth * verticalGap;
            });
          });
          
          const totalHeight = depths.length > 0 ? (depths[depths.length - 1] + 1) * verticalGap + 150 : 200;
          const totalWidth = baseWidth;
          
          // Create defs for gradients and filters
          const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
          
          // Add blur filter for glow effect
          const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
          filter.setAttribute('id', 'glow');
          const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
          feGaussianBlur.setAttribute('stdDeviation', '4');
          feGaussianBlur.setAttribute('result', 'coloredBlur');
          const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
          const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
          feMergeNode1.setAttribute('in', 'coloredBlur');
          const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
          feMergeNode2.setAttribute('in', 'SourceGraphic');
          feMerge.appendChild(feMergeNode1);
          feMerge.appendChild(feMergeNode2);
          filter.appendChild(feGaussianBlur);
          filter.appendChild(feMerge);
          defs.appendChild(filter);
          
          svg.appendChild(defs);
          
          // Draw edges with gradient effect
          edges.forEach(edge => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            
            if (fromNode && toNode) {
              // Create gradient for each edge
              const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
              gradient.setAttribute('id', \`edgeGradient-\${edge.from}-\${edge.to}\`);
              gradient.setAttribute('x1', '0%');
              gradient.setAttribute('y1', '0%');
              gradient.setAttribute('x2', '0%');
              gradient.setAttribute('y2', '100%');
              const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
              stop1.setAttribute('offset', '0%');
              stop1.setAttribute('stop-color', 'rgba(59, 130, 246, 0.6)');
              const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
              stop2.setAttribute('offset', '100%');
              stop2.setAttribute('stop-color', 'rgba(59, 130, 246, 0.2)');
              gradient.appendChild(stop1);
              gradient.appendChild(stop2);
              defs.appendChild(gradient);
              
              const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              const controlY = (fromNode.y + toNode.y) / 2;
              const d = \`M \${fromNode.x} \${fromNode.y + nodeHeight/2} Q \${fromNode.x} \${controlY} \${toNode.x} \${toNode.y - nodeHeight/2}\`;
              path.setAttribute('d', d);
              path.setAttribute('stroke', \`url(#edgeGradient-\${edge.from}-\${edge.to})\`);
              path.setAttribute('stroke-width', '2.5');
              path.setAttribute('fill', 'none');
              path.setAttribute('stroke-linecap', 'round');
              path.setAttribute('stroke-linejoin', 'round');
              path.style.transition = 'stroke-width 0.2s ease';
              svg.appendChild(path);
            }
          });
          
          // Draw nodes with enhanced styling
          nodes.forEach(nodeInfo => {
            const { x, y, node } = nodeInfo;
            const color = getNodeColor(node.type);
            const depth = nodeInfo.depth;
            
            // Create a group for better organization
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            // Draw node background with subtle shadow
            const shadowRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shadowRect.setAttribute('x', x - nodeWidth / 2 + 2);
            shadowRect.setAttribute('y', y - nodeHeight / 2 + 2);
            shadowRect.setAttribute('width', nodeWidth);
            shadowRect.setAttribute('height', nodeHeight);
            shadowRect.setAttribute('rx', '10');
            shadowRect.setAttribute('ry', '10');
            shadowRect.setAttribute('fill', 'rgba(0, 0, 0, 0.3)');
            shadowRect.setAttribute('pointer-events', 'none');
            group.appendChild(shadowRect);
            
            // Main node rectangle with gradient
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', \`nodeGradient-\${nodeInfo.id}\`);
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '0%');
            gradient.setAttribute('y2', '100%');
            
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', color + 'E6');
            stop1.setAttribute('stop-opacity', '1');
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', color + '99');
            stop2.setAttribute('stop-opacity', '1');
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x - nodeWidth / 2);
            rect.setAttribute('y', y - nodeHeight / 2);
            rect.setAttribute('width', nodeWidth);
            rect.setAttribute('height', nodeHeight);
            rect.setAttribute('rx', '10');
            rect.setAttribute('ry', '10');
            rect.setAttribute('fill', \`url(#nodeGradient-\${nodeInfo.id})\`);
            rect.setAttribute('stroke', color);
            rect.setAttribute('stroke-width', '1.5');
            rect.setAttribute('class', 'tree-node');
            
            // Depth-based opacity for visual hierarchy
            const opacity = Math.max(0.7, 1 - (depth * 0.05));
            rect.setAttribute('opacity', opacity);
            
            rect.style.cursor = 'pointer';
            rect.style.transition = 'all 0.3s ease';
            
            rect.addEventListener('mouseover', () => {
              rect.setAttribute('stroke-width', '2.5');
              rect.setAttribute('opacity', '1');
              rect.setAttribute('filter', 'url(#glow)');
              group.style.filter = \`drop-shadow(0 0 12px \${color})\`;
            });
            
            rect.addEventListener('mouseout', () => {
              rect.setAttribute('stroke-width', '1.5');
              rect.setAttribute('opacity', opacity);
              rect.setAttribute('filter', 'none');
              group.style.filter = 'none';
            });
            
            group.appendChild(rect);
            
            // Add text label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y + 1);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', '#e2e8f0');
            text.setAttribute('font-size', '13');
            text.setAttribute('font-weight', '600');
            text.setAttribute('font-family', 'system-ui, -apple-system, monospace');
            text.setAttribute('pointer-events', 'none');
            text.setAttribute('letter-spacing', '-0.3');
            
            let label = node.type.length > 11 ? node.type.substring(0, 10) + '.' : node.type;
            text.textContent = label;
            group.appendChild(text);
            
            // Add interactive tooltip
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            const tooltipText = [
              node.type,
              node.value ? 'Value: "' + node.value + '"' : '',
              node.line ? 'Line: ' + node.line : '',
              'Depth: ' + depth
            ].filter(x => x).join('\\n');
            title.textContent = tooltipText;
            rect.appendChild(title);
            
            svg.appendChild(group);
          });
          
          svg.setAttribute('width', totalWidth);
          svg.setAttribute('height', totalHeight);
          svg.setAttribute('viewBox', '0 0 ' + totalWidth + ' ' + totalHeight);
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        }
        
        // ============= Search Functionality =============
        function handleSearch(query) {
          const items = document.querySelectorAll('.tree-item');
          const normalizedQuery = query.toLowerCase();
          
          items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (normalizedQuery === '' || text.includes(normalizedQuery)) {
              item.style.opacity = '1';
              item.style.background = normalizedQuery && text.includes(normalizedQuery) ? 'rgba(59, 130, 246, 0.2)' : '';
            } else {
              item.style.opacity = '0.3';
            }
          });
        }
        
        // ============= Event Listeners =============
        document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
        document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
        document.getElementById('fitBtn').addEventListener('click', fitToScreen);
        document.getElementById('resetBtn').addEventListener('click', resetView);
        
        document.getElementById('searchInput').addEventListener('input', (e) => {
          handleSearch(e.target.value);
        });
        

        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
          if (e.code === 'Equal' || e.code === 'Plus') { zoomIn(); e.preventDefault(); }
          if (e.code === 'Minus') { zoomOut(); e.preventDefault(); }
          if (e.code === 'KeyR' && (e.ctrlKey || e.metaKey)) { resetView(); e.preventDefault(); }
          if (e.code === 'KeyF' && (e.ctrlKey || e.metaKey)) { document.getElementById('searchInput').focus(); e.preventDefault(); }
        });
        
        // ============= Initialization =============
        function init() {
          drawSVGTree();
          
          // Fit to screen on load with enough time for rendering
          setTimeout(() => {
            fitToScreen();
            // Force a redraw to ensure everything is properly positioned
            applyTransform();
          }, 200);
        }
        
        init();
      </script>
    </body>
    </html>
  `;
}
