class CreateMonitors < ActiveRecord::Migration[8.0]
  def change
    create_table :monitors do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.string :url, null: false
      t.integer :http_method, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.integer :interval_seconds, null: false, default: 300
      t.integer :expected_status, null: false, default: 200
      t.datetime :last_checked_at
      t.timestamps
    end
    add_index :monitors, :status
  end
end
