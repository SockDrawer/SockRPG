$(() => {
	$('#replydiv').hide();
	CKEDITOR.replace( 'editor1' );
	
	$('#replyButton .btn').click(() => {
		$('#replyButton').hide();
		$('#replydiv').show();
		CKEDITOR.instances.editor1.focus();
	});
	
	$('#replyCancel').click(() => {
		$('#replyButton').show();
		$('#replydiv').hide();
	});
	
	$('#replySubmit').click(() => {
		var content = CKEDITOR.instances.editor1.getData();
		var threadID = $('#threadTitle').data('threadid');
		
		$.ajax('/api/threads/' + threadID,
			{
				method: 'PUT',
				data: JSON.stringify({
					Body: content
				}),
				dataType: 'json',
				contentType: 'application/json; charset=UTF-8'
			}
		).done(function () {
			location.reload();
		});
	});
});
