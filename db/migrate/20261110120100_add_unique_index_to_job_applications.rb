class AddUniqueIndexToJobApplications < ActiveRecord::Migration[8.0]
  def change
    add_index :job_applications, [ :user_id, :job_id ], unique: true
  end
end
