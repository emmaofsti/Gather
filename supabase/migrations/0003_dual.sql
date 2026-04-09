-- Store front-camera selfie path alongside main back-camera photo
alter table media add column if not exists secondary_storage_path text;
