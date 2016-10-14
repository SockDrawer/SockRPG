
$( document ).ready(function() {
	$('#addBoard').click(openNewBoardModal);
	$('#addGame').click(openNewBoardModal);
});



/**
 * openNewBoardModal - Open a modal to add a new board
 *
 * @param  {object} event The event
 */
function openNewBoardModal(event) {
	var model;

	if ($(event.currentTarget).attr('id').toLowerCase().indexOf('game') >= 0) {
		model = new SockRPG.Boards.Game();
	} else {
		model = new SockRPG.Boards.Board();
	}

	var view = new SockRPG.Boards.BoardEditModal({
		el: '#bsModal',
		model: model
	});

}
