class SlotMachine {
    constructor() {
        this.symbols = ['symbol1', 'symbol2', 'symbol3']; // Nombres de archivos de imágenes
        this.symbolImages = {
            'symbol1': 'images/symbol1.png',
            'symbol2': 'images/symbol2.png', 
            'symbol3': 'images/symbol3.png'
        };
        this.score = 1000;
        this.bet = 10; // Apuesta fija de 10 puntos
        this.isSpinning = false;
        this.activeLines = 1; // Solo 1 línea de pago: la del medio
        this.paylinePatterns = [
            [1, 1, 1, 1, 1] // Solo línea del medio
        ];
        
        // Sistema de premios simplificado: solo importa la cantidad de símbolos iguales
        this.prizes = {
            3: { points: 50, name: 'Premio Bajo', bonus: 'Sticker Speed' },
            4: { points: 200, name: 'Premio Medio', bonus: 'Llavero' },
            5: { points: 1000, name: 'Premio Alto', bonus: 'JACKPOT! Lata Speed' }
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateDisplay();
        this.preloadImages();
        this.initializeSymbols();
    }

    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.prizeElement = document.getElementById('prize');
        this.spinBtn = document.getElementById('spinBtn');
        this.activeLinesElement = document.getElementById('activeLines');
        this.reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3'),
            document.getElementById('reel4'),
            document.getElementById('reel5')
        ];
        this.paylines = [
            document.getElementById('payline1'),
            document.getElementById('payline2'),
            document.getElementById('payline3'),
            document.getElementById('payline4'),
            document.getElementById('payline5')
        ];
        this.modal = document.getElementById('winModal');
        this.winTitle = document.getElementById('winTitle');
        this.winMessage = document.getElementById('winMessage');
        this.winPrize = document.getElementById('winPrize');
        this.closeModalBtn = document.getElementById('closeModal');
    }

    setupEventListeners() {
        this.spinBtn.addEventListener('click', () => this.spin());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        // Teclas de acceso rápido
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isSpinning) {
                e.preventDefault();
                this.spin();
            }
        });
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.prizeElement.textContent = '0';
        this.activeLinesElement.textContent = this.activeLines;
    }

    preloadImages() {
        // Precargar todas las imágenes para evitar problemas de renderización
        Object.values(this.symbolImages).forEach(imageSrc => {
            const img = new Image();
            img.src = imageSrc;
        });
    }

    initializeSymbols() {
        // Inicializar todos los símbolos con imágenes
        this.reels.forEach(reel => {
            const symbols = reel.querySelectorAll('.symbol');
            symbols.forEach(symbol => {
                // Generar un símbolo aleatorio para la inicialización
                const randomSymbol = this.getRandomSymbol();
                this.updateSymbolDisplay(symbol, randomSymbol);
            });
        });
    }

    async spin() {
        if (this.isSpinning || this.score < this.bet) return;
        
        this.isSpinning = true;
        this.score -= this.bet;
        this.updateDisplay();
        
        // Ocultar líneas de pago
        this.paylines.forEach(payline => {
            payline.classList.remove('show');
        });
        
        // Generar resultado final ANTES de empezar a girar
        this.finalResult = this.generateFinalResult();
        
        // Iniciar animación de giro con efecto de aceleración
        this.reels.forEach((reel, index) => {
            setTimeout(() => {
                reel.classList.add('spinning');
            }, index * 100); // Iniciar con delay escalonado
        });
        
        this.spinBtn.disabled = true;
        this.spinBtn.innerHTML = '<span class="spin-text">GIRANDO...</span><div class="spin-glow"></div>';
        
        // Simular tiempo de giro más largo con desaceleración gradual
        await this.sleep(3000);
        
        // Añadir efecto de desaceleración
        this.reels.forEach(reel => {
            reel.classList.add('slowing');
        });
        
        await this.sleep(2000);
        
        // Detener animación y mostrar resultado final
        this.stopReelsWithFinalResult();
        
        // Verificar ganancias después de que todas las ruedas se detengan
        setTimeout(() => {
            this.checkWin();
            this.isSpinning = false;
            this.spinBtn.disabled = false;
            this.spinBtn.innerHTML = '<span class="spin-text">GIRAR</span><div class="spin-glow"></div>';
            this.updateDisplay();
        }, 2000); // Más tiempo para que se vea la combinación
    }

    stopReels() {
        this.reels.forEach(reel => {
            reel.classList.remove('spinning');
        });
    }

    generateFinalResult() {
        // Generar el resultado final que se mostrará
        const result = [];
        for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
            const reelSymbols = [];
            for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
                reelSymbols.push(this.getRandomSymbol());
            }
            result.push(reelSymbols);
        }
        return result;
    }

    stopReelsWithFinalResult() {
        // Detener las ruedas de forma escalonada y mostrar el resultado final
        this.reels.forEach((reel, index) => {
            setTimeout(() => {
                reel.classList.remove('spinning', 'slowing');
                reel.classList.add('stopping');
                
                // Mostrar el resultado final para esta rueda
                this.showFinalResultForReel(reel, index);
                
                // Efecto de rebote al detenerse
                setTimeout(() => {
                    reel.classList.remove('stopping');
                }, 300);
            }, index * 500); // 500ms entre cada rueda para más dramatismo
        });
    }

    showFinalResultForReel(reel, reelIndex) {
        const symbols = reel.querySelectorAll('.symbol');
        const finalSymbols = this.finalResult[reelIndex];
        
        symbols.forEach((symbolElement, rowIndex) => {
            this.updateSymbolDisplay(symbolElement, finalSymbols[rowIndex]);
        });
    }

    stopReelsStaggered() {
        // Detener las ruedas de forma escalonada (de izquierda a derecha)
        this.reels.forEach((reel, index) => {
            setTimeout(() => {
                reel.classList.remove('spinning', 'slowing');
                reel.classList.add('stopping');
                
                // Efecto de rebote al detenerse
                setTimeout(() => {
                    reel.classList.remove('stopping');
                }, 300);
            }, index * 500); // 500ms entre cada rueda para más dramatismo
        });
    }

    checkWin() {
        const grid = this.getReelResults();
        
        // Solo verificar la línea del medio (fila 1 de cada reel)
        const middleLine = [];
        for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
            middleLine.push(grid[reelIndex][1]); // Fila del medio
        }
        
        const win = this.checkLineWin(middleLine);
        
        if (win.winning) {
            this.score += win.points;
            this.prizeElement.textContent = win.points;
            
            // Mostrar línea de pago ganadora (solo la del medio)
            this.paylines[1].classList.add('show'); // payline2 es la del medio
            
            // Efecto de brillo en las ruedas ganadoras
            this.highlightWinningReels();
            
            // Efecto de suspense: esperar para mostrar el modal
            setTimeout(() => {
                this.showWinModal([{
                    line: 1,
                    symbols: middleLine,
                    points: win.points,
                    prizeName: win.prizeName,
                    bonus: win.bonus,
                    count: win.count
                }], win.points);
                
                this.createConfetti();
            }, 3000); // 3 segundos de suspense para ver la combinación
            
        } else {
            this.prizeElement.textContent = '0';
        }
    }

    getReelResults() {
        const grid = [];
        this.reels.forEach((reel, reelIndex) => {
            const symbols = reel.querySelectorAll('.symbol');
            const reelSymbols = [];
            for (let i = 0; i < 3; i++) {
                // Leer el símbolo actual del DOM en lugar de generar uno nuevo
                const currentSymbol = this.getCurrentSymbolFromDOM(symbols[i]);
                reelSymbols.push(currentSymbol);
            }
            grid.push(reelSymbols);
        });
        return grid;
    }

    getCurrentSymbolFromDOM(symbolElement) {
        // Obtener el símbolo actual del DOM
        const img = symbolElement.querySelector('img');
        if (img) {
            const src = img.src;
            if (src.includes('symbol1')) return 'symbol1';
            if (src.includes('symbol2')) return 'symbol2';
            if (src.includes('symbol3')) return 'symbol3';
        }
        
        // Fallback a emoji si no hay imagen
        const text = symbolElement.textContent;
        if (text.includes('⚡️')) return 'symbol1';
        if (text.includes('🚀')) return 'symbol2';
        if (text.includes('😎')) return 'symbol3';
        
        return 'symbol3'; // Default
    }

    getRandomSymbol() {
        // Probabilidades realistas: symbol1 es más raro, symbol3 es más común
        const random = Math.random();
        if (random < 0.1) return 'symbol1';      // 10% probabilidad
        else if (random < 0.3) return 'symbol2';  // 20% probabilidad
        else return 'symbol3';                    // 70% probabilidad
    }

    updateSymbolDisplay(symbolElement, symbolName) {
        // Verificar si ya tiene el símbolo correcto para evitar cambios innecesarios
        const currentSymbol = this.getCurrentSymbolFromDOM(symbolElement);
        if (currentSymbol === symbolName) {
            return; // No cambiar si ya es el símbolo correcto
        }
        
        // Limpiar contenido anterior
        symbolElement.innerHTML = '';
        
        // Crear imagen
        const img = document.createElement('img');
        img.src = this.symbolImages[symbolName];
        img.alt = symbolName;
        img.className = 'symbol-image';
        
        // Agregar la imagen inmediatamente (ya está precargada)
        symbolElement.appendChild(img);
        
        // Si la imagen falla al cargar, mostrar emoji como fallback
        img.onerror = () => {
            const fallbackEmojis = {
                'symbol1': '⚡️',
                'symbol2': '🚀',
                'symbol3': '😎'
            };
            symbolElement.innerHTML = fallbackEmojis[symbolName] || '?';
        };
    }

    getLineSymbols(grid, payline) {
        const lineSymbols = [];
        for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
            const rowIndex = payline[reelIndex];
            lineSymbols.push(grid[reelIndex][rowIndex]);
        }
        return lineSymbols;
    }

    checkLineWin(lineSymbols) {
        // Contar símbolos consecutivos desde la izquierda
        const firstSymbol = lineSymbols[0];
        let count = 1;
        
        for (let i = 1; i < lineSymbols.length; i++) {
            if (lineSymbols[i] === firstSymbol) {
                count++;
            } else {
                break;
            }
        }
        
        // Solo gana con 3, 4 o 5 símbolos iguales (no importa cuál símbolo)
        if (count >= 3 && count <= 5 && this.prizes[count]) {
            const prize = this.prizes[count];
            return {
                winning: true,
                points: prize.points,
                prizeName: prize.name,
                bonus: prize.bonus,
                symbol: firstSymbol,
                count: count
            };
        }
        
        return { winning: false, points: 0, prizeName: '', bonus: '' };
    }

    showWinModal(winningLines, totalWinnings) {
        this.winTitle.textContent = '¡FELICIDADES!';
        this.winMessage.textContent = `Has ganado ${totalWinnings} puntos`;
        
        let prizeHTML = `<div style="font-size: 1.5rem; color: #ffff00; margin: 20px 0;">Total: +${totalWinnings} puntos</div>`;
        
        const win = winningLines[0];
        prizeHTML += `
            <div style="font-size: 2.5rem; margin: 15px 0;">${win.count} Símbolos Iguales</div>
            <div style="font-size: 1.5rem; color: #00ffff; margin: 10px 0;">${win.prizeName}</div>
            <div style="font-size: 1.2rem; color: #ffff00; margin: 10px 0;">+${win.points} puntos</div>
        `;
        
        // Agregar premio especial según la cantidad de símbolos
        if (win.count === 5) {
            prizeHTML += `<div style="font-size: 1.8rem; color: #ff00ff; margin: 15px 0;">🎉 ¡JACKPOT! LATA SPEED! 🎉</div>`;
        } else if (win.count === 4) {
            prizeHTML += `<div style="font-size: 1.5rem; color: #00ffff; margin: 15px 0;">🥳 Llavero SPEED! 🥳</div>`;
        } else if (win.count === 3) {
            prizeHTML += `<div style="font-size: 1.3rem; color: #ffff00; margin: 15px 0;">⚡️ ¡STICKER SPEED! ⚡️</div>`;
        }
        
        this.winPrize.innerHTML = prizeHTML;
        this.modal.style.display = 'block';
        
        // Efecto de sonido (simulado con vibración si está disponible)
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    highlightWinningReels() {
        // Resaltar las ruedas ganadoras con efecto de brillo
        this.reels.forEach((reel, index) => {
            setTimeout(() => {
                reel.classList.add('winning');
                
                // Efecto de pulso
                setTimeout(() => {
                    reel.classList.remove('winning');
                }, 2000);
            }, index * 200);
        });
    }

    createConfetti() {
        // Crear efecto de confeti simple
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.top = '-10px';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = ['#ff00ff', '#00ffff', '#ffff00', '#ff6600'][Math.floor(Math.random() * 4)];
                confetti.style.borderRadius = '50%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '1000';
                confetti.style.animation = 'fall 3s linear forwards';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 50);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Agregar animación CSS para el confeti
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new SlotMachine();
});

// Efectos de partículas de fondo
function createBackgroundParticles() {
    const container = document.querySelector('.container');
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = Math.random() * window.innerHeight + 'px';
        particle.style.width = '2px';
        particle.style.height = '2px';
        particle.style.backgroundColor = '#00ffff';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.opacity = '0.5';
        particle.style.animation = `float ${3 + Math.random() * 4}s ease-in-out infinite`;
        particle.style.zIndex = '-1';
        
        document.body.appendChild(particle);
    }
}

// Agregar animación CSS para las partículas
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.5;
        }
        25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
        }
        50% {
            transform: translateY(-10px) translateX(-10px);
            opacity: 0.3;
        }
        75% {
            transform: translateY(-30px) translateX(5px);
            opacity: 0.6;
        }
    }
`;
document.head.appendChild(particleStyle);

// Crear partículas de fondo
createBackgroundParticles();
