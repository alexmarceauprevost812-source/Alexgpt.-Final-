/* ========================================
   AlexGPT - Image Editor
   Full-featured canvas-based image editor
   ======================================== */

class ImageEditor {
    constructor() {
        this.canvas = document.getElementById('editorCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.modal = document.getElementById('imageEditorModal');
        this.originalImage = null;
        this.currentImage = null;
        this.history = [];
        this.historyIndex = -1;
        this.rotation = 0;
        this.flipH = false;
        this.flipV = false;
        this.activeTool = null;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.aspectRatio = 1;

        // Filters state
        this.filters = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            sepia: 0,
            grayscale: 0
        };

        this.initEvents();
    }

    // ========================================
    // Open / Close
    // ========================================

    open(imageSrc) {
        const img = new Image();
        img.onload = () => {
            this.originalImage = img;
            this.rotation = 0;
            this.flipH = false;
            this.flipV = false;
            this.resetFilters();
            this.history = [];
            this.historyIndex = -1;
            this.activeTool = null;
            this.updateToolButtons();

            this.canvas.width = img.width;
            this.canvas.height = img.height;
            this.aspectRatio = img.width / img.height;

            // Set resize inputs
            document.getElementById('resizeWidth').value = img.width;
            document.getElementById('resizeHeight').value = img.height;

            this.drawImage();
            this.saveToHistory();
            this.modal.classList.add('active');
        };
        img.src = imageSrc;
    }

    close() {
        this.modal.classList.remove('active');
        this.activeTool = null;
        this.updateToolButtons();
    }

    // ========================================
    // Drawing
    // ========================================

    drawImage() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.clearRect(0, 0, w, h);
        this.ctx.save();

        // Apply CSS filters
        this.ctx.filter = this.getFilterString();

        // Apply transforms
        this.ctx.translate(w / 2, h / 2);
        this.ctx.rotate((this.rotation * Math.PI) / 180);
        this.ctx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);

        const drawW = (this.rotation % 180 !== 0) ? h : w;
        const drawH = (this.rotation % 180 !== 0) ? w : h;

        this.ctx.drawImage(this.originalImage, -drawW / 2, -drawH / 2, drawW, drawH);
        this.ctx.restore();
    }

    redrawFromHistory() {
        if (this.historyIndex >= 0 && this.history[this.historyIndex]) {
            const img = new Image();
            img.onload = () => {
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                this.ctx.clearRect(0, 0, img.width, img.height);
                this.ctx.filter = this.getFilterString();
                this.ctx.drawImage(img, 0, 0);
            };
            img.src = this.history[this.historyIndex];
        }
    }

    getFilterString() {
        return `brightness(${this.filters.brightness}%) contrast(${this.filters.contrast}%) saturate(${this.filters.saturation}%) blur(${this.filters.blur}px) sepia(${this.filters.sepia}%) grayscale(${this.filters.grayscale}%)`;
    }

    applyFiltersToCanvas() {
        // Get current canvas as image, then redraw with filters
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw current state without filters first
        if (this.historyIndex >= 0) {
            const img = new Image();
            img.onload = () => {
                tempCtx.drawImage(img, 0, 0);
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.filter = this.getFilterString();
                this.ctx.drawImage(tempCanvas, 0, 0);
            };
            img.src = this.history[this.historyIndex];
        }
    }

    // ========================================
    // History
    // ========================================

    saveToHistory() {
        // Remove any forward history
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(this.canvas.toDataURL('image/png'));
        this.historyIndex = this.history.length - 1;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.redrawFromHistory();
        }
    }

    // ========================================
    // Transforms
    // ========================================

    rotateLeft() {
        this.rotation = (this.rotation - 90 + 360) % 360;
        this.swapCanvasIfNeeded();
        this.drawImage();
        this.saveToHistory();
    }

    rotateRight() {
        this.rotation = (this.rotation + 90) % 360;
        this.swapCanvasIfNeeded();
        this.drawImage();
        this.saveToHistory();
    }

    swapCanvasIfNeeded() {
        if (this.rotation % 180 !== 0) {
            const temp = this.canvas.width;
            this.canvas.width = this.canvas.height;
            this.canvas.height = temp;
        } else {
            this.canvas.width = this.originalImage.width;
            this.canvas.height = this.originalImage.height;
        }
        document.getElementById('resizeWidth').value = this.canvas.width;
        document.getElementById('resizeHeight').value = this.canvas.height;
    }

    flipHorizontal() {
        this.flipH = !this.flipH;
        this.drawImage();
        this.saveToHistory();
    }

    flipVertical() {
        this.flipV = !this.flipV;
        this.drawImage();
        this.saveToHistory();
    }

    resize(newW, newH) {
        if (newW < 1 || newH < 1) return;

        // Get current canvas content
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        tempCanvas.getContext('2d').drawImage(this.canvas, 0, 0);

        this.canvas.width = newW;
        this.canvas.height = newH;
        this.ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, newW, newH);

        document.getElementById('resizeWidth').value = newW;
        document.getElementById('resizeHeight').value = newH;
        this.aspectRatio = newW / newH;
        this.saveToHistory();
    }

    reset() {
        this.rotation = 0;
        this.flipH = false;
        this.flipV = false;
        this.resetFilters();
        this.updateFilterSliders();
        this.canvas.width = this.originalImage.width;
        this.canvas.height = this.originalImage.height;
        this.aspectRatio = this.originalImage.width / this.originalImage.height;
        document.getElementById('resizeWidth').value = this.originalImage.width;
        document.getElementById('resizeHeight').value = this.originalImage.height;
        this.drawImage();
        this.saveToHistory();
    }

    resetFilters() {
        this.filters = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            sepia: 0,
            grayscale: 0
        };
    }

    updateFilterSliders() {
        document.getElementById('filterBrightness').value = this.filters.brightness;
        document.getElementById('filterContrast').value = this.filters.contrast;
        document.getElementById('filterSaturation').value = this.filters.saturation;
        document.getElementById('filterBlur').value = this.filters.blur;
        document.getElementById('filterSepia').value = this.filters.sepia;
        document.getElementById('filterGrayscale').value = this.filters.grayscale;
    }

    // ========================================
    // Drawing Tool
    // ========================================

    startDraw(x, y) {
        if (this.activeTool === 'draw') {
            this.isDrawing = true;
            this.lastX = x;
            this.lastY = y;
        } else if (this.activeTool === 'text') {
            this.placeText(x, y);
        }
    }

    draw(x, y) {
        if (!this.isDrawing || this.activeTool !== 'draw') return;

        this.ctx.save();
        this.ctx.filter = 'none';
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.strokeStyle = document.getElementById('drawColor').value;
        this.ctx.lineWidth = parseInt(document.getElementById('drawSize').value);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        this.ctx.restore();

        this.lastX = x;
        this.lastY = y;
    }

    stopDraw() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveToHistory();
        }
    }

    placeText(x, y) {
        const text = document.getElementById('textInput').value;
        if (!text) return;

        const color = document.getElementById('textColor').value;
        const size = parseInt(document.getElementById('textSize').value);

        this.ctx.save();
        this.ctx.filter = 'none';
        this.ctx.font = `${size}px Inter, sans-serif`;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();

        this.saveToHistory();
    }

    // ========================================
    // Crop
    // ========================================

    startCrop() {
        if (this.activeTool === 'crop') {
            this.activeTool = null;
            this.updateToolButtons();
            this.removeCropOverlay();
            return;
        }

        this.activeTool = 'crop';
        this.updateToolButtons();

        // Create crop overlay
        const container = document.getElementById('editorCanvasContainer');
        let overlay = document.getElementById('cropOverlay');
        if (overlay) overlay.remove();

        overlay = document.createElement('div');
        overlay.id = 'cropOverlay';
        overlay.style.cssText = `
            position: absolute;
            border: 2px dashed #00cc44;
            background: rgba(0, 204, 68, 0.1);
            cursor: move;
            min-width: 20px;
            min-height: 20px;
        `;

        // Default crop to center 50%
        const rect = this.canvas.getBoundingClientRect();
        const cropW = rect.width * 0.5;
        const cropH = rect.height * 0.5;
        overlay.style.width = cropW + 'px';
        overlay.style.height = cropH + 'px';
        overlay.style.left = (rect.left - container.getBoundingClientRect().left + (rect.width - cropW) / 2) + 'px';
        overlay.style.top = (rect.top - container.getBoundingClientRect().top + (rect.height - cropH) / 2) + 'px';

        // Apply crop button
        const applyBtn = document.createElement('button');
        applyBtn.textContent = 'Recadrer';
        applyBtn.style.cssText = `
            position: absolute; bottom: -36px; left: 50%; transform: translateX(-50%);
            padding: 6px 16px; background: #00cc44; color: white; border: none;
            border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 500;
            white-space: nowrap;
        `;
        applyBtn.addEventListener('click', () => this.applyCrop());
        overlay.appendChild(applyBtn);

        // Make draggable
        let isDragging = false;
        let startOX, startOY, startLeft, startTop;

        overlay.addEventListener('mousedown', (e) => {
            if (e.target === applyBtn) return;
            isDragging = true;
            startOX = e.clientX;
            startOY = e.clientY;
            startLeft = parseInt(overlay.style.left);
            startTop = parseInt(overlay.style.top);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            overlay.style.left = (startLeft + e.clientX - startOX) + 'px';
            overlay.style.top = (startTop + e.clientY - startOY) + 'px';
        });

        document.addEventListener('mouseup', () => { isDragging = false; });

        // Resize handles
        const handle = document.createElement('div');
        handle.style.cssText = `
            position: absolute; bottom: -4px; right: -4px; width: 12px; height: 12px;
            background: #00cc44; border-radius: 50%; cursor: se-resize;
        `;
        let isResizing = false;
        let resizeStartX, resizeStartY, resizeStartW, resizeStartH;

        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isResizing = true;
            resizeStartX = e.clientX;
            resizeStartY = e.clientY;
            resizeStartW = parseInt(overlay.style.width);
            resizeStartH = parseInt(overlay.style.height);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const newW = Math.max(20, resizeStartW + e.clientX - resizeStartX);
            const newH = Math.max(20, resizeStartH + e.clientY - resizeStartY);
            overlay.style.width = newW + 'px';
            overlay.style.height = newH + 'px';
        });

        document.addEventListener('mouseup', () => { isResizing = false; });

        overlay.appendChild(handle);
        container.appendChild(overlay);
    }

    applyCrop() {
        const overlay = document.getElementById('cropOverlay');
        if (!overlay) return;

        const canvasRect = this.canvas.getBoundingClientRect();
        const overlayRect = overlay.getBoundingClientRect();

        // Calculate crop coordinates relative to the actual canvas pixels
        const scaleX = this.canvas.width / canvasRect.width;
        const scaleY = this.canvas.height / canvasRect.height;

        const cropX = Math.max(0, (overlayRect.left - canvasRect.left) * scaleX);
        const cropY = Math.max(0, (overlayRect.top - canvasRect.top) * scaleY);
        const cropW = Math.min(this.canvas.width - cropX, overlayRect.width * scaleX);
        const cropH = Math.min(this.canvas.height - cropY, overlayRect.height * scaleY);

        // Get cropped data
        const imageData = this.ctx.getImageData(cropX, cropY, cropW, cropH);

        // Resize canvas and put data
        this.canvas.width = cropW;
        this.canvas.height = cropH;
        this.ctx.putImageData(imageData, 0, 0);

        // Update original reference for re-drawing
        const newImg = new Image();
        newImg.onload = () => {
            this.originalImage = newImg;
            this.rotation = 0;
            this.flipH = false;
            this.flipV = false;
            this.aspectRatio = cropW / cropH;
            document.getElementById('resizeWidth').value = Math.round(cropW);
            document.getElementById('resizeHeight').value = Math.round(cropH);
            this.saveToHistory();
        };
        newImg.src = this.canvas.toDataURL('image/png');

        this.removeCropOverlay();
        this.activeTool = null;
        this.updateToolButtons();
    }

    removeCropOverlay() {
        const overlay = document.getElementById('cropOverlay');
        if (overlay) overlay.remove();
    }

    // ========================================
    // Tool Management
    // ========================================

    setTool(tool) {
        const optionsBar = document.getElementById('editorOptions');
        const drawOpts = document.getElementById('drawOptions');
        const textOpts = document.getElementById('textOptions');

        if (this.activeTool === tool) {
            this.activeTool = null;
            optionsBar.classList.remove('active');
            this.removeCropOverlay();
        } else {
            this.removeCropOverlay();
            this.activeTool = tool;

            if (tool === 'draw') {
                optionsBar.classList.add('active');
                drawOpts.style.display = 'flex';
                textOpts.style.display = 'none';
            } else if (tool === 'text') {
                optionsBar.classList.add('active');
                drawOpts.style.display = 'none';
                textOpts.style.display = 'flex';
            } else {
                optionsBar.classList.remove('active');
            }

            if (tool === 'crop') {
                this.startCrop();
                return;
            }
        }

        this.updateToolButtons();
    }

    updateToolButtons() {
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        if (this.activeTool === 'draw') document.getElementById('toolDraw').classList.add('active');
        if (this.activeTool === 'text') document.getElementById('toolText').classList.add('active');
        if (this.activeTool === 'crop') document.getElementById('toolCrop').classList.add('active');
    }

    // ========================================
    // Export
    // ========================================

    getImageDataUrl() {
        // Flatten with filters applied
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.canvas.width;
        exportCanvas.height = this.canvas.height;
        const exportCtx = exportCanvas.getContext('2d');
        exportCtx.filter = this.getFilterString();
        exportCtx.drawImage(this.canvas, 0, 0);
        return exportCanvas.toDataURL('image/png');
    }

    download() {
        const dataUrl = this.getImageDataUrl();
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'alexgpt-edited-' + Date.now() + '.png';
        a.click();
    }

    save() {
        const dataUrl = this.getImageDataUrl();
        if (window.onImageEdited) {
            window.onImageEdited(dataUrl);
        }
        this.close();
    }

    // ========================================
    // Canvas Mouse Coordinates
    // ========================================

    getCanvasCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    // ========================================
    // Events
    // ========================================

    initEvents() {
        // Toolbar buttons
        document.getElementById('toolRotateLeft').addEventListener('click', () => this.rotateLeft());
        document.getElementById('toolRotateRight').addEventListener('click', () => this.rotateRight());
        document.getElementById('toolFlipH').addEventListener('click', () => this.flipHorizontal());
        document.getElementById('toolFlipV').addEventListener('click', () => this.flipVertical());
        document.getElementById('toolCrop').addEventListener('click', () => this.setTool('crop'));
        document.getElementById('toolDraw').addEventListener('click', () => this.setTool('draw'));
        document.getElementById('toolText').addEventListener('click', () => this.setTool('text'));
        document.getElementById('toolUndo').addEventListener('click', () => this.undo());
        document.getElementById('toolReset').addEventListener('click', () => this.reset());

        // Close / Cancel
        document.getElementById('closeImageEditor').addEventListener('click', () => this.close());
        document.getElementById('cancelEdit').addEventListener('click', () => this.close());

        // Save / Download
        document.getElementById('downloadImage').addEventListener('click', () => this.download());
        document.getElementById('saveEdit').addEventListener('click', () => this.save());

        // Canvas drawing events
        this.canvas.addEventListener('mousedown', (e) => {
            const coords = this.getCanvasCoords(e);
            this.startDraw(coords.x, coords.y);
        });
        this.canvas.addEventListener('mousemove', (e) => {
            const coords = this.getCanvasCoords(e);
            this.draw(coords.x, coords.y);
        });
        this.canvas.addEventListener('mouseup', () => this.stopDraw());
        this.canvas.addEventListener('mouseleave', () => this.stopDraw());

        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const coords = this.getCanvasCoords(touch);
            this.startDraw(coords.x, coords.y);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const coords = this.getCanvasCoords(touch);
            this.draw(coords.x, coords.y);
        });
        this.canvas.addEventListener('touchend', () => this.stopDraw());

        // Filter sliders
        const filterIds = ['filterBrightness', 'filterContrast', 'filterSaturation', 'filterBlur', 'filterSepia', 'filterGrayscale'];
        const filterKeys = ['brightness', 'contrast', 'saturation', 'blur', 'sepia', 'grayscale'];

        filterIds.forEach((id, i) => {
            document.getElementById(id).addEventListener('input', (e) => {
                this.filters[filterKeys[i]] = parseInt(e.target.value);
                // Redraw from last history state with new filters
                if (this.historyIndex >= 0) {
                    const img = new Image();
                    img.onload = () => {
                        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                        this.ctx.filter = this.getFilterString();
                        this.ctx.drawImage(img, 0, 0);
                    };
                    img.src = this.history[this.historyIndex];
                }
            });
        });

        // Draw size label
        document.getElementById('drawSize').addEventListener('input', (e) => {
            document.getElementById('drawSizeLabel').textContent = e.target.value + 'px';
        });

        // Text size label
        document.getElementById('textSize').addEventListener('input', (e) => {
            document.getElementById('textSizeLabel').textContent = e.target.value + 'px';
        });

        // Resize
        const resizeW = document.getElementById('resizeWidth');
        const resizeH = document.getElementById('resizeHeight');
        const keepRatio = document.getElementById('keepRatio');

        resizeW.addEventListener('input', () => {
            if (keepRatio.checked && this.aspectRatio) {
                resizeH.value = Math.round(parseInt(resizeW.value) / this.aspectRatio);
            }
        });

        resizeH.addEventListener('input', () => {
            if (keepRatio.checked && this.aspectRatio) {
                resizeW.value = Math.round(parseInt(resizeH.value) * this.aspectRatio);
            }
        });

        document.getElementById('applyResize').addEventListener('click', () => {
            const w = parseInt(resizeW.value);
            const h = parseInt(resizeH.value);
            if (w > 0 && h > 0) {
                this.resize(w, h);
            }
        });

        // Modal click outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }
}

// Initialize editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.imageEditor = new ImageEditor();
});
