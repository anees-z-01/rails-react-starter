# frozen_string_literal: true

module SerializerHandler
  def serialize(collection, serializer)
    return {} unless collection

    ActiveModelSerializers::SerializableResource.new(collection,
                                                     each_serializer: serializer,
                                                     adapter: :json)
                                                .as_json
  end
end
