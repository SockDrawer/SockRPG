if (!window.SockRPG) {
	window.SockRPG = {};
}

window.SockRPG.Threads = {
	Thread: Backbone.Model.extend({
		url: '/api/boards/' + $('#boardname').data('board-id') + '/threads',

		defaults: {
			Title: 'New Thread'
		},

		validate: function(attrs) {
			if (attrs.Title.length <= 0) {
				return 'Title invalid; must be longer than 0 characters. You entered:"' + attrs.Title + '"';
			}
		}

	}),

	Threads: Backbone.Collection.extend({
		url: '/api/boards/' + $('#boardname').data('board-id') + '/threads'
	}),
	
	ThreadEditModal: Backbone.View.extend({
		initialize: function(){
			this.model.on('invalid', this.showErrors.bind(this));
			this.model.on('error', this.showErrors.bind(this));
			this.model.on('sync', this.showSuccess.bind(this));
			this.render();
		},

		render: function(){
			var data = this.model.toJSON();
			
			var tpl = Handlebars.compile($('#threadModal').html());
			this.$el.find('.modal-content').html(tpl(data));
			this.$el.find('#submitModal').click(this.onSave.bind(this));
			this.$el.modal('show');
		},

		onSave: function(event) {
			event.preventDefault();
			var newData = {};
			newData.Title = this.$el.find('input[name="Title"]').val();
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
