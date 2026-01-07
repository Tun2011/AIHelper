import { useState, useRef } from 'react'

function ColorPicker() {
    const [colorImage, setColorImage] = useState(null)
    const [selectedColor, setSelectedColor] = useState(null)
    const [hoverColor, setHoverColor] = useState(null)
    const [colorPalette, setColorPalette] = useState([])
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
    const [showMagnifier, setShowMagnifier] = useState(false)
    const [magnifierPixels, setMagnifierPixels] = useState([])
    const canvasRef = useRef(null)
    const imageRef = useRef(null)

    // Color utility functions
    const rgbToHex = (r, g, b) => {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
    }

    const rgbToHsl = (r, g, b) => {
        r /= 255; g /= 255; b /= 255
        const max = Math.max(r, g, b), min = Math.min(r, g, b)
        let h, s, l = (max + min) / 2
        if (max === min) {
            h = s = 0
        } else {
            const d = max - min
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
                case g: h = ((b - r) / d + 2) / 6; break
                case b: h = ((r - g) / d + 4) / 6; break
            }
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setColorImage(event.target.result)
                setSelectedColor(null)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleImagePaste = (e) => {
        const items = e.clipboardData?.items
        if (items) {
            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile()
                    const reader = new FileReader()
                    reader.onload = (event) => {
                        setColorImage(event.target.result)
                        setSelectedColor(null)
                    }
                    reader.readAsDataURL(file)
                }
            }
        }
    }

    const drawImageOnCanvas = () => {
        const canvas = canvasRef.current
        const img = imageRef.current
        if (canvas && img && img.complete) {
            try {
                const ctx = canvas.getContext('2d')
                const maxSize = 2000
                let width = img.naturalWidth
                let height = img.naturalHeight

                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height)
                    width = Math.floor(width * ratio)
                    height = Math.floor(height * ratio)
                }

                canvas.width = width
                canvas.height = height
                ctx.drawImage(img, 0, 0, width, height)
            } catch (err) {
                console.log('Error drawing image:', err)
            }
        }
    }

    // Helper function to get correct canvas coordinates accounting for CSS scaling
    const getCanvasCoordinates = (e) => {
        const canvas = canvasRef.current
        if (!canvas) return null
        if (canvas.width === 0 || canvas.height === 0) return null

        const rect = canvas.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return null

        // Calculate the actual displayed size of the canvas content
        // This accounts for CSS max-height and object-fit
        const canvasAspect = canvas.width / canvas.height
        const rectAspect = rect.width / rect.height

        let displayWidth, displayHeight, offsetX, offsetY

        if (canvasAspect > rectAspect) {
            // Canvas is wider than container - width fills, height has gaps
            displayWidth = rect.width
            displayHeight = rect.width / canvasAspect
            offsetX = 0
            offsetY = (rect.height - displayHeight) / 2
        } else {
            // Canvas is taller than container - height fills, width has gaps
            displayHeight = rect.height
            displayWidth = rect.height * canvasAspect
            offsetX = (rect.width - displayWidth) / 2
            offsetY = 0
        }

        // Get mouse position relative to the actual displayed image area
        const mouseX = e.clientX - rect.left - offsetX
        const mouseY = e.clientY - rect.top - offsetY

        // Check if mouse is within the actual displayed image area
        if (mouseX < 0 || mouseX >= displayWidth || mouseY < 0 || mouseY >= displayHeight) {
            return null
        }

        // Scale to canvas coordinates
        const x = Math.floor((mouseX / displayWidth) * canvas.width)
        const y = Math.floor((mouseY / displayHeight) * canvas.height)

        // Clamp to valid range
        const clampedX = Math.max(0, Math.min(canvas.width - 1, x))
        const clampedY = Math.max(0, Math.min(canvas.height - 1, y))

        return {
            x: clampedX,
            y: clampedY,
            displayX: e.clientX - rect.left,
            displayY: e.clientY - rect.top
        }
    }

    const pickColorFromCanvas = (e) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const coords = getCanvasCoordinates(e)
        if (!coords) return

        try {
            const ctx = canvas.getContext('2d')
            const pixel = ctx.getImageData(coords.x, coords.y, 1, 1).data
            const [r, g, b] = pixel

            const hex = rgbToHex(r, g, b)
            const hsl = rgbToHsl(r, g, b)

            setSelectedColor({ r, g, b, hex, hsl })
            setCursorPosition({ x: coords.displayX, y: coords.displayY })
        } catch (err) {
            console.log('Error picking color:', err)
        }
    }

    const getMagnifierPixels = (e) => {
        const canvas = canvasRef.current
        if (!canvas) return []

        const coords = getCanvasCoordinates(e)
        if (!coords) return []

        const centerX = coords.x
        const centerY = coords.y

        try {
            const ctx = canvas.getContext('2d')
            const pixels = []

            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const x = centerX + dx
                    const y = centerY + dy
                    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
                        const pixel = ctx.getImageData(x, y, 1, 1).data
                        const [r, g, b] = pixel
                        pixels.push({
                            hex: rgbToHex(r, g, b),
                            isCenter: dx === 0 && dy === 0
                        })
                    } else {
                        pixels.push({ hex: '#000000', isCenter: dx === 0 && dy === 0 })
                    }
                }
            }
            return pixels
        } catch (err) {
            return []
        }
    }

    const handleCanvasMouseMove = (e) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const coords = getCanvasCoordinates(e)
        if (!coords) return

        try {
            const ctx = canvas.getContext('2d')
            const pixel = ctx.getImageData(coords.x, coords.y, 1, 1).data
            const [r, g, b] = pixel
            const hex = rgbToHex(r, g, b)
            const hsl = rgbToHsl(r, g, b)

            setHoverColor({ r, g, b, hex, hsl })
            setCursorPosition({
                x: coords.displayX,
                y: coords.displayY
            })
            setShowMagnifier(true)
            setMagnifierPixels(getMagnifierPixels(e))
        } catch (err) {
            console.log('Canvas not ready:', err)
        }
    }

    const addToColorPalette = () => {
        if (selectedColor && !colorPalette.find(c => c.hex === selectedColor.hex)) {
            setColorPalette([...colorPalette, selectedColor])
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
    }

    return (
        <div className="page colorpicker-page" onPaste={handleImagePaste}>
            <div className="page-header">
                <h1 className="colorpicker-title">
                    Pick colors from any image:
                    <span className="gradient-text"> instantly and 100% free.</span>
                </h1>
                <p>Upload, paste, or enter a URL to extract colors with HEX, RGB, and more.</p>
            </div>

            <div className="colorpicker-container">
                {/* Left Side - Image */}
                <div className="colorpicker-left">
                    <div className="image-section">
                        <span className="section-label">Image</span>

                        {!colorImage ? (
                            <div className="upload-area">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="file-input"
                                    id="color-image-upload"
                                />
                                <label htmlFor="color-image-upload" className="upload-label">
                                    <div className="upload-icon">📷</div>
                                    <p>Click to upload or paste an image</p>
                                    <span className="upload-hint">Supports: JPG, PNG, WebP</span>
                                </label>
                            </div>
                        ) : (
                            <div className="canvas-container">
                                <img
                                    ref={imageRef}
                                    src={colorImage}
                                    alt="Color source"
                                    onLoad={drawImageOnCanvas}
                                    style={{ display: 'none' }}
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="color-canvas"
                                    onClick={pickColorFromCanvas}
                                    onMouseMove={handleCanvasMouseMove}
                                    onMouseLeave={() => {
                                        setShowMagnifier(false)
                                        setHoverColor(null)
                                    }}
                                />
                                {/* Magnifier - 3x3 pixel grid */}
                                {showMagnifier && magnifierPixels.length > 0 && (
                                    <div
                                        className="magnifier"
                                        style={{
                                            left: cursorPosition.x + 20,
                                            top: cursorPosition.y - 60
                                        }}
                                    >
                                        <div className="magnifier-grid">
                                            {magnifierPixels.map((pixel, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`magnifier-pixel ${pixel.isCenter ? 'center' : ''}`}
                                                    style={{ backgroundColor: pixel.hex }}
                                                />
                                            ))}
                                        </div>
                                        {hoverColor && (
                                            <div className="magnifier-hex">{hoverColor.hex}</div>
                                        )}
                                    </div>
                                )}

                            </div>
                        )}
                    </div>

                    {/* Color Palette */}
                    <div className="palette-section">
                        <span className="section-label">Color Palette</span>
                        <div className="palette-controls">
                            <button className="palette-btn" onClick={() => setColorPalette([])}>−</button>
                            <button className="palette-btn" onClick={addToColorPalette}>+</button>
                            {colorPalette.map((color, idx) => (
                                <div
                                    key={idx}
                                    className="palette-color"
                                    style={{ backgroundColor: color.hex }}
                                    onClick={() => setSelectedColor(color)}
                                    title={color.hex}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Colors */}
                <div className="colorpicker-right">
                    <span className="section-label">Colors</span>

                    {selectedColor || hoverColor ? (
                        <div className="color-details">
                            <div className="color-preview-large">
                                <div className="swatch-group">
                                    <div
                                        className="color-swatch selected"
                                        style={{ backgroundColor: selectedColor?.hex || '#cccccc' }}
                                        title="Selected color"
                                    />
                                    <span className="swatch-label">Selected</span>
                                </div>
                                {hoverColor && (
                                    <div className="swatch-group">
                                        <div
                                            className="color-swatch hover"
                                            style={{ backgroundColor: hoverColor.hex }}
                                            title="Hover color"
                                        />
                                        <span className="swatch-label">Hover</span>
                                    </div>
                                )}
                            </div>

                            {selectedColor && (
                                <div className="color-values">
                                    <div className="color-row">
                                        <span className="color-label">HEX</span>
                                        <span className="color-value">{selectedColor.hex}</span>
                                        <button className="copy-btn" onClick={() => copyToClipboard(selectedColor.hex)}>📋</button>
                                    </div>
                                    <div className="color-row">
                                        <span className="color-label">RGB</span>
                                        <span className="color-value">rgb({selectedColor.r}, {selectedColor.g}, {selectedColor.b})</span>
                                        <button className="copy-btn" onClick={() => copyToClipboard(`rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`)}>📋</button>
                                    </div>
                                    <div className="color-row">
                                        <span className="color-label">HSL</span>
                                        <span className="color-value">{selectedColor.hsl.h}, {selectedColor.hsl.s}, {selectedColor.hsl.l}</span>
                                        <button className="copy-btn" onClick={() => copyToClipboard(`hsl(${selectedColor.hsl.h}, ${selectedColor.hsl.s}%, ${selectedColor.hsl.l}%)`)}>📋</button>
                                    </div>
                                </div>
                            )}

                            {selectedColor && (
                                <button className="add-palette-btn" onClick={addToColorPalette}>
                                    + Add to palette
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="no-color-selected">
                            <div className="placeholder-swatch" />
                            <p>Click on the image to pick a color</p>
                        </div>
                    )}

                    {/* Use your own image section */}
                    <div className="use-image-section">
                        <span className="section-label">Use your own image</span>
                        <label htmlFor="color-image-upload-2" className="use-image-btn">
                            📷 Use your image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="file-input"
                            id="color-image-upload-2"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ColorPicker
