# Demo data for local development and screenshots. Every person and company
# here is made up. Safe to run more than once.

password = ENV.fetch("SEED_PASSWORD", "shortlist-demo")

def seed_user(email, name, password, admin: false)
  User.find_or_create_by!(email: email) do |user|
    user.name = name
    user.password = password
    user.admin = admin
  end
end

admin = seed_user("admin@example.com", "Avery Admin", password, admin: true)
demo = seed_user("demo@example.com", "Dana Demo", password)
others = [
  seed_user("sam.rivera@example.com", "Sam Rivera", password),
  seed_user("lee.okafor@example.com", "Lee Okafor", password)
]

jobs = [
  [ "Backend Engineer, Payments", :open, "Own the ledger service that settles card and bank transfers. Ruby on Rails, PostgreSQL, a lot of careful idempotency work." ],
  [ "Frontend Engineer", :open, "Build the customer dashboard in React. You will pair with design on accessibility and keep the bundle small." ],
  [ "Site Reliability Engineer", :open, "Run the Kubernetes clusters, tune alerting so on-call is quiet, and write the runbooks nobody else wants to." ],
  [ "Product Designer", :open, "Shape onboarding and billing flows from research through high-fidelity prototypes." ],
  [ "Data Analyst", :open, "Turn product events into weekly metrics the whole company trusts. SQL first, dashboards second." ],
  [ "Customer Support Lead", :open, "Lead a team of six across two time zones and own the help centre content." ],
  [ "Technical Writer", :open, "Write and maintain API guides, changelogs and the public reference docs." ],
  [ "QA Engineer", :open, "Grow the end-to-end suite, triage flaky tests and sit in on release reviews." ],
  [ "Mobile Engineer, iOS", :closed, "Shipped the 3.0 redesign; this role has been filled." ],
  [ "Security Engineer", :closed, "Threat modelling and dependency review for the platform team. Filled in the spring." ],
  [ "Engineering Manager, Platform", :draft, "Hiring plan still being finalised with finance." ],
  [ "Solutions Architect", :draft, "Pending approval for the enterprise sales team." ]
].map do |title, status, description|
  Job.find_or_create_by!(title: title) do |job|
    job.status = status
    job.description = description
  end
end

def seed_application(user, job, status)
  application = JobApplication.find_or_initialize_by(user: user, job: job)
  return application if application.persisted?

  application.status = status
  # The open-job rule applies to new applications; closed jobs are seeded with decided ones.
  application.save!(validate: job.open?)
end

seed_application(demo, jobs[0], :reviewed)
seed_application(demo, jobs[1], :applied)
seed_application(demo, jobs[4], :applied)
seed_application(demo, jobs[7], :withdrawn)
seed_application(demo, jobs[8], :rejected)
others.each { |user| seed_application(user, jobs[0], :applied) }
seed_application(others.first, jobs[2], :reviewed)

puts "Seeded #{User.count} users (admin: #{admin.email}, applicant: #{demo.email}), " \
     "#{Job.count} jobs, #{JobApplication.count} applications"
