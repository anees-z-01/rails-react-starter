# frozen_string_literal: true

module SerializerHandler
  def serialize(collection, serializer)
    return {} unless collection

    ActiveModelSerializers::SerializableResource.new(collection,
                                                     each_serializer: serializer,
                                                     adapter: :json,
                                                     scope: current_user,
                                                     scope_name: :current_user)
                                                .as_json
  end
end
