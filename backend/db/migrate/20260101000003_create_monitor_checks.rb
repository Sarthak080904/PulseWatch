class CreateMonitorChecks < ActiveRecord::Migration[8.0]
  def change
    create_table :monitor_checks do |t|
      t.references :monitor, null: false, foreign_key: true
      t.integer :status_code
      t.integer :response_time_ms, null: false, default: 0
      t.boolean :success, null: false, default: false
      t.text :error_message
      t.datetime :checked_at, null: false
      t.timestamps
    end
    add_index :monitor_checks, [:monitor_id, :checked_at]
  end
end
