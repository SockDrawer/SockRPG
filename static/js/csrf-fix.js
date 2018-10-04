$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
	if (options.crossDomain) { 
		return;
	}

	var token;
	options.xhrFields = {
		withCredentials: true
	};
	token = $('meta[name="csrf-token"]').attr('content');
	if (token) {
		jqXHR.setRequestHeader('X-CSRF-Token', token);
	}
});
