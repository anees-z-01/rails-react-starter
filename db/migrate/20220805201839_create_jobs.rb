class CreateJobs < ActiveRecord::Migration[6.1]
  def change
    create_table :jobs do |t|
      t.string :title, null: false
      t.string :description, null: false
      t.integer :status, null: false, default: 0
      t.string :slug, null: false

      t.timestamps
    end
  end
end
