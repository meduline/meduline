import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260319051446 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "size_guide" ("id" text not null, "name" text not null, "description" text null, "type" text null, "instruction_image_url" text null, "columns" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "size_guide_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_size_guide_deleted_at" ON "size_guide" ("deleted_at") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `create table if not exists "size_guide_entry" ("id" text not null, "label" text not null, "measurements" jsonb not null, "sort_order" integer not null default 0, "size_guide_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "size_guide_entry_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_size_guide_entry_size_guide_id" ON "size_guide_entry" ("size_guide_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_size_guide_entry_deleted_at" ON "size_guide_entry" ("deleted_at") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `alter table if exists "size_guide_entry" add constraint "size_guide_entry_size_guide_id_foreign" foreign key ("size_guide_id") references "size_guide" ("id") on update cascade;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "size_guide_entry" drop constraint if exists "size_guide_entry_size_guide_id_foreign";`
    )

    this.addSql(`drop table if exists "size_guide" cascade;`)

    this.addSql(`drop table if exists "size_guide_entry" cascade;`)
  }
}
