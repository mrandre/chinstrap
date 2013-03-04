(function() {
  var root = this;
  var Chinstrap = function () {};

  //Export Chinstrap to node.js if it's available
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Chinstrap;
    }
    exports.Chinstrap = Chinstrap;
  } else {
    root['Chinstrap'] = Chinstrap;
  }

  Chinstrap.prototype.construct = function() {
    this.cache = {};
    return this.debug = false;
  };

  Chinstrap.merge = function(str, data, rtnSrc) {
    var fn, str;
    rtnSrc = (typeof rtnSrc !== 'undefined' && rtnSrc) ? true : false; 
    str = this.render(str);
    fn = new Function("obj", str);
    return rtnSrc ? str : fn(data);
  };

  Chinstrap.render = function(str) {
    str = str.replace(/[\r\t\n]/g, " ");
    str = str.split("{{").join("\t");
    str = str.replace(/((^|\}\})[^\t]*)'/g, "$1\r");
    str = str.replace(/\t\s?=(.*?)\}\}/g, "',value($1),'");
    str = str.replace(/\t\s?\@\=(.*?)\}\}/g, "\titerator=$1;\n}}");
    str = str.replace(/\t\s?WHILE(.*?)\}\}/g, "\twhile ($1) {\n}}");
    str = str.replace(/\t\s?\/WHILE(.*?)\}\}/g, "\t}\n}}");
    str = str.replace(/\t\s?FOR(.*?)\}\}/g, "\tfor ($1) {\n}}");
    str = str.replace(/\t\s?%(.*?)\}\}/g,"', this.merge($1), '");
    str = str.replace(/\t\s?\/FOR(.*?)\}\}/g, "\t}\n}}");
    str = str.replace(/\t\s?(IF|\?)(.*?)\}\}/g, "\tif (value($2)) {\n}}");
    str = str.replace(/\t\s?\/(IF|\?)(.*?)\}\}/g, "\t}\n}}");
    str = str.replace(/\t\s?(\-\?|ELSEIF)(.*?)\}\}/g, "\t} else if (value($2)) {\n}}");
    str = str.replace(/\t\s?(\-|ELSE)(.*?)\}\}/g, "\t} else {\n}}");
    str = str.replace(/\@\@/g, "iterator");
    str = str.replace(/\@/g, "iterator.");
    str = str.split("\t").join("');\n");
    str = str.split("}}").join("p.push('");
    str = str.split("\r").join("\\'");
    str = "\nvar p=[],iterator = {},print=function(){p.push.apply(p,arguments);},value = function(val){if (typeof val == 'function') {return val.apply(iterator);} else {return val;}};\nwith(obj){\np.push('" + str + "');\n}\nreturn p.join('');\n";

    return str;
  };

  return this;

}).call(this);

