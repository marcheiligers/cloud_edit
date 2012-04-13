App.Views.Notice = Backbone.View.extend({
  className: "success",
  displayLength: 5000,
  defaultMessage: '',

  initialize: function() {
    _.bindAll(this, 'render');
    this.message = this.options.message || this.defaultMessage;
    this.render();
  },

  render: function() {
    var view = this;

    $(this.el).html(this.message);
    $(this.el).hide();
    $('#notice').html(this.el);
    $(this.el).slideDown();
    setTimeout(function() {
      $(view.el).slideUp();
      setTimeout(function() {
        view.remove();
      }, 2000);
    }, this.displayLength);

    return this;
  }
});
