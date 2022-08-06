# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

require 'faker'

u1 = User.create(email: 'test@test.com', password: 123_456)

10.times do
  User.create(
    email: Faker::Internet.unique.email,
    password: Faker::Internet.password(min_length: 6)
  )
end

10.times do |_i|
  job = Job.create!(
    title: Faker::Job.title,
    description: Faker::Job.field,
    status: 1,
    slug: Faker::Internet.slug
  )

  2.times do |_j|
    JobApplication.create(
      job: job,
      user: User.order('RANDOM()').first,
      status: 1
    )
  end
end
