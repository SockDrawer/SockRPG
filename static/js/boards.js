window.SockRPGBoards = {
	Board: Backbone.Model.extend({
		url: '/api/board',

		defaults: {
			name: 'New Board',
			description: '',
			adult: false
		},

		validate: function() {
			if (this.name.length <= 0) {
				return 'Name invalid';
			}
		}

	}),

	Boards: Backbone.Collection.extend({
		url: '/api/boards'
	}),

	Game: Backbone.Model.extend({
		url: '/api/game',

		defaults: {
			name: 'New Game',
			description: '',
			adult: false
		},

		validate: function() {
			if (name.length <= 0) {
				return 'Name invalid';
			}
		}

	}),

	Games: Backbone.Collection.extend({
		url: '/api/games'
	}),


	BoardEditModal: Backbone.View.extend({
		initialize: function(){
			this.model.on('invalid', this.showErrors);
			this.model.on('sync', this.showSuccess);
			this.render();
		},

		render: function(){
			var data = _.clone(this.model.attributes);
			if (this.model instanceof SockRPGBoards.Game) {
				data.game = true;
			}
			var tpl = Handlebars.compile($('#boardModal').html());
			this.$el.find('.modal-content').html(tpl(data));
			this.$el.find('#submitModal').click(this.onSave.bind(this));
			this.$el.modal('show');
		},

		onSave: function() {
			var newData = {};
			newData.name = this.$el.find('input[name="name"]').value();
			newData.description = this.$el.find('textarea[name="description"]').value();
			newData.adult = this.$el.find('input[name="adult"]').checked();
			this.model.save(newData);
		},

		showErrors: function (_, error) {
			this.$el.find('.alert-danger').text(error);
			this.$el.find('.alert-danger').show();
		},

		showSuccess: function() {
			this.$el.find('.alert-success').text('Saved successfully');
			this.$el.find('.alert-success').show();
		}

	})
};
