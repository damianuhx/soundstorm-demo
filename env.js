settings.version = 'demo';
settings.plattform = 'web';
settings.playtest = [1];
settings.assetVersion = 'e5036ac66b6c039d';

function webDemoAssetUrl(source) {
  if (typeof source !== 'string' || /^(?:data|blob):/i.test(source)) return source;
  var fragmentAt = source.indexOf('#');
  var fragment = fragmentAt < 0 ? '' : source.slice(fragmentAt);
  var address = fragmentAt < 0 ? source : source.slice(0, fragmentAt);
  var queryAt = address.indexOf('?');
  var pathname = queryAt < 0 ? address : address.slice(0, queryAt);
  var query = new URLSearchParams(queryAt < 0 ? '' : address.slice(queryAt + 1));
  query.set('v', settings.assetVersion);
  return pathname + '?' + query.toString() + fragment;
}
function webDemoHowl(options) {
  return new Howl(Object.assign({}, options, {src: options.src.map(webDemoAssetUrl)}));
}
