$(() => {
	$('#replydiv').hide();
	CKEDITOR.replace( 'editor1' );
	
	$('#replyButton .btn').click(() => {
		$('#replyButton').hide();
		$('#replydiv').show();
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
				data: {
					Body: content,
					Thread: threadID
				}
			}
		).done(function () {
			location.reload();
		});
	});
});
