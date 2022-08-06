# frozen_string_literal: true

FactoryBot.define do
  factory :job do
    title { Faker::Job.title }
    description { Faker::Lorem.paragraph }
    status { Job.statuses.keys.sample.to_sym }
    slug { title }

    trait :open do
      status { :open }
    end

    trait :closed do
      status { :closed }
    end

    trait :draft do
      status { :draft }
    end
  end
end
