# frozen_string_literal: true

module Api
  class BaseController < ApplicationController
    include BaseHandler

    private

    def index
      render json: serialized_collection
    end

    def serialized_collection
      serialize(collection[:data], serializer).merge(page_info: collection[:page_info])
    end

    def serializer
      "#{model.name}Serializer".constantize
    end
  end
end
