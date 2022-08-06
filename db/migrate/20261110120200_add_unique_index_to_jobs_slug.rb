class AddUniqueIndexToJobsSlug < ActiveRecord::Migration[8.0]
  def change
    add_index :jobs, :slug, unique: true
  end
end
