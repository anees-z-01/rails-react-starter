class Job < ApplicationRecord
  has_many :job_applications, dependent: :destroy

  enum :status, { open: 0, closed: 1, draft: 2 }, validate: true

  before_validation :generate_slug

  validates :title, :status, :description, presence: true
  validates :title, uniqueness: { case_sensitive: false }
  validates :slug, presence: true, uniqueness: true

  private

  def generate_slug
    self.slug = title.to_s.parameterize
  end
end
