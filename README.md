## CloudEdit
### Backbone on Rails

This is an example app built on the ideas in the tutorial by James Yu found [here](http://www.jamesyu.org/2011/01/27/cloudedit-a-backbone-js-tutorial-by-example/)

```
$ mkdir Backbone
$ cd Backbone/
$ echo 'rvm use 1.9.2@backbone' > .rvmrc
$ rvm use 1.9.2
Using /Users/marc/.rvm/gems/ruby-1.9.2-p290
$ rvm gemset create backbone
'backbone' gemset created (/Users/marc/.rvm/gems/ruby-1.9.2-p290@backbone).
$ cd ..
$ cd Backbone/
==============================================================================
= NOTICE                                                                     =
==============================================================================
= RVM has encountered a new or modified .rvmrc file in the current directory =
= This is a shell script and therefore may contain any shell commands.       =
=                                                                            =
= Examine the contents of this file carefully to be sure the contents are    =
= safe before trusting it! ( Choose v[iew] below to view the contents )      =
==============================================================================
Do you wish to trust this .rvmrc file? (/Users/marc/Projects/Experiments/Backbone/.rvmrc)
y[es], n[o], v[iew], c[ancel]> y
Using /Users/marc/.rvm/gems/ruby-1.9.2-p290 with gemset backbone
$ gem install rails
# … Wee, rails install stuff … 
# Why did I do all this in a Backbone root did? Don't want to have to reinstall all the gems
$ rails new cloud_edit
# … Wee, rails new stuff and bundle install … 
$ cd cloud_edit
$ mate .
# Yep, I use Textmate. What of it?
$ cd app/assets/javascripts/$ mkdir vendor
# I like to stick vendor JS in a vendor dir
$ cd vendor/
$ curl -O http://documentcloud.github.com/underscore/underscore.js
$ curl -O http://backbonejs.org/backbone.js
$ cd ../../../../
# Mess with README.rdoc
$ git init
$ git add .
$ git commit -m 'First commit - Rails app created, backbone and underscore libs added'
# Lots of git goodness
$ git remote add origin git@github.com:marcheiligers/cloud_edit.git
$ git push -u origin master
# More git goodness
# Open a new Terminal tab in the same dir
$ rails s -p 4000
# My day job runs on port 3000
# Hit localhost:4000 in your browser just to make sure everything is working :)
# Back in the first tab (keep the rails server running)
$ rm public/index.html
$ rails g controller Home index
# Now in app/views/home/index.html.erb paste
###
<h1><a href="#">CloudEdit</a></h1>
<h2>A Backbone.js Rails Example by James Yu</h2>

<div id="notice"></div>
<div id="app"></div>

<script type="text/javascript">
    $(function() {
        App.init();
    });
</script>
###
# Edit routes.rb to add this near the bottom
###
root :to => 'home#index'
###
# Rails JS assets should go into the app/assets/javascripts dir
# James claims to like to follow the same structure as the Rails app,
# I'm ok with that, but I'm adding an additional documents dir under views
$ mkdir app/assets/javascripts/app
$ mkdir app/assets/javascripts/app/models
$ mkdir app/assets/javascripts/app/views
$ mkdir app/assets/javascripts/app/controllers
$ mkdir app/assets/javascripts/app/views/documents
# Ok, dirs created, let's create the JS
$ touch app/assets/javascripts/app/models/document.js
# And now in that file paste
###
var Document = Backbone.Model.extend({  url : function() {
    var base = 'documents';
    if (this.isNew()) return base;
    return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
  }
});
###
$ touch app/assets/javascripts/app/controllers/documents.js
# And in the controller paste
###
App.Controllers.Documents = Backbone.Controller.extend({  routes: {
    "documents/:id":            "edit",
    "":                         "index",
    "new":                      "newDoc"
  },

  edit: function(id) {
    var doc = new Document({ id: id });
    doc.fetch({
      success: function(model, resp) {
        new App.Views.Edit({ model: doc });
      },
      error: function() {
        new Error({ message: 'Could not find that document.' });
        window.location.hash = '#';
      }
    });
  },

  index: function() {
    $.getJSON('/documents', function(data) {
      if(data) {
        var documents = _(data).map(function(i) { return new Document(i); });
        new App.Views.Index({ documents: documents });
      } else {
        new Error({ message: "Error loading documents." });
      }
    });
  },

  newDoc: function() {
    new App.Views.Edit({ model: new Document() });
  }
});
###
$ touch app/assets/javascripts/app/app.js
# And in here paste
###
var App = {
  Views: {},
  Controllers: {},
  init: function() {
    new App.Controllers.Documents();
    Backbone.history.start();
  }
};
###
$ touch app/assets/javascripts/app/views/documents/index.js
###
App.Views.Index = Backbone.View.extend({  initialize: function() {
    this.documents = this.options.documents;
    this.render();
  },

  render: function() {
    if(this.documents.length > 0) {
      var out = "<h3><a href='#new'>Create New</a></h3><ul>";
      _(this.documents).each(function(item) {
        out += "<li><a href='#documents/" + item.id + "'>" + item.escape('title') + "</a></li>";
      });
      out += "</ul>";
    } else {
      out = "<h3>No documents! <a href='#new'>Create one</a></h3>";
    }
    $(this.el).html(out);
    $('#app').html(this.el);
  }
});
###
$ touch app/assets/javascripts/app/views/documents/edit.js
###
App.Views.Edit = Backbone.View.extend({  events: {
    "submit form": "save"
  },

  initialize: function() {
    this.render();
  },

  save: function() {
    var self = this;
    var msg = this.model.isNew() ? 'Successfully created!' : "Saved!";


    this.model.save({ title: this.$('[name=title]').val(), body: this.$('[name=body]').val() }, {
      success: function(model, resp) {
        new App.Views.Notice({ message: msg });

        self.model = model;
        self.render();
        self.delegateEvents();

        Backbone.history.saveLocation('documents/' + model.id);
      },
      error: function() {
        new App.Views.Error();
      }
    });


    return false;
  },

  render: function() {
    var out = '<form>';
    out += "<label for='title'>Title</label>";
    out += "<input name='title' type='text' />";

    out += "<label for='body'>Body</label>";
    out += "<textarea name='body'>" + (this.model.escape('body') || '') + "</textarea>";

    var submitText = this.model.isNew() ? 'Create' : 'Save';

    out += "<button>" + submitText + "</button>";
    out += "</form>";

    $(this.el).html(out);
    $('#app').html(this.el);

    this.$('[name=title]').val(this.model.get('title')); // use val, for security reasons
  }
});
###
$ rails g model document title:string body:text
# In views/document.rb add 
###
  def to_json(options = {})
    super(options.merge(:only => [ :id, :title, :created_at, :body ]))
  end
###
$ rails g controller Documents index show create update
# OMG, that creates a lot of stuff we're not going to use… Oh well.
# Update controllers/documents_controller.rb to look like
###
class DocumentsController < ApplicationController
  def index
    render :json => Document.all
  end
 
  def show
    render :json => Document.find(params[:id])
  end
 
  def create
    document = Document.create! params
    render :json => document
  end
 
  def update
    document = Document.find(params[:id])
    document.update_attributes! params
    render :json => document
  end
end
###
# Now in routes.rb nuke the get "documents/*" routes created by the generator and add
###
  resources :documents, :only => [ :index, :show, :create, :update ]
###
# Remove the cruft from application.js and add this
###
//= require jquery
//= require vendor/underscore
//= require vendor/backbone
//
//= require app/app
//= require app/controllers/documents
//= require app/models/document
//= require app/views/documents/index
//= require app/views/documents/edit
###
# Ok, we've got everything in :)
# Time to fix what's wrong with the, admittedly more than a year old, tutorial
# The Backbone project realized somewhere along the line that their Controllers weren't really. So they renamed them Routers.
# So in documents.js, change Backbone.Controller.extend to Backbone.Router.extend
# Backbone.history.saveLocation has been replaced with Backbone,history.navigate
# So in edit.js, just change that quickly ;)
# Mass assignment is going to be a pain, so a suggestion from
# http://www.quora.com/Backbone-js-1/How-well-does-backbone-js-work-with-rails# to create a pick method will help. Add this to application_controller.rb
###
def pick(hash, *keys)
  filtered = {}
  hash.each do |key, value|
    filtered[key.to_sym] = value if keys.include?(key.to_sym)
  end
  filtered
end
###
# Not a fan, but it'll do for the purposes of this tutorial
# Now change the documents_controller.rb so that
###
  def create
    document = Document.create! pick(params, :title, :body)
    render :json => document
  end
 
  def update
    document = Document.find(params[:id])
    document.update_attributes! pick(params, :title, :body)
    render :json => document
  end
###
# In the tutorial the Message and Error views are used, but the code for them is not actually shown anywhere.
# Luckily we can easily find it in the Demo app
# I'm putting them in the root of the views dir
$ touch app/assets/javascripts/app/views/notice.js
# Note: I changed $.doTimeout to simple setTimeout calls
###
App.Views.Notice = Backbone.View.extend({  className: "success",
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
});$ touch app/assets/javascripts/app/views/error.js
###
App.Views.Error = App.Views.Notice.extend({
  className: "error",
  defaultMessage: 'Uh oh! Something went wrong. Please try again.'
});
###
# And you'll want to add the following to application.js
//= require app/views/notice
//= require app/views/error
###
# And we're done. Not pretty, but it's a working app
$ git add .
$ git rm public/index.html
$ git commit -m "Finished tutorial :)"
$ git push
```
