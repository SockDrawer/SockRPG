
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
		model = new SockRPGBoards.Game();
	} else {
		model = new SockRPGBoards.Board();
	}

	var view = new SockRPGBoards.BoardEditModal({
		el: '#bsModal',
		model: model
	});

}
