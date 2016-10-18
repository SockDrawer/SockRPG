if (!window.SockRPG) {
	window.SockRPG = {};
}

window.SockRPG.Boards = {
	Board: Backbone.Model.extend({
		url: '/api/boards',

		defaults: {
			Name: 'New Board',
			Description: '',
			Adult: false
		},

		validate: function(attrs) {
			if (attrs.Name.length <= 0) {
				return 'Name invalid; must be longer than 0 characters. You entered:"' + attrs.Name + '"';
			}
		}

	}),

	Boards: Backbone.Collection.extend({
		url: '/api/boards'
	}),

	Game: Backbone.Model.extend({
		url: '/api/games',

		defaults: {
			Name: 'New Game',
			Description: '',
			Adult: false
		},

		validate: function(attrs) {
			if (attrs.Name.length <= 0) {
				return 'Name invalid; must be longer than 0 characters. You entered:"' + attrs.Name + '"';
			}
		}

	}),

	Games: Backbone.Collection.extend({
		url: '/api/games'
	}),


	BoardEditModal: Backbone.View.extend({
		initialize: function(){
			this.model.on('invalid', this.showErrors.bind(this));
			this.model.on('error', this.showErrors.bind(this));
			this.model.on('sync', this.showSuccess.bind(this));
			this.render();
		},

		render: function(){
			var data = this.model.toJSON();
			if (this.model instanceof window.SockRPG.Boards.Game) {
				data.game = true;
			}
			var tpl = Handlebars.compile($('#boardModal').html());
			this.$el.find('.modal-content').html(tpl(data));
			this.$el.find('#submitModal').click(this.onSave.bind(this));
			this.$el.modal('show');
		},

		onSave: function(event) {
			event.preventDefault();
			var newData = {};
			newData.Name = this.$el.find('input[name="name"]').val();
			newData.Description = this.$el.find('textarea[name="description"]').val();
			newData.Adult = this.$el.find('input[name="adult"]').val() === 'on';
			this.model.save(newData);
		},

		showErrors: function (_, error) {
			if (error.responseJSON.error) {
				error = error.responseJSON.error;
			}
			this.$el.find('.alert-danger').text(error);
			this.$el.find('.alert-danger').show();
		},

		showSuccess: function() {
			this.$el.find('.alert-success').text('Saved successfully');
			this.$el.find('.alert-success').show();
		}

	})
};
