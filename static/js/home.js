/* global: CKEDITOR, $ */

$('#home_overview').on('blur', function() {
    $.ajax('/api/text/home_overview', {
        method: "PUT",
        data: $('#home_overview').html(),
        contentType: 'text/plain'
    });
});