class DocumentsController < ApplicationController
  def index
    render :json => Document.all
  end
  
  def show
    render :json => Document.find(params[:id])
  end
  
  def create
    document = Document.create! pick(params, :title, :body)
    render :json => document
  end
  
  def update
    document = Document.find(params[:id])
    document.update_attributes! pick(params, :title, :body)
    render :json => document
  end
end
