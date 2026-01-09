       /*This is a JavaScript file for 3D particle system operated on hand gestures*/
        // Three.js Setup
        let scene, camera, renderer, particles, particleGeometry, particleMaterial;
        let currentTemplate = 'galaxy';
        let currentColorScheme = 0;
        let expansionFactor = 1.0;
        let targetExpansion = 1.0;
        let lastGestureTime = 0;
        let particlePositions, particleColors, particleVelocities;
        let particleCount = 5000;

        // Gesture state
        let currentGesture = 'none';
        let handDetected = false;

        // Color schemes
        const colorSchemes = [
            [[0.0, 1.0, 0.53], [0.0, 0.5, 1.0], [1.0, 0.0, 1.0]], // Green-Blue-Purple
            [[1.0, 0.0, 0.0], [1.0, 0.5, 0.0], [1.0, 1.0, 0.0]],   // Red-Orange-Yellow
            [[1.0, 0.0, 0.5], [0.5, 0.0, 1.0], [0.0, 1.0, 1.0]],   // Pink-Purple-Cyan
            [[0.0, 1.0, 0.0], [1.0, 1.0, 1.0], [0.0, 0.5, 0.0]],   // Green-White-DarkGreen
            [[1.0, 0.3, 0.0], [1.0, 0.8, 0.0], [1.0, 1.0, 1.0]]    // Orange-Gold-White
        ];

        // Expanded Templates - Now with 15 different particle formations
        const templates = [
            'galaxy', 'heart', 'flower', 'saturn', 'fireworks', 
            'spiral', 'cube', 'sphere', 'torus', 'dna', 
            'wave', 'tornado', 'constellation', 'atomic', 'phoenix'
        ];
        let currentTemplateIndex = 0;

        function initThreeJS() {
            const container = document.getElementById('container');
            
            // Scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x000510);
            
            // Camera
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 50;
            
            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);
            
            // Initialize particles
            createParticleSystem();
            
            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            
            const pointLight = new THREE.PointLight(0x00ff88, 1, 100);
            pointLight.position.set(0, 0, 50);
            scene.add(pointLight);
            
            // Handle window resize
            window.addEventListener('resize', onWindowResize, false);
            
            animate();
        }

        function createParticleSystem() {
            if (particles) {
                scene.remove(particles);
                particleGeometry.dispose();
                particleMaterial.dispose();
            }

            particleGeometry = new THREE.BufferGeometry();
            particlePositions = new Float32Array(particleCount * 3);
            particleColors = new Float32Array(particleCount * 3);
            particleVelocities = new Float32Array(particleCount * 3);

            generateParticleTemplate(currentTemplate);

            particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
            particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

            particleMaterial = new THREE.PointsMaterial({
                size: 0.5,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });

            particles = new THREE.Points(particleGeometry, particleMaterial);
            scene.add(particles);
        }

        function generateParticleTemplate(template) {
            const colors = colorSchemes[currentColorScheme];
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                let x, y, z;

                switch(template) {
                    case 'galaxy':
                        const angle = Math.random() * Math.PI * 2;
                        const radius = Math.random() * 30;
                        const spiralAngle = radius * 0.3;
                        x = Math.cos(angle + spiralAngle) * radius;
                        y = (Math.random() - 0.5) * 5;
                        z = Math.sin(angle + spiralAngle) * radius;
                        break;

                    case 'heart':
                        const t = Math.random() * Math.PI * 2;
                        const scale = Math.random() * 10 + 10;
                        x = scale * 16 * Math.pow(Math.sin(t), 3);
                        y = scale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * 0.7;
                        z = (Math.random() - 0.5) * 5;
                        x *= 0.15;
                        y *= 0.15;
                        break;

                    case 'flower':
                        const petalAngle = Math.random() * Math.PI * 2;
                        const petalRadius = (Math.sin(petalAngle * 5) * 0.5 + 1) * Math.random() * 20;
                        x = Math.cos(petalAngle) * petalRadius;
                        y = Math.sin(petalAngle) * petalRadius;
                        z = (Math.random() - 0.5) * 3;
                        break;

                    case 'saturn':
                        if (Math.random() > 0.3) {
                            // Ring
                            const ringAngle = Math.random() * Math.PI * 2;
                            const ringRadius = Math.random() * 15 + 15;
                            x = Math.cos(ringAngle) * ringRadius;
                            y = (Math.random() - 0.5) * 2;
                            z = Math.sin(ringAngle) * ringRadius;
                        } else {
                            // Planet
                            const theta = Math.random() * Math.PI * 2;
                            const phi = Math.random() * Math.PI;
                            const r = Math.random() * 10;
                            x = r * Math.sin(phi) * Math.cos(theta);
                            y = r * Math.sin(phi) * Math.sin(theta);
                            z = r * Math.cos(phi);
                        }
                        break;

                    case 'fireworks':
                        const burstAngle = Math.random() * Math.PI * 2;
                        const burstAngleY = Math.random() * Math.PI;
                        const burstRadius = Math.pow(Math.random(), 0.3) * 40;
                        x = Math.sin(burstAngleY) * Math.cos(burstAngle) * burstRadius;
                        y = Math.sin(burstAngleY) * Math.sin(burstAngle) * burstRadius;
                        z = Math.cos(burstAngleY) * burstRadius;
                        
                        particleVelocities[i3] = (Math.random() - 0.5) * 0.2;
                        particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.2;
                        particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
                        break;

                    case 'spiral':
                        const spiralT = (i / particleCount) * Math.PI * 10;
                        const spiralR = spiralT * 2;
                        x = Math.cos(spiralT) * spiralR;
                        y = spiralT * 2 - 30;
                        z = Math.sin(spiralT) * spiralR;
                        break;

                    case 'cube':
                        x = (Math.random() - 0.5) * 40;
                        y = (Math.random() - 0.5) * 40;
                        z = (Math.random() - 0.5) * 40;
                        if (Math.random() > 0.7) {
                            // Place on cube faces
                            const face = Math.floor(Math.random() * 6);
                            if (face === 0) x = 20;
                            else if (face === 1) x = -20;
                            else if (face === 2) y = 20;
                            else if (face === 3) y = -20;
                            else if (face === 4) z = 20;
                            else z = -20;
                        }
                        break;

                    case 'sphere':
                        const sphereTheta = Math.random() * Math.PI * 2;
                        const spherePhi = Math.random() * Math.PI;
                        const sphereR = 20 + Math.random() * 10;
                        x = sphereR * Math.sin(spherePhi) * Math.cos(sphereTheta);
                        y = sphereR * Math.sin(spherePhi) * Math.sin(sphereTheta);
                        z = sphereR * Math.cos(spherePhi);
                        break;

                    case 'torus':
                        const torusAngle1 = Math.random() * Math.PI * 2;
                        const torusAngle2 = Math.random() * Math.PI * 2;
                        const majorRadius = 20;
                        const minorRadius = 8;
                        x = (majorRadius + minorRadius * Math.cos(torusAngle2)) * Math.cos(torusAngle1);
                        y = (majorRadius + minorRadius * Math.cos(torusAngle2)) * Math.sin(torusAngle1);
                        z = minorRadius * Math.sin(torusAngle2);
                        break;

                    case 'dna':
                        const dnaT = (i / particleCount) * Math.PI * 8;
                        const dnaRadius = 10;
                        const strand = i % 2;
                        const phaseShift = strand * Math.PI;
                        x = Math.cos(dnaT + phaseShift) * dnaRadius;
                        y = dnaT * 3 - 30;
                        z = Math.sin(dnaT + phaseShift) * dnaRadius;
                        
                        // Add connecting particles
                        if (i % 50 === 0) {
                            x = Math.cos(dnaT) * (Math.random() * dnaRadius);
                            z = Math.sin(dnaT) * (Math.random() * dnaRadius);
                        }
                        break;

                    case 'wave':
                        const waveX = (i / particleCount) * 80 - 40;
                        const waveZ = (i / particleCount) * 80 - 40;
                        x = waveX;
                        y = Math.sin(waveX * 0.2) * 10 + Math.cos(waveZ * 0.2) * 10;
                        z = waveZ;
                        break;

                    case 'tornado':
                        const tornadoHeight = (i / particleCount) * 60 - 30;
                        const tornadoRadius = Math.abs(tornadoHeight) * 0.3 + 5;
                        const tornadoAngle = (i / particleCount) * Math.PI * 10 + Math.random() * 0.5;
                        x = Math.cos(tornadoAngle) * tornadoRadius;
                        y = tornadoHeight;
                        z = Math.sin(tornadoAngle) * tornadoRadius;
                        
                        particleVelocities[i3] = Math.cos(tornadoAngle + Math.PI/2) * 0.05;
                        particleVelocities[i3 + 2] = Math.sin(tornadoAngle + Math.PI/2) * 0.05;
                        break;

                    case 'constellation':
                        // Create star clusters connected by lines
                        const clusterCount = 8;
                        const clusterId = Math.floor(i / (particleCount / clusterCount));
                        const clusterAngle = (clusterId / clusterCount) * Math.PI * 2;
                        const clusterRadius = 25;
                        const clusterCenterX = Math.cos(clusterAngle) * clusterRadius;
                        const clusterCenterZ = Math.sin(clusterAngle) * clusterRadius;
                        
                        x = clusterCenterX + (Math.random() - 0.5) * 10;
                        y = (Math.random() - 0.5) * 10;
                        z = clusterCenterZ + (Math.random() - 0.5) * 10;
                        break;

                    case 'atomic':
                        // Nucleus
                        if (i < particleCount * 0.1) {
                            const nucTheta = Math.random() * Math.PI * 2;
                            const nucPhi = Math.random() * Math.PI;
                            const nucR = Math.random() * 3;
                            x = nucR * Math.sin(nucPhi) * Math.cos(nucTheta);
                            y = nucR * Math.sin(nucPhi) * Math.sin(nucTheta);
                            z = nucR * Math.cos(nucPhi);
                        } else {
                            // Electron orbits
                            const orbitLevel = Math.floor(Math.random() * 3);
                            const orbitRadius = (orbitLevel + 1) * 10;
                            const orbitAngle = Math.random() * Math.PI * 2;
                            const orbitTilt = Math.random() * Math.PI;
                            
                            x = Math.cos(orbitAngle) * orbitRadius;
                            y = Math.sin(orbitTilt) * Math.sin(orbitAngle) * orbitRadius;
                            z = Math.cos(orbitTilt) * Math.sin(orbitAngle) * orbitRadius;
                        }
                        break;

                    case 'phoenix':
                        // Bird-like shape with wings
                        const phoenixT = (i / particleCount) * Math.PI * 2;
                        const phoenixSection = Math.floor((i / particleCount) * 5);
                        
                        if (phoenixSection < 1) {
                            // Body
                            x = (Math.random() - 0.5) * 5;
                            y = Math.random() * 20 - 10;
                            z = (Math.random() - 0.5) * 5;
                        } else if (phoenixSection < 3) {
                            // Wings
                            const wingSpan = 30;
                            const wingY = Math.sin(phoenixT * 2) * 10;
                            x = (phoenixSection === 1 ? 1 : -1) * (Math.random() * wingSpan);
                            y = wingY;
                            z = Math.abs(Math.cos(phoenixT * 3)) * 10 - 5;
                        } else {
                            // Tail
                            const tailLength = 25;
                            const tailCurve = Math.sin(phoenixT * 3) * 8;
                            x = tailCurve;
                            y = -Math.random() * tailLength;
                            z = tailCurve * 0.5;
                        }
                        break;

                    default:
                        x = (Math.random() - 0.5) * 40;
                        y = (Math.random() - 0.5) * 40;
                        z = (Math.random() - 0.5) * 40;
                        break;
                }

                particlePositions[i3] = x;
                particlePositions[i3 + 1] = y;
                particlePositions[i3 + 2] = z;

                // Assign color from scheme
                const colorIndex = Math.floor(Math.random() * colors.length);
                particleColors[i3] = colors[colorIndex][0];
                particleColors[i3 + 1] = colors[colorIndex][1];
                particleColors[i3 + 2] = colors[colorIndex][2];
            }
        }

        function updateParticles() {
            const positions = particleGeometry.attributes.position.array;
            
            // Smooth expansion transition
            expansionFactor += (targetExpansion - expansionFactor) * 0.05;
            
            // Update particle positions
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                
                // Apply expansion
                const baseX = particlePositions[i3];
                const baseY = particlePositions[i3 + 1];
                const baseZ = particlePositions[i3 + 2];
                
                positions[i3] = baseX * expansionFactor + particleVelocities[i3];
                positions[i3 + 1] = baseY * expansionFactor + particleVelocities[i3 + 1];
                positions[i3 + 2] = baseZ * expansionFactor + particleVelocities[i3 + 2];
                
                // Apply velocity for special templates
                if (currentTemplate === 'fireworks' || currentTemplate === 'tornado') {
                    if (currentTemplate === 'fireworks') {
                        particleVelocities[i3 + 1] -= 0.01; // Gravity
                    }
                    particlePositions[i3] += particleVelocities[i3];
                    particlePositions[i3 + 1] += particleVelocities[i3 + 1];
                    particlePositions[i3 + 2] += particleVelocities[i3 + 2];
                    
                    // Reset if too far
                    if (currentTemplate === 'fireworks' && particlePositions[i3 + 1] < -50) {
                        generateParticleTemplate(currentTemplate);
                    }
                }
            }
            
            particleGeometry.attributes.position.needsUpdate = true;
            
            // Rotate particles
            particles.rotation.y += 0.001;
        }

        function animate() {
            requestAnimationFrame(animate);
            updateParticles();
            renderer.render(scene, camera);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // Hand tracking setup
        let hands;
        let videoElement = document.getElementById('video');

        function setupHandTracking() {
            hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            hands.onResults(onHandsResults);

            const camera = new Camera(videoElement, {
                onFrame: async () => {
                    await hands.send({ image: videoElement });
                },
                width: 640,
                height: 480
            });

            camera.start();
            
            document.getElementById('loading').style.display = 'none';
        }

        function onHandsResults(results) {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                handDetected = true;
                const landmarks = results.multiHandLandmarks[0];
                const gesture = detectGesture(landmarks);
                
                if (gesture !== currentGesture) {
                    currentGesture = gesture;
                    handleGesture(gesture);
                }
                
                document.getElementById('status').textContent = `Gesture: ${gesture}`;
                document.getElementById('status').style.color = '#00ff88';
            } else {
                handDetected = false;
                currentGesture = 'none';
                document.getElementById('status').textContent = 'No hand detected';
                document.getElementById('status').style.color = '#ff6b6b';
            }
        }

        function detectGesture(landmarks) {
            // Extract key points
            const thumb_tip = landmarks[4];
            const index_tip = landmarks[8];
            const middle_tip = landmarks[12];
            const ring_tip = landmarks[16];
            const pinky_tip = landmarks[20];
            
            const thumb_mcp = landmarks[2];
            const index_mcp = landmarks[5];
            const middle_mcp = landmarks[9];
            const ring_mcp = landmarks[13];
            const pinky_mcp = landmarks[17];
            
            const wrist = landmarks[0];

            // Helper function to calculate distance
            const distance = (p1, p2) => {
                return Math.sqrt(
                    Math.pow(p1.x - p2.x, 2) +
                    Math.pow(p1.y - p2.y, 2) +
                    Math.pow(p1.z - p2.z, 2)
                );
            };

            // Finger extension check
            const getFingerExtension = (tip, mcp, wrist) => {
                const tipToWrist = distance(tip, wrist);
                const mcpToWrist = distance(mcp, wrist);
                return tipToWrist / mcpToWrist;
            };

            // Calculate extension ratios
            const thumbRatio = getFingerExtension(thumb_tip, thumb_mcp, wrist);
            const indexRatio = getFingerExtension(index_tip, index_mcp, wrist);
            const middleRatio = getFingerExtension(middle_tip, middle_mcp, wrist);
            const ringRatio = getFingerExtension(ring_tip, ring_mcp, wrist);
            const pinkyRatio = getFingerExtension(pinky_tip, pinky_mcp, wrist);

            // Determine if fingers are extended
            const indexExtended = indexRatio > 1.3;
            const middleExtended = middleRatio > 1.3;
            const ringExtended = ringRatio > 1.3;
            const pinkyExtended = pinkyRatio > 1.3;
            const thumbExtended = thumbRatio > 1.2;

            // Pinch gesture (thumb and index close)
            const thumbIndexDist = distance(thumb_tip, index_tip);
            if (thumbIndexDist < 0.05 && !middleExtended && !ringExtended && !pinkyExtended) {
                return 'pinch';
            }

            // Open palm (all fingers extended)
            if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
                return 'open_palm';
            }

            // THREE FINGERS gesture (index, middle, ring extended - pinky closed)
            // This replaces the fist gesture
            if (indexExtended && middleExtended && ringExtended && !pinkyExtended) {
                return 'three_fingers';
            }

            // Peace sign (index and middle extended, others closed)
            if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
                return 'peace';
            }

            // Thumbs up (only thumb extended, pointing up)
            if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
                // Check if thumb is pointing up
                if (thumb_tip.y < thumb_mcp.y - 0.05) {
                    return 'thumbs_up';
                }
            }

            return 'unknown';
        }

        function handleGesture(gesture) {
            const now = Date.now();
            if (now - lastGestureTime < 500) return; // Debounce
            
            lastGestureTime = now;

            switch(gesture) {
                case 'open_palm':
                    // Expand particles
                    targetExpansion = 2.0;
                    setTimeout(() => { targetExpansion = 1.0; }, 2000);
                    break;

                case 'pinch':
                    // Change color scheme
                    currentColorScheme = (currentColorScheme + 1) % colorSchemes.length;
                    generateParticleTemplate(currentTemplate);
                    particleGeometry.attributes.color.needsUpdate = true;
                    break;

                case 'three_fingers':
                    // Switch template (REPLACED FIST GESTURE)
                    currentTemplateIndex = (currentTemplateIndex + 1) % templates.length;
                    currentTemplate = templates[currentTemplateIndex];
                    createParticleSystem();
                    document.getElementById('template-display').textContent = 
                        `Template: ${currentTemplate.charAt(0).toUpperCase() + currentTemplate.slice(1)}`;
                    break;

                case 'peace':
                    // Trigger fireworks
                    const oldTemplate = currentTemplate;
                    currentTemplate = 'fireworks';
                    createParticleSystem();
                    setTimeout(() => {
                        currentTemplate = oldTemplate;
                        createParticleSystem();
                    }, 3000);
                    break;

                case 'thumbs_up':
                    // Reset to default
                    currentTemplate = 'galaxy';
                    currentTemplateIndex = 0;
                    currentColorScheme = 0;
                    expansionFactor = 1.0;
                    targetExpansion = 1.0;
                    createParticleSystem();
                    document.getElementById('template-display').textContent = 'Template: Galaxy';
                    break;
            }
        }

        // Initialization of everything
        document.addEventListener('DOMContentLoaded', () => {
            initThreeJS();
            setupHandTracking();
        });

