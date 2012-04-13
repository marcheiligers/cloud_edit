var App = {
  Views: {},
  Controllers: {},
  init: function() {
    new App.Controllers.Documents();
    Backbone.history.start();
  }
};

//= require app/controllers/documents
//= require app/models/document
//= require app/views/documents/index
//= require app/views/documents/edit
