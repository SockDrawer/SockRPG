function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      escapeXml = __helpers.x,
      attr = __helpers.a;

  return function render(data, out) {
    out.w("<div class=\"row post\"><div class=\"col-md-2 col-md-offset-1 media\"><div class=\"media-left\"><img" +
      attr("src", data.User.avatar) +
      "></div><div class=\"media-body\">" +
      escapeXml(data.User.name) +
      "<br>" +
      escapeXml(data.Timestamp) +
      "</div></div><div class=\"col-md-6\">" +
      escapeXml(data.Body) +
      "</div><div class=\"col-md-8 col-md-offset-1\"><hr style=\"gradiant\"></div></div>");
  };
}

(module.exports = require("marko").c(__filename)).c(create);
