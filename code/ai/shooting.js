// Compatibility behaviors for existing sprite AI arrays.
// The two pattern engines intentionally remain separate in ShotPatterns.

function patternfn(options) {
    return ShotPatterns.sweep(this, options);
}

function shootf(counter, type, options) {
    return ShotPatterns.trigger(this, counter, type, options);
}

function patternf(type, options, counter = 0) {
    return ShotPatterns.recursive(this, type, options, counter);
}
