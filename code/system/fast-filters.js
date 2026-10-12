(function installSoundStormFastFilters(root) {
    "use strict";

    if (!root.PIXI || !PIXI.Filter || !PIXI.filters) {
        throw new Error("SoundStorm fast filters require Pixi and pixi-filters");
    }

    // Keep the sprite itself at native resolution. The speed-up comes from
    // bounded sample counts and smaller padding, not from softening the source.
    var FILTER_RESOLUTION = 1;
    var LEGACY_FILTER_VERTEX = [
        "attribute vec2 aVertexPosition;",
        "attribute vec2 aTextureCoord;",
        "uniform mat3 projectionMatrix;",
        "varying vec2 vTextureCoord;",
        "void main(void) {",
        "    gl_Position = vec4(",
        "        (projectionMatrix * vec3(aVertexPosition, 1.0)).xy,",
        "        0.0,",
        "        1.0",
        "    );",
        "    vTextureCoord = aTextureCoord;",
        "}",
    ].join("\n");
    var OUTLINE_FRAGMENT = [
        "precision highp float;",
        "varying vec2 vTextureCoord;",
        "uniform sampler2D uSampler;",
        "uniform vec4 filterClamp;",
        "uniform vec2 uThickness;",
        "uniform vec3 uColor;",
        "uniform float uAlpha;",
        "uniform bool uKnockout;",
        "float alphaAt(vec2 offset) {",
        "    return texture2D(",
        "        uSampler,",
        "        clamp(vTextureCoord + offset, filterClamp.xy, filterClamp.zw)",
        "    ).a;",
        "}",
        "void main(void) {",
        "    vec4 source = texture2D(uSampler, vTextureCoord);",
        "    vec2 diagonal = uThickness * 0.70710678;",
        "    float edge = 0.0;",
        "    edge = max(edge, alphaAt(vec2( uThickness.x, 0.0)));",
        "    edge = max(edge, alphaAt(vec2(-uThickness.x, 0.0)));",
        "    edge = max(edge, alphaAt(vec2(0.0,  uThickness.y)));",
        "    edge = max(edge, alphaAt(vec2(0.0, -uThickness.y)));",
        "    edge = max(edge, alphaAt(vec2( diagonal.x,  diagonal.y)));",
        "    edge = max(edge, alphaAt(vec2(-diagonal.x,  diagonal.y)));",
        "    edge = max(edge, alphaAt(vec2( diagonal.x, -diagonal.y)));",
        "    edge = max(edge, alphaAt(vec2(-diagonal.x, -diagonal.y)));",
        "    float outlineAlpha = min(1.0, edge * uAlpha) * (1.0 - source.a);",
        "    vec4 outline = vec4(uColor * outlineAlpha, outlineAlpha);",
        "    gl_FragColor = uKnockout ? outline : source + outline;",
        "}",
    ].join("\n");

    var GLOW_FRAGMENT = [
        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "uniform sampler2D uSampler;",
        "uniform vec4 filterClamp;",
        "uniform vec2 uDistance;",
        "uniform vec3 uColor;",
        "uniform float uOuterStrength;",
        "uniform float uInnerStrength;",
        "uniform float uAlpha;",
        "uniform bool uKnockout;",
        "float alphaAt(vec2 offset) {",
        "    return texture2D(",
        "        uSampler,",
        "        clamp(vTextureCoord + offset, filterClamp.xy, filterClamp.zw)",
        "    ).a;",
        "}",
        "float ringSum(vec2 radius) {",
        "    vec2 diagonal = radius * 0.70710678;",
        "    float value = 0.0;",
        "    value += alphaAt(vec2( radius.x, 0.0));",
        "    value += alphaAt(vec2(-radius.x, 0.0));",
        "    value += alphaAt(vec2(0.0,  radius.y));",
        "    value += alphaAt(vec2(0.0, -radius.y));",
        "    value += alphaAt(vec2( diagonal.x,  diagonal.y));",
        "    value += alphaAt(vec2(-diagonal.x,  diagonal.y));",
        "    value += alphaAt(vec2( diagonal.x, -diagonal.y));",
        "    value += alphaAt(vec2(-diagonal.x, -diagonal.y));",
        "    return value;",
        "}",
        "void main(void) {",
        "    vec4 source = texture2D(uSampler, vTextureCoord);",
        "    float ring1 = ringSum(uDistance * 0.20);",
        "    float ring2 = ringSum(uDistance * 0.40);",
        "    float ring3 = ringSum(uDistance * 0.60);",
        "    float ring4 = ringSum(uDistance * 0.80);",
        "    float ring5 = ringSum(uDistance);",
        "    float field = (",
        "        ring1 * 5.0",
        "        + ring2 * 4.0",
        "        + ring3 * 3.0",
        "        + ring4 * 2.0",
        "        + ring5",
        "    ) / 120.0;",
        "    float innerAmount = min(",
        "        1.0,",
        "        (1.0 - ring1 / 8.0) * uInnerStrength * source.a",
        "    );",
        "    vec4 content = source;",
        "    content.rgb = mix(content.rgb, uColor * content.a, innerAmount);",
        "    float glowAlpha = min(",
        "        1.0 - content.a,",
        "        field * uOuterStrength * uAlpha * (1.0 - content.a)",
        "    );",
        "    vec4 glow = vec4(uColor * glowAlpha, glowAlpha);",
        "    gl_FragColor = uKnockout ? glow : content + glow;",
        "}",
    ].join("\n");

    var SHADOW_FRAGMENT = [
        "precision highp float;",
        "varying vec2 vTextureCoord;",
        "uniform sampler2D uSampler;",
        "uniform vec4 inputClamp;",
        "uniform vec4 inputSize;",
        "uniform vec4 inputPixel;",
        "uniform vec2 uOffset;",
        "uniform vec2 uDrawSize;",
        "uniform vec2 uDrawPosition;",
        "uniform vec2 uShadowAnchor;",
        "uniform vec3 uColor;",
        "uniform float uAlpha;",
        "uniform float uBlur;",
        "uniform float uSize;",
        "uniform bool uShadowOnly;",
        "float shadowAlphaAt(vec2 position, vec2 offset) {",
        "    vec2 samplePosition = position + offset;",
        // Pixi clamps to texel centers. Include the valid half-texel border,
        // then make samples beyond the clipped source transparent.
        "    vec2 inside = step(",
        "        inputClamp.xy - 0.5 * inputPixel.zw, samplePosition",
        "    ) * step(",
        "        samplePosition, inputClamp.zw + 0.5 * inputPixel.zw",
        "    );",
        "    return texture2D(",
        "        uSampler,",
        "        clamp(samplePosition, inputClamp.xy, inputClamp.zw)",
        "    ).a * inside.x * inside.y;",
        "}",
        "void main(void) {",
        "    vec4 source = texture2D(uSampler, vTextureCoord);",
        "    if (uAlpha <= 0.0 && !uShadowOnly) {",
        "        gl_FragColor = source;",
        "        return;",
        "    }",
        // The input contains the whole sprite, including offscreen pixels.
        // Its larger frame must not move the existing perspective projection.
        "    vec2 shadowPosition =",
        "        uSize * vTextureCoord",
        "        - (uSize - 1.0) * uShadowAnchor * inputSize.zw",
        "        - uOffset * inputSize.zw;",
        "    vec2 radius = uBlur * inputSize.zw;",
        "    vec2 diagonal = radius * 0.70710678;",
        "    float shadowAlpha = shadowAlphaAt(shadowPosition, vec2(0.0));",
        "    shadowAlpha += shadowAlphaAt(shadowPosition, vec2( radius.x, 0.0));",
        "    shadowAlpha += shadowAlphaAt(shadowPosition, vec2(-radius.x, 0.0));",
        "    shadowAlpha += shadowAlphaAt(shadowPosition, vec2(0.0,  radius.y));",
        "    shadowAlpha += shadowAlphaAt(shadowPosition, vec2(0.0, -radius.y));",
        "    shadowAlpha += shadowAlphaAt(shadowPosition, vec2( diagonal.x,  diagonal.y));",
        "    shadowAlpha += shadowAlphaAt(shadowPosition, vec2(-diagonal.x,  diagonal.y));",
        "    shadowAlpha += shadowAlphaAt(shadowPosition, vec2( diagonal.x, -diagonal.y));",
        "    shadowAlpha += shadowAlphaAt(shadowPosition, vec2(-diagonal.x, -diagonal.y));",
        "    shadowAlpha = min(1.0, shadowAlpha * uAlpha / 9.0);",
        "    vec4 shadow = vec4(uColor * shadowAlpha, shadowAlpha);",
        // Composite behind the actual source opacity, including translucent
        // glow. An alpha threshold cuts a silhouette-shaped hole in the shadow.
        "    float shadowVisibility = 1.0 - source.a;",
        "    gl_FragColor = uShadowOnly",
        "        ? shadow",
        "        : source + shadow * shadowVisibility;",
        "}",
    ].join("\n");

    function valueOr(options, key, fallback) {
        return options[key] === undefined ? fallback : options[key];
    }

    function normalizedOptions(options) {
        return options && typeof options === "object" ? options : {};
    }

    function setRgb(target, color) {
        target[0] = ((color >> 16) & 0xFF) / 255;
        target[1] = ((color >> 8) & 0xFF) / 255;
        target[2] = (color & 0xFF) / 255;
    }

    function rgbValue(rgb) {
        return (
            (Math.round(rgb[0] * 255) << 16)
            | (Math.round(rgb[1] * 255) << 8)
            | Math.round(rgb[2] * 255)
        );
    }

    class FastOutlineFilter extends PIXI.Filter {
        constructor(thickness, color, quality, alpha, knockout) {
            super(undefined, OUTLINE_FRAGMENT, {
                uThickness: new Float32Array(2),
                uColor: new Float32Array(3),
                uAlpha: 1,
                uKnockout: false,
            });
            this.soundStormFastFilter = true;
            this.resolution = FILTER_RESOLUTION;
            this._thickness = thickness === undefined ? 1 : thickness;
            this._quality = quality === undefined ? 0.1 : quality;
            this._alpha = alpha === undefined ? 1 : alpha;
            this._knockout = knockout === true;
            this.color = color === undefined ? 0 : color;
            this.padding = Math.ceil(this._thickness);
        }

        apply(filterManager, input, output, clearMode) {
            this.uniforms.uThickness[0] = this._thickness / input._frame.width;
            this.uniforms.uThickness[1] = this._thickness / input._frame.height;
            this.uniforms.uAlpha = this._alpha;
            this.uniforms.uKnockout = this._knockout;
            filterManager.applyFilter(this, input, output, clearMode);
        }

        get thickness() {
            return this._thickness;
        }

        set thickness(value) {
            this._thickness = Math.max(0, value);
            this.padding = Math.ceil(this._thickness);
        }

        get size() {
            return this.thickness;
        }

        set size(value) {
            this.thickness = value;
        }

        get color() {
            return rgbValue(this.uniforms.uColor);
        }

        set color(value) {
            setRgb(this.uniforms.uColor, value);
        }

        get quality() {
            return this._quality;
        }

        set quality(value) {
            this._quality = value;
        }

        get alpha() {
            return this._alpha;
        }

        set alpha(value) {
            this._alpha = value;
        }

        get knockout() {
            return this._knockout;
        }

        set knockout(value) {
            this._knockout = value === true;
        }
    }

    class FastGlowFilter extends PIXI.Filter {
        constructor(rawOptions) {
            var options = normalizedOptions(rawOptions);
            super(LEGACY_FILTER_VERTEX, GLOW_FRAGMENT, {
                uDistance: new Float32Array(2),
                uColor: new Float32Array(3),
                uOuterStrength: 4,
                uInnerStrength: 0,
                uAlpha: 1,
                uKnockout: false,
            });
            this.soundStormFastFilter = true;
            this.resolution = valueOr(options, "resolution", FILTER_RESOLUTION);
            this._distance = Math.max(0, valueOr(options, "distance", 10));
            this._quality = valueOr(options, "quality", 0.1);
            this._outerStrength = valueOr(options, "outerStrength", 4);
            this._innerStrength = valueOr(options, "innerStrength", 0);
            this._alpha = valueOr(options, "alpha", 1);
            this._knockout = valueOr(options, "knockout", false) === true;
            this.color = valueOr(options, "color", 0xFFFFFF);
            this.padding = Math.ceil(this._distance);
        }

        apply(filterManager, input, output, clearMode) {
            this.uniforms.uDistance[0] = this._distance / input._frame.width;
            this.uniforms.uDistance[1] = this._distance / input._frame.height;
            this.uniforms.uOuterStrength = this._outerStrength;
            this.uniforms.uInnerStrength = this._innerStrength;
            this.uniforms.uAlpha = this._alpha;
            this.uniforms.uKnockout = this._knockout;
            filterManager.applyFilter(this, input, output, clearMode);
        }

        get color() {
            return rgbValue(this.uniforms.uColor);
        }

        set color(value) {
            setRgb(this.uniforms.uColor, value);
        }

        get outerStrength() {
            return this._outerStrength;
        }

        set outerStrength(value) {
            this._outerStrength = value;
        }

        get innerStrength() {
            return this._innerStrength;
        }

        set innerStrength(value) {
            this._innerStrength = value;
        }

        get distance() {
            return this._distance;
        }

        set distance(value) {
            this._distance = Math.max(0, value);
            this.padding = Math.ceil(this._distance);
        }

        get quality() {
            return this._quality;
        }

        set quality(value) {
            this._quality = value;
        }

        get alpha() {
            return this._alpha;
        }

        set alpha(value) {
            this._alpha = value;
        }

        get knockout() {
            return this._knockout;
        }

        set knockout(value) {
            this._knockout = value === true;
        }

    }

    class FastDropShadowFilter extends PIXI.Filter {
        constructor(rawOptions) {
            var options = normalizedOptions(rawOptions);
            super(undefined, SHADOW_FRAGMENT, {
                uOffset: new Float32Array(2),
                uDrawSize: new Float32Array([100, 100]),
                uDrawPosition: new Float32Array([1000, 500]),
                uShadowAnchor: new Float32Array([50, 50]),
                uColor: new Float32Array(3),
                uAlpha: 0.5,
                uBlur: 2,
                uSize: 1.2,
                uShadowOnly: false,
            });
            this.soundStormFastFilter = true;
            this.resolution = valueOr(options, "resolution", FILTER_RESOLUTION);
            // Crop only the final image, so hidden sprite contours can still
            // cast a visible shadow. Pixi shares this with the local stack.
            this.autoFit = false;
            this._offset = {x: 4, y: 4};
            this._drawSize = {x: 100, y: 100};
            this._drawPosition = {x: 1000, y: 500};
            this._blur = Math.max(0, valueOr(options, "blur", 2));
            this._quality = valueOr(options, "quality", 3);
            this._alpha = valueOr(options, "alpha", 0.5);
            this._size = 1.2;
            this._shadowOnly = valueOr(options, "shadowOnly", false) === true;
            this._distance = valueOr(options, "distance", 5);
            this._rotation = valueOr(options, "rotation", 45);
            this.pixelSize = valueOr(options, "pixelSize", 1);
            this.color = valueOr(options, "color", 0);

            if (options.offset !== undefined) {
                this.offset = options.offset;
            }
            else if (options.distance !== undefined) {
                this.distance = options.distance;
            }
            else {
                this.offset = {x: 4, y: 4};
            }
            this._syncUniforms();
        }

        apply(filterManager, input, output, clearMode) {
            this._syncUniforms();
            var state = filterManager.activeState;
            var fullFrame = state.sourceFrame;
            var clipped = this._clippedFrame
                || (this._clippedFrame = fullFrame.clone());
            var viewport = this._shadowViewport
                || (this._shadowViewport = state.bindingSourceFrame.clone());
            clipped.copyFrom(fullFrame);
            viewport.copyFrom(state.bindingSourceFrame);
            if (state.transform) {
                var inverse = this._shadowTransform
                    || (this._shadowTransform = state.transform.clone());
                filterManager.transformAABB(
                    inverse.copyFrom(state.transform).invert(), viewport
                );
            }
            clipped.fit(viewport);
            var stack = filterManager.defaultFilterStack;
            var parentTexture = stack[stack.length - 1].renderTexture;
            filterManager.roundFrame(
                clipped,
                parentTexture ? parentTexture.resolution : filterManager.renderer.resolution,
                state.bindingSourceFrame,
                state.bindingDestinationFrame,
                state.transform
            );

            // Recreate the former input dimensions without allocating another
            // texture. They bound the legacy cutoff in the perspective anchor.
            var resolution = state.resolution;
            var width = Math.max(Math.ceil(clipped.width * resolution - 1e-6), 1);
            var height = Math.max(Math.ceil(clipped.height * resolution - 1e-6), 1);
            var pool = filterManager.texturePool;
            if (!pool.enableFullScreen
                || width !== pool._pixelsWidth || height !== pool._pixelsHeight) {
                width = PIXI.utils.nextPow2(width);
                height = PIXI.utils.nextPow2(height);
            }
            var halfWidth = this._drawSize.x * 0.5;
            var halfHeight = this._drawSize.y * 0.5;
            this.uniforms.uShadowAnchor[0] = halfWidth
                - Math.min(Math.max(halfWidth - this._drawPosition.x, 0), width / resolution)
                + clipped.x - fullFrame.x;
            this.uniforms.uShadowAnchor[1] = halfHeight
                - Math.min(Math.max(halfHeight - this._drawPosition.y, 0), height / resolution)
                + clipped.y - fullFrame.y;
            filterManager.applyFilter(this, input, output, clearMode);
        }

        _syncUniforms() {
            this.uniforms.uOffset[0] = this._offset.x;
            this.uniforms.uOffset[1] = this._offset.y;
            this.uniforms.uDrawSize[0] = this._drawSize.x;
            this.uniforms.uDrawSize[1] = this._drawSize.y;
            this.uniforms.uDrawPosition[0] = this._drawPosition.x;
            this.uniforms.uDrawPosition[1] = this._drawPosition.y;
            this.uniforms.uAlpha = this._alpha;
            this.uniforms.uBlur = this._blur;
            this.uniforms.uSize = this._size;
            this.uniforms.uShadowOnly = this._shadowOnly;
            this._updatePadding();
        }

        _updatePadding() {
            var offset = Math.max(
                Math.abs(this._offset.x),
                Math.abs(this._offset.y)
            );
            this.padding = Math.ceil(offset + this._blur * 2);
        }

        _updateOffsetFromPolar() {
            var angle = this._rotation * Math.PI / 180;
            this.offset = {
                x: this._distance * Math.cos(angle),
                y: this._distance * Math.sin(angle),
            };
        }

        get offset() {
            return this._offset;
        }

        set offset(value) {
            this._offset = {
                x: value && Number.isFinite(value.x) ? value.x : 0,
                y: value && Number.isFinite(value.y) ? value.y : 0,
            };
            this._syncUniforms();
        }

        get drawSize() {
            return this._drawSize;
        }

        set drawSize(value) {
            this._drawSize = {
                x: value && Number.isFinite(value.x) ? value.x : 0,
                y: value && Number.isFinite(value.y) ? value.y : 0,
            };
            this._syncUniforms();
        }

        get drawPosition() {
            return this._drawPosition;
        }

        set drawPosition(value) {
            this._drawPosition = {
                x: value && Number.isFinite(value.x) ? value.x : 0,
                y: value && Number.isFinite(value.y) ? value.y : 0,
            };
            this._syncUniforms();
        }

        get size() {
            return this._size;
        }

        set size(value) {
            this._size = value;
            this.uniforms.uSize = value;
        }

        get blur() {
            return this._blur;
        }

        set blur(value) {
            this._blur = Math.max(0, value);
            this.uniforms.uBlur = this._blur;
            this._updatePadding();
        }

        get quality() {
            return this._quality;
        }

        set quality(value) {
            this._quality = value;
        }

        get alpha() {
            return this._alpha;
        }

        set alpha(value) {
            this._alpha = value;
            this.uniforms.uAlpha = value;
        }

        get color() {
            return rgbValue(this.uniforms.uColor);
        }

        set color(value) {
            setRgb(this.uniforms.uColor, value);
        }

        get shadowOnly() {
            return this._shadowOnly;
        }

        set shadowOnly(value) {
            this._shadowOnly = value === true;
            this.uniforms.uShadowOnly = this._shadowOnly;
        }

        get distance() {
            return this._distance;
        }

        set distance(value) {
            this._distance = value;
            this._updateOffsetFromPolar();
        }

        get rotation() {
            return this._rotation;
        }

        set rotation(value) {
            this._rotation = value;
            this._updateOffsetFromPolar();
        }
    }

    var legacyFilters = Object.freeze({
        OutlineFilter: PIXI.filters.OutlineFilter,
        GlowFilter: PIXI.filters.GlowFilter,
        DropShadowFilter: PIXI.filters.DropShadowFilter,
    });

    root.SoundStormLegacyFilters = legacyFilters;
    root.FastOutlineFilter = FastOutlineFilter;
    root.FastGlowFilter = FastGlowFilter;
    root.FastDropShadowFilter = FastDropShadowFilter;

    PIXI.filters.OutlineFilter = FastOutlineFilter;
    PIXI.filters.GlowFilter = FastGlowFilter;
    PIXI.filters.DropShadowFilter = FastDropShadowFilter;
})(
    typeof window === "undefined" ? globalThis : window
);
