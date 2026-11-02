class CreateIncidents < ActiveRecord::Migration[8.0]
  def change
    create_table :incidents do |t|
      t.references :monitor, null: false, foreign_key: true
      t.integer :status, null: false, default: 0
      t.datetime :started_at, null: false
      t.datetime :resolved_at
      t.text :summary
      t.timestamps
    end
    add_index :incidents, [:monitor_id, :status]
  end
end
