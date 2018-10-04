$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
	var token;
	options.xhrFields = {
		withCredentials: true
	};
	token = $('meta[name="csrf-token"]').attr('content');
	if (token) {
		jqXHR.setRequestHeader('X-CSRF-Token', token);
	}
});
