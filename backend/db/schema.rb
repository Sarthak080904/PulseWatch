# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_01_01_000005) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "incidents", force: :cascade do |t|
    t.bigint "monitor_id", null: false
    t.integer "status", default: 0, null: false
    t.datetime "started_at", null: false
    t.datetime "resolved_at"
    t.text "summary"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["monitor_id", "status"], name: "index_incidents_on_monitor_id_and_status"
    t.index ["monitor_id"], name: "index_incidents_on_monitor_id"
  end

  create_table "jwt_denylists", force: :cascade do |t|
    t.string "jti", null: false
    t.datetime "exp", null: false
    t.index ["jti"], name: "index_jwt_denylists_on_jti", unique: true
  end

  create_table "monitor_checks", force: :cascade do |t|
    t.bigint "monitor_id", null: false
    t.integer "status_code"
    t.integer "response_time_ms", default: 0, null: false
    t.boolean "success", default: false, null: false
    t.text "error_message"
    t.datetime "checked_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["monitor_id", "checked_at"], name: "index_monitor_checks_on_monitor_id_and_checked_at"
    t.index ["monitor_id"], name: "index_monitor_checks_on_monitor_id"
  end

  create_table "monitors", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", null: false
    t.string "url", null: false
    t.integer "http_method", default: 0, null: false
    t.integer "status", default: 0, null: false
    t.integer "interval_seconds", default: 300, null: false
    t.integer "expected_status", default: 200, null: false
    t.datetime "last_checked_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["status"], name: "index_monitors_on_status"
    t.index ["user_id"], name: "index_monitors_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "jti", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "incidents", "monitors"
  add_foreign_key "monitor_checks", "monitors"
  add_foreign_key "monitors", "users"
end
