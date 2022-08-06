# frozen_string_literal: true

FactoryBot.define do
  factory :job_application do
    job { association :job, :open }
    user
    status { :applied }
  end
end
