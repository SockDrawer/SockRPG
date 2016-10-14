
$( document ).ready(function() {
	$('#addThread').click(openNewThreadModal);
});



/**
 * openNewBoardModal - Open a modal to add a new board
 *
 * @param  {object} event The event
 */
function openNewThreadModal(event) {
	var model = new SockRPG.Threads.Thread;

	var view = new SockRPG.Threads.ThreadEditModal({
		el: '#tModal',
		model: model
	});

}
